import { Groq } from 'groq-sdk';
import { AIInsight } from '../models/AIInsight.js';

// Lazy-init the Groq client so env vars are available
let groq = null;
function getGroq() {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

const AI_SYSTEM_PROMPT = `You are the underlying intelligence engine of FinLedger Pro, built for Chartered Accountants in India.
Your objective is to provide executive, actionable intelligence based strictly on the provided financial data.

CRITICAL RULES:
1. CURRENCY: You MUST use Indian Rupees (₹) for all monetary values.
2. ACCURACY: You MUST extract and state the exact numbers from the provided JSON context. 
3. FORENSIC ANALYSIS: Analyze the 'topTransactions' and 'recentTransactions' narrations. Link specific payments (e.g., to specific vendors or individuals) to anomalies or budget deviations.
4. TONE: Professional, analytical, and direct. DO NOT use conversational filler.
5. GOAL: Act as a forensic accountant. Detect cash leaks, unusual spending patterns, or missing revenue.

You MUST format your ONLY output as a strict JSON object with EXACTLY the following structure:
{
  "keyInsight": "One powerful sentence summarizing the primary takeaway, including the actual ₹ figure.",
  "whatIsHappening": ["Specific point 1 including exact ₹ amounts or %", "Specific point 2 (e.g., 'Payment to Sh. P.P. Singh is unusual')"],
  "rootCause": ["Potential driver 1 based on the ledger data", "Potential driver 2"],
  "actions": ["Actionable step 1", "Actionable step 2"],
  "impact": "Predicted impact if actions are taken."
}`;

export const aiService = {
  
  /**
   * Generates AI Insights structured in JSON using Groq
   */
  async generateInsights(companyId, financialData, query = "") {
    
    let userPrompt = "Analyze the following financial snapshot:\n";
    userPrompt += JSON.stringify(financialData, null, 2);
    
    if (query) {
      userPrompt += `\n\nSpecific Query: "${query}" - Answer this query strictly within the constraints of the required JSON structure.`;
    } else {
      userPrompt += `\n\nIdentify anomalies, profit deviations, and areas for immediate attention by the CA.`;
    }

    try {
      const client = getGroq();
      const completion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0]?.message?.content;
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseContent);
      } catch (parseErr) {
        console.error("Failed to parse Groq response as JSON:", responseContent);
        throw new Error("AI returned malformed JSON");
      }

      // Store in DB for history
      const insight = new AIInsight({
        companyId,
        triggerType: 'ON_DEMAND',
        context: financialData,
        response: parsedResponse
      });
      await insight.save();

      return parsedResponse;
      
    } catch (error) {
      console.error("AI Insight Error:", error.message);
      throw new Error(`AI Intelligence Error: ${error.message}`);
    }
  }
};
