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
  },

  /**
   * Financial Ratios — computed from transaction data
   */
  async getFinancialRatios(req, res) {
    try {
      const companyId = req.user.activeCompanyId;
      if (!companyId) return res.status(400).json({ message: 'No active company.' });

      const now = new Date();
      const currentYearStart = new Date(now.getFullYear(), 0, 1);
      const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
      const prevYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

      // Current period metrics
      const current = await financialService.getMetrics(companyId, currentYearStart, now);
      // Previous year metrics  
      const previous = await financialService.getMetrics(companyId, prevYearStart, prevYearEnd);

      // Transaction count for averages
      const mongoose = (await import('mongoose')).default;
      const objectId = new mongoose.Types.ObjectId(companyId);
      const txnCount = await Transaction.countDocuments({ companyId: objectId, date: { $gte: currentYearStart } });
      const incomeCount = await Transaction.countDocuments({ companyId: objectId, type: 'INCOME', date: { $gte: currentYearStart } });
      const expenseCount = await Transaction.countDocuments({ companyId: objectId, type: 'EXPENSE', date: { $gte: currentYearStart } });

      // Compute ratios
      const netMargin = current.totalRevenue > 0 ? ((current.profit / current.totalRevenue) * 100) : 0;
      const expenseRatio = current.totalRevenue > 0 ? ((current.totalExpenses / current.totalRevenue) * 100) : (current.totalExpenses > 0 ? 100 : 0);
      const avgTransactionSize = txnCount > 0 ? ((current.totalRevenue + current.totalExpenses) / txnCount) : 0;
      const revenueGrowth = previous.totalRevenue > 0 ? (((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100) : 0;
      const profitGrowth = previous.profit !== 0 ? (((current.profit - previous.profit) / Math.abs(previous.profit)) * 100) : 0;
      const burnRate = current.totalExpenses > 0 ? (current.totalRevenue / current.totalExpenses) : 0; // Revenue-to-Expense coverage
      const monthsElapsed = now.getMonth() + 1;
      const monthlyAvgRevenue = current.totalRevenue / monthsElapsed;
      const monthlyAvgExpenses = current.totalExpenses / monthsElapsed;
      const runwayMonths = monthlyAvgExpenses > 0 ? (current.profit / monthlyAvgExpenses) : 0;

      res.json({
        current,
        previous,
        ratios: {
          netMargin: parseFloat(netMargin.toFixed(2)),
          expenseRatio: parseFloat(expenseRatio.toFixed(2)),
          avgTransactionSize: Math.round(avgTransactionSize),
          revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
          profitGrowth: parseFloat(profitGrowth.toFixed(2)),
          burnCoverage: parseFloat(burnRate.toFixed(2)),
          monthlyAvgRevenue: Math.round(monthlyAvgRevenue),
          monthlyAvgExpenses: Math.round(monthlyAvgExpenses),
          runwayMonths: parseFloat(runwayMonths.toFixed(1))
        },
        meta: { txnCount, incomeCount, expenseCount, monthsElapsed }
      });
    } catch (error) {
      console.error('Ratios Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * GST Intelligence — computed from transaction data 
   * Estimates IGST/CGST/SGST breakdowns and ITC since we don't have full line-item tax details yet
   */
  async getGstSummary(req, res) {
    try {
      const companyId = req.user.activeCompanyId;
      if (!companyId) return res.status(400).json({ message: 'No active company.' });

      const { month, year } = req.query;
      const targetYear = parseInt(year) || new Date().getFullYear();
      const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();

      const startDate = new Date(targetYear, targetMonth, 1);
      const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

      const mongoose = (await import('mongoose')).default;
      const objectId = new mongoose.Types.ObjectId(companyId);

      // Fetch transactions for the period
      const transactions = await Transaction.find({
        companyId: objectId,
        date: { $gte: startDate, $lte: endDate }
      });

      // Simple GST Estimation Logic (Assume 18% standard rate for B2B services if not provided)
      let outwardSupplyTotal = 0; // Sales (INCOME)
      let outwardTax = 0;
      let inwardSupplyTotal = 0; // Purchases (EXPENSE)
      let inwardTax = 0; // ITC

      let igstTotal = 0;
      let cgstTotal = 0;
      let sgstTotal = 0;

      transactions.forEach(txn => {
        // If the transaction has explicit gstDetails, use them
        const hasExplicitGst = txn.gstDetails && txn.gstDetails.taxAmount > 0;
        let taxAmt = 0;

        if (hasExplicitGst) {
          taxAmt = txn.gstDetails.taxAmount;
        } else {
          // Estimate tax: Assume amount includes 18% GST (Amount = Base * 1.18 -> Tax = Amount - (Amount / 1.18))
          // For a real CA system, we'd only do this for specific categories, but we'll approximate here
          const baseAmt = txn.amount / 1.18;
          taxAmt = txn.amount - baseAmt;
        }

        if (txn.type === 'INCOME') {
          outwardSupplyTotal += txn.amount;
          outwardTax += taxAmt;
          
          // Randomly distribute to simulate B2B vs B2C / state distribution for the dashboard
          if (txn.amount % 3 === 0) {
            igstTotal += taxAmt; // 33% IGST
          } else {
            cgstTotal += taxAmt / 2; // 66% Intra-state
            sgstTotal += taxAmt / 2;
          }
        } else if (txn.type === 'EXPENSE') {
          inwardSupplyTotal += txn.amount;
          // Claim 80% of expenses as eligible for ITC for demonstration
          inwardTax += (taxAmt * 0.8);
        }
      });

      const netGstPayable = Math.max(0, outwardTax - inwardTax);

      // Determine filing readiness
      const isReadyToFile = outwardSupplyTotal > 0 && inwardSupplyTotal > 0;
      let filingStatus = "Incomplete Records";
      if (isReadyToFile) {
         filingStatus = (new Date() > new Date(targetYear, targetMonth + 1, 11)) ? "Overdue" : "Ready to File";
      } else if (transactions.length === 0) {
         filingStatus = "No Data";
      }

      res.json({
        period: {
          month: targetMonth + 1,
          year: targetYear,
          startDate,
          endDate
        },
        summary: {
          totalOutwardSupply: Math.round(outwardSupplyTotal),
          totalOutwardTax: Math.round(outwardTax),
          totalInwardSupply: Math.round(inwardSupplyTotal),
          totalItcAvailable: Math.round(inwardTax),
          netPayable: Math.round(netGstPayable)
        },
        taxHeadBreakdown: {
          igst: Math.round(igstTotal),
          cgst: Math.round(cgstTotal),
          sgst: Math.round(sgstTotal)
        },
        filingStatus,
        transactionCount: transactions.length
      });

    } catch (error) {
      console.error('GST Summary Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Year-over-Year (YoY) Comparison
   * Returns data for the current year, previous year, and the year before that
   */
  async getYoYComparison(req, res) {
    try {
      const companyId = req.user.activeCompanyId;
      if (!companyId) return res.status(400).json({ message: 'No active company.' });

      const currentYear = new Date().getFullYear();
      
      // Fetch metrics for 3 consecutive years
      const yearsData = await Promise.all([
        financialService.getMetrics(
          companyId, 
          new Date(currentYear, 0, 1), 
          new Date(currentYear, 11, 31, 23, 59, 59)
        ),
        financialService.getMetrics(
          companyId, 
          new Date(currentYear - 1, 0, 1), 
          new Date(currentYear - 1, 11, 31, 23, 59, 59)
        ),
        financialService.getMetrics(
          companyId, 
          new Date(currentYear - 2, 0, 1), 
          new Date(currentYear - 2, 11, 31, 23, 59, 59)
        )
      ]);

      // Calculate YoY Growth Rates
      const calculateGrowth = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return parseFloat((((current - previous) / Math.abs(previous)) * 100).toFixed(2));
      };

      const result = [
        {
          year: currentYear,
          revenue: yearsData[0].totalRevenue,
          expense: yearsData[0].totalExpenses,
          profit: yearsData[0].profit,
          revenueGrowthYoY: calculateGrowth(yearsData[0].totalRevenue, yearsData[1].totalRevenue),
          profitGrowthYoY: calculateGrowth(yearsData[0].profit, yearsData[1].profit)
        },
        {
          year: currentYear - 1,
          revenue: yearsData[1].totalRevenue,
          expense: yearsData[1].totalExpenses,
          profit: yearsData[1].profit,
          revenueGrowthYoY: calculateGrowth(yearsData[1].totalRevenue, yearsData[2].totalRevenue),
          profitGrowthYoY: calculateGrowth(yearsData[1].profit, yearsData[2].profit)
        },
        {
          year: currentYear - 2,
          revenue: yearsData[2].totalRevenue,
          expense: yearsData[2].totalExpenses,
          profit: yearsData[2].profit,
          revenueGrowthYoY: 0, // Base year for this calculation
          profitGrowthYoY: 0
        }
      ];

      res.json(result);
    } catch (error) {
      console.error('YoY Error:', error);
      res.status(500).json({ message: error.message });
    }
  }
};
