import React from 'react';
import { useAuth } from '../context/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <div className="logout-container">
      <button className="logout-btn"  
      onClick={() => {
          if (window.confirm('Are you sure you want to delete this item?')) {
            logout();
          }
        }} title="Logout">
        <span className="logout-icon">🚪</span>
        <span className="logout-text">Logout</span>
      </button>
    </div>
  );
};

export default LogoutButton;