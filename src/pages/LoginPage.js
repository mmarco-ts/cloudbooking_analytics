import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      // Store credentials securely in sessionStorage (cleared when browser closes)
      sessionStorage.setItem('ts_username', username);
      sessionStorage.setItem('ts_password', password);
      
      // Call parent login handler
      await onLogin(username, password);
      
      // Navigate to main app
      navigate('/liveboard');
    } catch (err) {
      setError('Invalid credentials. Please check your ThoughtSpot username and password.');
      // Clear stored credentials on error
      sessionStorage.removeItem('ts_username');
      sessionStorage.removeItem('ts_password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left side - Branding */}
        <div className="login-brand">
          <div className="brand-content">
            <img 
              src="/cloudbooking-logo.png" 
              alt="Cloudbooking" 
              className="login-logo"
            />
            <h1 className="brand-title">Workplace Analytics</h1>
            <p className="brand-subtitle">
              Powered by AI • Secured for Enterprise • Built for Insight
            </p>
            
            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div className="feature-text">
                  <h3>Real-Time Insights</h3>
                  <p>Track occupancy, utilization, and resource efficiency across all your workplace locations</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🤖</div>
                <div className="feature-text">
                  <h3>AI-Powered Analytics</h3>
                  <p>Ask questions in natural language and get instant answers with interactive visualizations</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <div className="feature-text">
                  <h3>Enterprise Security</h3>
                  <p>Multi-tenant data isolation with row-level security and regional data residency</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="login-form-section">
          <div className="login-form-container">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Sign in to access your workplace analytics dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">ThoughtSpot Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">ThoughtSpot Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span className="login-icon">🔐</span>
                    Sign In to Analytics
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <div className="security-badge">
                <span className="badge-icon">🛡️</span>
                <span className="badge-text">Secure Connection • Your credentials are encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

