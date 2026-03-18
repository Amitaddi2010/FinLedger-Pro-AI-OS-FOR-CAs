import { Budget } from '../models/Budget.js';
import { protect } from '../middleware/authMiddleware.js';

export const budgetController = {
  
  async saveBudget(req, res) {
    try {
      const { companyId, annualRevenueTarget, annualProfitTarget } = req.body;
      const currentYear = new Date().getFullYear();

      // Upsert budget for current year
      const budget = await Budget.findOneAndUpdate(
        { companyId, year: currentYear },
        { annualRevenueTarget, annualProfitTarget },
        { upsert: true, new: true, runValidators: true }
      );

      res.json(budget);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getBudget(req, res) {
    try {
      const companyId = req.user.activeCompanyId;
      if (!companyId) return res.status(400).json({ message: 'No active company.' });
      
      const currentYear = new Date().getFullYear();
      const budget = await Budget.findOne({ companyId, year: currentYear });
      
      if (!budget) return res.status(404).json({ message: 'No budget data found for current year.' });
      
      res.json(budget);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
