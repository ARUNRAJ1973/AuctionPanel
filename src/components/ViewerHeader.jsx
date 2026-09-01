import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LogoutConfirmModal from './LogoutConfirmModal';

const ViewerHeader = () => {
  const { logout, user, isAdmin } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <div className="viewer-header">
        <div className="viewer-header__left" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/auction.jpeg"
            alt="KPL Logo"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid #a7f3d0'
            }}
          />
          <div className="viewer-header__title">KPL Auction</div>
        </div>
        <div className="viewer-header__right">
          <div className="user-info">
            <span className="user-name">Hello, {user?.name || 'User'}</span>
            <span className="user-role">{isAdmin() ? '👑 Admin' : '👤 Viewer'}</span>
          </div>
          <button 
            className="header-logout-btn" 
            onClick={() => setShowLogoutModal(true)} 
            title="Logout"
            type="button"
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>

      <LogoutConfirmModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default ViewerHeader;