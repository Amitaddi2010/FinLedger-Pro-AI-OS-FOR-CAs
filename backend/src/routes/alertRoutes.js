import express from 'express';
import { alertController } from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, alertController.getAlerts);
router.post('/scan/:companyId', protect, alertController.triggerScan);
router.put('/:id/read', protect, alertController.markAsRead);

export default router;
