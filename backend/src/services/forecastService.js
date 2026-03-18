import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.js';

export const forecastService = {
  
  /**
   * Basic forecasting using linear regression on historical monthly data.
   * Predicts next month revenue and profit.
   */
  async forecastNextMonth(companyId) {
    const objectId = new mongoose.Types.ObjectId(companyId);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);
    
    const monthlyAggregations = await Transaction.aggregate([
      {
        $match: {
          companyId: objectId,
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Pivot the data
    const monthMap = {};
    monthlyAggregations.forEach(entry => {
      const key = `${entry._id.year}-${String(entry._id.month).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { revenue: 0, expenses: 0 };
      if (entry._id.type === 'INCOME') monthMap[key].revenue = entry.total;
      if (entry._id.type === 'EXPENSE') monthMap[key].expenses = entry.total;
    });

    const months = Object.keys(monthMap).sort();
    
    if (months.length < 2) {
      return {
        message: 'Insufficient historical data (need at least 2 months).',
        predictedRevenue: null,
        predictedProfit: null
      };
    }

    const revenuePoints = months.map((m, i) => ({ x: i, y: monthMap[m].revenue }));
    const expensePoints = months.map((m, i) => ({ x: i, y: monthMap[m].expenses }));

    const predictRevenue = linearRegression(revenuePoints, months.length);
    const predictExpenses = linearRegression(expensePoints, months.length);
    const predictProfit = predictRevenue - predictExpenses;

    const nextMonthIdx = currentMonth + 1;
    const nextMonthName = new Date(currentYear, nextMonthIdx, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    return {
      forecastPeriod: nextMonthName,
      predictedRevenue: Math.max(0, parseFloat(predictRevenue.toFixed(2))),
      predictedExpenses: parseFloat(predictExpenses.toFixed(2)),
      predictedProfit: parseFloat(predictProfit.toFixed(2)),
      basedOnMonths: months.length,
      trend: predictRevenue > monthMap[months[months.length - 1]]?.revenue ? 'UPWARD' : 'DOWNWARD'
    };
  }
};

/**
 * Simple linear regression helper
 * y = mx + b
 */
function linearRegression(points, predictX) {
  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  points.forEach(p => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  });

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return sumY / n; // Flat line fallback
  
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  
  return slope * predictX + intercept;
}
