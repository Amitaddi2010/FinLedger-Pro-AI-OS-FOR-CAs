import express from 'express';
import { transactionController } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Bulk ingest
router.post('/upload', protect, upload.single('file'), transactionController.uploadCSV);

// Financial summary (revenues, prorata)
router.get('/summary', protect, transactionController.getSummary);

export default router;
