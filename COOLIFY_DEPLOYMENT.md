# Shoulder IQ Coolify Deployment Guide

## Overview
This application has been reconfigured for Coolify deployment with Traefik direct routing. The frontend and backend run as separate services with independent domains.

## Architecture

### Local Development
- **Frontend**: `http://localhost:5173` (Vite dev server with proxy)
- **Backend**: `http://localhost:3000` (Express server)
- Uses Vite proxy to forward `/api` requests to backend

### Production (Coolify)
- **Frontend**: `https://shoulderiq.com.au` (Static React app served by nginx)
- **Backend**: `https://api.shoulderiq.com.au` (Express API server)
- Direct API calls from frontend to backend via CORS
- Traefik handles SSL and routing based on domains

## Coolify Configuration

### 1. Create New Project in Coolify
1. Go to Coolify dashboard
2. Create a new project named "Shoulder IQ"
3. Connect your Git repository: `radion-x/shoulder-only`

### 2. Configure Services

#### Frontend Service (client)
**Service Name**: `shoulder-client`

**Build Configuration**:
- Build Pack: Docker Compose
- Docker Compose File: `docker-compose.yaml`
- Service: `client`

**Environment Variables**:
```
VITE_SERVER_BASE_URL=https://api.shoulderiq.com.au
```

**Domain Configuration**:
- Primary Domain: `shoulderiq.com.au`
- Additional Domains (optional): `www.shoulderiq.com.au`
- Enable HTTPS: ✓
- Auto SSL (Let's Encrypt): ✓

#### Backend Service (server)
**Service Name**: `shoulder-server`

**Build Configuration**:
- Build Pack: Docker Compose
- Docker Compose File: `docker-compose.yaml`
- Service: `server`

**Environment Variables**:
```
SERVER_PORT=3000
SERVER_BASE_URL=https://api.shoulderiq.com.au
NODE_ENV=production

MONGODB_URI=your-mongodb-connection-string

CLAUDE_API_KEY=your-claude-api-key-here

MAILGUN_API_KEY=your-mailgun-api-key-here
MAILGUN_DOMAIN=mg.websited.org
EMAIL_SENDER_ADDRESS=pain-map@mg.websited.org
EMAIL_RECIPIENT_ADDRESS=recipient@example.com
BCC_EMAIL_RECIPIENT_ADDRESS=bcc@example.com

DASHBOARD_PASSWORD=YourSecurePassword
SESSION_SECRET=aVerySecureSessionSecretKey12345!@#$%

ALLOWED_ORIGINS=https://shoulderiq.com.au,https://www.shoulderiq.com.au
COOKIE_DOMAIN=.shoulderiq.com.au
TRUST_PROXY=true
```

**Domain Configuration**:
- Primary Domain: `api.shoulderiq.com.au`
- Enable HTTPS: ✓
- Auto SSL (Let's Encrypt): ✓

**Persistent Storage**:
- Mount Point: `/app/public/uploads`
- This ensures uploaded files survive container restarts

### 3. Deploy
1. Commit and push your changes to the main branch
2. Coolify will automatically detect changes and rebuild
3. Monitor deployment logs in Coolify dashboard

## Testing After Deployment

### 1. Frontend Access
Visit `https://shoulderiq.com.au` - should load the React app

### 2. Backend API Test
```bash
curl https://api.shoulderiq.com.au/api/doctor/check-auth
```

### 3. CORS Testing
Open browser console at `https://shoulderiq.com.au` and check for CORS errors in network tab

## Key Configuration Notes

### CORS Settings
The backend now uses explicit CORS origin validation:
- `ALLOWED_ORIGINS` must include all frontend domains
- Credentials are enabled for cross-origin cookie sharing
- Non-production environments allow all origins

### Cookie Configuration
- `COOKIE_DOMAIN` set to `.shoulderiq.com.au` allows cookies across subdomains
- `TRUST_PROXY=true` required for Traefik to properly handle secure cookies
- `sameSite=none` with `secure=true` for cross-domain authentication

### Traefik Labels
Both services include:
```yaml
labels:
  - coolify.managed=true
  - coolify.http=true
```
This tells Coolify to manage routing via Traefik

## Troubleshooting

### CORS Issues
- Check `ALLOWED_ORIGINS` includes exact frontend domain (including protocol)
- Verify `credentials: true` in both CORS config and fetch requests
- Check browser console for specific CORS error messages

### Cookie/Session Issues
- Verify `TRUST_PROXY=true` is set
- Check `COOKIE_DOMAIN` starts with `.` for subdomain sharing
- Ensure `secure: true` is only set in production

### File Upload Issues
- Verify persistent volume is mounted at `/app/public/uploads`
- Check directory permissions in container
- Verify `SERVER_BASE_URL` points to correct API domain

## Environment Variables Checklist

### Required for Frontend (Build Args)
- [ ] `VITE_SERVER_BASE_URL`

### Required for Backend (Runtime)
- [ ] `SERVER_PORT`
- [ ] `SERVER_BASE_URL`
- [ ] `NODE_ENV`
- [ ] `MONGODB_URI`
- [ ] `CLAUDE_API_KEY`
- [ ] `MAILGUN_API_KEY`
- [ ] `MAILGUN_DOMAIN`
- [ ] `EMAIL_SENDER_ADDRESS`
- [ ] `EMAIL_RECIPIENT_ADDRESS`
- [ ] `DASHBOARD_PASSWORD`
- [ ] `SESSION_SECRET`
- [ ] `ALLOWED_ORIGINS`
- [ ] `COOKIE_DOMAIN`
- [ ] `TRUST_PROXY`

### Optional
- [ ] `BCC_EMAIL_RECIPIENT_ADDRESS`

## Migration from Nginx Proxy

This app was previously configured for nginx proxy. Key changes:
1. Removed nginx proxy dependency - Traefik handles routing
2. Added explicit CORS origin validation
3. Added Coolify labels for Traefik integration
4. Separated frontend and backend domains
5. Updated cookie configuration for cross-domain support
6. Changed port from 3889 to 3000 (standard)
