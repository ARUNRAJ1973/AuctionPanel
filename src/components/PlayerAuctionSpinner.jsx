import React, { useState, useEffect, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';

const PlayerAuctionSpinner = () => {
  const { players, teams, selectPlayer } = useAuction();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [resultPlayer, setResultPlayer] = useState(null);
  const animationRef = useRef(null);
  const spinTimeoutRef = useRef(null);

  const listRef = useRef(null);
  const itemHeightRef = useRef(48);
  const [offset, setOffset] = useState(0);

  const unsoldPlayers = players.filter(player => !player.sold);

  useEffect(() => {
    itemHeightRef.current = 48;
  }, [unsoldPlayers.length]);

  useEffect(() => {
    if (!isSpinning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setOffset(0);
      return;
    }

    const currentUnsoldPlayers = players.filter(player => !player.sold);
    if (currentUnsoldPlayers.length === 0) {
      setIsSpinning(false);
      return;
    }

    let last = performance.now();
    let px = 0;
    const speed = 2400;

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      px += speed * dt;

      const h = itemHeightRef.current || 48;
      if (px >= h) {
        px -= h;
        setSelectedIndex((prev) => (prev + 1) % currentUnsoldPlayers.length);
      }
      setOffset(px);
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isSpinning, players]);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
        spinTimeoutRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  // Lock background scrolling when result overlay modal is displayed
  useEffect(() => {
    if (resultPlayer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [resultPlayer]);

  const finishSpinWithPick = () => {
    const list = players.filter(p => !p.sold);
    if (list.length === 0) {
      setIsSpinning(false);
      return;
    }

    const randomIndex = Math.floor(Math.random() * list.length);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsSpinning(false);
    setSelectedIndex(randomIndex);
    setOffset(0);
    setSpinCount(prev => prev + 1);

    const player = list[randomIndex];
    if (player) {
      setResultPlayer(player);
    }
  };

  const handleSpin = () => {
    if (unsoldPlayers.length === 0) {
      alert('No players available for auction!');
      return;
    }
    if (isSpinning) return;
    setResultPlayer(null);
    setIsSpinning(true);

    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
    }
    spinTimeoutRef.current = setTimeout(() => {
      finishSpinWithPick();
    }, 3000);
  };

  const handleStop = () => {
    if (!isSpinning) return;
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }
    finishSpinWithPick();
  };

  if (unsoldPlayers.length === 0) {
    const totalSpent = players.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
    return (
      <div className="auc">
        <div className="panel" style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 50%, #f0fdf4 100%)',
          borderRadius: 16,
          border: '1.5px solid #a7f3d0',
          padding: '20px 16px',
          textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Decorative Banner Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg, #047857, #065f46)',
            color: '#ffffff',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 12,
            boxShadow: '0 2px 8px rgba(4, 120, 87, 0.25)'
          }}>
            <span>✨ AUCTION COMPLETED ✨</span>
          </div>

          {/* Trophy Icon */}
          <div style={{
            width: 52,
            height: 52,
            margin: '0 auto 10px auto',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            boxShadow: '0 8px 18px rgba(217, 119, 6, 0.3)',
            border: '2.5px solid #ffffff'
          }}>
            🏆
          </div>

          {/* Title & Subtitle */}
          <h2 style={{
            fontSize: 18,
            fontWeight: 900,
            color: '#065f46',
            margin: '0 0 4px 0',
            fontStyle: 'italic',
            letterSpacing: '-0.2px'
          }}>
            🎉 All Players Sold!
          </h2>
          <p style={{
            color: '#475569',
            margin: '0 auto 14px auto',
            fontSize: 12,
            maxWidth: 380,
            lineHeight: 1.4,
            fontWeight: 600
          }}>
            Every player in the pool has been successfully auctioned & assigned to team rosters. The auction is complete!
          </p>

          {/* Key Metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: 8,
            maxWidth: 380,
            margin: '0 auto'
          }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 12,
              padding: '8px 10px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: 9, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>TOTAL SOLD</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', fontStyle: 'italic', marginTop: 2 }}>
                {players.length} Players
              </div>
            </div>

            {teams && teams.length > 0 && (
              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 12,
                padding: '8px 10px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontSize: 9, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>TEAMS</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#d97706', fontStyle: 'italic', marginTop: 2 }}>
                  {teams.length} Teams
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const names = unsoldPlayers.map(p => ({ id: p.id, name: p.name }));
  const looped = [...names, ...names];

  const h = 48;
  const centerOffset = 2 * h;
  const baseTranslate = -((selectedIndex * h + offset) - centerOffset);
  const fallbackImage = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80";

  return (
    <div className="auc">
      <div className="panel" style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 20, padding: 20, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', marginBottom: 16 }}>

        {/* Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🎯</span> Player Auction Spinner
          </h2>
          <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }}>
            {unsoldPlayers.length} PLAYERS LEFT
          </div>
        </div>

        {/* Casino-Grade Slot Wheel Reel */}
        <div style={{
          position: 'relative',
          height: `${h * 5}px`,
          overflow: 'hidden',
          borderRadius: 16,
          border: '2px solid #e2e8f0',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Top & Bottom Depth Vignette Fade Masks */}
          <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: h * 1.2, background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0))', pointerEvents: 'none', zIndex: 3 }} />
          <div aria-hidden style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: h * 1.2, background: 'linear-gradient(0deg, rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0))', pointerEvents: 'none', zIndex: 3 }} />

          {/* Golden Amber Winner Highlight Pointer Lane */}
          <div aria-hidden style={{
            position: 'absolute',
            top: 2 * h,
            left: 0,
            right: 0,
            height: h,
            background: 'linear-gradient(90deg, rgba(217, 119, 6, 0.08), rgba(217, 119, 6, 0.2), rgba(217, 119, 6, 0.08))',
            borderTop: '2px solid #d97706',
            borderBottom: '2px solid #d97706',
            boxShadow: '0 0 16px rgba(217, 119, 6, 0.25)',
            zIndex: 2,
            pointerEvents: 'none'
          }} />

          {/* Rolling Names Strip */}
          <div ref={listRef} style={{ willChange: 'transform', transform: `translateY(${baseTranslate}px)`, transition: isSpinning ? 'none' : 'transform 120ms ease-out', position: 'relative', zIndex: 1 }}>
            {looped.map((p, idx) => {
              const isSelected = idx % names.length === selectedIndex;
              return (
                <div
                  key={`${p.id}-${idx}`}
                  style={{
                    height: `${h}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 16px',
                    borderBottom: '1px dashed #e2e8f0',
                    fontWeight: isSelected ? 900 : 600,
                    fontSize: isSelected ? 18 : 14,
                    color: isSelected ? '#d97706' : '#475569',
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'color 0.15s ease, font-size 0.15s ease'
                  }}
                >
                  {p.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            type="button"
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 12,
              background: isSpinning ? '#cbd5e1' : 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#ffffff',
              border: 'none',
              fontSize: 15,
              fontWeight: 900,
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              boxShadow: isSpinning ? 'none' : '0 6px 18px rgba(217, 119, 6, 0.35)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
            title="Spin for 3 seconds and pick a player"
          >
            {isSpinning ? <>⚡ SPINNING...</> : <>🎲 SPIN (3S)</>}
          </button>

          <button
            onClick={handleStop}
            disabled={!isSpinning}
            type="button"
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 12,
              background: !isSpinning ? '#f1f5f9' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: !isSpinning ? '#94a3b8' : '#ffffff',
              border: !isSpinning ? '1px solid #cbd5e1' : 'none',
              fontSize: 15,
              fontWeight: 900,
              cursor: !isSpinning ? 'not-allowed' : 'pointer',
              boxShadow: !isSpinning ? 'none' : '0 6px 18px rgba(239, 68, 68, 0.35)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
            title="Stop now and pick immediately"
          >
            🛑 STOP NOW
          </button>
        </div>

        {/* Live Spinning Indicator Bar */}
        {isSpinning && (
          <div style={{
            marginTop: 12,
            background: '#fef3c7',
            border: '1px solid #fde68a',
            color: '#b45309',
            borderRadius: 12,
            padding: '10px 14px',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            <span>⚡ Selecting random player for auction...</span>
          </div>
        )}
      </div>

      {/* Selected Player Result Overlay Modal */}
      {resultPlayer && (
        <div className="overlay" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div className="overlay__content" style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 24,
            padding: '24px 20px',
            width: 'min(440px, 94vw)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            color: '#0f172a',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#ffffff',
              padding: '6px 18px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
            }}>
              🎉 SELECTED FOR AUCTION
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              width: '100%'
            }}>
              <div style={{
                position: 'relative',
                width: 220,
                height: 220,
                borderRadius: 20,
                overflow: 'hidden',
                border: '4px solid #cbd5e1',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
                background: '#f8fafc'
              }}>
                <img
                  src={resultPlayer.image || fallbackImage}
                  onError={(e) => { e.target.src = fallbackImage; }}
                  alt={resultPlayer.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>

              <h2 style={{
                fontSize: 26,
                margin: 0,
                fontWeight: 900,
                color: '#0f172a',
                fontStyle: 'italic',
                letterSpacing: '-0.3px'
              }}>
                {resultPlayer.name}
              </h2>
            </div>

            {/* Centered Base Price Tag */}
            <div style={{
              padding: '8px 20px',
              border: '1px solid #a7f3d0',
              borderRadius: 12,
              background: '#ecfdf5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 2px 6px rgba(4, 120, 87, 0.08)'
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: 0.5 }}>BASE PRICE:</span>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#047857', fontStyle: 'italic' }}>
                ₹{Number(resultPlayer.basePrice).toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, width: '100%', marginTop: 4 }}>
              <button
                type="button"
                style={{
                  flex: 1.5,
                  minHeight: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(217, 119, 6, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  selectPlayer(resultPlayer.id);
                  setResultPlayer(null);
                  window.location.hash = `#/auction/${resultPlayer.id}`;
                }}
              >
                ⚡ GO TO AUCTION
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 12,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setResultPlayer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerAuctionSpinner;
