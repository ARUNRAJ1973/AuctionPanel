import React, { useEffect, useState } from 'react';

const WelcomeScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + (100 / 30); // 30 steps over 3 seconds
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [onComplete]);

  return (
    <div className="welcome-screen">
      <div className="welcome-background">
        <div className="welcome-circle circle-1"></div>
        <div className="welcome-circle circle-2"></div>
        <div className="welcome-circle circle-3"></div>
      </div>
      <div className="welcome-content">
        <div className="welcome-logo">
          <div className="logo-icon">🏏</div>
        </div>
        <h1 className="welcome-title">Welcome to</h1>
        <h2 className="welcome-subtitle">KPL Auction</h2>
        <p className="welcome-description">Premier League Cricket Auction System</p>
        
        <div className="welcome-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="progress-text">Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
