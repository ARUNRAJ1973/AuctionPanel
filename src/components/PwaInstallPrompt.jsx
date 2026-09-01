import React, { useState, useEffect } from 'react';

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Check if already installed in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return; // Already installed, don't show prompt
    }

    // Check if user dismissed prompt in this session
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) {
      return;
    }

    // Listen for browser beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // On iOS or browsers where prompt event fired earlier/differently, show initial prompt after 1.5s delay
    const timer = setTimeout(() => {
      const isDismissedNow = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!isStandalone && !isDismissedNow) {
        setShowPrompt(true);
      }
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else if (isIOS) {
      alert('To install on iOS: Tap the Share button in Safari (ios-share) and select "Add to Home Screen" ➕');
    } else {
      alert('To install: Open your browser menu (⋮) and select "Install App" or "Add to Home Screen".');
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '16px'
      }}
      onClick={handleDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: 24,
          padding: '24px 20px',
          width: 'min(380px, 92vw)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          boxSizing: 'border-box',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* App Logo */}
        <div style={{ position: 'relative' }}>
          <img
            src="/auction.jpeg"
            alt="KPL Auction App"
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #047857',
              boxShadow: '0 8px 20px rgba(4, 120, 87, 0.25)'
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              background: '#047857',
              color: '#ffffff',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 900,
              border: '2px solid #ffffff'
            }}
          >
            ⚡
          </span>
        </div>

        {/* Text Details */}
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0', fontStyle: 'italic' }}>
            Install KPL Auction App
          </h3>
          <p style={{ color: '#64748b', margin: 0, fontSize: 13, lineHeight: 1.5, fontWeight: 600 }}>
            Install the app on your home screen for instant access, real-time bidding, and offline access!
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              width: '100%',
              minHeight: 46,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #047857, #065f46)',
              color: '#ffffff',
              border: 'none',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(4, 120, 87, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'transform 0.15s ease'
            }}
          >
            <span>📲</span> Install App Now
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            style={{
              width: '100%',
              minHeight: 40,
              borderRadius: 10,
              background: '#f1f5f9',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
