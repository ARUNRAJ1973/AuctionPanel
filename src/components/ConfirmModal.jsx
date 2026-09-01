import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  icon = "⚠️",
  variant = "danger" 
}) => {
  if (!isOpen) return null;

  const getBadgeStyle = () => {
    switch (variant) {
      case 'danger':
        return { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' };
      case 'warning':
        return { background: '#fffbe6', border: '1px solid #fde68a', color: '#b45309' };
      case 'success':
        return { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857' };
      default:
        return { background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155' };
    }
  };

  const getConfirmBtnStyle = () => {
    switch (variant) {
      case 'danger':
        return { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)' };
      case 'warning':
        return { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)' };
      case 'success':
        return { background: 'linear-gradient(135deg, #10b981, #047857)', color: '#ffffff', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)' };
      default:
        return { background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#ffffff', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)' };
    }
  };

  return (
    <div 
      className="overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: 24,
          padding: '24px 20px',
          width: 'min(400px, 92vw)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          color: '#0f172a',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          boxSizing: 'border-box'
        }}
      >
        {/* Icon Badge */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          ...getBadgeStyle()
        }}>
          {icon}
        </div>

        {/* Title & Message */}
        <div>
          <h3 style={{ fontSize: 19, fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0', fontStyle: 'italic' }}>
            {title}
          </h3>
          <p style={{ color: '#64748b', margin: 0, fontSize: 13, lineHeight: 1.5, fontWeight: 600 }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              minHeight: 42,
              borderRadius: 10,
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              flex: 1,
              minHeight: 42,
              borderRadius: 10,
              border: 'none',
              fontSize: 13,
              fontWeight: 900,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              ...getConfirmBtnStyle()
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
