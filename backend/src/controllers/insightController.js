import { aiService } from '../services/aiService.js';
import { financialService } from '../services/financialService.js';
import { Document } from '../models/Document.js';

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
  },

  /**
   * Generates Medical Grade PDF Executive Overview
   */
  async generateExecutiveReport(req, res) {
    try {
      const activeCompanyId = req.user.activeCompanyId;
      if (!activeCompanyId) return res.status(400).json({ message: 'No active company selected.' });

      // Gather context
      const financialSnapshot = await financialService.getCompanyOverview(activeCompanyId);
      
      const reportData = await aiService.generateExecutiveSummary(activeCompanyId, financialSnapshot);
      res.json({
         report: reportData,
         snapshot: financialSnapshot
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * RAG Vector Query for Documents
   */
  async queryDocuments(req, res) {
    try {
      const activeCompanyId = req.user.activeCompanyId;
      const { query } = req.body;

      if (!activeCompanyId) return res.status(400).json({ message: 'No active company selected.' });
      if (!query) return res.status(400).json({ message: 'Query is required.' });

      // Gather Document Context
      // Naive approach: Pull all extracted text from the Vault for this company. 
      // If it gets too large, we could chunk and use cosine similarity embeddings.
      // But for this MVP Groq has 8K-128K context which easily fits 10s of PDFs.
      const docs = await Document.find({ companyId: activeCompanyId, extractedText: { $ne: null } });
      
      let contextStr = docs.map(d => `[DOCUMENT NAME: ${d.name}]\n${d.extractedText}`).join("\n\n---\n\n");
      
      // If contextStr is extraordinarily long, we truncate to roughly 30,000 words (safely under 128k Llama 3 limits)
      if (contextStr.length > 200000) {
         contextStr = contextStr.substring(0, 200000) + "\n...[CONTEXT TRUNCATED]...";
      }

      if (contextStr.trim() === '') {
         return res.json({ 
            answer: "No text-searchable documents exist in the Vault. Please upload PDFs to analyze.",
            confidence: "LOW",
            extractedQuotes: []
         });
      }

      const responseData = await aiService.askDocuments(activeCompanyId, contextStr, query);
      res.json(responseData);
    } catch (error) {
      console.error("Document Query Error:", error);
      res.status(500).json({ message: error.message });
    }
  }
};
