import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import LiveboardPage from './pages/LiveboardPage';
import SpotterPage from './pages/SpotterPage';
import { initializeThoughtSpotWithCredentials } from './config/thoughtspot';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (session exists)
  useEffect(() => {
    const checkAuth = () => {
      const username = sessionStorage.getItem('ts_username');
      const password = sessionStorage.getItem('ts_password');
      
      if (username && password) {
        // User has credentials stored, initialize ThoughtSpot
        initializeThoughtSpotWithCredentials(username, password);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (username, password) => {
    // Initialize ThoughtSpot with provided credentials
    const success = await initializeThoughtSpotWithCredentials(username, password);
    if (success) {
      setIsAuthenticated(true);
      return true;
    }
    throw new Error('Authentication failed');
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('ts_username');
    sessionStorage.removeItem('ts_password');
    setIsAuthenticated(false);
    // Reload to clear any cached ThoughtSpot data
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner-large"></div>
        <p>Loading Cloudbooking Analytics...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/liveboard" replace /> : 
              <LoginPage onLogin={handleLogin} />
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Navigate to="/liveboard" replace />} />
                  <Route path="/liveboard" element={<LiveboardPage />} />
                  <Route path="/spotter" element={<SpotterPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;


