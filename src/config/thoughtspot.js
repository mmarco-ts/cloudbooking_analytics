import { init, AuthType } from '@thoughtspot/visual-embed-sdk';

// ThoughtSpot configuration
export const THOUGHTSPOT_CONFIG = {
  thoughtSpotHost: 'https://analytics-cloudbooking.thoughtspot.cloud',
  username: 'tsadmin',
  password: 'TSCloud123!',
  liveboardId: '7d749892-4fb3-4a69-8566-6537fdfa6c46',
  modelId: '0d5e909e-99ac-4484-b545-e277a82330ba'
};

let isInitialized = false;
let isAuthenticating = false;
let authPromise = null;

// Login to ThoughtSpot and establish session
const loginToThoughtSpot = async () => {
  try {
    console.log('Logging into ThoughtSpot with Basic Auth...');
    const response = await fetch(`${THOUGHTSPOT_CONFIG.thoughtSpotHost}/callosum/v1/tspublic/v1/session/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: new URLSearchParams({
        username: THOUGHTSPOT_CONFIG.username,
        password: THOUGHTSPOT_CONFIG.password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login failed:', response.status, errorText);
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    console.log('Successfully logged into ThoughtSpot');
    return true;
  } catch (error) {
    console.error('Error during ThoughtSpot login:', error);
    throw error;
  }
};

// Initialize ThoughtSpot SDK with proper authentication
export const initializeThoughtSpot = async () => {
  // If already initialized, return true
  if (isInitialized) {
    console.log('ThoughtSpot SDK already initialized');
    return true;
  }

  // If currently authenticating, wait for that to complete
  if (isAuthenticating && authPromise) {
    console.log('Authentication in progress, waiting...');
    return authPromise;
  }

  // Start authentication
  isAuthenticating = true;
  authPromise = (async () => {
    try {
      console.log('Initializing ThoughtSpot SDK with host:', THOUGHTSPOT_CONFIG.thoughtSpotHost);
      
      // Step 1: Login to establish session
      await loginToThoughtSpot();
      
      // Step 2: Initialize SDK with AuthType.None (since we already have session)
      init({
        thoughtSpotHost: THOUGHTSPOT_CONFIG.thoughtSpotHost,
        authType: AuthType.None,
      });
      
      console.log('ThoughtSpot SDK initialized successfully');
      isInitialized = true;
      isAuthenticating = false;
      return true;
    } catch (error) {
      console.error('Failed to initialize ThoughtSpot SDK:', error);
      isAuthenticating = false;
      authPromise = null;
      return false;
    }
  })();

  return authPromise;
};

// Fetch user's reports from ThoughtSpot
export const fetchUserReports = async () => {
  try {
    // Ensure we're logged in first
    await initializeThoughtSpot();
    
    const baseUrl = THOUGHTSPOT_CONFIG.thoughtSpotHost;
    
    // Fetch metadata for liveboards and answers created by or favorited by the user
    // Using session-based auth (cookies) instead of Basic Auth header
    const response = await fetch(`${baseUrl}/api/rest/2.0/metadata/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Important: includes cookies for session auth
      body: JSON.stringify({
        metadata: [
          {
            type: 'LIVEBOARD'
          },
          {
            type: 'ANSWER'
          }
        ],
        sort_options: {
          field_name: 'MODIFIED',
          order: 'DESC'
        },
        record_size: 20
      })
    });

    if (!response.ok) {
      throw new Error(`ThoughtSpot API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched reports from ThoughtSpot:', data);
    
    // Transform the response into a format we can use
    const reports = [];
    
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        if (item.metadata_type === 'LIVEBOARD' || item.metadata_type === 'ANSWER') {
          reports.push({
            id: item.metadata_id,
            name: item.metadata_name,
            type: item.metadata_type === 'LIVEBOARD' ? 'Liveboard' : 'Answer',
            description: item.description || '',
            author: item.author_name || item.owner_name || 'Unknown',
            modified: item.modified || item.created,
            modifiedEpoch: item.modified_epoch || item.created_epoch,
            // Calculate relative time
            lastViewed: formatRelativeTime(item.modified_epoch || item.created_epoch)
          });
        }
      });
    }
    
    return reports;
  } catch (error) {
    console.error('Error fetching user reports:', error);
    // Return sample data as fallback
    return getSampleReports();
  }
};

// Helper function to format relative time
const formatRelativeTime = (epochMs) => {
  if (!epochMs) return 'Recently';
  
  const now = Date.now();
  const diff = now - epochMs;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

// Sample reports as fallback
const getSampleReports = () => {
  return [
    { id: 1, name: 'Weekly Occupancy Summary', type: 'Liveboard', lastViewed: '2 hours ago', author: 'You' },
    { id: 2, name: 'Department Utilization Report', type: 'Liveboard', lastViewed: '1 day ago', author: 'You' },
    { id: 3, name: 'No-Show Analysis', type: 'Liveboard', lastViewed: '3 days ago', author: 'You' },
    { id: 4, name: 'License Waste Report', type: 'Liveboard', lastViewed: '1 week ago', author: 'You' },
  ];
};
