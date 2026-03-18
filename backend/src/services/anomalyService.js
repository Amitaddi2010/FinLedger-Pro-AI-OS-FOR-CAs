import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.js';
import { Company } from '../models/Company.js';

export const anomalyService = {
  
  /**
   * Detect sudden expense spikes or revenue drops.
   * Compares current month vs trailing 3-month average.
   * If deviation > 30%, flag as anomaly.
   */
  async detectAnomalies(companyId) {
    const objectId = new mongoose.Types.ObjectId(companyId);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentStart = new Date(currentYear, currentMonth, 1);
    const currentEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const trailingStart = new Date(currentYear, currentMonth - 3, 1);
    const trailingEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const [currentData, trailingData] = await Promise.all([
      Transaction.aggregate([
        { $match: { companyId: objectId, date: { $gte: currentStart, $lte: currentEnd } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { companyId: objectId, date: { $gte: trailingStart, $lte: trailingEnd } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ])
    ]);

    const currentMap = {};
    currentData.forEach(d => { currentMap[d._id] = d.total; });

    const trailingMap = {};
    trailingData.forEach(d => { trailingMap[d._id] = d.total / 3; });

    const anomalies = [];
    const THRESHOLD = 0.30;

    // Expense spike detection
    if (trailingMap['EXPENSE'] && currentMap['EXPENSE']) {
      const deviation = (currentMap['EXPENSE'] - trailingMap['EXPENSE']) / trailingMap['EXPENSE'];
      if (deviation > THRESHOLD) {
        anomalies.push({
          type: 'EXPENSE_SPIKE',
          severity: deviation > 0.5 ? 'HIGH' : 'MEDIUM',
          currentValue: currentMap['EXPENSE'],
          average: trailingMap['EXPENSE'],
          deviationPercent: parseFloat((deviation * 100).toFixed(2)),
          message: `Expenses this month (₹${currentMap['EXPENSE'].toLocaleString()}) are ${(deviation * 100).toFixed(1)}% higher than the trailing 3-month average (₹${trailingMap['EXPENSE'].toLocaleString()}).`
        });
      }
    }

    // Revenue drop detection
    if (trailingMap['INCOME'] && currentMap['INCOME']) {
      const deviation = (trailingMap['INCOME'] - currentMap['INCOME']) / trailingMap['INCOME'];
      if (deviation > THRESHOLD) {
        anomalies.push({
          type: 'REVENUE_DROP',
          severity: deviation > 0.5 ? 'HIGH' : 'MEDIUM',
          currentValue: currentMap['INCOME'],
          average: trailingMap['INCOME'],
          deviationPercent: parseFloat((deviation * 100).toFixed(2)),
          message: `Revenue this month (₹${currentMap['INCOME'].toLocaleString()}) is ${(deviation * 100).toFixed(1)}% lower than the trailing 3-month average (₹${trailingMap['INCOME'].toLocaleString()}).`
        });
      }
    }

    // Update company risk level
    if (anomalies.length > 0) {
      const hasHigh = anomalies.some(a => a.severity === 'HIGH');
      await Company.findByIdAndUpdate(companyId, {
        riskLevel: hasHigh ? 'HIGH' : 'MEDIUM'
      });
    }

    return anomalies;
  },

  /**
   * Category-level anomaly detection.
   */
  async detectCategoryAnomalies(companyId) {
    const objectId = new mongoose.Types.ObjectId(companyId);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentStart = new Date(currentYear, currentMonth, 1);
    const currentEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const trailingStart = new Date(currentYear, currentMonth - 3, 1);
    const trailingEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const [currentCategories, trailingCategories] = await Promise.all([
      Transaction.aggregate([
        { $match: { companyId: objectId, type: 'EXPENSE', date: { $gte: currentStart, $lte: currentEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { companyId: objectId, type: 'EXPENSE', date: { $gte: trailingStart, $lte: trailingEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ])
    ]);

    const trailingAvgMap = {};
    trailingCategories.forEach(c => { trailingAvgMap[c._id] = c.total / 3; });

    const categoryAnomalies = [];
    currentCategories.forEach(c => {
      const avg = trailingAvgMap[c._id];
      if (avg && c.total > avg * 1.3) {
        categoryAnomalies.push({
          category: c._id,
          currentAmount: c.total,
          trailingAverage: avg,
          spikePercent: parseFloat((((c.total - avg) / avg) * 100).toFixed(2))
        });
      }
    });

    return categoryAnomalies.sort((a, b) => b.spikePercent - a.spikePercent);
  }
};
