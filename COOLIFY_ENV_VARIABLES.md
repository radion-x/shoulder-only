# Coolify Environment Variables Configuration

## Frontend Service (client)

### Build Arguments
Set these in Coolify under "Build" → "Build Arguments":

```
VITE_SERVER_BASE_URL=https://api.shoulderiq.com.au
```

### Domain Settings
- **Primary Domain**: `shoulderiq.com.au`
- **Additional Domain** (optional): `www.shoulderiq.com.au`
- **HTTPS**: Enabled ✓
- **Auto SSL**: Enabled ✓

---

## Backend Service (server)

### Environment Variables
Set these in Coolify under "Environment Variables":

```bash
# Server Configuration
SERVER_PORT=3000
SERVER_BASE_URL=https://api.shoulderiq.com.au
NODE_ENV=production

# Database
MONGODB_URI=your-mongodb-connection-string-here

# AI Service
CLAUDE_API_KEY=your-claude-api-key-here

# Email Configuration
MAILGUN_API_KEY=your-mailgun-api-key-here
MAILGUN_DOMAIN=mg.websited.org
EMAIL_SENDER_ADDRESS=noreply@mg.websited.org
EMAIL_RECIPIENT_ADDRESS=recipient@example.com
BCC_EMAIL_RECIPIENT_ADDRESS=bcc@example.com

# Security
DASHBOARD_PASSWORD=YourSecurePassword
SESSION_SECRET=aVerySecureSessionSecretKey12345!@#$%

# CORS Configuration - CRITICAL
ALLOWED_ORIGINS=https://shoulderiq.com.au,https://www.shoulderiq.com.au

# Cookie Configuration - CRITICAL
COOKIE_DOMAIN=.shoulderiq.com.au

# Proxy Configuration - CRITICAL
TRUST_PROXY=true
```

### Domain Settings
- **Primary Domain**: `api.shoulderiq.com.au`
- **HTTPS**: Enabled ✓
- **Auto SSL**: Enabled ✓

### Storage/Volumes
- **Mount Path**: `/app/public/uploads`
- **Volume Type**: Persistent Volume
- This ensures uploaded files survive container restarts

---

## Quick Copy-Paste for Coolify

### Frontend Environment (Build Args)
```
VITE_SERVER_BASE_URL=https://api.shoulderiq.com.au
```

### Backend Environment (Runtime Variables)
```
SERVER_PORT=3000
SERVER_BASE_URL=https://api.shoulderiq.com.au
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string-here
CLAUDE_API_KEY=your-claude-api-key-here
MAILGUN_API_KEY=your-mailgun-api-key-here
MAILGUN_DOMAIN=mg.websited.org
EMAIL_SENDER_ADDRESS=noreply@mg.websited.org
EMAIL_RECIPIENT_ADDRESS=recipient@example.com
BCC_EMAIL_RECIPIENT_ADDRESS=bcc@example.com
DASHBOARD_PASSWORD=YourSecurePassword
SESSION_SECRET=aVerySecureSessionSecretKey12345!@#$%
ALLOWED_ORIGINS=https://shoulderiq.com.au,https://www.shoulderiq.com.au
COOKIE_DOMAIN=.shoulderiq.com.au
TRUST_PROXY=true
```

---

## Deployment Steps in Coolify

### 1. Create New Project
1. Navigate to Coolify dashboard
2. Click "New Project"
3. Name: "Shoulder IQ"
4. Connect Git repository: `radion-x/shoulder-only`

### 2. Add Frontend Service
1. Click "New Resource" → "Docker Compose"
2. Select your repository
3. **Service**: `client`
4. Set Build Arguments (see above)
5. Set Domain: `shoulderiq.com.au`
6. Enable HTTPS & Auto SSL
7. Deploy

### 3. Add Backend Service
1. Click "New Resource" → "Docker Compose"
2. Select same repository
3. **Service**: `server`
4. Set Environment Variables (see above)
5. Set Domain: `api.shoulderiq.com.au`
6. Enable HTTPS & Auto SSL
7. Add Persistent Volume:
   - Name: `uploads-data`
   - Mount Path: `/app/public/uploads`
8. Deploy

### 4. Verify Deployment
- Visit `https://shoulderiq.com.au` - frontend should load
- Check browser console for any CORS errors
- Test form submission and file uploads
- Verify doctor dashboard login works

---

## Important Configuration Notes

### CORS Setup
The `ALLOWED_ORIGINS` variable is critical for security:
- Must include protocol (`https://`)
- Include all domains that will access the API
- Use comma separation for multiple origins
- No trailing slashes

### Cookie Domain
- Set to `.shoulderiq.com.au` (note the leading dot)
- Allows cookies to work across subdomains
- Required for authentication between frontend and API

### Trust Proxy
- Must be set to `true` for Traefik deployment
- Allows Express to trust X-Forwarded-* headers
- Required for secure cookies and correct client IP detection

### Session Secret
- Should be a long, random string
- Different for each environment
- Never commit to Git

---

## Environment Validation Checklist

Before deploying, ensure:
- [ ] All domains are pointed to Coolify server
- [ ] DNS records are propagated
- [ ] MongoDB is accessible from Coolify
- [ ] Claude API key is valid
- [ ] Mailgun credentials are correct
- [ ] All required environment variables are set
- [ ] `ALLOWED_ORIGINS` matches frontend domain exactly
- [ ] `COOKIE_DOMAIN` starts with `.`
- [ ] `TRUST_PROXY` is set to `true`

---

## Updating Environment Variables

After changing environment variables:
1. Go to service in Coolify
2. Update variables in settings
3. Click "Redeploy" to apply changes
4. Monitor deployment logs for any errors

---

## Security Best Practices

1. **Never commit real credentials** to Git
2. Use strong, unique passwords for `DASHBOARD_PASSWORD`
3. Generate a long random string for `SESSION_SECRET`
4. Restrict `ALLOWED_ORIGINS` to only your domains
5. Keep API keys secure and rotate periodically
6. Monitor deployment logs for security issues
