import express from 'express';
import { Document } from '../models/Document.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * Get all documents for the active company
 */
router.get('/', protect, async (req, res) => {
  try {
    const activeCompanyId = req.query.companyId || req.user.activeCompanyId;
    if (!activeCompanyId) return res.status(400).json({ message: 'Select a company first.' });

    const docs = await Document.find({ companyId: activeCompanyId }).populate('uploadedBy', 'name');
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Get Storage Statistics
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const activeCompanyId = req.user.activeCompanyId;
    if (!activeCompanyId) return res.status(400).json({ message: 'Select a company first.' });

    const docs = await Document.find({ companyId: activeCompanyId });
    
    // Sum up sizes (assuming size string like "2.4 MB")
    let totalBytes = 0;
    docs.forEach(doc => {
      const match = doc.size.match(/(\d+\.?\d*)\s*(MB|KB|GB|B)/i);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        if (unit === 'GB') totalBytes += value * 1024 * 1024 * 1024;
        else if (unit === 'MB') totalBytes += value * 1024 * 1024;
        else if (unit === 'KB') totalBytes += value * 1024;
        else totalBytes += value;
      }
    });

    const usedGB = totalBytes / (1024 * 1024 * 1024);
    res.status(200).json({ usedGB, limitGB: 10, usedPercent: (usedGB / 10) * 100 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Direct Vault Upload & PDF Extraction Tooling
 */
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const activeCompanyId = req.body.companyId || req.user.activeCompanyId;
    if (!activeCompanyId) return res.status(400).json({ message: 'Select a company first.' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const vaultDir = path.join(process.cwd(), 'vault');
    if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });

    const originalName = req.file.originalname;
    const extName = path.extname(originalName).toLowerCase();
    const vaultPath = path.join(vaultDir, req.file.filename + extName);
    fs.renameSync(req.file.path, vaultPath);

    let extractedText = null;
    if (extName === '.pdf') {
      try {
        const dataBuffer = fs.readFileSync(vaultPath);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      } catch (pdfErr) {
        console.warn("PDF Extraction skipped/failed:", pdfErr.message);
      }
    }

    const doc = await Document.create({
      companyId: activeCompanyId,
      name: originalName,
      type: originalName.split('.').pop().toUpperCase(),
      size: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
      category: req.body.category || 'General',
      filePath: vaultPath,
      uploadedBy: req.user._id,
      extractedText: extractedText
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
