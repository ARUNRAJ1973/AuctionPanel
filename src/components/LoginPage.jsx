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
  const ADMIN_EMAIL = 'kpl@gmail.com';
  const ADMIN_PASSWORD = '87654321';
  const USER_EMAIL = 'kpt@gmail.com';
  const USER_PASSWORD = 'kpt123';

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error);
      }
      setLoading(false);
    }, 600);
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
              <img
                src="/auction.jpeg"
                alt="Auction Panel Logo"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
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

          <div className="demo-section" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="demo-btn"
              onClick={fillUserCredentials}
              disabled={loading}
            >
              <span className="demo-icon">🎟️</span>
              Use User Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
