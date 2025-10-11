import React from 'react';
import { useAuth } from '../context/AuthContext';

// Component that only shows content to admin users
export const AdminOnly = ({ children, fallback = null }) => {
  const { isAdmin } = useAuth();
  return isAdmin() ? children : fallback;
};

// Component that only shows content to regular users
export const UserOnly = ({ children, fallback = null }) => {
  const { isUser } = useAuth();
  return isUser() ? children : fallback;
};

// Component that shows content to both admin and users but with different content
export const RoleConditional = ({ adminContent, userContent, bothContent = null }) => {
  const { isAdmin, isUser } = useAuth();
  
  if (bothContent) {
    return bothContent;
  }
  
  if (isAdmin()) {
    return adminContent;
  }
  
  if (isUser()) {
    return userContent;
  }
  
  return null;
};

// Component that restricts access based on role
export const RestrictedAccess = ({ allowedRoles, children, fallback }) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="access-denied">
        <div className="access-denied-content">
          <h3>🚫 Access Restricted</h3>
          <p>You don't have permission to view this content.</p>
          <small>Required role: {allowedRoles.join(' or ')}</small>
        </div>
      </div>
    );
  }
  
  return children;
};

// Higher-order component for role-based rendering
export const withRoleAccess = (Component, allowedRoles) => {
  return function RoleProtectedComponent(props) {
    return (
      <RestrictedAccess allowedRoles={allowedRoles}>
        <Component {...props} />
      </RestrictedAccess>
    );
  };
};