const express = require('express');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const http = require('http');
const https = require('https');
const FormData = require('form-data');
const Mailgun = require('mailgun.js');
const { generateComprehensivePrompt } = require('./prompt-builder.js');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const app = express();

// --- DIRECTORY SETUP ---
const baseUploadsDir = path.join(__dirname, 'public/uploads');
const baseAssessmentFilesDir = path.join(baseUploadsDir, 'assessment_files');
const tempUploadDir = path.join(baseUploadsDir, 'temp'); // Temporary directory for initial uploads

// Ensure all necessary directories exist
[baseUploadsDir, baseAssessmentFilesDir, tempUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const port = process.env.SERVER_PORT || 3001;

// --- DATABASE & MIDDLEWARE ---
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("CRITICAL: MONGODB_URI environment variable not set.");
} else {
  mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));
}

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));

// Trust proxy - required when behind nginx/Traefik/Cloudflare
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key_please_change',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
    httpOnly: true,
    sameSite: 'lax', // 'lax' works for same-site requests
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// --- STATIC FILE SERVING ---
// Serve files from the session-specific directories
app.use('/uploads/assessment_files', express.static(baseAssessmentFilesDir));


// --- API CLIENTS ---
const claudeApiKey = process.env.CLAUDE_API_KEY;
let anthropic;
if (claudeApiKey) {
  anthropic = new Anthropic({ apiKey: claudeApiKey });
} else {
  console.error("CRITICAL: CLAUDE_API_KEY environment variable not set.");
}

// --- MONGOOSE SCHEMAS & MODELS ---
// Import the Assessment model from the models directory (includes spinalRegions field)
const Assessment = require('./models/Assessment');

// --- AUTHENTICATION ---
const ensureAuthenticated = (req, res, next) => {
  console.log('[Auth Check] Path:', req.path);
  console.log('[Auth Check] Session ID:', req.sessionID);
  console.log('[Auth Check] Cookies received:', req.headers.cookie);
  console.log('[Auth Check] Session isAuthenticated:', req.session?.isAuthenticated);
  if (req.session && req.session.isAuthenticated) return next();
  console.log('[Auth Check] DENIED - No valid session');
  res.status(401).json({ error: 'Unauthorized. Please log in.' });
};
app.post('/api/doctor/login', (req, res) => {
  console.log('[Login] Attempt received');
  console.log('[Login] Session ID:', req.sessionID);
  console.log('[Login] Cookies received:', req.headers.cookie);
  if (req.body.password === process.env.DASHBOARD_PASSWORD) {
    req.session.isAuthenticated = true;
    console.log('[Login] Success - Session authenticated');
    res.status(200).json({ message: 'Login successful.' });
  } else {
    console.log('[Login] Failed - Invalid password');
    res.status(401).json({ error: 'Invalid password.' });
  }
});
app.get('/api/doctor/check-auth', (req, res) => {
  res.status(200).json({ isAuthenticated: !!(req.session && req.session.isAuthenticated) });
});
app.post('/api/doctor/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ error: 'Could not log out.' });
      res.clearCookie('connect.sid').status(200).json({ message: 'Logout successful.' });
    });
  } else {
    res.status(200).json({ message: 'No active session.' });
  }
});

// --- CORE API ENDPOINTS ---
app.get('/api/doctor/patients', ensureAuthenticated, async (req, res) => {
  try {
    const assessments = await Assessment.find({}, 'demographics.fullName demographics.email').lean();
    const patientsMap = new Map();
    assessments.forEach(a => {
      if (a.demographics && a.demographics.email && !patientsMap.has(a.demographics.email)) {
        patientsMap.set(a.demographics.email, { id: a.demographics.email, name: a.demographics.fullName });
      }
    });
    res.status(200).json(Array.from(patientsMap.values()));
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve patient list.' });
  }
});
app.get('/api/doctor/patient/:email/assessments', ensureAuthenticated, async (req, res) => {
  try {
    const assessments = await Assessment.find({ 'demographics.email': req.params.email }).sort({ createdAt: -1 });
    res.status(200).json(assessments || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve assessments.' });
  }
});
app.post('/api/assessment', async (req, res) => {
  try {
    // DEBUGGING: Log what we receive from frontend
    console.log("==========================================");
    console.log("===== BACKEND ASSESSMENT SUBMISSION =====");
    console.log("==========================================");
    console.log("Received imaging data:");
    if (req.body.imaging) {
      req.body.imaging.forEach((img, idx) => {
        console.log(`Backend ${idx}. ${img.type}:`);
        console.log(`  hadStudy: ${img.hadStudy}`);
        console.log(`  spinalRegions: ${JSON.stringify(img.spinalRegions)}`);
        console.log(`  spinalRegions type: ${typeof img.spinalRegions}`);
        console.log(`  hasOwnProperty spinalRegions: ${img.hasOwnProperty('spinalRegions')}`);
      });
    }
    
    const newAssessment = new Assessment(req.body);
    
    // DEBUGGING: Log what Mongoose created
    console.log("After creating Assessment instance:");
    if (newAssessment.imaging) {
      newAssessment.imaging.forEach((img, idx) => {
        console.log(`Mongoose ${idx}. ${img.type}:`);
        console.log(`  hadStudy: ${img.hadStudy}`);
        console.log(`  spinalRegions: ${JSON.stringify(img.spinalRegions)}`);
        console.log(`  spinalRegions type: ${typeof img.spinalRegions}`);
      });
    }
    
    await newAssessment.save();
    
    // DEBUGGING: Log what was actually saved
    const savedAssessment = await Assessment.findById(newAssessment._id);
    console.log("After saving to database:");
    if (savedAssessment.imaging) {
      savedAssessment.imaging.forEach((img, idx) => {
        console.log(`Saved ${idx}. ${img.type}:`);
        console.log(`  hadStudy: ${img.hadStudy}`);
        console.log(`  spinalRegions: ${JSON.stringify(img.spinalRegions)}`);
        console.log(`  spinalRegions type: ${typeof img.spinalRegions}`);
      });
    }
    console.log("==========================================");
    
    res.status(201).json({ message: 'Assessment saved successfully', assessmentId: newAssessment._id });
  } catch (error) {
    console.error('Assessment save error:', error);
    res.status(500).json({ error: 'Failed to save assessment data.' });
  }
});

app.delete('/api/doctor/assessment/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Assessment.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }
    res.status(200).json({ message: 'Assessment deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assessment.' });
  }
});

app.delete('/api/doctor/user/:email', ensureAuthenticated, async (req, res) => {
  try {
    const { email } = req.params;
    const result = await Assessment.deleteMany({ 'demographics.email': email });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No assessments found for this user.' });
    }
    res.status(200).json({ message: `${result.deletedCount} assessments for user ${email} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user assessments.' });
  }
});

// --- FILE UPLOAD LOGIC (REVISED) ---
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempUploadDir); // Always upload to the temporary directory first
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedOriginalName}`);
  }
});
const upload = multer({ storage: tempStorage, limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/upload/imaging-file', upload.single('imagingFile'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const formSessionId = req.query.formSessionId || 'default_session';
  const sanitizedSessionId = formSessionId.replace(/[^a-zA-Z0-9_-]/g, '');
  
  const finalSessionDir = path.join(baseAssessmentFilesDir, sanitizedSessionId);
  if (!fs.existsSync(finalSessionDir)) {
    fs.mkdirSync(finalSessionDir, { recursive: true });
  }

  const tempPath = req.file.path;
  const finalPath = path.join(finalSessionDir, req.file.filename);
  
  // Move the file from temp to the final session directory
  fs.rename(tempPath, finalPath, (err) => {
    if (err) {
      console.error('Error moving file:', err);
      // Try to clean up the temp file
      try {
        fs.unlinkSync(tempPath);
      } catch (unlinkErr) {
        console.error('Error cleaning up temp file:', unlinkErr);
      }
      return res.status(500).json({ error: 'Failed to process file upload.' });
    }

    // The relative path for the URL should be based on the final location
    let relativeFilePath = path.join(sanitizedSessionId, req.file.filename);
    if (path.sep === '\\') {
      relativeFilePath = relativeFilePath.replace(/\\/g, '/');
    }

    res.status(200).json({
      message: 'File uploaded successfully',
      filePath: relativeFilePath
    });
  });
});

app.post('/api/upload/pain-map', async (req, res) => {
  const { imageData, view, formSessionId } = req.body;

  if (!imageData || !view || !formSessionId) {
    return res.status(400).json({ error: 'Missing required data for pain map upload.' });
  }

  try {
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const sanitizedSessionId = formSessionId.replace(/[^a-zA-Z0-9_-]/g, '');
    const finalSessionDir = path.join(baseAssessmentFilesDir, sanitizedSessionId);

    console.log(`[Pain Map Upload] Session: ${sanitizedSessionId}, View: ${view}`);
    console.log(`[Pain Map Upload] Directory: ${finalSessionDir}`);

    if (!fs.existsSync(finalSessionDir)) {
      fs.mkdirSync(finalSessionDir, { recursive: true });
      console.log(`[Pain Map Upload] Created directory: ${finalSessionDir}`);
    }

    const filename = `pain-map-${view}-${Date.now()}.png`;
    const finalPath = path.join(finalSessionDir, filename);
    
    // Write file synchronously
    fs.writeFileSync(finalPath, base64Data, 'base64');
    
    // Force file system sync to ensure data is flushed to disk
    const fd = fs.openSync(finalPath, 'r');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    
    // Verify file exists and get size
    const stats = fs.statSync(finalPath);
    console.log(`[Pain Map Upload] File saved and synced: ${finalPath}, Size: ${stats.size} bytes`);

    let relativeFilePath = path.join(sanitizedSessionId, filename);
    if (path.sep === '\\') {
      relativeFilePath = relativeFilePath.replace(/\\/g, '/');
    }

    console.log(`[Pain Map Upload] Returning path: ${relativeFilePath}`);

    res.status(200).json({
      message: 'Pain map uploaded successfully',
      filePath: relativeFilePath
    });
  } catch (error) {
    console.error('Error saving pain map image:', error);
    res.status(500).json({ error: 'Failed to save pain map image.' });
  }
});

// Referral document upload endpoint
app.post('/api/upload/referral', upload.single('referralFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const formSessionId = req.query.formSessionId || 'default_session';
    const sanitizedSessionId = formSessionId.replace(/[^a-zA-Z0-9_-]/g, '');
    
    const finalSessionDir = path.join(baseAssessmentFilesDir, sanitizedSessionId);
    if (!fs.existsSync(finalSessionDir)) {
      fs.mkdirSync(finalSessionDir, { recursive: true });
    }

    const tempPath = req.file.path;
    const finalPath = path.join(finalSessionDir, req.file.filename);
    
    fs.rename(tempPath, finalPath, (err) => {
      if (err) {
        console.error('Error moving referral file:', err);
        try {
          fs.unlinkSync(tempPath);
        } catch (unlinkErr) {
          console.error('Error cleaning up temp referral file:', unlinkErr);
        }
        return res.status(500).json({ error: 'Failed to process referral file upload.' });
      }

      let relativeFilePath = path.join(sanitizedSessionId, req.file.filename);
      if (path.sep === '\\') {
        relativeFilePath = relativeFilePath.replace(/\\/g, '/');
      }

      const referralDocument = {
        id: req.file.filename.split('.')[0],
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: `${process.env.SERVER_BASE_URL}/uploads/assessment_files/${relativeFilePath}`,
        uploadDate: new Date()
      };

      res.status(200).json({
        message: 'Referral document uploaded successfully',
        referralDocument: referralDocument
      });
    });
  } catch (error) {
    console.error('Error in referral upload:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});


// --- AI & EMAIL ENDPOINTS ---

// Streaming AI Summary endpoint using Server-Sent Events (SSE)
app.post('/api/generate-summary-stream', async (req, res) => {
  if (!anthropic) {
    return res.status(500).json({ error: 'Claude API client not initialized on server. API key may be missing or invalid.' });
  }

  try {
    const formData = req.body;

    if (!formData) {
      return res.status(400).json({ error: 'No form data received.' });
    }

    const comprehensivePrompt = generateComprehensivePrompt(formData);

    console.log("Starting streaming response from Claude API...");

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    // Use Claude streaming API
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: comprehensivePrompt }],
    });

    let fullText = '';

    // Stream each text chunk to the client
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text;
        fullText += text;
        // Send the chunk as an SSE event
        res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
      }
    }

    // Send completion event with full text
    res.write(`data: ${JSON.stringify({ type: 'done', fullText })}\n\n`);
    res.end();

    console.log("Streaming summary completed.");

  } catch (error) {
    console.error('Error in /api/generate-summary-stream endpoint:', error);
    let errorMessage = 'Failed to generate AI summary via backend.';
    if (error.message) {
      errorMessage = error.message;
    }
    // Send error as SSE event
    res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
    res.end();
  }
});

// Legacy non-streaming endpoint (kept for fallback)
app.post('/api/generate-summary', async (req, res) => {
  if (!anthropic) {
    return res.status(500).json({ error: 'Claude API client not initialized on server. API key may be missing or invalid.' });
  }

  try {
    const formData = req.body;

    if (!formData) {
      return res.status(400).json({ error: 'No form data received.' });
    }

    const comprehensivePrompt = generateComprehensivePrompt(formData);

    console.log("Sending prompt to Claude API...");

    const claudeResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: comprehensivePrompt }],
    });
    
    let summary = "No summary content found from AI.";
    if (claudeResponse.content && claudeResponse.content.length > 0 && claudeResponse.content[0].type === 'text') {
        summary = claudeResponse.content[0].text;
    } else {
        console.warn("Unexpected Claude API response structure:", claudeResponse);
    }
    
    console.log("Received summary from Claude API.");
    res.status(200).json({ summary: summary });

  } catch (error) {
    console.error('Error in /api/generate-summary endpoint:', error);
    let errorMessage = 'Failed to generate AI summary via backend.';
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
        errorMessage = error.response.data.error.message;
    } else if (error.message) {
        errorMessage = error.message;
    }
    res.status(500).json({ error: errorMessage });
  }
});
app.post('/api/email/send-assessment', async (req, res) => {
  if (!mailgunClient || !mailgunDomain) {
    return res.status(503).json({ error: 'Email service is not configured or unavailable.' });
  }

  try {
    const { formData, aiSummary, recommendationText, nextStep, systemRecommendation, clientOrigin } = req.body;

    if (!formData || !aiSummary) {
      return res.status(400).json({ error: 'Missing required data for email (formData or aiSummary).' });
    }
    
    const serverBaseUrl = process.env.SERVER_BASE_URL;
    const primaryRecipient = process.env.EMAIL_RECIPIENT_ADDRESS;
    if (!primaryRecipient) {
        console.error('CRITICAL: EMAIL_RECIPIENT_ADDRESS is not set in .env for the primary recipient.');
        return res.status(500).json({ error: 'Primary email recipient not configured on server.' });
    }

    const patientEmail = formData.demographics?.email;
    const subjectDate = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Prepare attachments for Mailgun
    const attachments = [];
    const inlineImages = [];
    
    if (formData.painMapImageFront) {
      const frontImagePath = path.join(baseAssessmentFilesDir, formData.painMapImageFront);
      if (fs.existsSync(frontImagePath)) {
        const fileData = fs.readFileSync(frontImagePath);
        inlineImages.push({
          filename: 'painMapFront.png',
          data: fileData
        });
      }
    }
    if (formData.painMapImageBack) {
      const backImagePath = path.join(baseAssessmentFilesDir, formData.painMapImageBack);
      if (fs.existsSync(backImagePath)) {
        const fileData = fs.readFileSync(backImagePath);
        inlineImages.push({
          filename: 'painMapBack.png',
          data: fileData
        });
      }
    }

    // Send email to admin/BCC
    const adminHtmlContent = generateAssessmentEmailHTML({ formData, aiSummary, recommendationText: formData.systemRecommendation, nextStep: formData.nextStep }, serverBaseUrl, 'admin');
    
    const adminMessageData = {
      from: `Shoulder IQ Assessment <${process.env.EMAIL_SENDER_ADDRESS}>`,
      to: [primaryRecipient],
      subject: `Shoulder Assessment Summary - ${formData.demographics?.fullName || 'N/A'} - ${subjectDate}`,
      html: adminHtmlContent,
    };
    
    // Add BCC if configured
    if (process.env.BCC_EMAIL_RECIPIENT_ADDRESS) {
      adminMessageData.bcc = process.env.BCC_EMAIL_RECIPIENT_ADDRESS;
    }
    
    // Add inline images if available
    if (inlineImages.length > 0) {
      adminMessageData.inline = inlineImages;
    }
    
    console.log('Sending admin email via Mailgun API...');
    await mailgunClient.messages.create(mailgunDomain, adminMessageData);
    console.log('Admin email sent successfully.');

    // Send email to patient
    if (patientEmail && typeof patientEmail === 'string' && patientEmail.trim() !== '' && patientEmail !== primaryRecipient) {
      const patientHtmlContent = generateAssessmentEmailHTML({ formData, aiSummary, recommendationText: formData.systemRecommendation, nextStep: formData.nextStep }, serverBaseUrl, 'patient');
      
      const patientMessageData = {
        from: `Shoulder IQ Assessment <${process.env.EMAIL_SENDER_ADDRESS}>`,
        to: [patientEmail],
        subject: `Your Shoulder Assessment Summary - ${subjectDate}`,
        html: patientHtmlContent,
      };
      
      console.log('Sending patient email via Mailgun API...');
      await mailgunClient.messages.create(mailgunDomain, patientMessageData);
      console.log('Patient email sent successfully.');
    }

    res.status(200).json({ message: 'Assessment email(s) sent successfully.' });

  } catch (error) {
    console.error('Error sending assessment email:', error);
    res.status(500).json({ error: 'Failed to send assessment email: ' + (error.message || 'Unknown error') });
  }
});

// --- MAILGUN API CLIENT ---
let mailgunClient;
const mailgunDomain = process.env.MAILGUN_DOMAIN;

if (process.env.MAILGUN_API_KEY && mailgunDomain) {
  const mailgun = new Mailgun(FormData);
  mailgunClient = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });
  console.log(`Mailgun API client initialized for domain: ${mailgunDomain}`);
} else {
  console.warn('Mailgun API credentials not set (MAILGUN_API_KEY and MAILGUN_DOMAIN required). Email sending will be disabled.');
}

// --- SERVER START ---
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

function generateAssessmentEmailHTML(data, serverBaseUrl, recipientType) {
  const { formData, aiSummary, recommendationText, nextStep } = data;

  let html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          h1 { color: #2c3e50; }
          h2 { color: #34495e; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9; }
          .section-title { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; }
          .field-label { font-weight: bold; color: #555; }
          .field-value { margin-left: 10px; }
          ul { padding-left: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px;}
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left;}
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h1>Shoulder Assessment Report</h1>
  `;

  if (recipientType === 'patient') {
    if (aiSummary) {
      html += `
        <div class="section">
          <div class="section-title">Initial Triage: Report and Summary</div>
          <p>${aiSummary.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (nextStep) {
        html += `
        <div class="section">
          <div class="section-title">Next Step Chosen by User</div>
          <p>${nextStep}</p>
        </div>
      `;
    }
    if (recommendationText) {
      html += `
        <div class="section">
          <div class="section-title">Adaptive Next-Step Evaluation</div>
          <p>${recommendationText}</p>
        </div>
      `;
    }
  }

  if (formData.demographics) {
    html += `
      <div class="section">
        <div class="section-title">Personal Information</div>
        <p><span class="field-label">Full Name:</span> <span class="field-value">${formData.demographics.fullName || 'N/A'}</span></p>
        <p><span class="field-label">Date of Birth:</span> <span class="field-value">${formData.demographics.dateOfBirth || 'N/A'}</span></p>
        <p><span class="field-label">Phone:</span> <span class="field-value">${formData.demographics.phoneNumber || 'N/A'}</span></p>
        <p><span class="field-label">Email:</span> <span class="field-value">${formData.demographics.email || 'N/A'}</span></p>
        <p><span class="field-label">Residential Address:</span> <span class="field-value">${formData.demographics.residentialAddress.addressLine1 || ''}, ${formData.demographics.residentialAddress.addressLine2 ? formData.demographics.residentialAddress.addressLine2 + ', ' : ''}${formData.demographics.residentialAddress.suburb || ''}, ${formData.demographics.residentialAddress.state || ''}, ${formData.demographics.residentialAddress.postcode || ''}</span></p>
        ${!formData.demographics.isPostalSameAsResidential && formData.demographics.postalAddress ? `<p><span class="field-label">Postal Address:</span> <span class="field-value">${formData.demographics.postalAddress.addressLine1 || ''}, ${formData.demographics.postalAddress.addressLine2 ? formData.demographics.postalAddress.addressLine2 + ', ' : ''}${formData.demographics.postalAddress.suburb || ''}, ${formData.demographics.postalAddress.state || ''}, ${formData.demographics.postalAddress.postcode || ''}</span></p>` : ''}
        ${formData.demographics.funding && formData.demographics.funding.source ? `
          <div class="section">
            <div class="section-title">Funding Information</div>
            <p><span class="field-label">Source:</span> <span class="field-value">${formData.demographics.funding.source}</span></p>
            ${formData.demographics.funding.source === 'Private Health Insurance' ? `
              <p><span class="field-label">Health Fund:</span> <span class="field-value">${formData.demographics.funding.healthFundName || 'N/A'}</span></p>
              <p><span class="field-label">Membership No.:</span> <span class="field-value">${formData.demographics.funding.membershipNumber || 'N/A'}</span></p>
            ` : ''}
            ${['Workers Compensation', 'DVA', 'TAC'].includes(formData.demographics.funding.source) && formData.demographics.funding.claimNumber ? `
              <p><span class="field-label">Claim/Reference No.:</span> <span class="field-value">${formData.demographics.funding.claimNumber}</span></p>
            ` : ''}
            ${formData.demographics.funding.source === 'Other' && formData.demographics.funding.otherSource ? `
              <p><span class="field-label">Other Source:</span> <span class="field-value">${formData.demographics.funding.otherSource}</span></p>
            ` : ''}
          </div>
        ` : ''}
        ${formData.demographics.nextOfKin ? `
          <div class="section">
            <div class="section-title">Emergency Contact</div>
            <p><span class="field-label">Name:</span> <span class="field-value">${formData.demographics.nextOfKin.fullName || 'N/A'}</span></p>
            <p><span class="field-label">Relationship:</span> <span class="field-value">${formData.demographics.nextOfKin.relationship || 'N/A'}</span></p>
            <p><span class="field-label">Phone:</span> <span class="field-value">${formData.demographics.nextOfKin.phoneNumber || 'N/A'}</span></p>
          </div>
        ` : ''}
        ${formData.demographics.referringDoctor ? `
          <div class="section">
            <div class="section-title">Referring Doctor</div>
            ${formData.demographics.referringDoctor.hasReferringDoctor ? `
              <p><span class="field-label">Name:</span> <span class="field-value">${formData.demographics.referringDoctor.doctorName || 'N/A'}</span></p>
              <p><span class="field-label">Clinic:</span> <span class="field-value">${formData.demographics.referringDoctor.clinic || 'N/A'}</span></p>
              <p><span class="field-label">Phone:</span> <span class="field-value">${formData.demographics.referringDoctor.phoneNumber || 'N/A'}</span></p>
              <p><span class="field-label">Email:</span> <span class="field-value">${formData.demographics.referringDoctor.email || 'N/A'}</span></p>
              <p><span class="field-label">Fax:</span> <span class="field-value">${formData.demographics.referringDoctor.fax || 'N/A'}</span></p>
              ${formData.demographics.referringDoctor.referralDocument ? `
                <p><span class="field-label">Referral Document:</span> <span class="field-value">
                  <a href="${formData.demographics.referringDoctor.referralDocument.url}" target="_blank" style="color: #007bff; text-decoration: none;">
                    📄 ${formData.demographics.referringDoctor.referralDocument.originalName}
                  </a>
                </span></p>
              ` : ''}
            ` : '<p>No referring doctor.</p>'}
          </div>
        ` : ''}
        ${formData.demographics.gender ? `<p><span class="field-label">Gender:</span> <span class="field-value">${formData.demographics.gender}</span></p>` : ''}
        ${formData.demographics.medicareNumber ? `<p><span class="field-label">Medicare Number:</span> <span class="field-value">${formData.demographics.medicareNumber}</span></p>` : ''}
        ${formData.demographics.medicareRefNum ? `<p><span class="field-label">Medicare Ref. No.:</span> <span class="field-value">${formData.demographics.medicareRefNum}</span></p>` : ''}
        ${formData.demographics.countryOfBirth ? `<p><span class="field-label">Country of Birth:</span> <span class="field-value">${formData.demographics.countryOfBirth}</span></p>` : ''}
      </div>
    `;
  }
  
  if (formData.diagnoses) {
    html += '<div class="section"><div class="section-title">Medical Conditions & Symptoms</div><ul>';
    const diagnosesOrder = [
      'herniatedDisc', 'spinalStenosis', 'spondylolisthesis', 
      'scoliosis', 'spinalFracture', 'degenerativeDiscDisease',
      'otherConditionSelected'
    ];
    diagnosesOrder.forEach(key => {
      if (formData.diagnoses[key] === true) {
        if (key === 'otherConditionSelected' && formData.diagnoses.other) {
          html += `<li>Other: ${formData.diagnoses.other}</li>`;
        } else if (key !== 'otherConditionSelected') {
          const readableKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          html += `<li>${readableKey}</li>`;
        }
      }
    });
    if (formData.diagnoses.other && !formData.diagnoses.otherConditionSelected) {
        html += `<li>Other (not selected as primary): ${formData.diagnoses.other}</li>`;
    }
    if (formData.diagnoses.mainSymptoms) {
      html += `<li>Main Symptoms: ${formData.diagnoses.mainSymptoms.replace(/\n/g, '<br>')}</li>`;
    }
    if (formData.diagnoses.symptomDuration) {
      html += `<li>Symptom Duration: ${formData.diagnoses.symptomDuration}</li>`;
    }
    if (formData.diagnoses.symptomProgression) {
      html += `<li>Symptom Progression: ${formData.diagnoses.symptomProgression}</li>`;
    }
    html += '</ul></div>';
  }

    if (formData.redFlags) {
      let redFlagsHtml = '';
      const { 
        muscleWeakness, numbnessOrTingling, unexplainedWeightLoss, 
        bladderOrBowelIncontinence, saddleAnaesthesia, balanceProblems,
        otherRedFlagPresent, otherRedFlag 
      } = formData.redFlags;

      if (muscleWeakness?.present) {
        let areaDetails = "Present";
        if (muscleWeakness.areas) {
          const selectedAreas = Object.entries(muscleWeakness.areas)
            .filter(([, val]) => val.selected)
            .map(([areaName, val]) => `${areaName} (Severity: ${val.severity || 0})`).join(', ');
          if (selectedAreas) areaDetails += `, Areas: ${selectedAreas}`;
          else areaDetails += ` (no specific areas detailed with severity)`;
        }
        redFlagsHtml += `<li>Muscle Weakness: ${areaDetails}</li>`;
      }
      if (numbnessOrTingling?.present) {
        let areaDetails = "Present";
        if (numbnessOrTingling.areas) {
          const selectedAreas = Object.entries(numbnessOrTingling.areas)
            .filter(([, val]) => val.selected)
            .map(([areaName, val]) => `${areaName} (Severity: ${val.severity || 0})`).join(', ');
          if (selectedAreas) areaDetails += `, Areas: ${selectedAreas}`;
          else areaDetails += ` (no specific areas detailed with severity)`;
        }
        redFlagsHtml += `<li>Numbness Or Tingling: ${areaDetails}</li>`;
      }
      if (unexplainedWeightLoss?.present) {
        redFlagsHtml += `<li>Unexplained Weight Loss: Present`;
        if (unexplainedWeightLoss.amountKg !== undefined) redFlagsHtml += `, Amount: ${unexplainedWeightLoss.amountKg}kg`;
        if (unexplainedWeightLoss.period) redFlagsHtml += `, Period: ${unexplainedWeightLoss.period}`;
        redFlagsHtml += `</li>`;
      }
      if (bladderOrBowelIncontinence?.present) {
        redFlagsHtml += `<li>Bladder Or Bowel Incontinence: Present`;
        if (bladderOrBowelIncontinence.details) redFlagsHtml += `, Type: ${bladderOrBowelIncontinence.details}`;
        if (bladderOrBowelIncontinence.severity !== undefined) redFlagsHtml += `, Severity: ${bladderOrBowelIncontinence.severity}/10`;
        redFlagsHtml += `</li>`;
      }
      if (saddleAnaesthesia?.present) {
        redFlagsHtml += `<li>Saddle Anaesthesia: Present`;
        if (saddleAnaesthesia.details) redFlagsHtml += `, Area: ${saddleAnaesthesia.details}`;
        if (saddleAnaesthesia.severity !== undefined) redFlagsHtml += `, Severity: ${saddleAnaesthesia.severity}/10`;
        redFlagsHtml += `</li>`;
      }
      if (balanceProblems?.present && balanceProblems.type) {
        redFlagsHtml += `<li>Balance Problems: Present, Type: ${balanceProblems.type}</li>`;
      }
      if (otherRedFlagPresent && otherRedFlag) {
        redFlagsHtml += `<li>Other Red Flags: ${otherRedFlag}</li>`;
      }

      if (redFlagsHtml) {
        html += `
          <div class="section">
            <div class="section-title">Red Flag Symptoms</div>
            <ul>${redFlagsHtml}</ul>
          </div>
        `;
      }
    }
    
    if (formData.imagingRecordsPermission !== undefined) {
         html += `
            <div class="section">
                <div class="section-title">Imaging Records Permission</div>
                <p>${formData.imagingRecordsPermission ? 'Permission Granted' : 'Permission Not Granted'}</p>
            </div>
        `;
    }
  
    if (formData.treatmentGoals) {
    html += `
      <div class="section">
        <div class="section-title">Treatment Goals</div>
        <p>${formData.treatmentGoals.replace(/\n/g, '<br>')}</p>
      </div>
    `;
  }


  if (formData.painAreas && formData.painAreas.length > 0) {
    html += `
      <div class="section">
        <div class="section-title">Pain Assessment</div>
        <table>
          <thead><tr><th>Region</th><th>Intensity (0-10)</th><th>Notes</th></tr></thead>
          <tbody>
            ${formData.painAreas.map(area => `
              <tr>
                <td>${area.region || 'N/A'}</td>
                <td>${area.intensity || 'N/A'}</td>
                <td>${area.notes || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  if (formData.treatments) {
    html += '<div class="section"><div class="section-title">Non-Surgical Treatments</div><ul>';
    for (const [key, value] of Object.entries(formData.treatments)) {
      if (value === true && !key.includes('Name') && !key.includes('Details')) {
         const readableKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
         let details = '';
         if (key === 'prescriptionAntiInflammatory' && formData.treatments.prescriptionAntiInflammatoryName) details = `: ${formData.treatments.prescriptionAntiInflammatoryName}`;
         else if (key === 'prescriptionPainMedication' && formData.treatments.prescriptionPainMedicationName) details = `: ${formData.treatments.prescriptionPainMedicationName}`;
         else if (key === 'spinalInjections' && formData.treatments.spinalInjectionsDetails) details = `: ${formData.treatments.spinalInjectionsDetails}`;
         html += `<li>${readableKey}${details}</li>`;
      }
    }
    html += '</ul></div>';
  }

  if (formData.surgeries && formData.surgeries.length > 0 && formData.hadSurgery) {
    html += `
      <div class="section">
        <div class="section-title">Surgical History</div>
        <table>
          <thead><tr><th>Date</th><th>Procedure</th><th>Surgeon</th><th>Hospital</th></tr></thead>
          <tbody>
            ${formData.surgeries.map(surgery => `
              <tr>
                <td>${surgery.date || 'N/A'}</td>
                <td>${surgery.procedure || 'N/A'}</td>
                <td>${surgery.surgeon || 'N/A'}</td>
                <td>${surgery.hospital || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (formData.hadSurgery === false) {
     html += '<div class="section"><div class="section-title">Surgical History</div><p>No surgical history reported.</p></div>';
  }
  
  if (formData.imaging && formData.imaging.some(img => img.hadStudy)) {
    html += `
      <div class="section">
        <div class="section-title">Imaging History</div>
        <table>
          <thead><tr><th>Type</th><th>Date</th><th>Clinic</th><th>Spinal Regions</th><th>Document</th></tr></thead>
          <tbody>
            ${formData.imaging.filter(img => img.hadStudy).map(img => {
              let docLink = 'N/A';
              if (img.documentName && serverBaseUrl) {
                docLink = `<a href="${serverBaseUrl}/uploads/assessment_files/${img.documentName}" target="_blank">View Document</a>`;
              } else if (img.documentName) {
                docLink = `Document: ${img.documentName} (Link unavailable)`;
              }
              const spinalRegions = img.spinalRegions && img.spinalRegions.length > 0 ? img.spinalRegions.join(', ') : 'N/A';
              return `
                <tr>
                  <td>${img.type || 'N/A'}</td>
                  <td>${img.date || 'N/A'}</td>
                  <td>${img.clinic || 'N/A'}</td>
                  <td>${spinalRegions}</td>
                  <td>${docLink}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    html += '<div class="section"><div class="section-title">Imaging History</div><p>No imaging studies reported.</p></div>';
  }

  if (recipientType === 'admin' && (formData.painMapImageFront || formData.painMapImageBack)) {
    html += `
      <div class="section">
        <div class="section-title">Pain Map Images</div>
    `;
    if (formData.painMapImageFront) {
      html += `
        <h3>Front View</h3>
        <img src="cid:painMapFront" alt="Pain Map Front View" style="max-width: 100%; height: auto;" />
      `;
    }
    if (formData.painMapImageBack) {
      html += `
        <h3>Back View</h3>
        <img src="cid:painMapBack" alt="Pain Map Back View" style="max-width: 100%; height: auto;" />
      `;
    }
    html += `</div>`;
  }

  if (recipientType === 'admin') {
    if (aiSummary) {
      html += `
        <div class="section">
          <div class="section-title">Initial Triage: Report and Summary</div>
          <p>${aiSummary.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }
    if (nextStep) {
        html += `
        <div class="section">
          <div class="section-title">Next Step Chosen by User</div>
          <p>${nextStep}</p>
        </div>
      `;
    }
    if (recommendationText) {
      html += `
        <div class="section">
          <div class="section-title">Adaptive Next-Step Evaluation</div>
          <p>${recommendationText}</p>
        </div>
      `;
    }
  }

  html += `
      </body>
    </html>
  `;
  return html;
}
