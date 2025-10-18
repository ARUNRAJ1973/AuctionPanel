import React, { useState, useEffect, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';

const PlayerAuctionSpinner = () => {
  const { players, selectPlayer } = useAuction();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [resultPlayer, setResultPlayer] = useState(null); // player object after auto-pick
  const animationRef = useRef(null);
  const spinTimeoutRef = useRef(null);

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

  // Smooth vertical scroll loop with auto-stop handled externally
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
    const speed = 2400; // pixels per second (very fast)

    const tick = (now) => {
      const dt = (now - last) / 1000; // seconds
      last = now;
      px += speed * dt; // pixels advanced

      const h = itemHeightRef.current || 44;
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

  // Cleanup timers on unmount
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

  const finishSpinWithPick = () => {
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

    const player = list[randomIndex];
    if (player) {
      setResultPlayer(player); // Show result overlay with nice UI
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

    // Auto-stop after 3 seconds and pick a random player
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

  // Compute translateY so that selectedIndex item appears under the center pointer row
  const h = 48;
  const centerOffset = 2 * h; // middle of 5 visible rows
  const baseTranslate = -((selectedIndex * h + offset) - centerOffset);

  return (
    <div className="auc">
      <div className="panel"  style={{backgroundColor:'#e6e6e6',marginBottom:10}}>
        <div className="panel__header-row">
          <h2 className="panel__title">🎯 Player Auction Spinner</h2>
          <div className="spinner-stats">
            <span className="unsold-count">{unsoldPlayers.length} players left</span>
          </div>
        </div>

        {/* Vertical name scroller */}
        <div className="spinner-container" style={{ position: 'relative', height: `${h * 5}px`, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)' }}>
          {/* Fade masks for top and bottom for professional look */}
          <div aria-hidden style={{ position:'absolute', top:0, left:0, right:0, height: h, background: 'linear-gradient(180deg, rgba(245,245,245,0.9), rgba(255, 0, 0, 0))', pointerEvents:'none', zIndex:2 }} />
          <div aria-hidden style={{ position:'absolute', bottom:0, left:0, right:0, height: h, background: 'linear-gradient(0deg, rgba(245,245,245,0.9), rgba(245,245,245,0))', pointerEvents:'none', zIndex:2 }} />

          {/* Pointer lane */}
          <div aria-hidden style={{ position:'absolute', top:110, left:0, right:0, height: h, background:'rgba(37,99,235,0.08)', borderTop:'1px solid rgba(37,99,235,0.25)', borderBottom:'1px solid rgba(37,99,235,0.25)', zIndex:1 }} />

          <div ref={listRef} style={{ willChange: 'transform', transform: `translateY(${baseTranslate}px)`, transition: isSpinning ? 'none' : 'transform 120ms ease-out', position:'relative', zIndex:0 }}>
            {looped.map((p, idx) => (
              <div key={`${p.id}-${idx}`} className={`name-item ${idx % names.length === selectedIndex ? 'selected' : ''}`} style={{
                height: `${h}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px',
                borderBottom: '1px dashed var(--border)', fontWeight: idx % names.length === selectedIndex ? 800 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',fontStyle:'italic'
              }}>
                {p.name}
              </div>
            ))}
          </div>
        </div>

        <div className="spinner-controls" style={{ display: 'flex', gap: 8 }}>
          <button
            className={"playeredit"}
            onClick={handleSpin}
            disabled={isSpinning}
            style={{backgroundColor:'#b7c1b8da',boxShadow:'5px 5px 10px #59605fff' }}
            type="button"
            title="Spin for 3 seconds and auto-pick"
          >
            {isSpinning ? (
              <>Spinning...</>
            ) : (
              <>Spin (3s)</>
            )}
          </button>

          <button
            className={"playerdelete"}
            onClick={handleStop}
            disabled={!isSpinning}
            type="button"
            style={{ minWidth: 140 ,backgroundColor:'#b34747',fontWeight:'bold',boxShadow:'5px 5px 10px #090908ff' }}
            title="Stop now and pick a random player"
          >
            Stop Now
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

      {resultPlayer && (
        <div className="overlay" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
          <div className="overlay__content" style={{
            background: 'linear-gradient(180deg,#111827,#0b1220)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 24,
            width: 'min(520px, 92vw)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            color: '#fff',
            textAlign: 'center'
          }}>
            <div style={{fontSize: 14, letterSpacing: 2, color:'#9CA3AF', textTransform:'uppercase'}}>Selected Player</div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginTop:10}}>
              <img src={resultPlayer.image || `https://placehold.co/80x80?text=${encodeURIComponent(resultPlayer.name||'P')}`}
                   alt={resultPlayer.name}
                   style={{ width: 80, height: 80, borderRadius: 12, objectFit:'cover', border:'1px solid rgba(255,255,255,0.12)' }} />
              <div style={{textAlign:'left'}}>
                <h2 style={{fontSize: 28, margin: 0, letterSpacing: 0.3}}>{resultPlayer.name}</h2>
                <div style={{color:'#A5B4FC', fontWeight:600}}>{resultPlayer.role}</div>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap: 12, margin:'16px 0 18px'}}>
              <div style={{padding:'6px 10px', border:'1px solid rgba(255,255,255,0.12)', borderRadius: 999, background:'rgba(255,255,255,0.04)'}}>Unsold count: {unsoldPlayers.length}</div>
              <div style={{padding:'6px 10px', border:'1px solid rgba(255,255,255,0.12)', borderRadius: 999, background:'rgba(255,255,255,0.04)'}}>Base ₹{Number(resultPlayer.basePrice).toLocaleString()}</div>
            </div>
            <div className="inline-form" style={{ display:'flex', justifyContent:'center', gap: 12 }}>
              <button className="btn" style={{background:'#374151', color:'#fff'}} onClick={() => setResultPlayer(null)}>Close</button>
              <button className="btn primary" style={{background:'#2563EB', color:'#fff'}} onClick={() => {
                selectPlayer(resultPlayer.id);
                setResultPlayer(null);
                window.location.hash = `#/auction/${resultPlayer.id}`;
              }}>Go to Auction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerAuctionSpinner;
