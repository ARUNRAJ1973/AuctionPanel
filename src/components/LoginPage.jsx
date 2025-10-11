import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Static admin credentials for demo
  const ADMIN_EMAIL = 'kplauction123@gmail.com';
  const ADMIN_PASSWORD = 'kplauction@123';

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Simulate loading for better UX
    setTimeout(() => {
      if (isSignUp) {
        // Handle registration
        const result = register(email, password, name);
        if (result.success) {
          setSuccess('Account created successfully! You can now sign in.');
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setName('');
        } else {
          setError(result.error);
        }
      } else {
        // Handle login
        const result = login(email, password);
        if (!result.success) {
          setError(result.error);
        }
        // If successful, the AuthContext will handle the state change
      }
      setLoading(false);
    }, 1000);
  };

  const fillDemoCredentials = () => {
    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
    setIsSignUp(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
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
            <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
            <p>{isSignUp ? 'Join the KPL Auction community' : 'Access your auction account'}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>
            )}

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
                  placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
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

            {success && (
              <div className="success-message">
                <span className="success-icon">✓</span>
                {success}
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
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-toggle">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button 
                type="button" 
                className="toggle-btn"
                onClick={toggleMode}
                disabled={loading}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* {!isSignUp && (
            <div className="demo-section">
              <div className="divider">
                <span>Quick Admin Access</span>
              </div>
              <button 
                type="button" 
                className="demo-btn"
                onClick={fillDemoCredentials}
                disabled={loading}
              >
                <span className="demo-icon">🚀</span>
                Use Admin Credentials
              </button>
              <div className="demo-info">
                <p><strong>Admin Email:</strong> kplauction123@gmail.com</p>
                <p><strong>Password:</strong> kplauction@123</p>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
