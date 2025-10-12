import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MobileUserDrawer = () => {
  const { logout, user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isOpen && !event.target.closest('.mobile-drawer') && !event.target.closest('.mobile-menu-toggle')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen]);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="mobile-user-menu">
      {/* Hamburger Menu Button */}
      <button
        className={`mobile-menu-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle user menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      {isOpen && <div className="mobile-drawer-overlay" />}

      {/* Drawer */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <div className="mobile-drawer__header">
          <h3>User Menu</h3>
          <button 
            className="mobile-drawer__close"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        
        <div className="mobile-drawer__content">
          <div className="mobile-user-info">
            <div className="mobile-user-name">
              <span className="mobile-user-name__label">Hello,</span>
              <span className="mobile-user-name__value">{user?.name || 'User'}</span>
            </div>
            <div className="mobile-user-role">
              <span className="role-icon">{isAdmin() ? '👑' : '👤'}</span>
              <span className="role-text">{isAdmin() ? 'Admin' : 'Viewer'}</span>
            </div>
          </div>
          
          <div className="mobile-drawer__actions">
            <button 
              className="mobile-logout-btn"
               onClick={() => {
                if (window.confirm('Are you sure you want to delete this item?')) {
                  handleLogout();
                }
              }}
            >
              <span className="mobile-logout-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileUserDrawer;