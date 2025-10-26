import React, { useState, useRef, useEffect } from 'react';
import { SpotterEmbed } from '@thoughtspot/visual-embed-sdk';
import { initializeThoughtSpot, THOUGHTSPOT_CONFIG } from '../config/thoughtspot';
import './ChatBubble.css';

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState('');
  const embedRef = useRef(null);
  const spotterInstance = useRef(null);

  // Suggested prompt questions for Cloudbooking workplace analytics
  const promptQuestions = [
    "What is our occupancy % by site?",
    "Show no show rate by tenant",
    "What are bookings by resource type?",
    "Compare checked in vs capacity",
    "Which floors have highest utilization?",
    "Show cancelled bookings trend",
    "What's the average booking duration by resource type?",
    "Bookings by tenant region over time",
  ];

  const handlePromptClick = (question) => {
    setSelectedQuery(question);
    setShowPrompts(false);
    
    // Clear existing instance if present and initialize with the selected query
    if (spotterInstance.current) {
      spotterInstance.current = null;
    }
    if (embedRef.current) {
      embedRef.current.innerHTML = '';
    }
    
    // Initialize Spotter with the question
    // Use setTimeout to ensure DOM has updated after state change
    setTimeout(() => {
      initializeSpotterEmbed(question);
    }, 100);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const initializeSpotterEmbed = async (searchQuery = '') => {
    try {
      setLoading(true);
      setError(null);

      // Wait for embedRef to be available
      if (!embedRef.current) {
        console.log('Waiting for embedRef to be available...');
        await new Promise(resolve => setTimeout(resolve, 200));
        if (!embedRef.current) {
          throw new Error('Embed container not ready');
        }
      }

      // Initialize ThoughtSpot SDK if not already initialized
      const initialized = initializeThoughtSpot();
      if (!initialized) {
        throw new Error('Failed to initialize ThoughtSpot SDK');
      }

      // Small delay to ensure SDK is ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (embedRef.current) {
        embedRef.current.innerHTML = '';
      }

      // Create Spotter embed with optional pre-loaded query
      const embedConfig = {
        worksheetId: THOUGHTSPOT_CONFIG.modelId,
        frameParams: {
          width: '100%',
          height: '100%',
        },
        additionalFlags: {
          hideApplicationSwitcher: true,
          hideProfileAndHelp: true,
          hideHomeLeftNav: true,
        },
        customizations: {
          style: {
            customCSS: {
              variables: {
                '--ts-var-root-background': '#000000',
                '--ts-var-root-color': '#ffffff',
                '--ts-var-spotter-prompt-background': '#1a1a1a',
                '--ts-var-spotter-conversation-background': '#111111',
                '--ts-var-button--primary-background': '#00c4ff',
                '--ts-var-button--primary-color': '#ffffff',
                '--ts-var-search-bar-background': '#1a1a1a',
                '--ts-var-search-bar-text-color': '#ffffff',
              },
            },
          },
          content: {
            strings: {
              "meet Spotter": "Cloudbooking AI",
              "Meet Spotter": "Cloudbooking AI",
              "Spotter": "Cloudbooking AI",
            },
          },
        },
      };

      // Add search query if provided
      if (searchQuery) {
        embedConfig.searchOptions = {
          searchQuery: searchQuery,
          executeSearch: true
        };
      }

      spotterInstance.current = new SpotterEmbed(embedRef.current, embedConfig);

      spotterInstance.current.on('init', () => {
        console.log('Chat bubble Spotter initialized');
        setLoading(false);
      });

      spotterInstance.current.on('error', (embedError) => {
        console.error('Chat bubble Spotter error:', embedError);
        setError('Failed to load Cloudbooking AI. Please try again.');
        setLoading(false);
      });

      await spotterInstance.current.render();
      
    } catch (err) {
      console.error('Error initializing Spotter in chat bubble:', err);
      setError('Failed to initialize Cloudbooking AI. Please check your configuration.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Spotter when chat is opened for the first time (no query selected)
    if (isOpen && !spotterInstance.current && !selectedQuery && !showPrompts) {
      initializeSpotterEmbed();
    }
  }, [isOpen, selectedQuery, showPrompts]);

  return (
    <>
      <div className={`chat-bubble-container ${isOpen ? 'open' : ''}`}>
        {isOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <div className="chat-header-content">
                <div className="chat-avatar">🤖</div>
                <div className="chat-header-text">
                  <h4>Cloudbooking AI Analyst</h4>
                  <span className="chat-status">Online</span>
                </div>
              </div>
              <button className="chat-close-btn" onClick={toggleChat}>
                ✕
              </button>
            </div>

            {/* Show prompt questions or Spotter embed */}
            {showPrompts && !loading && !error ? (
              <div className="chat-messages">
                <div className="chat-welcome">
                  <p>👋 Hi! I'm your AI Analyst for workplace analytics.</p>
                  <p>Click any question below to get started:</p>
                </div>
                <div className="prompt-suggestions">
                  <div className="prompt-header">💡 Quick Start Questions:</div>
                  <div className="prompt-grid">
                    {promptQuestions.map((question, index) => (
                      <button
                        key={index}
                        className="prompt-button"
                        onClick={() => handlePromptClick(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="chat-embed-area">
                {loading && (
                  <div className="chat-loading">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p>Loading AI Analyst...</p>
                  </div>
                )}
                
                {error && (
                  <div className="chat-error">
                    <p>{error}</p>
                    <button onClick={() => setShowPrompts(true)}>← Back to prompts</button>
                  </div>
                )}
                
                <div 
                  ref={embedRef} 
                  className="spotter-embed-container"
                  style={{ display: loading || error ? 'none' : 'block' }}
                />
                
                {!loading && !error && selectedQuery && (
                  <div className="chat-footer">
                    <button 
                      className="back-to-prompts-btn"
                      onClick={() => {
                        setShowPrompts(true);
                        setSelectedQuery('');
                        if (embedRef.current) {
                          embedRef.current.innerHTML = '';
                        }
                        spotterInstance.current = null;
                      }}
                    >
                      💡 Show more questions
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button className="chat-bubble-btn" onClick={toggleChat}>
          {isOpen ? '✕' : '💬'}
        </button>
      </div>
    </>
  );
};

export default ChatBubble;
