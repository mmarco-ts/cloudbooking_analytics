import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ChatBubble from './ChatBubble';
import { fetchUserReports } from '../config/thoughtspot';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState(null);

  // Get current username
  const username = sessionStorage.getItem('ts_username') || 'User';

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Fetch user's reports from ThoughtSpot when component mounts
  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoadingReports(true);
        setReportsError(null);
        const reports = await fetchUserReports();
        setMyReports(reports);
      } catch (error) {
        console.error('Error loading reports:', error);
        setReportsError('Failed to load reports');
      } finally {
        setLoadingReports(false);
      }
    };

    loadReports();
  }, []);

  return (
    <div className="layout">
      <header className="header">
        <div className="nav-container">
          <div className="logo-container">
            <img 
              src="/cloudbooking-logo.png" 
              alt="Cloudbooking" 
              className="logo"
            />
          </div>
          <nav>
            <ul className="nav-links">
              <li>
                <Link 
                  to="/liveboard" 
                  className={`nav-link ${isActive('/liveboard') || isActive('/') ? 'active' : ''}`}
                >
                  Liveboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/spotter" 
                  className={`nav-link ${isActive('/spotter') ? 'active' : ''}`}
                >
                  AI Analyst
                </Link>
              </li>
              <li className="reports-dropdown">
                <button 
                  className="nav-link reports-btn"
                  onClick={() => setShowReportsMenu(!showReportsMenu)}
                  onBlur={() => setTimeout(() => setShowReportsMenu(false), 200)}
                >
                  My Reports
                  <span className="dropdown-arrow">{showReportsMenu ? '▲' : '▼'}</span>
                </button>
                {showReportsMenu && (
                  <div className="reports-menu">
                    <div className="reports-menu-header">
                      <span className="reports-count">
                        {loadingReports ? 'Loading...' : `${myReports.length} saved reports`}
                      </span>
                    </div>
                    
                    {loadingReports ? (
                      <div className="reports-loading">
                        <div className="loading-spinner"></div>
                        <span>Loading your reports...</span>
                      </div>
                    ) : reportsError ? (
                      <div className="reports-error">
                        <span className="error-icon">⚠️</span>
                        <span>{reportsError}</span>
                      </div>
                    ) : myReports.length === 0 ? (
                      <div className="reports-empty">
                        <span className="empty-icon">📊</span>
                        <span>No reports found</span>
                        <p className="empty-message">Create or favorite reports to see them here</p>
                      </div>
                    ) : (
                      <ul className="reports-list">
                        {myReports.map((report) => (
                          <li key={report.id} className="report-item">
                            <Link 
                              to={`/liveboard?id=${report.id}`}
                              className="report-link"
                              onClick={() => setShowReportsMenu(false)}
                              title={report.description || report.name}
                            >
                              <div className="report-info">
                                <span className="report-name">{report.name}</span>
                                <span className="report-meta">
                                  <span className="report-type">{report.type}</span>
                                  <span className="report-separator">•</span>
                                  <span className="report-time">{report.lastViewed}</span>
                                </span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    <div className="reports-menu-footer">
                      <Link to="/liveboard" className="view-all-link" onClick={() => setShowReportsMenu(false)}>
                        View All Reports →
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </nav>
          
          {/* User Menu */}
          <div className="user-menu-container">
            <button 
              className="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
            >
              <span className="user-avatar">
                {username.charAt(0).toUpperCase()}
              </span>
              <span className="user-name">{username}</span>
              <span className="dropdown-arrow">{showUserMenu ? '▲' : '▼'}</span>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-avatar-large">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name-large">{username}</div>
                    <div className="user-role">Analytics User</div>
                  </div>
                </div>
                <div className="user-dropdown-divider"></div>
                <button className="user-dropdown-item" onClick={onLogout}>
                  <span className="dropdown-icon">🚪</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <ChatBubble />
    </div>
  );
};

export default Layout;
