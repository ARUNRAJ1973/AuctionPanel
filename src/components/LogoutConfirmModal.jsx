import React from 'react';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div className="logout-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-icon-badge">
          🚪
        </div>
        <h3 className="logout-modal-title">Confirm Logout</h3>
        <p className="logout-modal-message">
          Are you sure you want to log out of your session?
        </p>
        <div className="logout-modal-actions">
          <button 
            className="logout-modal-btn cancel" 
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="logout-modal-btn confirm" 
            onClick={onConfirm}
            type="button"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
