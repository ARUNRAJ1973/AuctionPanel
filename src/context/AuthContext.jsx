import React, { createContext, useContext, useState, useEffect } from 'react';
import userService from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user was previously logged in
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
      setShowWelcome(false);
    } else {
      // Check old auth system for backward compatibility
      const savedAuth = localStorage.getItem('kpl_auth');
      if (savedAuth === 'true') {
        localStorage.removeItem('kpl_auth'); // Clean up old auth
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    try {
      const loggedInUser = userService.loginUser(email, password);
      setIsAuthenticated(true);
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = (email, password, name) => {
    try {
      const newUser = userService.registerUser(email, password, name);
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    userService.logoutUser();
    setIsAuthenticated(false);
    setUser(null);
    setShowWelcome(true);
  };

  const completeWelcome = () => {
    setShowWelcome(false);
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isUser = () => {
    return user && user.role === 'user';
  };

  const value = {
    isAuthenticated,
    showWelcome,
    user,
    loading,
    login,
    register,
    logout,
    completeWelcome,
    isAdmin,
    isUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
