import { aiService } from '../services/aiService.js';
import { financialService } from '../services/financialService.js';

export const insightController = {
  
  /**
   * Triggers the Groq AI service to analyze current dashboard data
   */
  async generateDashboardInsight(req, res) {
    try {
      const activeCompanyId = req.user.activeCompanyId;
      if (!activeCompanyId) return res.status(400).json({ message: 'No active company selected.' });

      // Gather context
      const financialSnapshot = await financialService.getCompanyOverview(activeCompanyId);
      
      const insightData = await aiService.generateInsights(activeCompanyId, financialSnapshot);
      res.json(insightData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * NLQ AI Console for specific questions
   */
  async askAI(req, res) {
    try {
      const activeCompanyId = req.user.activeCompanyId;
      const { query } = req.body;

      if (!activeCompanyId) return res.status(400).json({ message: 'No active company selected.' });

      // Gather context
      const financialSnapshot = await financialService.getCompanyOverview(activeCompanyId);
      
      const insightData = await aiService.generateInsights(activeCompanyId, financialSnapshot, query);
      res.json(insightData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
