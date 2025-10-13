import React, { useMemo, useState } from "react";
import { useAuction } from "../context/AuctionContext";

const AuctionPanel = ({ onSold }) => {
  const {
    selectedPlayer,
    currentBid,
    incrementBid,
    decrementBid,
    markSold,
    clearSelected,
    teams,
    remainingOf,
    bidStep,
    setBidStep,
    teamById,
  } = useAuction();

  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");

  const disabledSell = useMemo(() => !selectedPlayer || !teamId, [selectedPlayer, teamId]);

  if (!selectedPlayer) {
    return (
      <section className="panel">
        <h2 className="panel__title">Auction</h2>
        <div className="empty">Select a player to start the auction</div>
      </section>
    );
  }

  const { name, image, role, basePrice, stats, sold, soldTo, soldPrice } = selectedPlayer;
  const soldTeam = soldTo ? teamById(soldTo) : null;

  const onSell = async () => {
    setError("");
    try {
      const res = await markSold(Number(teamId));
      if (!res?.ok) {
        setError(res?.error || "Could not sell");
      } else if (onSold && selectedPlayer) {
        onSold({ teamId: Number(teamId), playerId: selectedPlayer.id, price: (currentBid ?? basePrice) });
      }
    } catch (error) {
      console.error('Error selling player:', error);
      setError('Failed to sell player');
    }
  };

  return (
    <section className="panel auction" style={{height: "100vh"}}>
      <div className="panel__header-row">
        <h1 className="panel__title">Auction</h1>
        <button className="btn ghost" onClick={() => { window.location.hash = '#/'; }}>Back</button>
      </div>

      <div className="auction-grid">
        <div className="auction-left">
          <div className="auction__player">
            <img src={image} alt={name} />
            <div className="auction__info">
              <div className="title-row">
                <h2>{name}</h2>
                <span className="role">{role}</span>
              </div>
              <div className="muted">Base Price: ₹{basePrice.toLocaleString()}</div>
              <div className="muted">Matches: {stats.matches} • Runs: {stats.runs} • Wkts: {stats.wickets}</div>
            </div>
          </div>
        </div>
        <div className="auction-right">

      {sold ? (
        <div className="sold-banner">
          Already sold to {soldTeam?.name || soldTo} for ₹{soldPrice.toLocaleString()}
        </div>
      ) : (
        <>
          <div className="bid-row bid-step-row">
            <div className="inline-form bid-step-buttons" style={{ gap: 6 }}>
              <button className={`btn small ${bidStep===1000? 'amount': 'ghost'}`} onClick={() => setBidStep(1000)} type="button" style={{ minHeight: '40px', fontSize: '14px' }}>+ ₹1000</button>
              <button className={`btn small ${bidStep===3000? 'amount': 'ghost'}`} onClick={() => setBidStep(3000)} type="button" style={{ minHeight: '40px', fontSize: '14px' }}>+ ₹3000</button>
              <button className={`btn small ${bidStep===5000? 'amount': 'ghost'}`} onClick={() => setBidStep(5000)} type="button" style={{ minHeight: '40px', fontSize: '14px' }}>+ ₹5000</button>
              <button className={`btn small ${bidStep===10000? 'amount': 'ghost'}`} onClick={() => setBidStep(10000)} type="button" style={{ minHeight: '40px', fontSize: '14px' }}>+ ₹10,000</button>
            </div>
          </div>
          <div className="bid-row main-bid-row">
            <button className="btn circle" style={{backgroundColor:'#db9800',color:'#fff', minWidth: '50px', minHeight: '50px', fontSize: '20px'}} onClick={() => decrementBid()}>-</button>
            <div className="bid">₹{(currentBid ?? basePrice).toLocaleString()}</div>
            <button className="btn circle" style={{backgroundColor:'#db9800',color:'#fff', minWidth: '50px', minHeight: '50px', fontSize: '20px'}} onClick={() => incrementBid()}>+</button>
          </div>

          <div className="team-selection">
            <h4 className="team-selection__title">Select Team:</h4>
            <div className="team-selection-grid">
              {teams.map(t => {
                const remaining = Math.max(0, t.purse - t.spent);
                const isSelected = teamId === String(t.id);
                const canAfford = remaining >= (currentBid ?? basePrice);
                return (
                  <div 
                    key={t.id} 
                    className={`team-selection-card ${
                      isSelected ? 'selected' : ''
                    } ${
                      !canAfford ? 'disabled' : ''
                    }`}
                    onClick={() => canAfford && setTeamId(String(t.id))}
                  >
                    <div className="team-selection-card__name">{t.name}</div>
                    <div className={`team-selection-card__amount ${
                      !canAfford ? 'insufficient' : ''
                    }`}>
                      ₹{remaining.toLocaleString()}
                    </div>
                    {!canAfford && (
                      <div className="team-selection-card__warning">Insufficient funds</div>
                    )}
                  </div>
                );
              })}
            </div>
            <button 
              className="btn success sell-button" 
              disabled={disabledSell} 
              onClick={onSell}
              style={{ minHeight: '50px', fontSize: '16px', fontWeight: 'bold',backgroundColor:'#db9800' }}
            >
              Sell to {teamId ? teamById(Number(teamId))?.name : 'Selected Team'}
            </button>
          </div>
          {error && <div className="empty" style={{ color: '#fca5a5' }}>{error}</div>}
        </>
      )}
        </div>
      </div>
    </section>
  );
};

export default AuctionPanel;
