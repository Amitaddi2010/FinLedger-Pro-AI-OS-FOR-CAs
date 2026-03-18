import express from 'express';
import { companyController } from '../controllers/companyController.js';
import { budgetController } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, companyController.createCompany)
  .get(protect, companyController.getCompanies);

router.post('/switch/:companyId', protect, companyController.switchCompany);
router.post('/budget', protect, budgetController.saveBudget);
router.get('/budget', protect, budgetController.getBudget);

// Get audit logs for active workspace
router.get('/audit-logs', protect, companyController.getAuditLogs);

export default router;
