import React, { useState, useEffect, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';

const PlayerAuctionSpinner = () => {
  const { players, selectPlayer } = useAuction();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const animationRef = useRef(null);

  // Vertical scroll state
  const listRef = useRef(null);
  const itemHeightRef = useRef(44);
  const [offset, setOffset] = useState(0); // pixel offset for smooth scroll

  // Get only unsold players
  const unsoldPlayers = players.filter(player => !player.sold);

  // Fixed item height for stability across renders
  useEffect(() => {
    itemHeightRef.current = 48;
  }, [unsoldPlayers.length]);

  // Smooth vertical scroll loop (no auto-stop)
  useEffect(() => {
    if (!isSpinning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Snap to current selected index
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
    const speed = 2400; // pixels per second (very fast)

    const tick = (now) => {
      const dt = (now - last) / 1000; // seconds
      last = now;
      px += speed * dt; // pixels advanced

      const h = itemHeightRef.current || 44;
      if (px >= h) {
        // advanced one full item
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

  const handleSpin = () => {
    if (unsoldPlayers.length === 0) {
      alert('No players available for auction!');
      return;
    }
    if (isSpinning) return;
    setIsSpinning(true);
  };

  const handleStop = () => {
    if (!isSpinning) return;
    const list = players.filter(p => !p.sold);
    if (list.length === 0) { setIsSpinning(false); return; }

    const randomIndex = Math.floor(Math.random() * list.length);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsSpinning(false);
    setSelectedIndex(randomIndex);
    setOffset(0);
    setSpinCount(prev => prev + 1);

    setTimeout(() => {
      const player = list[randomIndex];
      if (player) {
        selectPlayer(player.id);
        window.location.hash = `#/auction/${player.id}`;
      }
    }, 1000);
  };

  if (unsoldPlayers.length === 0) {
    return (
      <div className="auc">
        <div className="panel">
          <h2 className="panel__title">🎯 Player Auction Spinner</h2>
          <div className="spinner-empty">
            <div className="spinner-empty-icon">🎉</div>
            <h3>All Players Sold!</h3>
            <p>The auction is complete. All players have been sold to teams.</p>
          </div>
        </div>
      </div>
    );
  }

  // Build a doubled list for seamless vertical scrolling
  const names = unsoldPlayers.map(p => ({ id: p.id, name: p.name }));
  const looped = [...names, ...names];

  // Compute translateY so that selectedIndex item appears under the pointer area
  const h = 48;
  const baseTranslate = -(selectedIndex * h + offset);

  return (
    <div className="auc">
      <div className="panel"  style={{backgroundColor:'#ccc1adff',marginBottom:10}}>
        <div className="panel__header-row">
          <h2 className="panel__title">🎯 Player Auction Spinner</h2>
          <div className="spinner-stats">
            <span className="unsold-count">{unsoldPlayers.length} players left</span>
            {spinCount > 0 && <span className="spin-count">Spins: {spinCount}</span>}
          </div>
        </div>

        {/* Vertical name scroller */}
        <div className="spinner-container" style={{ position: 'relative', height: `${h * 5}px`, overflow: 'hidden' }}>
          <div ref={listRef} style={{ willChange: 'transform', transform: `translateY(${baseTranslate}px)`, transition: isSpinning ? 'none' : 'transform 150ms ease-out' }}>
            {looped.map((p, idx) => (
              <div key={`${p.id}-${idx}`} className={`name-item ${idx % names.length === selectedIndex ? 'selected' : ''}`} style={{
                height: `${h}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px',
                borderBottom: '1px dashed var(--border)', fontWeight: idx % names.length === selectedIndex ? 800 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {p.name}
              </div>
            ))}
          </div>
        </div>

        <div className="spinner-controls" style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn primary`}
            onClick={handleSpin}
            disabled={isSpinning}
            style={{backgroundColor:'#f0e65b',textAlign:'center' }}
            type="button"
          >
            {isSpinning ? (
              <>Spinning...</>
            ) : (
              <>Spin</>
            )}
          </button>

          <button
            className="btn success"
            onClick={handleStop}
            disabled={!isSpinning}
            type="button"
            style={{ minWidth: 120 ,backgroundColor:'#b34747',textAlign:'center' }}
            title="Stop and pick random player"
          >
            Stop & Pick 
          </button>
        </div>

        {isSpinning && (
          <div className="spinner-status">
            <div className="spinner-loading">
              <div className="loading-dots">
                <span></span><span></span><span></span>
              </div>
              <p style={{fontWeight:'bold'}}>Selecting player for auction...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerAuctionSpinner;
