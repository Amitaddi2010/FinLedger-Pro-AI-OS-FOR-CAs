import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { invoiceController } from '../controllers/invoiceController.js';

const router = express.Router();

router.get('/', protect, invoiceController.getInvoices);
router.post('/', protect, invoiceController.createInvoice);
router.put('/:id/status', protect, invoiceController.updateInvoiceStatus);

export default router;
