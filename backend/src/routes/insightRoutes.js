import express from 'express';
import { insightController } from '../controllers/insightController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, insightController.generateDashboardInsight);
router.post('/ask', protect, insightController.askAI);

export default router;
