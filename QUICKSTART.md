# Cloudbooking Analytics - Quick Start Guide

Get the Cloudbooking Analytics application running in under 5 minutes.

## Prerequisites

- Node.js 14+ installed
- Access to ThoughtSpot Cloud instance
- ThoughtSpot credentials (username/password or token)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This installs:
- React 18.2
- React Router 6.8
- ThoughtSpot Visual Embed SDK 1.40

### 2. Configure ThoughtSpot Connection

Edit `src/config/thoughtspot.js` with your ThoughtSpot details:

```javascript
export const THOUGHTSPOT_CONFIG = {
  thoughtSpotHost: 'https://your-instance.thoughtspot.cloud',
  username: 'your-username',
  password: 'your-password',
  liveboardId: 'your-liveboard-guid',
  modelId: 'your-model-guid'
};
```

**Current Configuration:**
- Host: `https://analytics-cloudbooking.thoughtspot.cloud`
- Liveboard: `7d749892-4fb3-4a69-8566-6537fdfa6c46`
- Model: `0d5e909e-99ac-4484-b545-e277a82330ba` (Workspace Bookings)

### 3. Start Development Server

```bash
npm start
```

The app will open automatically at `http://localhost:3006`

## Application Structure

```
Cloudbooking_analytics/
├── public/
│   ├── cloudbooking-logo.png     # Logo in header
│   └── index.html                # HTML template
├── src/
│   ├── components/
│   │   ├── Layout.js             # Header, navigation, footer
│   │   ├── ChatBubble.js         # Floating AI assistant
│   │   └── ChatBubble.css        # Chat bubble styles
│   ├── config/
│   │   └── thoughtspot.js        # ThoughtSpot configuration
│   ├── pages/
│   │   ├── LiveboardPage.js      # Main dashboard page
│   │   └── SpotterPage.js        # AI Analyst page
│   ├── App.js                    # Main app component
│   ├── App.css                   # Global styles
│   └── index.js                  # Entry point
├── README.md                      # Full documentation
├── DEPLOYMENT.md                  # Deployment guide
├── PRODUCTION_CHECKLIST.md        # Pre-launch checklist
└── package.json                   # Dependencies
```

## Key Features

### 1. Workplace Analytics Dashboard (`/liveboard`)
- Interactive visualizations
- Key metrics sidebar (Occupancy, Utilization, No-Shows, License Optimization)
- Pre-built insights for workplace analytics

### 2. AI Analyst (`/spotter`)
- Natural language search interface
- Ask questions like: "What is our occupancy % by site?"
- Real-time AI-powered insights

### 3. ChatBubble
- Floating AI assistant on every page
- Quick access to common queries
- Click to ask questions without leaving current page

## Quick Testing

### Test Liveboard Page

1. Navigate to `http://localhost:3006/liveboard`
2. Wait for dashboard to load (~2-3 seconds)
3. Verify ThoughtSpot Liveboard displays
4. Try clicking filters or interacting with visualizations

### Test AI Analyst Page

1. Navigate to `http://localhost:3006/spotter`
2. Click an example question in the sidebar
3. Or type your own: "Show bookings by site"
4. Verify results appear

### Test ChatBubble

1. On any page, click the floating chat button (bottom right)
2. Click a suggested question
3. Verify Spotter interface loads in chat window

## Common Issues & Solutions

### Issue: "Failed to initialize ThoughtSpot SDK"

**Solution:**
- Check that `thoughtSpotHost` is correct in `thoughtspot.js`
- Verify your ThoughtSpot instance is accessible
- Ensure credentials are correct

### Issue: Liveboard not loading

**Solution:**
- Verify `liveboardId` is correct
- Check browser console for errors
- Ensure your user has access to the Liveboard in ThoughtSpot
- Try accessing the Liveboard directly in ThoughtSpot UI first

### Issue: AI Analyst not responding

**Solution:**
- Verify `modelId` is correct
- Check that the model/worksheet exists in your ThoughtSpot instance
- Ensure user has query permissions on the data source

### Issue: CORS errors

**Solution:**
- Add your local development URL to ThoughtSpot's allowed origins
- In ThoughtSpot: Develop > Customizations > Security Settings
- Add: `http://localhost:3006`

### Issue: Authentication failing

**Solution:**
- For development, Basic Auth should work
- For production, you MUST use Trusted Auth (see DEPLOYMENT.md)
- Check username/password are correct
- Verify user exists in ThoughtSpot

## Development Tips

### Hot Reload

React will automatically reload when you save files. No need to restart the server.

### Styling

- Global styles: `src/App.css`
- ThoughtSpot custom CSS: In `LiveboardPage.js` and `SpotterPage.js` embed configs
- Color variables: Cloudbooking blue (`#5BC5F0`)

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.js`
3. Add navigation link in `src/components/Layout.js`

### Customizing ThoughtSpot Appearance

Edit the `customizations` object in embed configs:

```javascript
customizations: {
  style: {
    customCSS: {
      variables: {
        '--ts-var-button--primary-background': '#5BC5F0',
        '--ts-var-root-background': '#ffffff',
        // ... more variables
      }
    }
  }
}
```

## Available Scripts

```bash
# Start development server (port 3006)
npm start

# Build for production
npm run build

# Run tests (if configured)
npm test

# Eject from Create React App (⚠️ irreversible)
npm run eject
```

## Next Steps

### For Development
1. ✅ You're ready to develop!
2. Customize colors/branding if needed
3. Add new visualizations to ThoughtSpot
4. Update Liveboard ID to show new content

### For Production
1. ⚠️ **DO NOT use Basic Auth** - Set up Trusted Authentication
2. Review [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
3. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment options
4. Remove hardcoded credentials
5. Set up environment variables
6. Configure Row-Level Security (RLS) for tenant isolation

## Getting Help

### Documentation
- [README.md](./README.md) - Complete documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Pre-launch checklist

### ThoughtSpot Resources
- [Developer Docs](https://developers.thoughtspot.com/)
- [Embed SDK Reference](https://developers.thoughtspot.com/docs/visual-embed-sdk)
- [Community Forum](https://community.thoughtspot.com/)

### Support Contacts
- **Technical**: Devin Maulayah (Head of Development)
- **Product**: Shams Uddin (Product/Analytics Lead)
- **Commercial**: Joe Jarrett (Account Director)

## Example Queries to Try

Once your app is running, try these in the AI Analyst:

```
"What is our occupancy % by site?"
"Show no show rate by tenant"
"Compare checked in vs capacity"
"Which floors have highest utilization?"
"Show cancelled bookings trend"
"Bookings by resource type"
"Average booking duration by resource type"
"Bookings by tenant region over time"
```

## Demo Data

If you don't have real data yet, the app includes example insights based on:
- **Workspace Bookings Model** with metrics:
  - Bookings (count)
  - Occupancy % (Checked In / Capacity)
  - No Show rate
  - Cancellation rate
  - Average Duration
- **Dimensions**: Tenant Name, Site, Floor, Resource Type, Department, Region, Date

---

**Ready to go!** 🚀

Run `npm start` and open `http://localhost:3006`

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)

