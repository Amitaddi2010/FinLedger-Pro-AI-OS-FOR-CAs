import { Groq } from 'groq-sdk';

// Lazy-init the Groq client so env vars are available
let groq = null;
function getGroq() {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

const OCR_SYSTEM_PROMPT = `You are FinLedger Pro's Receipt OCR Engine. You analyze receipt and invoice images to extract financial data.

INSTRUCTIONS:
1. Look at the image carefully. Find the TOTAL AMOUNT, VENDOR/PAYEE NAME, DATE, and EXPENSE CATEGORY.
2. For the amount: extract the final total as a plain number without currency symbols. Example: 30000.00
3. For the description: use the vendor name, payee, or a short summary of what was purchased.
4. For the category: pick the best fit from: Rent, Travel, Meals & Entertainment, Office Supplies, Software, Utilities, Maintenance, Professional Services, Insurance, Advertising, Miscellaneous.
5. For the date: use YYYY-MM-DD format.

You MUST respond with ONLY a JSON object. No explanations, no markdown, no extra text. Just the JSON.

Example response:
{"amount": 30000.00, "description": "Rent payment to Diya Patel", "category": "Rent", "date": "2024-05-09"}`;

export const ocrService = {
  
  /**
   * Processes a receipt image buffer via Groq Vision API
   * and returns structured JSON context.
   */
  async extractReceiptData(imageBuffer, mimeType) {
    try {
      const client = getGroq();
      
      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:${mimeType};base64,${base64Image}`;

      console.log(`[OCR] Sending image to Llama 4 Scout (${(imageBuffer.length / 1024).toFixed(1)} KB, ${mimeType})`);

      const completion = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: OCR_SYSTEM_PROMPT
          },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: 'Analyze this receipt image and extract the amount, description, category, and date as JSON.' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ] 
          }
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.1,
      });

      const responseContent = completion.choices[0]?.message?.content;
      console.log('[OCR] Raw AI Response:', responseContent);
      
      if (!responseContent) {
        throw new Error('AI returned an empty response for the receipt image.');
      }

      // Robust JSON extraction — handle markdown blocks, extra text, etc.
      let cleanJson = responseContent;

      // Strip markdown code fences
      cleanJson = cleanJson.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

      // If the response contains JSON embedded in text, extract just the JSON object
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }
      
      let parsedData;
      try {
        parsedData = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.error('[OCR] Failed to parse AI response as JSON:', cleanJson);
        throw new Error('AI returned malformed or unreadable OCR data');
      }

      // Validate and sanitize the parsed data
      const result = {
        amount: parseFloat(String(parsedData.amount).replace(/[^0-9.]/g, '')) || 0,
        description: parsedData.description || parsedData.vendor || parsedData.payee || 'Receipt Item',
        category: parsedData.category || 'Miscellaneous',
        date: parsedData.date || new Date().toISOString().split('T')[0]
      };

      console.log('[OCR] Extracted Data:', JSON.stringify(result));
      
      if (result.amount === 0) {
        console.warn('[OCR] WARNING: Amount extracted as 0. Raw amount field was:', parsedData.amount);
      }

      return result;
      
    } catch (error) {
      console.error('[OCR] Engine Error:', error.message);
      throw new Error(`Vision Engine Error: ${error.message}`);
    }
  }
};
