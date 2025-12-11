const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const baseUploadsDir = path.join(__dirname, '../public/uploads');
const baseAssessmentFilesDir = path.join(baseUploadsDir, 'assessment_files');
const tempUploadDir = path.join(baseUploadsDir, 'temp');

const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedOriginalName}`);
  }
});

const upload = multer({ storage: tempStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/imaging-file', upload.single('imagingFile'), (req, res, next) => {
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
  
  fs.rename(tempPath, finalPath, (err) => {
    if (err) {
      console.error('Error moving file:', err);
      try {
        fs.unlinkSync(tempPath);
      } catch (unlinkErr) {
        console.error('Error cleaning up temp file:', unlinkErr);
      }
      return res.status(500).json({ error: 'Failed to process file upload.' });
    }

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

router.post('/pain-map', async (req, res) => {
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
    console.log(`[Pain Map Upload] Base assessment dir: ${baseAssessmentFilesDir}`);
    console.log(`[Pain Map Upload] SERVER_BASE_URL: ${process.env.SERVER_BASE_URL || 'NOT SET'}`);

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
    
    // Also sync the directory to ensure entry is persisted (important for Docker volumes)
    try {
      const dirFd = fs.openSync(finalSessionDir, 'r');
      fs.fsyncSync(dirFd);
      fs.closeSync(dirFd);
    } catch (dirSyncErr) {
      console.warn(`[Pain Map Upload] Directory sync warning: ${dirSyncErr.message}`);
    }
    
    // Small delay to ensure Docker volume mount has propagated the write
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify file was written and get size
    const stats = fs.statSync(finalPath);
    console.log(`[Pain Map Upload] File saved and synced: ${finalPath}, Size: ${stats.size} bytes`);

    // Double-check file is readable
    const verifyExists = fs.existsSync(finalPath);
    const verifyReadable = fs.readFileSync(finalPath).length > 0;
    console.log(`[Pain Map Upload] Verification: exists=${verifyExists}, readable=${verifyReadable}, size=${stats.size}`);

    if (!verifyExists || stats.size === 0) {
      console.error(`[Pain Map Upload] Verification failed for ${finalPath}. Exists: ${verifyExists}, Size: ${stats.size}`);
      return res.status(500).json({ error: 'Pain map file could not be verified after upload.' });
    }

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
router.post('/referral', upload.single('referralFile'), (req, res) => {
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

module.exports = router;
