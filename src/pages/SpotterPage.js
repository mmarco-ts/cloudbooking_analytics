import React, { useEffect, useRef, useState } from 'react';
import { SpotterEmbed } from '@thoughtspot/visual-embed-sdk';
import { initializeThoughtSpot, THOUGHTSPOT_CONFIG } from '../config/thoughtspot';

const SpotterPage = () => {
  const embedRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAndEmbed = async () => {
      try {
        setLoading(true);
        setError(null);

<<<<<<< HEAD
        // Initialize ThoughtSpot SDK with Basic Auth
        console.log('Initializing ThoughtSpot for Spotter...');
=======
        // Initialize ThoughtSpot SDK
>>>>>>> parent of ac98ca3 (updated credentials)
        const initialized = initializeThoughtSpot();
        if (!initialized) {
          throw new Error('Failed to initialize ThoughtSpot SDK');
        }

<<<<<<< HEAD
        // Delay to ensure SDK is ready and authentication completes
        await new Promise(resolve => setTimeout(resolve, 1500));
=======
        // Small delay to ensure SDK is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
>>>>>>> parent of ac98ca3 (updated credentials)

        // Create and render the Spotter embed
        const spotterEmbed = new SpotterEmbed(embedRef.current, {
          worksheetId: THOUGHTSPOT_CONFIG.modelId, // ID of the data source object (Model) to query data
          frameParams: {
            width: '100%',
            height: '100%',
          },
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
                  // Light mode variables for Spotter - Cloudbooking style
                  '--ts-var-root-background': '#ffffff',
                  '--ts-var-root-color': '#1e293b',
                  '--ts-var-spotter-prompt-background': '#f8fafc',
                  '--ts-var-spotter-conversation-background': '#ffffff',
                  '--ts-var-button--primary-background': '#66CCFF',
                  '--ts-var-button--primary-color': '#ffffff',
                  '--ts-var-button--secondary-background': '#f1f5f9',
                  '--ts-var-button--secondary-color': '#1e293b',
                  '--ts-var-nav-background': '#ffffff',
                  '--ts-var-answer-background': '#ffffff',
                  '--ts-var-search-bar-background': '#f8fafc',
                  '--ts-var-search-bar-text-color': '#1e293b',
                  '--ts-var-chart-background': '#ffffff',
                  '--ts-var-viz-background': '#ffffff',
                  '--ts-var-border-color': '#e2e8f0',
                  '--ts-var-accent-primary': '#66CCFF',
                  '--ts-var-link-color': '#66CCFF',
                },
              },
            },
            content: {
              strings: {
                // Replace "meet Spotter" with "Cloudbooking AI"
                "meet Spotter": "Cloudbooking AI",
                "Meet Spotter": "Cloudbooking AI",
                "MEET SPOTTER": "CLOUDBOOKING AI",
                // Replace other Spotter references with Cloudbooking AI
                "Spotter": "Cloudbooking AI",
                "Ask Spotter": "Ask Cloudbooking AI",
                "Spotter can help": "Cloudbooking AI can help",
              },
            },
          },
        });

        // Handle events
        spotterEmbed.on('init', () => {
          console.log('Cloudbooking AI embed initialized');
          setLoading(false);
        });

        spotterEmbed.on('error', (error) => {
          console.error('Cloudbooking AI embed error:', error);
          setError('Failed to load Cloudbooking AI interface. Please check your connection and try again.');
          setLoading(false);
        });

        // Render the embed
        await spotterEmbed.render();
        
      } catch (err) {
        console.error('Error initializing Cloudbooking AI embed:', err);
        setError('Failed to initialize Cloudbooking AI interface. Please check your configuration.');
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
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Cloudbooking AI Analyst</h1>
        <p className="page-description">
          Ask natural language questions about your workplace data. Get instant insights on occupancy, 
          utilization, booking trends, and resource optimization across all your sites.
        </p>
      </div>

      <div className="dashboard-layout">
        {/* Example Questions Panel */}
        <div className="ai-insights-panel">
          <div className="insights-header">
            <h3>💡 Try Asking</h3>
            <span className="insights-subtitle">Sample Queries</span>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <h4>"What is our occupancy % by site?"</h4>
              <p>View space utilization across all locations</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">📅</div>
            <div className="insight-content">
              <h4>"Show bookings trend by date"</h4>
              <p>Analyze booking volume patterns over time</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">🚫</div>
            <div className="insight-content">
              <h4>"No show rate by tenant"</h4>
              <p>Identify tenants with attendance issues</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">✅</div>
            <div className="insight-content">
              <h4>"Compare checked in vs capacity"</h4>
              <p>Measure actual attendance vs available capacity</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">🏢</div>
            <div className="insight-content">
              <h4>"Which floors have highest utilization?"</h4>
              <p>Optimize space allocation by floor</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">⏱️</div>
            <div className="insight-content">
              <h4>"Average duration by resource type"</h4>
              <p>Understand booking length by desk, room, parking</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">🔄</div>
            <div className="insight-content">
              <h4>"Show cancelled bookings by department"</h4>
              <p>Track cancellation patterns and reasons</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">🌍</div>
            <div className="insight-content">
              <h4>"Bookings by tenant region"</h4>
              <p>Compare usage across geographic regions</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>"Weekly booking source breakdown"</h4>
              <p>See how employees are making bookings</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <div className="insight-content">
              <h4>"Where is license waste occurring?"</h4>
              <p>Identify underutilized capacity and cost savings</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">🔁</div>
            <div className="insight-content">
              <h4>"Repeat booking rate by site"</h4>
              <p>Measure recurring reservation adoption</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">📍</div>
            <div className="insight-content">
              <h4>"Show me active vs inactive resources"</h4>
              <p>Audit resource availability and status</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">👥</div>
            <div className="insight-content">
              <h4>"Occupancy % by office days policy"</h4>
              <p>Evaluate hybrid work policy effectiveness</p>
            </div>
          </div>
          
          <div className="insights-cta">
            <div style={{
              textAlign: 'center',
              padding: '1rem 0',
              fontSize: '0.9rem',
              color: '#64748b',
              borderTop: '1px solid #e2e8f0',
              marginTop: '1rem'
            }}>
              💡 <strong>Tip:</strong> Ask anything about your workplace data!
            </div>
          </div>
        </div>
        
        {/* Spotter Container */}
        <div className="dashboard-container">
          <div className="thoughtspot-container">
            {loading && (
              <div className="loading">
                Loading AI Analyst...
              </div>
            )}
            
            {error && (
              <div className="error">
                <h3>Error Loading AI Analyst</h3>
                <p>{error}</p>
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

export default SpotterPage;
