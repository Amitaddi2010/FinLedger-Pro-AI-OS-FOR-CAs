import express from 'express';
import { insightController } from '../controllers/insightController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, insightController.generateDashboardInsight);
router.post('/ask', protect, insightController.askAI);
router.post('/ask-documents', protect, insightController.queryDocuments);
router.get('/executive-summary', protect, insightController.generateExecutiveReport);

export default router;
