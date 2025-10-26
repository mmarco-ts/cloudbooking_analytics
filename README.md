# Cloudbooking Analytics

A white-labeled analytics application built with React and ThoughtSpot for Cloudbooking's workplace resource booking platform. This application provides enterprise customers and internal account managers with powerful insights into occupancy, utilization, and resource efficiency.

## Overview

Cloudbooking Analytics delivers embedded analytics for multi-tenant workplace resource management, enabling data-driven decisions around:

- **Occupancy & Utilization** - Track space usage across desks, meeting rooms, and parking
- **No-Show Analysis** - Identify attendance patterns and optimize resource allocation
- **License Optimization** - Discover underutilized capacity and cost-saving opportunities
- **Booking Trends** - Analyze patterns across sites, departments, and time periods
- **Resource Efficiency** - Monitor check-in rates, cancellations, and repeat bookings

## Features

### 🎯 Workplace Analytics Dashboard
- Interactive Liveboard with key workplace metrics
- Pre-built visualizations for occupancy, utilization, and booking volume
- Real-time insights panel highlighting critical metrics
- White-labeled interface matching Cloudbooking branding

### 🤖 AI Analyst (Natural Language Search)
- Ask questions in plain English about your workplace data
- Instant AI-powered insights and visualizations
- Contextual example queries based on common use cases
- Full access to ThoughtSpot Spotter capabilities

### 🎨 Custom Branding
- Cloudbooking color scheme (primary: #5BC5F0)
- Clean, modern interface designed for enterprise users
- Responsive design for desktop and mobile access
- Consistent styling across all components

## Data Model

The application uses the **Workspace Bookings** model with key metrics:

### Core Metrics
- **Bookings** - Total reservation count
- **Occupancy %** - Share of capacity actually used (Checked In / Capacity)
- **Checked In** - Successful attendance count
- **Cancellation** - Cancelled booking count
- **No Show** - Bookings without check-in
- **Avg Duration (min)** - Average booking length

### Dimensions
- **Tenant Name** - Client/customer (multi-tenant filtering)
- **Site** - Building/location
- **Floor** - Level within site
- **Resource Type** - Desk, Room, Parking, Visitor
- **Department** - Organizational unit
- **Tenant Region** - Geographic area
- **Booking Source** - Origin of reservation
- **Date** - Booking date
- **Status** - Current state
- **Office Days Policy** - Hybrid work configuration

## Technology Stack

- **React 18.2** - Frontend framework
- **React Router 6.8** - Client-side routing
- **ThoughtSpot Visual Embed SDK 1.40** - Analytics embedding
- **Inter Font** - Typography
- **CSS3** - Styling with CSS variables

## Installation

### Prerequisites
- Node.js 14 or higher
- npm or yarn package manager
- ThoughtSpot Cloud instance access

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Cloudbooking_analytics
```

2. Install dependencies:
```bash
npm install
```

3. Configure ThoughtSpot connection in `src/config/thoughtspot.js`:
```javascript
export const THOUGHTSPOT_CONFIG = {
  thoughtSpotHost: 'https://your-instance.thoughtspot.cloud',
  username: 'your-username',
  password: 'your-password',
  liveboardId: 'your-liveboard-id',
  modelId: 'your-model-id'
};
```

4. Start the development server:
```bash
npm start
```

The app will run on `http://localhost:3006`

## Configuration

### ThoughtSpot Settings

Update `src/config/thoughtspot.js` with your ThoughtSpot environment details:

- **thoughtSpotHost** - Your ThoughtSpot Cloud URL
- **username** - Service account username
- **password** - Service account password
- **liveboardId** - GUID of the main analytics Liveboard
- **modelId** - GUID of the Workspace Bookings model

### Authentication

The application currently uses Basic authentication. For production, consider:

- **Trusted Authentication** - Token-based SSO for seamless integration
- **SAML/OAuth** - Enterprise single sign-on
- **Row-Level Security (RLS)** - Tenant-level data isolation

## Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Environment Variables

For production deployments, use environment variables instead of hardcoded credentials:

```javascript
// .env.production
REACT_APP_TS_HOST=https://your-instance.thoughtspot.cloud
REACT_APP_TS_LIVEBOARD_ID=your-liveboard-id
REACT_APP_TS_MODEL_ID=your-model-id
```

Update `thoughtspot.js` to read from environment variables:
```javascript
export const THOUGHTSPOT_CONFIG = {
  thoughtSpotHost: process.env.REACT_APP_TS_HOST,
  liveboardId: process.env.REACT_APP_TS_LIVEBOARD_ID,
  modelId: process.env.REACT_APP_TS_MODEL_ID
};
```

### Security Considerations

⚠️ **Important**: Never expose credentials in client-side code for production use.

For production deployments:
1. Implement server-side token generation
2. Use ThoughtSpot Trusted Authentication
3. Configure proper CORS settings
4. Enable row-level security for multi-tenant data isolation
5. Set up SSL/TLS encryption
6. Implement audit logging

### Hosting Options

- **Static Hosting** - AWS S3 + CloudFront, Azure Static Web Apps, Netlify, Vercel
- **Container Deployment** - Docker + Kubernetes
- **Traditional Hosting** - nginx, Apache
- **Embedded in Portal** - Integrate into existing Cloudbooking web application

## Usage

### For Enterprise Customers

1. **Login** - Access via SSO from Cloudbooking portal
2. **View Dashboard** - Review key metrics and visualizations on Liveboard page
3. **Explore Data** - Use filters to drill down by site, department, or time period
4. **Ask Questions** - Navigate to AI Analyst for natural language queries
5. **Export Insights** - Download reports for team meetings

### For Account Managers

1. **Pre-Renewal Review** - Check customer usage patterns and engagement
2. **Identify Opportunities** - Spot underutilized resources for optimization discussions
3. **Performance Tracking** - Monitor occupancy and utilization trends
4. **Custom Analysis** - Use AI Analyst for ad-hoc customer questions

### Example Use Cases

**Occupancy Analysis**
```
"What is our occupancy % by site for the last 30 days?"
```

**License Optimization**
```
"Show me sites with less than 50% utilization"
```

**No-Show Patterns**
```
"No show rate by tenant region"
```

**Resource Planning**
```
"Compare desk bookings vs meeting room bookings by month"
```

## Customization

### Styling

The application uses CSS variables for easy theme customization. Main variables in `src/App.css`:

```css
/* Cloudbooking Brand Colors */
--primary-color: #5BC5F0;
--primary-hover: #4db8e6;
--text-dark: #1e293b;
--text-light: #64748b;
--background: #f8fafc;
```

### ThoughtSpot Theme

ThoughtSpot components are customized via `customCSS` in the embed configuration. Key variables:

```javascript
'--ts-var-button--primary-background': '#66CCFF',
'--ts-var-root-background': '#ffffff',
'--ts-var-accent-primary': '#66CCFF',
```

## Support & Documentation

### ThoughtSpot Resources
- [Visual Embed SDK Documentation](https://developers.thoughtspot.com/docs/visual-embed-sdk)
- [Embed Authentication Guide](https://developers.thoughtspot.com/docs/authentication)
- [Customization Reference](https://developers.thoughtspot.com/docs/customization)

### React Resources
- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)

## Roadmap

### Planned Enhancements
- [ ] Implement Trusted Authentication for production
- [ ] Add tenant-specific filtering and RLS
- [ ] Create alerts and notification system
- [ ] Build export and scheduling features
- [ ] Add "best booking" recommendations for end users
- [ ] Implement multi-region data residency support
- [ ] Create mobile-optimized views
- [ ] Add usage analytics and telemetry

## License

Proprietary - Cloudbooking Ltd.

## Contact

For questions or support, contact:
- **Technical**: Devin Maulayah (Head of Development)
- **Product**: Shams Uddin (Product/Analytics Lead)
- **Commercial**: Joe Jarrett (Account Director)

---

**Built for Cloudbooking** | Powered by ThoughtSpot | v1.0.0
# cloudbooking_analytics
# cloudbooking_analytics
