# My Reports - ThoughtSpot Integration

This document explains how the "My Reports" feature fetches and displays real reports from your ThoughtSpot instance.

## Overview

The "My Reports" dropdown in the header navigation now connects to ThoughtSpot's REST API to fetch:
- **Liveboards** - Saved dashboard collections
- **Answers** - Saved search results and visualizations

Reports are sorted by **most recently modified** and displayed with:
- Report name
- Type (Liveboard or Answer)
- Last modified time (relative format: "2 hours ago", "3 days ago", etc.)

## How It Works

### 1. API Integration

**File**: `src/config/thoughtspot.js`

The `fetchUserReports()` function calls ThoughtSpot's metadata search API:

```javascript
// Endpoint: /api/rest/2.0/metadata/search
// Method: POST
// Authentication: Basic Auth (username/password)

// Fetches both Liveboards and Answers
// Sorted by MODIFIED date (most recent first)
// Limit: 20 reports
```

**API Request Structure**:
```json
{
  "metadata": [
    { "type": "LIVEBOARD" },
    { "type": "ANSWER" }
  ],
  "sort_options": {
    "field_name": "MODIFIED",
    "order": "DESC"
  },
  "record_size": 20
}
```

### 2. Data Transformation

The API response is transformed into a user-friendly format:

```javascript
{
  id: "guid-123-456",              // ThoughtSpot object ID
  name: "Weekly Occupancy Summary", // Display name
  type: "Liveboard",                // "Liveboard" or "Answer"
  description: "...",               // Optional description
  author: "John Smith",             // Creator name
  modified: "2024-10-26",           // Last modified date
  modifiedEpoch: 1729958400000,     // Timestamp (ms)
  lastViewed: "2 hours ago"         // Human-readable time
}
```

### 3. Component Integration

**File**: `src/components/Layout.js`

The Layout component:
- Fetches reports on mount using `useEffect`
- Manages loading, error, and empty states
- Displays reports in dropdown menu
- Links to specific Liveboard when clicked

### 4. Dynamic Report Loading

**File**: `src/pages/LiveboardPage.js`

The LiveboardPage now supports URL parameters:
- **Default**: `/liveboard` → Loads default Liveboard
- **Specific**: `/liveboard?id=abc-123` → Loads specific Liveboard by ID

When you click a report in "My Reports", it loads that specific Liveboard.

## UI States

### 1. Loading State
When fetching reports from ThoughtSpot:
```
┌─────────────────────────────┐
│  Loading...                 │
│                             │
│     ⟳  Loading your         │
│        reports...           │
└─────────────────────────────┘
```

### 2. Reports Loaded
Normal state with reports:
```
┌─────────────────────────────┐
│  4 saved reports            │
├─────────────────────────────┤
│ Weekly Occupancy Summary    │
│ Liveboard • 2 hours ago     │
├─────────────────────────────┤
│ No-Show Analysis            │
│ Liveboard • 3 days ago      │
├─────────────────────────────┤
│ View All Reports →          │
└─────────────────────────────┘
```

### 3. Error State
If API call fails:
```
┌─────────────────────────────┐
│  Failed to load reports     │
│                             │
│         ⚠️                   │
│  Failed to load reports     │
└─────────────────────────────┘
```

### 4. Empty State
If user has no reports:
```
┌─────────────────────────────┐
│  0 saved reports            │
├─────────────────────────────┤
│         📊                   │
│   No reports found          │
│   Create or favorite        │
│   reports to see them here  │
└─────────────────────────────┘
```

## Features

### Automatic Refresh
Reports are fetched once when the app loads. To refresh:
- Reload the page
- Or add a "Refresh" button (future enhancement)

### Relative Time Display
Modified times are shown in human-readable format:
- "Just now" (< 1 minute)
- "5 minutes ago"
- "2 hours ago"
- "3 days ago"
- "2 weeks ago"
- "1 month ago"
- "2 years ago"

### Fallback Data
If the API call fails, sample reports are shown as fallback:
- Weekly Occupancy Summary
- Department Utilization Report
- No-Show Analysis
- License Waste Report

This ensures the UI doesn't break if ThoughtSpot is unavailable.

## API Endpoint Details

### ThoughtSpot REST API v2.0

**Base URL**: `https://your-instance.thoughtspot.cloud`

**Endpoint**: `/api/rest/2.0/metadata/search`

**Authentication**: 
- Currently using Basic Auth with username/password
- For production, switch to Trusted Auth (token-based)

**Rate Limits**:
- Check ThoughtSpot documentation for current limits
- Typically: 100 requests per minute per user

**Response Fields Used**:
- `metadata_id` - Unique identifier
- `metadata_name` - Display name
- `metadata_type` - LIVEBOARD or ANSWER
- `description` - Optional description
- `author_name` / `owner_name` - Creator
- `modified` / `created` - Dates
- `modified_epoch` / `created_epoch` - Timestamps

## Error Handling

The integration includes robust error handling:

1. **Network Errors**: Falls back to sample data
2. **API Errors**: Displays error message to user
3. **Authentication Errors**: Logs error, shows fallback data
4. **No Reports**: Shows empty state with helpful message

All errors are logged to console for debugging:
```javascript
console.error('Error fetching user reports:', error);
```

## Security Considerations

⚠️ **Current Implementation (Development Only)**:
- Uses Basic Auth with hardcoded credentials
- Credentials exposed in client-side code
- Not suitable for production

✅ **Production Recommendations**:

1. **Use Trusted Authentication**:
```javascript
// Backend endpoint to generate tokens
GET /api/ts-token
Response: { token: "..." }

// Frontend uses token
authType: AuthType.TrustedAuthToken
```

2. **Environment Variables**:
```javascript
// Never hardcode credentials
username: process.env.REACT_APP_TS_USERNAME
```

3. **CORS Configuration**:
- Add your domain to ThoughtSpot's allowed origins
- Configure in ThoughtSpot: Develop > Customizations > Security Settings

4. **Rate Limiting**:
- Implement caching to reduce API calls
- Cache reports for 5-10 minutes
- Use localStorage or React Query

## Testing

### Test with Real Data

1. **Create Test Reports in ThoughtSpot**:
   - Log into ThoughtSpot UI
   - Create a few Liveboards or save some Answers
   - Refresh the app

2. **Verify API Call**:
   ```bash
   # Open browser console
   # Look for: "Fetched reports from ThoughtSpot:"
   ```

3. **Check Network Tab**:
   - Open DevTools > Network
   - Click "My Reports"
   - Look for POST to `/api/rest/2.0/metadata/search`
   - Check response data

### Test Different States

**Loading State**:
- Add a delay in fetchUserReports()
- Or throttle network in DevTools

**Error State**:
- Change ThoughtSpot host to invalid URL
- Or disable network in DevTools

**Empty State**:
- Use a user with no saved reports
- Or return empty array from API

## Troubleshooting

### Problem: "Failed to load reports"

**Possible Causes**:
1. ThoughtSpot instance is down
2. Incorrect credentials
3. CORS not configured
4. Network issues

**Solutions**:
```javascript
// Check console for detailed error
// Verify ThoughtSpot host is correct
console.log(THOUGHTSPOT_CONFIG.thoughtSpotHost);

// Test API directly with curl
curl -X POST \
  https://your-instance.thoughtspot.cloud/api/rest/2.0/metadata/search \
  -H "Authorization: Basic $(echo -n 'user:pass' | base64)" \
  -H "Content-Type: application/json" \
  -d '{"metadata":[{"type":"LIVEBOARD"}]}'
```

### Problem: Reports not updating

**Cause**: Reports are cached on component mount

**Solution**: Reload the page to fetch fresh data

### Problem: CORS errors

**Cause**: Your domain not in ThoughtSpot's allowed origins

**Solution**:
1. Log into ThoughtSpot
2. Go to Develop > Customizations > Security Settings
3. Add your domain: `http://localhost:3006` (dev) or `https://your-domain.com` (prod)

### Problem: "No reports found" but reports exist

**Possible Causes**:
1. Reports belong to different user
2. API filtering user's reports only
3. Reports are not Liveboards or Answers (e.g., worksheets)

**Solution**:
- Check the API response in console
- Verify report types in ThoughtSpot
- Ensure using correct user credentials

## Future Enhancements

### Recommended Improvements

1. **Caching**:
```javascript
// Cache reports for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
localStorage.setItem('reports', JSON.stringify({
  data: reports,
  timestamp: Date.now()
}));
```

2. **Search/Filter**:
```javascript
// Add search input to filter reports
const filteredReports = reports.filter(r => 
  r.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

3. **Favorites**:
```javascript
// Star/unstar reports
// Store favorites in localStorage or user preferences
```

4. **Report Thumbnails**:
```javascript
// Fetch thumbnail images from ThoughtSpot
// Display preview on hover
```

5. **Recently Viewed Tracking**:
```javascript
// Track user's actual view history
// Not just modification date
// Store in localStorage or backend
```

## API Reference

### fetchUserReports()

Fetches reports from ThoughtSpot metadata API.

**Returns**: `Promise<Array<Report>>`

**Report Object**:
```typescript
interface Report {
  id: string;              // ThoughtSpot GUID
  name: string;            // Display name
  type: 'Liveboard' | 'Answer';
  description?: string;
  author: string;
  modified: string;        // ISO date
  modifiedEpoch: number;   // Timestamp ms
  lastViewed: string;      // Human-readable
}
```

**Error Handling**: Returns sample data on error (never throws)

**Usage**:
```javascript
import { fetchUserReports } from '../config/thoughtspot';

const reports = await fetchUserReports();
console.log(reports); // Array of Report objects
```

## Summary

The "My Reports" feature provides:
- ✅ Real-time data from ThoughtSpot
- ✅ Automatic sorting by recent activity
- ✅ Loading, error, and empty states
- ✅ Direct links to specific Liveboards
- ✅ Fallback data for resilience
- ✅ Clean, professional UI

For production deployment:
- ⚠️ Switch to Trusted Authentication
- ⚠️ Remove hardcoded credentials
- ⚠️ Configure CORS properly
- ⚠️ Add caching and rate limiting

---

**Version**: 1.0.0  
**Last Updated**: October 26, 2025  
**Contact**: Technical support - Devin Maulayah

