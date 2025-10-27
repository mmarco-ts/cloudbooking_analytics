# Authentication Fix - Auto-Login with Embedded Credentials

## Problem

The ThoughtSpot embeds (Liveboard, Spotter, ChatBubble) were not automatically logging in, requiring manual authentication each time.

## Solution

Implemented a proper authentication flow that:
1. **Logs in via REST API** first to establish a session
2. **Stores session in cookies**
3. **Initializes SDK** with `AuthType.None` (using the established session)
4. **All embeds use the same session** automatically

## Technical Changes

### File: `src/config/thoughtspot.js`

**Previous Approach (didn't work)**:
```javascript
init({
  thoughtSpotHost: THOUGHTSPOT_CONFIG.thoughtSpotHost,
  authType: AuthType.Basic,
  username: THOUGHTSPOT_CONFIG.username,
  password: THOUGHTSPOT_CONFIG.password,
});
```

**New Approach (works)**:
```javascript
// Step 1: Login via REST API
await fetch(`${host}/callosum/v1/tspublic/v1/session/login`, {
  method: 'POST',
  credentials: 'include', // Store session cookies
  body: new URLSearchParams({
    username: 'tsadmin',
    password: 'TSCloud123!'
  })
});

// Step 2: Initialize SDK with session
init({
  thoughtSpotHost: host,
  authType: AuthType.None, // Use established session
});
```

### Key Features

1. **Single Login**: Only logs in once, even if multiple embeds load
2. **Session Management**: Tracks initialization state to prevent duplicate logins
3. **Promise-based**: Returns a promise that all components can await
4. **Error Handling**: Logs errors and returns false if login fails

### Updated Functions

**`loginToThoughtSpot()`**:
- New function that calls ThoughtSpot's login endpoint
- Uses `credentials: 'include'` to store session cookies
- POSTs username and password as form data

**`initializeThoughtSpot()`**:
- Now async (returns Promise)
- Checks if already initialized
- Prevents duplicate login attempts
- Establishes session before initializing SDK

**`fetchUserReports()`**:
- Now calls `initializeThoughtSpot()` first
- Uses session-based auth (cookies) instead of Basic Auth header
- No longer sends Authorization header

### Components Updated

All embed components now properly await initialization:

**LiveboardPage.js**:
```javascript
const initialized = await initializeThoughtSpot();
```

**SpotterPage.js**:
```javascript
const initialized = await initializeThoughtSpot();
```

**ChatBubble.js**:
```javascript
const initialized = await initializeThoughtSpot();
```

## Authentication Flow

```
User opens app
    ↓
Component calls initializeThoughtSpot()
    ↓
Check: Already initialized?
    ├─ YES → Return immediately
    └─ NO  → Continue
    ↓
POST /session/login
    ↓
Receive session cookie
    ↓
Initialize SDK with AuthType.None
    ↓
Mark as initialized
    ↓
All embeds now use same session
```

## Credentials (POC Environment)

For this POC environment, credentials are embedded directly:

```javascript
username: 'tsadmin'
password: 'TSCloud123!'
```

**⚠️ IMPORTANT**: This is acceptable for POC/demo environments only.

**For Production**:
- Remove hardcoded credentials
- Use Trusted Authentication (token-based)
- Generate tokens on backend
- Never expose credentials in client code

## Benefits

✅ **Auto-login**: Users don't need to manually authenticate  
✅ **Seamless UX**: All embeds load immediately  
✅ **Single session**: One login for all embeds  
✅ **Persistent**: Session lasts until timeout  
✅ **Fast**: No repeated authentication calls  

## Testing

### Test Auto-Login

1. **Clear cookies** (DevTools > Application > Cookies > Clear)
2. **Open app**: `http://localhost:3006`
3. **Check console**: Should see:
   ```
   Logging into ThoughtSpot with Basic Auth...
   Successfully logged into ThoughtSpot
   ThoughtSpot SDK initialized successfully
   ```
4. **Verify embeds load**: Liveboard should display automatically
5. **Navigate to Spotter**: Should load without re-authenticating
6. **Open ChatBubble**: Should work without login prompt

### Check Session Cookies

**Browser DevTools > Application > Cookies**:
- Look for cookies from `analytics-cloudbooking.thoughtspot.cloud`
- Should see session cookies after login
- These persist across pages

### Debug Login Issues

**Check Console Logs**:
```javascript
// Should see these in order:
"Initializing ThoughtSpot..."
"Logging into ThoughtSpot with Basic Auth..."
"Successfully logged into ThoughtSpot"
"ThoughtSpot SDK initialized successfully"
"ThoughtSpot initialized, ready to embed"
```

**Check Network Tab**:
1. Filter by `session/login`
2. Should see POST request with 200 OK response
3. Response should set session cookies
4. Subsequent requests should include cookies

## Troubleshooting

### "Login failed: 401"

**Cause**: Incorrect credentials

**Solution**:
- Verify username and password in `thoughtspot.js`
- Test credentials in ThoughtSpot UI first
- Check for typos or spaces

### "CORS error"

**Cause**: Domain not in ThoughtSpot's allowed origins

**Solution**:
1. Log into ThoughtSpot as admin
2. Go to Develop > Customizations > Security Settings
3. Add: `http://localhost:3006`
4. Click Save

### Embeds still asking for login

**Cause**: Session cookies not being stored

**Solution**:
- Check `credentials: 'include'` is set in fetch calls
- Verify CORS allows credentials
- Check browser isn't blocking third-party cookies
- Try in incognito mode to rule out extensions

### "Failed to initialize ThoughtSpot SDK"

**Cause**: Login endpoint failed or SDK couldn't initialize

**Solution**:
- Check console for detailed error
- Verify ThoughtSpot host URL is correct
- Test login endpoint with curl:
  ```bash
  curl -X POST \
    https://analytics-cloudbooking.thoughtspot.cloud/callosum/v1/tspublic/v1/session/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=tsadmin&password=TSCloud123!" \
    --cookie-jar cookies.txt
  ```

## Session Management

### Session Duration
- ThoughtSpot sessions typically last 24 hours
- Can be configured in ThoughtSpot admin settings
- Session automatically refreshed on activity

### Session Expiry
When session expires:
- User sees login prompt in embed
- Reload page to re-authenticate
- Or implement token refresh logic

### Multiple Tabs
- Session shared across all tabs
- Login in one tab = authenticated in all
- Logout in one tab = logged out everywhere

## Security Considerations

### Current Setup (POC)
✅ Acceptable for proof-of-concept  
✅ Demo environments  
✅ Internal testing  
⚠️ **NOT for production**

### Production Setup
For production deployment, you MUST:

1. **Remove hardcoded credentials** from client code
2. **Implement backend token service**:
   ```javascript
   // Backend endpoint
   GET /api/ts-token
   → Returns: { token: "..." }
   
   // Frontend uses token
   authType: AuthType.TrustedAuthToken,
   getAuthToken: async () => {
     const res = await fetch('/api/ts-token');
     return res.json().token;
   }
   ```

3. **Use environment variables** (minimum):
   ```javascript
   username: process.env.REACT_APP_TS_USERNAME
   password: process.env.REACT_APP_TS_PASSWORD
   ```

4. **Configure HTTPS** everywhere
5. **Implement Row-Level Security** for multi-tenancy

## Console Output

### Successful Authentication

```
Initializing ThoughtSpot with host: https://analytics-cloudbooking.thoughtspot.cloud
Logging into ThoughtSpot with Basic Auth...
Successfully logged into ThoughtSpot
ThoughtSpot SDK initialized successfully
ThoughtSpot initialized, ready to embed
Creating LiveboardEmbed with ID: 7d749892-4fb3-4a69-8566-6537fdfa6c46
Liveboard initialized successfully
Liveboard loaded
```

### Already Authenticated

```
ThoughtSpot SDK already initialized
Creating LiveboardEmbed with ID: 7d749892-4fb3-4a69-8566-6537fdfa6c46
Liveboard initialized successfully
```

## Summary

✅ **Auto-login now works**  
✅ Credentials embedded (username: tsadmin, password: TSCloud123!)  
✅ Session established before embeds load  
✅ All components use shared session  
✅ No manual authentication required  
✅ Suitable for POC environment  

**Next Steps for Production**:
- Implement Trusted Authentication
- Remove hardcoded credentials
- Add token generation backend
- Configure proper security

---

**Version**: 1.0.0  
**Date**: October 26, 2025  
**Status**: ✅ Working in POC environment

