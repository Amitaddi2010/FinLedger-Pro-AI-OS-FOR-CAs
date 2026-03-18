import express from 'express';
import { transactionController } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Bulk ingest
router.post('/upload', protect, upload.single('file'), transactionController.uploadCSV);

// OCR Vision Ingestion
router.post('/upload-receipt', protect, upload.single('image'), transactionController.uploadReceipt);

// Financial summary (revenues, prorata)
router.get('/summary', protect, transactionController.getSummary);

// Ledger Explorer — paginated list with search/filter/sort
router.get('/list', protect, transactionController.listTransactions);

export default router;
