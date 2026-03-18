import { Transaction } from '../models/Transaction.js';
import { Company } from '../models/Company.js';
import { Budget } from '../models/Budget.js';
import { financialService } from '../services/financialService.js';
import { anomalyService } from '../services/anomalyService.js';
import { forecastService } from '../services/forecastService.js';
import { calculateProrata, compareWithProrata } from '../utils/prorata.js';

export const metricsController = {

  /**
   * Full portfolio health summary for Portfolio Dashboard
   */
  async getPortfolioHealth(req, res) {
    try {
      const companies = await Company.find({ ownerId: req.user._id });
      
      const portfolioData = await Promise.all(companies.map(async (company) => {
        const metrics = await financialService.getMetrics(company._id);
        const budget = await Budget.findOne({ companyId: company._id, year: new Date().getFullYear() });
        
        let prorataStatus = null;
        if (budget) {
          const expectedRevenue = calculateProrata(budget.annualRevenueTarget);
          const expectedProfit = calculateProrata(budget.annualProfitTarget);
          prorataStatus = {
            revenue: compareWithProrata(metrics.totalRevenue, expectedRevenue),
            profit: compareWithProrata(metrics.profit, expectedProfit)
          };
        }

        // Calculate health score (0-100) based on multiple factors
        let healthScore = 100;
        if (prorataStatus) {
          if (prorataStatus.revenue.status === 'BEHIND') healthScore -= Math.min(prorataStatus.revenue.percentage * 0.5, 30);
          if (prorataStatus.profit.status === 'BEHIND') healthScore -= Math.min(prorataStatus.profit.percentage * 0.5, 30);
        }
        if (metrics.netMargin < 0) healthScore -= 20;
        else if (metrics.netMargin < 5) healthScore -= 10;
        healthScore = Math.max(0, Math.round(healthScore));

        // Update healthScore in DB
        await Company.findByIdAndUpdate(company._id, { healthScore });

        return {
          _id: company._id,
          name: company.name,
          industry: company.industry,
          healthScore,
          riskLevel: company.riskLevel,
          metrics,
          prorataStatus
        };
      }));

      // Sort by urgency (lowest health first)
      portfolioData.sort((a, b) => a.healthScore - b.healthScore);

      res.json(portfolioData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Category breakdown for current active company
   */
  async getCategoryBreakdown(req, res) {
    try {
      const companyId = req.user.activeCompanyId;
      if (!companyId) return res.status(400).json({ message: 'No active company.' });
      
      const { type } = req.query; // INCOME or EXPENSE
      const breakdown = await financialService.getCategoryBreakdown(companyId, type || 'EXPENSE');
      res.json(breakdown);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * MoM comparison — current month vs previous month
   */
  async getMoMComparison(req, res) {
    try {
      const companyId = req.user.activeCompanyId;
      if (!companyId) return res.status(400).json({ message: 'No active company.' });

      const now = new Date();
      const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      const [currentMetrics, prevMetrics] = await Promise.all([
        financialService.getMetrics(companyId, currentStart, currentEnd),
        financialService.getMetrics(companyId, prevStart, prevEnd)
      ]);

      const revenueChange = prevMetrics.totalRevenue > 0
        ? ((currentMetrics.totalRevenue - prevMetrics.totalRevenue) / prevMetrics.totalRevenue * 100) : 0;
      const profitChange = prevMetrics.profit !== 0
        ? ((currentMetrics.profit - prevMetrics.profit) / Math.abs(prevMetrics.profit) * 100) : 0;

      res.json({
        current: currentMetrics,
        previous: prevMetrics,
        changes: {
          revenueChange: parseFloat(revenueChange.toFixed(2)),
          profitChange: parseFloat(profitChange.toFixed(2))
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Anomaly detection endpoint
   */
  async getAnomalies(req, res) {
    try {
      const companyId = req.user.activeCompanyId;
      if (!companyId) return res.status(400).json({ message: 'No active company.' });

      const [aggregateAnomalies, categoryAnomalies] = await Promise.all([
        anomalyService.detectAnomalies(companyId),
        anomalyService.detectCategoryAnomalies(companyId)
      ]);

      res.json({ aggregateAnomalies, categoryAnomalies });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Forecast endpoint
   */
  async getForecast(req, res) {
    try {
      const companyId = req.user.activeCompanyId;
      if (!companyId) return res.status(400).json({ message: 'No active company.' });

      const forecast = await forecastService.forecastNextMonth(companyId);
      res.json(forecast);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
