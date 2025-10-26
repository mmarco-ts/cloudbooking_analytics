# Cloudbooking Analytics - Deployment Guide

This guide covers production deployment of the Cloudbooking Analytics application.

## Pre-Deployment Checklist

### 1. Security Configuration

- [ ] Remove hardcoded credentials from `src/config/thoughtspot.js`
- [ ] Implement Trusted Authentication or Token-based auth
- [ ] Configure environment variables for sensitive data
- [ ] Enable HTTPS/SSL for all connections
- [ ] Set up Content Security Policy (CSP) headers
- [ ] Configure CORS on ThoughtSpot instance

### 2. ThoughtSpot Configuration

- [ ] Create production ThoughtSpot instance (if not using trial)
- [ ] Configure Row-Level Security (RLS) for tenant data isolation
- [ ] Set up service account with appropriate permissions
- [ ] Validate Liveboard and Model IDs
- [ ] Test token authentication flow
- [ ] Configure regional endpoints (US, EMEA, Australasia) if needed

### 3. Application Configuration

- [ ] Update package.json name and version
- [ ] Set up environment-specific configuration files
- [ ] Configure error tracking (e.g., Sentry, LogRocket)
- [ ] Set up analytics tracking (if required)
- [ ] Update favicon and app icons
- [ ] Test responsive design on all target devices

## Deployment Options

### Option 1: Static Hosting (Recommended)

#### AWS S3 + CloudFront

1. **Build the application:**
```bash
npm run build
```

2. **Create S3 bucket:**
```bash
aws s3 mb s3://cloudbooking-analytics
aws s3 website s3://cloudbooking-analytics --index-document index.html
```

3. **Upload build files:**
```bash
aws s3 sync build/ s3://cloudbooking-analytics
```

4. **Configure CloudFront:**
   - Create CloudFront distribution pointing to S3 bucket
   - Enable HTTPS with ACM certificate
   - Set custom error responses for SPA routing
   - Configure cache behaviors

5. **Set up Route 53:**
   - Create A record pointing to CloudFront distribution
   - Example: `analytics.cloudbooking.com`

#### Netlify

1. **Connect repository:**
```bash
netlify init
```

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `build`

3. **Set environment variables in Netlify UI**

4. **Deploy:**
```bash
netlify deploy --prod
```

#### Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

### Option 2: Container Deployment

#### Docker

1. **Create Dockerfile:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Create nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

3. **Build and run:**
```bash
docker build -t cloudbooking-analytics .
docker run -p 80:80 cloudbooking-analytics
```

#### Kubernetes

1. **Create deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloudbooking-analytics
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cloudbooking-analytics
  template:
    metadata:
      labels:
        app: cloudbooking-analytics
    spec:
      containers:
      - name: analytics
        image: cloudbooking-analytics:latest
        ports:
        - containerPort: 80
        env:
        - name: REACT_APP_TS_HOST
          valueFrom:
            secretKeyRef:
              name: thoughtspot-config
              key: host
```

2. **Create service.yaml:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: cloudbooking-analytics
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: cloudbooking-analytics
```

3. **Deploy:**
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

### Option 3: Embed in Existing Portal

Integrate into the existing Cloudbooking React application:

1. **Install dependencies in main app:**
```bash
npm install @thoughtspot/visual-embed-sdk react-router-dom
```

2. **Copy components:**
   - `src/pages/LiveboardPage.js`
   - `src/pages/SpotterPage.js`
   - `src/config/thoughtspot.js`
   - `src/App.css`

3. **Add routes to main app:**
```javascript
import LiveboardPage from './pages/LiveboardPage';
import SpotterPage from './pages/SpotterPage';

// In your main router:
<Route path="/analytics" element={<LiveboardPage />} />
<Route path="/analytics/ai" element={<SpotterPage />} />
```

4. **Configure authentication:**
   - Use shared SSO tokens
   - Implement tenant context from main app
   - Pass user permissions to ThoughtSpot

## Authentication Setup (Production)

### Trusted Authentication

1. **Create backend token service:**

```javascript
// Node.js example
const axios = require('axios');

async function getThoughtSpotToken(username) {
  const response = await axios.post(
    `${TS_HOST}/callosum/v1/tspublic/v1/session/auth/token`,
    {
      username: username,
      validity_time_in_sec: 3600,
      org_id: ORG_ID
    },
    {
      headers: {
        'X-Requested-By': 'ThoughtSpot',
        'Authorization': `Bearer ${SECRET_KEY}`
      }
    }
  );
  
  return response.data.token;
}

// API endpoint
app.get('/api/ts-token', authenticateUser, async (req, res) => {
  const token = await getThoughtSpotToken(req.user.username);
  res.json({ token });
});
```

2. **Update frontend to use token auth:**

```javascript
import { AuthType } from '@thoughtspot/visual-embed-sdk';

init({
  thoughtSpotHost: TS_HOST,
  authType: AuthType.TrustedAuthToken,
  getAuthToken: async () => {
    const response = await fetch('/api/ts-token');
    const { token } = await response.json();
    return token;
  }
});
```

## Multi-Tenant Configuration

### Row-Level Security (RLS)

1. **Create tenant mapping in ThoughtSpot:**
   - Set up user groups per tenant
   - Configure RLS rules on Tenant Name column
   - Test data isolation between tenants

2. **Pass tenant context:**

```javascript
// In embed configuration
const embed = new LiveboardEmbed(embedRef.current, {
  liveboardId: LIVEBOARD_ID,
  runtimeFilters: [{
    columnName: 'Tenant Name',
    operator: RuntimeFilterOp.EQ,
    values: [currentTenant]
  }]
});
```

## Regional Data Residency

For clients requiring in-region data:

1. **Deploy separate ThoughtSpot instances:**
   - EMEA: `analytics-emea.cloudbooking.cloud`
   - US: `analytics-us.cloudbooking.cloud`
   - APAC: `analytics-apac.cloudbooking.cloud`

2. **Route based on tenant region:**

```javascript
const getThoughtSpotHost = (tenantRegion) => {
  const hostMap = {
    'EMEA': process.env.REACT_APP_TS_HOST_EMEA,
    'US': process.env.REACT_APP_TS_HOST_US,
    'APAC': process.env.REACT_APP_TS_HOST_APAC
  };
  return hostMap[tenantRegion] || hostMap['EMEA'];
};
```

## Monitoring & Observability

### Application Monitoring

```javascript
// Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ]
});
```

### Usage Analytics

```javascript
// Track page views
useEffect(() => {
  analytics.page('Analytics Dashboard', {
    liveboard_id: LIVEBOARD_ID,
    user_tenant: currentTenant
  });
}, []);
```

## Performance Optimization

### 1. Code Splitting

```javascript
// Lazy load pages
const LiveboardPage = lazy(() => import('./pages/LiveboardPage'));
const SpotterPage = lazy(() => import('./pages/SpotterPage'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/liveboard" element={<LiveboardPage />} />
    <Route path="/spotter" element={<SpotterPage />} />
  </Routes>
</Suspense>
```

### 2. CDN Configuration

Configure aggressive caching for static assets:

```
Cache-Control: public, max-age=31536000, immutable  # JS/CSS
Cache-Control: public, max-age=3600                 # HTML
```

### 3. Bundle Optimization

```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
npm run build -- --stats

# Use production build
NODE_ENV=production npm run build
```

## Testing Before Go-Live

### Functional Testing
- [ ] Test all navigation flows
- [ ] Verify Liveboard loads and renders correctly
- [ ] Test AI Analyst natural language queries
- [ ] Validate filters and drill-down functionality
- [ ] Check mobile responsiveness
- [ ] Test error states and recovery

### Security Testing
- [ ] Verify tenant data isolation
- [ ] Test authentication flow end-to-end
- [ ] Check for credential exposure in network requests
- [ ] Validate HTTPS enforcement
- [ ] Test CORS configuration
- [ ] Verify XSS and injection protection

### Performance Testing
- [ ] Load test with expected concurrent users
- [ ] Test embed load times
- [ ] Check for memory leaks in long sessions
- [ ] Verify CDN cache hit rates
- [ ] Test across different network conditions

### User Acceptance Testing
- [ ] External customer validation
- [ ] Account manager workflow testing
- [ ] Stakeholder demo and approval
- [ ] Documentation review

## Go-Live Checklist

- [ ] Backup configuration and data
- [ ] Notify stakeholders of deployment window
- [ ] Deploy to staging environment first
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Update DNS if needed
- [ ] Monitor error rates and performance
- [ ] Communication to users
- [ ] Document any issues and resolutions

## Rollback Plan

If issues arise:

1. **Immediate rollback:**
```bash
# AWS S3
aws s3 sync s3://cloudbooking-analytics-backup/$(date -d yesterday +%Y%m%d)/ s3://cloudbooking-analytics/

# Kubernetes
kubectl rollout undo deployment/cloudbooking-analytics
```

2. **DNS rollback:**
   - Update Route 53/DNS to point to previous version
   - TTL consideration: 300 seconds typical

3. **Notify users of issues and estimated resolution**

## Support & Maintenance

### Monitoring Dashboards
- Application uptime and availability
- Error rates and types
- User engagement metrics
- ThoughtSpot API performance
- CDN cache performance

### Regular Maintenance
- Weekly: Review error logs and user feedback
- Monthly: Update dependencies and security patches
- Quarterly: Performance optimization review
- Annually: Technology stack evaluation

## Contact

Deployment questions: Devin Maulayah (Head of Development)
Production issues: operations@cloudbooking.com

---

Last updated: October 2025

