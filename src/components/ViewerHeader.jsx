import React from 'react';
import { useAuth } from '../context/AuthContext';
import MobileUserDrawer from './MobileUserDrawer';

const ViewerHeader = () => {
  const { logout, user, isAdmin } = useAuth();

  return (
    <div className="viewer-header">
      <div className="viewer-header__left">
        <div className="viewer-header__title">KPL Auction</div>
      </div>
      <div className="viewer-header__right">
        <div className="user-info">
          <span className="user-name">Hello, {user?.name || 'User'}</span>
          <span className="user-role">{isAdmin() ? '👑 Admin' : '👤 Viewer'}</span>
        </div>
        <button className="header-logout-btn" 
         onClick={() => {
          if (window.confirm('Are you sure you want to Logout ?')) {
            logout();
          }
        }} title="Logout">
          <span className="logout-icon">🚪</span>
          <span className="logout-text">Logout</span>
        </button>
        <MobileUserDrawer />
      </div>
    </div>
  );
};

export default ViewerHeader;