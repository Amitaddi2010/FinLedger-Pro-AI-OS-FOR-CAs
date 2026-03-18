import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.js';
import { Budget } from '../models/Budget.js';
import { calculateProrata, compareWithProrata } from '../utils/prorata.js';

export const financialService = {
  
  /**
   * Get basic aggregated financial metrics (Revenue, Expenses, Profit) over a period
   */
  async getMetrics(companyId, startDate, endDate) {
    // Ensure companyId is a proper ObjectId for aggregation
    const objectId = new mongoose.Types.ObjectId(companyId);

    const matchStage = {
      $match: {
        companyId: objectId,
        ...(startDate && endDate ? { date: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {})
      }
    };

    const groupStage = {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0] }
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0] }
        }
      }
    };

    const results = await Transaction.aggregate([matchStage, groupStage]);
    
    if (results.length === 0) {
      return { totalRevenue: 0, totalExpenses: 0, profit: 0, netMargin: 0 };
    }

    const { totalRevenue, totalExpenses } = results[0];
    const profit = totalRevenue - totalExpenses;
    
    let netMargin = 0;
    if (totalRevenue > 0) {
      netMargin = (profit / totalRevenue) * 100;
    } else if (profit < 0) {
      // If 0 revenue and negative profit, margin is -100% technically (total loss of expenses)
      netMargin = -100;
    }

    return {
      totalRevenue,
      totalExpenses,
      profit,
      netMargin: parseFloat(netMargin.toFixed(2))
    };
  },

  /**
   * Get comprehensive dashboard overview including Prorata expectations
   */
  async getCompanyOverview(companyId) {
    const objectId = new mongoose.Types.ObjectId(companyId);
    const metrics = await this.getMetrics(companyId);
    
    // Get budget for current year
    const currentYear = new Date().getFullYear();
    const budget = await Budget.findOne({ companyId, year: currentYear });
    
    // Get Top Transactions for AI context
    const topTransactions = await Transaction.find({ companyId: objectId })
      .sort({ amount: -1 })
      .limit(20)
      .select('date description amount type category');

    // Get Recent Transactions for AI context
    const recentTransactions = await Transaction.find({ companyId: objectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('date description amount type category');

    // Get Category distribution
    const expenseCategories = await this.getCategoryBreakdown(companyId, 'EXPENSE');

    const overview = {
      actuals: metrics,
      prorata: null,
      targets: null,
      topTransactions,
      recentTransactions,
      expenseCategories
    };

    if (budget) {
      overview.targets = {
        annualRevenueTarget: budget.annualRevenueTarget,
        annualProfitTarget: budget.annualProfitTarget
      };
      
      const expectedRevenue = calculateProrata(budget.annualRevenueTarget);
      const expectedProfit = calculateProrata(budget.annualProfitTarget);

      overview.prorata = {
        revenue: compareWithProrata(metrics.totalRevenue, expectedRevenue),
        profit: compareWithProrata(metrics.profit, expectedProfit),
        expectedRevenue,
        expectedProfit
      };
    }

    return overview;
  },

  /**
   * Category-wise breakdown for anomalies
   */
  async getCategoryBreakdown(companyId, type) {
    const objectId = new mongoose.Types.ObjectId(companyId);
    return await Transaction.aggregate([
      { $match: { companyId: objectId, type } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);
  }
};
