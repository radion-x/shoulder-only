const express = require('express');
const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) return next();
  res.status(401).json({ error: 'Unauthorized. Please log in.' });
};

router.post('/doctor/login', (req, res) => {
  console.log('[Auth] Login attempt received');
  console.log('[Auth] Session ID before login:', req.sessionID);
  
  if (req.body.password === process.env.DASHBOARD_PASSWORD) {
    req.session.isAuthenticated = true;
    
    // Explicitly save session to ensure cookie is set
    req.session.save((err) => {
      if (err) {
        console.error('[Auth] Session save error:', err);
        return res.status(500).json({ error: 'Session save failed.' });
      }
      console.log('[Auth] Login successful, session saved. ID:', req.sessionID);
      console.log('[Auth] Session isAuthenticated:', req.session.isAuthenticated);
      res.status(200).json({ message: 'Login successful.' });
    });
  } else {
    console.log('[Auth] Login failed - invalid password');
    res.status(401).json({ error: 'Invalid password.' });
  }
});

router.get('/doctor/check-auth', (req, res) => {
  console.log('[Auth] Check-auth called. Session ID:', req.sessionID);
  console.log('[Auth] Session isAuthenticated:', req.session?.isAuthenticated);
  console.log('[Auth] Cookies:', req.headers.cookie);
  res.status(200).json({ isAuthenticated: !!(req.session && req.session.isAuthenticated) });
});

router.post('/doctor/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ error: 'Could not log out.' });
      res.clearCookie('connect.sid').status(200).json({ message: 'Logout successful.' });
    });
  } else {
    res.status(200).json({ message: 'No active session.' });
  }
});

module.exports = { router, ensureAuthenticated };
