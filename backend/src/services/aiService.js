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
  },

  /**
   * Generates a "Medical Grade" structured Executive Summary for PDF Reports
   */
  async generateExecutiveSummary(companyId, financialData) {
    const EX_SYSTEM_PROMPT = `You are the underlying intelligence engine of FinLedger Pro.
Your objective is to provide a "Medical-Grade" Financial Audit Executive Summary.
This will be printed as a formal PDF for stakeholders.

CRITICAL RULES:
1. USE EXACT FIGURES: Always cite the actual numeric data from the JSON.
2. MEDICAL-GRADE TONE: Analytical, precise, forensic, objective. Label findings as 'Observations', 'Anomalies', or 'Diagnoses'.
3. NO FLUFF: Be extremely direct.
4. JSON OUTPUT STRICTLY matching this schema:
{
  "executiveSummary": "1-2 paragraph formal overview of the entity's financial health.",
  "keyFindings": [ 
    {"title": "Finding 1", "description": "Detail exactly what happened", "severity": "HIGH|MEDIUM|LOW"} 
  ],
  "cashFlowDiagnostic": "Detailed analysis of revenue vs expense trends.",
  "anomaliesDetected": [ "Anomaly 1", "Anomaly 2" ],
  "strategicPrescription": [ "Actionable Step 1", "Actionable Step 2" ]
}`;

    const userPrompt = "Generate an executive PDF summary for the following financial snapshot:\n" + JSON.stringify(financialData, null, 2);

    try {
      const client = getGroq();
      const completion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: EX_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0]?.message?.content;
      
      let cleanJson = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
         return JSON.parse(cleanJson);
      } catch (parseError) {
         console.error("Malformed AI JSON:", cleanJson);
         throw new Error("AI returned a malformed JSON response.");
      }
      
    } catch (error) {
      console.error("AI Executive Summary Error:", error);
      throw new Error(`Failed to generate executive summary: ${error.message}`);
    }
  },

  /**
   * RAG Engine: Queries the Document Vault
   */
  async askDocuments(companyId, documentTextContext, query) {
    const RAG_SYSTEM_PROMPT = `You are FinLedger's Document Intelligence Oracle.
The user has asked a question based on uploaded PDFs and Vault documents. 
You are provided with the EXACT text extracted from their documents.
Answer the user's query PRECISELY using ONLY the provided document context.

CRITICAL RULES:
1. If the context does not contain the answer, state clearly: "I cannot find this information in the uploaded documents." Do not guess.
2. Be concise but cite specific clauses, numbers, or dates from the text if applicable.

Return ONLY a strictly formatted JSON object:
{
  "answer": "Your detailed answer to the query based purely on the text.",
  "confidence": "HIGH|MEDIUM|LOW (based on how clearly the text answers it)",
  "extractedQuotes": ["Quote 1 from text", "Quote 2 from text"]
}`;

    const userPrompt = `Document Context:\n----------------\n${documentTextContext}\n----------------\n\nUser Query: "${query}"`;

    try {
      const client = getGroq();
      const completion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: RAG_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0]?.message?.content;
      return JSON.parse(responseContent);
      
    } catch (error) {
      console.error("AI Document Query Error:", error);
      throw new Error(`Document Engine Error: ${error.message}`);
    }
  }
};
