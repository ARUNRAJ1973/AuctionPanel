import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Static demo credentials
  const ADMIN_EMAIL = 'kplauction123@gmail.com';
  const ADMIN_PASSWORD = 'kplauction@123';
  const USER_EMAIL = 'kpl@gmail.com';
  const USER_PASSWORD = 'kpl@123';

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate loading for better UX
    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error);
      }
      setLoading(false);
    }, 600);
  };

  const fillAdminCredentials = () => {
    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
  };

  const fillUserCredentials = () => {
    setEmail(USER_EMAIL);
    setPassword(USER_PASSWORD);
  };

  return (
    <div className="login-screen">
      <div className="login-background">
        <div className="login-circle circle-1"></div>
        <div className="login-circle circle-2"></div>
        <div className="login-circle circle-3"></div>
        <div className="login-circle circle-4"></div>
      </div>
      
      <div className="login-container">
        <div className="login-side-panel">
          <div className="side-panel-content">
            <div className="brand-logo">
              <div className="logo-icon">🏏</div>
              <h1>KPL Auction</h1>
            </div>
            <div className="brand-description">
              <h2>Welcome Back!</h2>
              <p>Access your cricket auction management system</p>
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">⚡</span>
                  <span>Real-time Bidding</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📊</span>
                  <span>Team Management</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🎯</span>
                  <span>Player Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-header">
            <h2>Sign In</h2>
            <p>Access your auction account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
                <span className="input-icon">📧</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className={`login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* <div className="demo-section" style={{marginTop: 16}}>
            <div className="divider">
              <span>Quick Admin Access</span>
            </div>
            <button 
              type="button" 
              className="demo-btn"
              onClick={fillAdminCredentials}
              disabled={loading}
            >
              <span className="demo-icon">🚀</span>
              Use Admin Credentials
            </button>
            <div className="demo-info">
              <p><strong>Admin Email:</strong> kplauction123@gmail.com</p>
              <p><strong>Password:</strong> kplauction@123</p>
            </div>
          </div> */}

          {/* <div className="demo-section" style={{marginTop: 16}}>
            <div className="divider">
              <span>Quick User Access</span>
            </div>
            <button 
              type="button" 
              className="demo-btn"
              onClick={fillUserCredentials}
              disabled={loading}
            >
              <span className="demo-icon">🎟️</span>
              Use User Credentials
            </button>
            <div className="demo-info">
              <p><strong>User Email:</strong> kpl@gmail.com</p>
              <p><strong>Password:</strong> kpl@123</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
