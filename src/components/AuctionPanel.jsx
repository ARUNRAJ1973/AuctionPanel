import React, { useMemo, useState } from "react";
import { useAuction } from "../context/AuctionContext";

const AuctionPanel = ({ onSold }) => {
  const {
    selectedPlayer,
    currentBid,
    incrementBid,
    decrementBid,
    markSold,
    teams,
    bidStep,
    setBidStep,
    teamById,
  } = useAuction();

  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");
  const [isSelling, setIsSelling] = useState(false);

  const disabledSell = useMemo(() => !selectedPlayer || !teamId, [selectedPlayer, teamId]);

  if (!selectedPlayer) {
    return (
      <div className="auction-light-panel empty-card">
        <div className="empty-title">🏏 Live Auction Room</div>
        <div className="empty-sub">Please select a player from the list to start live bidding.</div>
      </div>
    );
  }

  const { name, image, basePrice, sold, soldTo, soldPrice } = selectedPlayer;
  const soldTeam = soldTo ? teamById(soldTo) : null;
  const activeBid = currentBid ?? basePrice ?? 10000;
  const selectedTeam = teamId ? teamById(Number(teamId)) : null;

  const onSell = async () => {
    if (isSelling || disabledSell) return;
    setIsSelling(true);
    setError("");

    try {
      const res = await markSold(Number(teamId));
      if (!res?.ok) {
        setError(res?.error || "Could not complete sale");
      } else if (onSold && selectedPlayer) {
        onSold({
          teamId: Number(teamId),
          playerId: selectedPlayer.id,
          price: activeBid,
        });
      }
    } catch (err) {
      console.error("Error selling player:", err);
      setError("Failed to process sale");
    } finally {
      setIsSelling(false);
    }
  };

  return (
    <>
      {isSelling && (
        <div className="overlay" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 99999 }}>
          <div className="sold-popup-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div className="sold-popup-badge" style={{ marginBottom: '16px' }}>⏳ PROCESSING SALE</div>
            <h3 style={{ color: '#fbbf24', margin: '0 0 8px 0', fontSize: '22px', fontWeight: 800, fontStyle: 'italic' }}>Selling Player...</h3>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px', fontStyle: 'italic' }}>Updating team purse and completing sale</p>
          </div>
        </div>
      )}

      <div className="auction-light-panel">
        {/* Header Bar */}
        <div className="auction-light-header">
          <div className="auction-light-title-group">
            <h2 className="auction-main-heading">Player Auction Room</h2>
          </div>
          <button
            className="auction-back-btn"
            onClick={() => { window.location.hash = '#/'; }}
            type="button"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Compact Grid */}
        <div className="auction-light-grid">
          {/* Left Column: Player Profile */}
          <div className="auction-player-card">
            <div className="player-avatar-wrapper">
              <img
                src={image}
                alt={name}
                className="player-avatar-img"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=300&auto=format&fit=crop&q=80"; }}
              />
            </div>

            <div className="player-details-compact">
              <div className="player-name-price-row">
                <h3 className="player-card-name" title={name}>{name}</h3>
                <div className="base-price-tag">
                  <span className="label">BASE</span>
                  <span className="amount">₹{(basePrice || 10000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bidding Controls & Team Selection */}
          <div className="auction-bidding-card">
            {sold ? (
              <div className="sold-already-banner">
                <div className="sold-banner-icon">🏆</div>
                <div className="sold-banner-text">
                  <h3>PLAYER SOLD</h3>
                  <p>Acquired by <strong>{soldTeam?.name || `Team #${soldTo}`}</strong> for <span>₹{(soldPrice || activeBid).toLocaleString()}</span></p>
                </div>
              </div>
            ) : (
              <>
                {/* Compact Live Bid Counter Section */}
                <div className="bid-counter-box">
                  <div className="bid-counter-header">
                    <span className="bid-label">CURRENT BID PRICE</span>
                    <span className="bid-step-info">Increment: +₹{bidStep.toLocaleString()}</span>
                  </div>

                  <div className="bid-counter-controls">
                    <button
                      className="bid-btn-circle decrement"
                      onClick={() => decrementBid(bidStep)}
                      type="button"
                      title={`Decrease by ₹${bidStep.toLocaleString()}`}
                    >
                      −
                    </button>
                    <div className="bid-display-value">
                      ₹{activeBid.toLocaleString()}
                    </div>
                    <button
                      className="bid-btn-circle increment"
                      onClick={() => incrementBid(bidStep)}
                      type="button"
                      title={`Increase by ₹${bidStep.toLocaleString()}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Step Selector Pills under Counter */}
                  <div className="step-preset-bar">
                    {[1000, 3000, 5000, 10000, 50000].map((step) => (
                      <button
                        key={step}
                        className={`step-preset-chip ${bidStep === step ? 'active' : ''}`}
                        onClick={() => setBidStep(step)}
                        type="button"
                      >
                        +₹{step >= 100000 ? `${step / 100000}L` : step.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Selection Section */}
                <div className="team-selection-box">
                  <div className="team-selection-header">
                    <div className="team-selection-title-group">
                      <span className="team-title-icon">👥</span>
                      <h4 className="team-selection__title">SELECT TEAM</h4>
                    </div>
                  </div>

                  <div className="team-selection-grid">
                    {teams.map(t => {
                      const remaining = Math.max(0, t.purse - t.spent);
                      const isSelected = teamId === String(t.id);
                      const canAfford = remaining >= activeBid;
                      const purseAfterSale = Math.max(0, remaining - activeBid);
                      const initial = t.name ? t.name.charAt(0).toUpperCase() : 'T';

                      return (
                        <div
                          key={t.id}
                          className={`team-selection-card ${isSelected ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
                          onClick={() => canAfford && setTeamId(String(t.id))}
                        >
                          <div className="team-card-top">
                            <div className="team-avatar-icon">{initial}</div>
                            <div className="team-card-name-group">
                              <span className="team-selection-card__name" title={t.name}>{t.name}</span>
                            </div>
                            {isSelected && <div className="team-card-check">✓</div>}
                          </div>

                          <div className="team-card-purse-row">
                            <span className="purse-label">Purse:</span>
                            <span className={`team-selection-card__amount ${!canAfford ? 'insufficient' : ''}`}>
                              ₹{remaining.toLocaleString()}
                            </span>
                          </div>

                          {isSelected && canAfford && (
                            <div className="projected-purse-tag">
                              After: ₹{purseAfterSale.toLocaleString()}
                            </div>
                          )}

                          {!canAfford && (
                            <div className="team-selection-card__warning">Insufficient Purse</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className={`sell-hero-btn ${disabledSell ? 'disabled' : 'active'}`}
                    disabled={disabledSell || isSelling}
                    onClick={onSell}
                    type="button"
                  >
                    {isSelling ? (
                      <>⏳ SELLING PLAYER...</>
                    ) : selectedTeam ? (
                      <>⚡ SELL TO {selectedTeam.name.toUpperCase()} FOR ₹{activeBid.toLocaleString()}</>
                    ) : (
                      <>👈 SELECT TEAM TO SELL PLAYER</>
                    )}
                  </button>
                </div>

                {error && <div className="auction-error-banner">⚠️ {error}</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuctionPanel;
