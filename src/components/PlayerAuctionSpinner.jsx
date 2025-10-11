import React, { useState, useEffect, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';

const PlayerAuctionSpinner = () => {
  const { players, selectPlayer } = useAuction();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const animationRef = useRef(null);

  // Get only unsold players
  const unsoldPlayers = players.filter(player => !player.sold);

  // Continuous spin loop (no auto-stop). Speeds up and down gently but keeps spinning
  useEffect(() => {
    if (!isSpinning) {
      // Ensure no stray animation frames running
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    // Clean up any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const currentUnsoldPlayers = players.filter(player => !player.sold);
    if (currentUnsoldPlayers.length === 0) {
      setIsSpinning(false);
      return;
    }

    let currentIndex = selectedIndex;
    let lastUpdateTime = performance.now();
    let t = 0; // time accumulator used to modulate speed

    const animate = (now) => {
      // Dynamic speed oscillation between baseInterval and slowInterval
      const baseInterval = 60;   // Fast speed in ms
      const slowInterval = 220;  // Slow speed in ms
      t += 0.02;
      const osc = (Math.sin(t) + 1) / 2; // 0..1
      const currentInterval = baseInterval + (slowInterval - baseInterval) * osc;

      if (now - lastUpdateTime >= currentInterval) {
        currentIndex = (currentIndex + 1) % currentUnsoldPlayers.length;
        setSelectedIndex(currentIndex);
        lastUpdateTime = now;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isSpinning, players, selectedIndex]);

  const handleSpin = () => {
    if (unsoldPlayers.length === 0) {
      alert('No players available for auction!');
      return;
    }

    if (isSpinning) {
      console.log('Spin already in progress, ignoring request');
      return;
    }

    console.log('Starting spin...');
    setIsSpinning(true);
  };

  const handleStop = () => {
    if (!isSpinning) return;

    const list = players.filter(p => !p.sold);
    if (list.length === 0) {
      setIsSpinning(false);
      return;
    }

    // Pick a random player on stop
    const randomIndex = Math.floor(Math.random() * list.length);

    // Stop animation and lock on the random player
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsSpinning(false);
    setSelectedIndex(randomIndex);
    setSpinCount(prev => prev + 1);

    // Navigate to auction after 1 second
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
      <div className="auction-spinner">
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

  return (
    <div className="auction-spinner">
      <div className="panel">
        <div className="panel__header-row">
          <h2 className="panel__title">🎯 Player Auction Spinner</h2>
          <div className="spinner-stats">
            <span className="unsold-count">{unsoldPlayers.length} players left</span>
            {/* {spinCount > 0 && <span className="spin-count">Spins: {spinCount}</span>} */}
          </div>
        </div>

        <div className="spinner-container">
          <div className={`player-roulette ${isSpinning ? 'spinning' : ''}`}>
            {unsoldPlayers.map((player, index) => (
              <div 
                key={player.id} 
                className={`roulette-player ${index === selectedIndex ? 'selected' : ''}`}
              >
                <img src={player.image} alt={player.name} className="roulette-player-image" />
                <div className="roulette-player-info">
                  <span className="roulette-player-name">{player.name}</span>
                  <span className="roulette-player-role">{player.role}</span>
                  <span className="roulette-player-price">₹{player.basePrice?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="spinner-pointer">▼</div>
        </div>

        <div className="spinner-controls" style={{ display: 'flex', gap: 8 }}>
          <button 
            className={`btn primary spinner-btn ${isSpinning ? 'spinning' : ''}`}
            onClick={handleSpin}
            disabled={isSpinning}
            type="button"
          >
            {isSpinning ? (
              <>
                <span className="spinner-icon">🎰</span>
                Spinning...
              </>
            ) : (
              <>
                <span className="spinner-icon">🎯</span>
                Spin
              </>
            )}
          </button>

          <button
            className="btn success"
            onClick={handleStop}
            disabled={!isSpinning}
            type="button"
            style={{ minWidth: 120 }}
            title="Stop and pick random player"
          >
            Stop & Pick Random
          </button>
        </div>

        {isSpinning && (
          <div className="spinner-status">
            <div className="spinner-loading">
              <div className="loading-dots">
                <span></span><span></span><span></span>
              </div>
              <p>Selecting player for auction...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerAuctionSpinner;
