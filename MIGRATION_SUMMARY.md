# Migration to Traefik-based Coolify Deployment

## Summary of Changes

This application has been migrated from nginx proxy-based deployment to Traefik-based Coolify deployment, matching the architecture of the hip_actually application.

## Files Modified

### 1. `docker-compose.yaml`
**Changes:**
- Added Coolify/Traefik labels (`coolify.managed=true`, `coolify.http=true`)
- Added `VITE_SERVER_BASE_URL` as build argument for client service
- Changed server port from 3889 to 3000 (standard)
- Removed `depends_on` for client (not needed with Traefik)
- Added new environment variables:
  - `ALLOWED_ORIGINS` - for CORS configuration
  - `COOKIE_DOMAIN` - for cross-subdomain cookies
  - `TRUST_PROXY` - for reverse proxy support

### 2. `server/app.js`
**Changes:**
- Replaced blanket CORS with explicit origin validation
- Added `ALLOWED_ORIGINS` environment variable parsing
- Made proxy trust conditional on `TRUST_PROXY` environment variable
- Enhanced session configuration with conditional cookie settings
- Added logging for CORS decisions and configuration

**Key Changes:**
```javascript
// Old CORS (accepts all origins)
app.use(cors({
  origin: true,
  credentials: true
}));

// New CORS (validates against whitelist)
app.use(cors({
  origin: function (origin, callback) {
    // Validates against ALLOWED_ORIGINS
    // Logs all CORS decisions
    // Allows dev mode flexibility
  },
  credentials: true
}));
```

### 3. `server/.env.example`
**Changes:**
- Updated port from 3713 to 3000
- Replaced Mailgun SMTP variables with API key variables
- Added `ALLOWED_ORIGINS` configuration
- Added `COOKIE_DOMAIN` configuration
- Added `TRUST_PROXY` configuration
- Updated comments for Traefik deployment

### 4. New Files Created

#### `.env.production.example`
Template for Coolify production environment variables with all required settings for Traefik deployment.

#### `COOLIFY_DEPLOYMENT.md`
Comprehensive deployment guide including:
- Architecture overview (local vs production)
- Step-by-step Coolify configuration
- Service configuration for client and server
- Domain setup instructions
- Testing procedures
- Troubleshooting guide
- Migration notes from nginx

#### `COOLIFY_ENV_VARIABLES.md`
Detailed environment variable documentation including:
- Complete list of all required variables
- Quick copy-paste configurations
- Deployment step-by-step
- Configuration validation checklist
- Security best practices

## Key Architectural Changes

### Before (Nginx Proxy)
```
Internet → nginx → React App (static)
                 → Express API
```
- Single entry point through nginx
- Internal proxy to backend
- Shared domain

### After (Traefik)
```
Internet → Traefik → shoulderiq.com.au → React App
                  → api.shoulderiq.com.au → Express API
```
- Separate domains for frontend and backend
- Direct API calls with CORS
- Traefik handles routing and SSL
- Better separation of concerns

## Deployment Architecture

### Services
1. **client** (Frontend)
   - Domain: `shoulderiq.com.au`
   - Port: 80
   - Built with Vite, served by nginx
   - Static files only

2. **server** (Backend)
   - Domain: `api.shoulderiq.com.au`
   - Port: 3000
   - Express API server
   - Persistent volume for uploads

### Network Flow
1. User visits `https://shoulderiq.com.au`
2. Traefik routes to client service
3. React app loads and makes API calls to `https://api.shoulderiq.com.au`
4. Traefik routes API calls to server service
5. CORS validates origin and allows with credentials
6. Cookies work across subdomains via `COOKIE_DOMAIN=.shoulderiq.com.au`

## Critical Configuration Requirements

### Environment Variables (Production)
1. **VITE_SERVER_BASE_URL** (Frontend build arg)
   - Must point to API domain: `https://api.shoulderiq.com.au`

2. **ALLOWED_ORIGINS** (Backend runtime)
   - Must include all frontend domains
   - Example: `https://shoulderiq.com.au,https://www.shoulderiq.com.au`

3. **COOKIE_DOMAIN** (Backend runtime)
   - Must start with `.` for subdomain support
   - Example: `.shoulderiq.com.au`

4. **TRUST_PROXY** (Backend runtime)
   - Must be `true` for Traefik deployment
   - Allows secure cookies behind reverse proxy

### DNS Configuration
Both domains must point to Coolify server:
- `shoulderiq.com.au` → Coolify IP
- `api.shoulderiq.com.au` → Coolify IP
- (Optional) `www.shoulderiq.com.au` → Coolify IP

## Testing Checklist

After deployment:
- [ ] Frontend loads at `https://shoulderiq.com.au`
- [ ] No CORS errors in browser console
- [ ] Form submissions work
- [ ] File uploads work and are accessible
- [ ] Doctor dashboard login works
- [ ] Sessions persist across page reloads
- [ ] API calls show in Network tab with correct URLs
- [ ] SSL certificates are valid for both domains

## Advantages of New Architecture

1. **Better Separation**: Frontend and backend are completely independent
2. **Easier Scaling**: Can scale frontend and backend separately
3. **Clearer Security**: CORS policies explicitly defined
4. **Standard Port**: Backend uses standard port 3000
5. **Better Logging**: Enhanced CORS logging for debugging
6. **Flexibility**: Can deploy frontend and backend to different servers if needed
7. **Modern Stack**: Traefik is more modern and actively maintained

## Migration Path for Other Projects

To migrate similar projects:
1. Update `docker-compose.yaml` with Traefik labels
2. Add CORS origin validation to backend
3. Make proxy trust conditional
4. Add cookie domain configuration
5. Update environment variables
6. Create production environment template
7. Document deployment process
8. Test thoroughly in staging first

## References

- Original hip_actually deployment: `hip_actually/COOLIFY_DEPLOYMENT.md`
- Coolify documentation: https://coolify.io/docs
- Traefik documentation: https://doc.traefik.io/traefik/
