import express from 'express';
import { metricsController } from '../controllers/metricsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Portfolio-level aggregate health (Portfolio Dashboard)
router.get('/portfolio', protect, metricsController.getPortfolioHealth);

// Category-level breakdown (pie charts)
router.get('/categories', protect, metricsController.getCategoryBreakdown);

// Month-over-Month comparison
router.get('/mom', protect, metricsController.getMoMComparison);

// Anomaly detection
router.get('/anomalies', protect, metricsController.getAnomalies);

// Forecast next month
router.get('/forecast', protect, metricsController.getForecast);

// Financial Ratios
router.get('/ratios', protect, metricsController.getFinancialRatios);

// GST Intelligence Summary
router.get('/gst', protect, metricsController.getGstSummary);

// Year-over-Year Comparison
router.get('/yoy', protect, metricsController.getYoYComparison);

export default router;
