import { Alert } from '../models/Alert.js';
import { anomalyService } from '../services/anomalyService.js';
import { financialService } from '../services/financialService.js';

export const alertController = {
  
  /**
   * Get all unread alerts or filtered by company
   */
  async getAlerts(req, res) {
    try {
      const companyId = req.query.companyId; 
      
      const filter = {};
      if (companyId) {
        filter.companyId = companyId;
      } else {
        // If no company selected, get all alerts for all companies user manages
        // In this MVP, user is admin, so just return all if no filter
      }

      const alerts = await Alert.find(filter)
        .sort({ isRead: 1, createdAt: -1 }) // Unread first, newest first
        .limit(50);
        
      res.json(alerts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Automatically scan ledgers to verify current rules/budgets
   * and create new alerts in the DB.
   */
  async triggerScan(req, res) {
    try {
      const { companyId } = req.params;
      if (!companyId) return res.status(400).json({ message: 'companyId required' });
      
      // 1. Scan for mathematical anomalies
      const localAnomalies = await anomalyService.scanLocalAnomalies(companyId);
      
      // We log each anomaly as an alert if it hasn't been logged today
      for (const a of localAnomalies.aggregateAnomalies) {
        // Simple dedupe strategy: check if identical title/message exists today
        const existing = await Alert.findOne({
           companyId,
           title: a.type.replace('_', ' '),
           createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
        });

        if (!existing) {
          await Alert.create({
            companyId,
            title: a.type.replace('_', ' '),
            message: a.message,
            severity: a.type === 'UNUSUAL_SPEND_SPIKE' ? 'HIGH' : 'MEDIUM',
            type: 'ANOMALY',
            metadata: { category: a.category, amount: a.categoryTotal }
          });
        }
      }

      // 2. Scan prorata metrics using financial service
      const snapshot = await financialService.getCompanyOverview(companyId);
      if (snapshot.prorata) {
        if (snapshot.prorata.profit.status === 'BEHIND' && snapshot.prorata.profit.percentage > 10) {
          const title = 'Profit Margin Deviation';
          // Avoid spamming alerts
          const existing = await Alert.findOne({ companyId, title, isRead: false });
          if (!existing) {
             await Alert.create({
               companyId,
               title,
               message: `Entity is missing YoY prorata profit targets by ${snapshot.prorata.profit.percentage}%.`,
               severity: 'HIGH',
               type: 'PRORATA_DEVIATION',
               metadata: { expected: snapshot.prorata.expectedProfit, actual: snapshot.actuals.profit }
             });
          }
        }
        
        // Expense Burn WARNING
        if (snapshot.actuals.totalRevenue > 0) {
          const burnRate = (snapshot.actuals.totalExpenses / snapshot.actuals.totalRevenue) * 100;
          if (burnRate > 80) { // arbitrary threshold for MVP warning
            const existing = await Alert.findOne({ companyId, type: 'CASHFLOW_RISK', isRead: false });
            if (!existing) {
               await Alert.create({
                 companyId,
                 title: 'High Burn Rate Warning',
                 message: `Total expenditure has consumed ${burnRate.toFixed(1)}% of total revenue. Immediate cash flow optimization is required.`,
                 severity: 'HIGH',
                 type: 'CASHFLOW_RISK'
               });
            }
          }
        }
      }

      res.json({ success: true, message: 'Ledgers scanned. Intelligence matrix updated.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * Mark an alert as read / dismissed
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const alert = await Alert.findByIdAndUpdate(id, { isRead: true }, { new: true });
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
