import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk';
import { initializeThoughtSpot, THOUGHTSPOT_CONFIG } from '../config/thoughtspot';

const LiveboardPage = () => {
  const embedRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get liveboard ID from URL parameter or use default
  const liveboardId = searchParams.get('id') || THOUGHTSPOT_CONFIG.liveboardId;

  const handleChatClick = () => {
    navigate('/spotter');
  };

  const handleTestConnection = async () => {
    console.log('Testing ThoughtSpot connection...');
    try {
      const response = await fetch(`${THOUGHTSPOT_CONFIG.thoughtSpotHost}/callosum/v1/tspublic/v1/session/info`, {
        credentials: 'include',
      });
      console.log('Connection test response:', response.status);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  useEffect(() => {
    const initializeAndEmbed = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize ThoughtSpot SDK with Basic Auth
        console.log('Initializing ThoughtSpot...');
        const initialized = initializeThoughtSpot();
        if (!initialized) {
          throw new Error('Failed to initialize ThoughtSpot SDK');
        }

        // Delay to ensure SDK is fully ready and authentication completes
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Clear any existing content
        if (embedRef.current) {
          embedRef.current.innerHTML = '';
        }

        console.log('Creating LiveboardEmbed with ID:', liveboardId);

        // Create and render the liveboard embed with styling and grouping enabled
        const liveboardEmbed = new LiveboardEmbed(embedRef.current, {
          liveboardId: liveboardId,
          frameParams: {
            width: '100%',
            height: '100%',
          },
          isLiveboardStylingAndGroupingEnabled: true, // New flag for enhanced styling and grouping
          additionalFlags: {
            hideApplicationSwitcher: true,
            hideProfileAndHelp: true,
            hideHomeLeftNav: true,
            hideFooter: true,
          },
          customizations: {
            style: {
              customCSS: {
                variables: {
                  // Light mode root colors - Cloudbooking style
                  '--ts-var-root-background': '#ffffff',
                  '--ts-var-root-color': '#1e293b',
                  
                  // Navigation and header light theme
                  '--ts-var-nav-background': '#ffffff',
                  '--ts-var-nav-color': '#1e293b',
                  '--ts-var-header-background': '#f8fafc',
                  
                  // Chart and visualization backgrounds
                  '--ts-var-viz-background': '#ffffff',
                  '--ts-var-chart-background': '#ffffff',
                  '--ts-var-answer-background': '#ffffff',
                  
                  // Text colors for light mode
                  '--ts-var-answer-color': '#1e293b',
                  '--ts-var-chart-axis-color': '#64748b',
                  '--ts-var-chart-grid-color': '#e2e8f0',
                  
                  // Button theming with Cloudbooking blue
                  '--ts-var-button--primary-background': '#66CCFF',
                  '--ts-var-button--primary-color': '#ffffff',
                  '--ts-var-button--primary-hover-background': '#4db8ff',
                  '--ts-var-button--primary-active-background': '#33a3ff',
                  '--ts-var-button--secondary-background': '#f1f5f9',
                  '--ts-var-button--secondary-color': '#1e293b',
                  '--ts-var-button--tertiary-background': '#e2e8f0',
                  '--ts-var-button--tertiary-color': '#1e293b',
                  
                  // Filter and search components
                  '--ts-var-search-bar-background': '#f8fafc',
                  '--ts-var-search-bar-text-color': '#1e293b',
                  '--ts-var-filter-background': '#ffffff',
                  '--ts-var-filter-color': '#1e293b',
                  
                  // Table theming
                  '--ts-var-table-background': '#ffffff',
                  '--ts-var-table-header-background': '#f8fafc',
                  '--ts-var-table-border-color': '#e2e8f0',
                  '--ts-var-table-row-even-background': '#ffffff',
                  '--ts-var-table-row-odd-background': '#f8fafc',
                  
                  // Menu and dropdown theming
                  '--ts-var-menu-background': '#ffffff',
                  '--ts-var-menu-color': '#1e293b',
                  '--ts-var-menu-hover-background': '#f1f5f9',
                  '--ts-var-dropdown-background': '#ffffff',
                  '--ts-var-dropdown-border-color': '#e2e8f0',
                  
                  // Card and panel backgrounds
                  '--ts-var-card-background': '#ffffff',
                  '--ts-var-panel-background': '#f8fafc',
                  '--ts-var-sidebar-background': '#ffffff',
                  
                  // Border colors for light theme
                  '--ts-var-border-color': '#e2e8f0',
                  '--ts-var-divider-color': '#e2e8f0',
                  
                  // Accent colors using Cloudbooking blue theme
                  '--ts-var-accent-primary': '#66CCFF',
                  '--ts-var-accent-secondary': '#4db8ff',
                  '--ts-var-link-color': '#66CCFF',
                  '--ts-var-link-hover-color': '#4db8ff',
                }
              }
            }
          }
        });

        // Handle events with detailed logging
        liveboardEmbed.on('init', (data) => {
          console.log('Liveboard initialized successfully:', data);
          setLoading(false);
        });

        liveboardEmbed.on('load', (data) => {
          console.log('Liveboard loaded:', data);
          setLoading(false);
        });

        liveboardEmbed.on('error', (error) => {
          console.error('Liveboard error details:', error);
          setError(`Failed to load liveboard: ${error.message || 'Unknown error'}. Please check your credentials and connection.`);
          setLoading(false);
        });

        // Add additional event listeners for debugging
        liveboardEmbed.on('authInit', () => {
          console.log('Authentication initialized');
        });

        liveboardEmbed.on('authExpire', () => {
          console.warn('Authentication expired');
        });

        console.log('Rendering liveboard embed...');
        // Render the embed
        await liveboardEmbed.render();
        console.log('Liveboard render call completed');
        
      } catch (err) {
        console.error('Error initializing liveboard:', err);
        setError('Failed to initialize liveboard. Please check your configuration.');
        setLoading(false);
      }
    };

    initializeAndEmbed();

    // Cleanup function
    return () => {
      const currentRef = embedRef.current;
      if (currentRef) {
        currentRef.innerHTML = '';
      }
    };
  }, [liveboardId]); // Re-render when liveboard ID changes

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Workplace Analytics Dashboard</h1>
        <p className="page-description">
          Monitor occupancy, utilization, and resource efficiency across your workplace portfolio
        </p>
      </div>
      
      <div className="dashboard-layout">
        {/* AI Insights Panel */}
        <div className="ai-insights-panel">
          <div className="insights-header">
            <h3>📊 Key Metrics</h3>
            <span className="insights-subtitle">Workplace Intelligence</span>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">📍</div>
            <div className="insight-content">
              <h4>Occupancy Rate</h4>
              <p>Current desk occupancy is 73%, with highest utilization in EMEA sites during business hours.</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">⚡</div>
            <div className="insight-content">
              <h4>Space Utilization</h4>
              <p>Meeting rooms show 82% booking rate but only 67% check-in rate, indicating potential optimization.</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">🚫</div>
            <div className="insight-content">
              <h4>No-Show Analysis</h4>
              <p>15% no-show rate detected across sites. Consider implementing automated reminders to improve attendance.</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <div className="insight-content">
              <h4>License Optimization</h4>
              <p>Identify underutilized seats across 12 tenants, representing potential cost savings of £85K annually.</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">🔄</div>
            <div className="insight-content">
              <h4>Booking Patterns</h4>
              <p>Repeat bookings comprise 42% of total volume, indicating strong adoption of hybrid work policies.</p>
            </div>
          </div>
          
          <div className="insights-cta">
            <button className="ai-chat-button" onClick={handleChatClick}>
              💬 Ask AI Analyst
            </button>
          </div>
        </div>
        
        {/* Dashboard Container */}
        <div className="dashboard-container">
          <div className="thoughtspot-container">
            {loading && (
              <div className="loading">
                <div>Loading Workplace Analytics...</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#888' }}>
                  Initializing dashboard
                </div>
              </div>
            )}
            
            {error && (
              <div className="error">
                <h3>Error Loading Dashboard</h3>
                <p>{error}</p>
                <div style={{ fontSize: '0.8rem', marginTop: '1rem', color: '#ffcccc' }}>
                  Debug Info: Host: {THOUGHTSPOT_CONFIG.thoughtSpotHost} | Liveboard: {THOUGHTSPOT_CONFIG.liveboardId}
                </div>
                <button 
                  onClick={handleTestConnection}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#333',
                    color: '#fff',
                    border: '1px solid #666',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Test Connection
                </button>
              </div>
            )}
            
            <div 
              ref={embedRef} 
              className="embed-container"
              style={{ display: loading || error ? 'none' : 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveboardPage;
