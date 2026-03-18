import { Transaction } from '../models/Transaction.js';
import { Document } from '../models/Document.js';
import { financialService } from '../services/financialService.js';
import { tallyService } from '../services/tallyService.js';
import { ocrService } from '../services/ocrService.js';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';

export const transactionController = {
  
  /**
   * Upload CSV of transactions and automatically process them
   */
  /**
   * Universal data ingestion handler
   * Supports CSV, Tally (.900), and TSF (XML)
   */
  async uploadCSV(req, res) {
    try {
      // Use active company from body (frontend override) or session (backend state)
      const activeCompanyId = req.body.companyId || req.user.activeCompanyId;
      
      if (!activeCompanyId) {
        console.warn("Upload Failed: No active company ID provided in body or session.");
        return res.status(400).json({ message: 'Please activate a company first.' });
      }
      
      if (!req.file) {
        console.warn("Upload Failed: No file attached to request.");
        return res.status(400).json({ message: 'Please upload a data file (CSV, .900, or .tsf).' });
      }

      const filePath = req.file.path;
      const originalName = req.file.originalname.toLowerCase();
      console.log(`Processing upload: ${originalName} (${req.file.size} bytes)`);
      let results = [];

      // Route based on extension/content
      if (originalName.endsWith('.csv')) {
        results = await this.parseCSVFile(filePath, activeCompanyId);
      } else if (originalName.endsWith('.900') || originalName.endsWith('.tsf') || originalName.endsWith('.xml') || originalName.endsWith('.zip')) {
        const tallyData = await tallyService.processTallyFile(filePath, activeCompanyId, originalName);
        if (Array.isArray(tallyData)) {
          results = tallyData;
        } else {
          results = tallyData.transactions || [];
          console.log("Tally Ingestion Metadata:", tallyData.metadata);
        }
      } else {
        console.warn(`Upload Failed: Unsupported format ${originalName}`);
        return res.status(400).json({ message: 'Unsupported file format. Please upload CSV, Tally (.900), or TSF/XML.' });
      }

      // Final processing
      if (results.length === 0) {
        console.warn(`Upload Failed: Parser returned 0 records for ${originalName}`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({ message: 'No valid records found in the uploaded file.' });
      }

      // Insert Transactions
      await Transaction.insertMany(results);

      // Create Vault Entry instead of deleting!
      try {
        const vaultDir = path.join(process.cwd(), 'vault');
        if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
        
        const vaultPath = path.join(vaultDir, req.file.filename + path.extname(originalName));
        fs.renameSync(filePath, vaultPath);

        await Document.create({
          companyId: activeCompanyId,
          name: originalName,
          type: originalName.split('.').pop().toUpperCase(),
          size: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
          category: originalName.endsWith('.csv') ? 'Bank Statements' : 'Financials',
          filePath: vaultPath,
          uploadedBy: req.user._id
        });
      } catch (vaultErr) {
        console.error("Vault Archival Failed:", vaultErr);
        // Fallback cleanup if rename fails
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      
      res.status(200).json({ 
        message: `Successfully ingested ${results.length} records.`,
        format: originalName.split('.').pop().toUpperCase(),
        metadata: results.length === 1 && results[0].status === 'PENDING' ? "System stub created for binary backup. For full records, please export Tally as XML." : "Full transaction history mapped."
      });

    } catch (error) {
      console.error('Ingestion Controller Error:', error);
      // Ensure file cleanup even on failure
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ message: `Ingestion Error: ${error.message}` });
    }
  },

  /**
   * Internal CSV Parser as a Promise
   */
  async parseCSVFile(filePath, companyId) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => {
          results.push({
            companyId,
            date: new Date(data.date || data.Date || new Date()),
            description: data.description || data.Description || 'N/A',
            amount: parseFloat(data.amount || data.Amount || 0),
            type: (data.type || data.Type || '').toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE',
            category: data.category || data.Category || 'Uncategorized',
            status: 'CLEARED'
          });
        })
        .on('error', (err) => reject(err))
        .on('end', () => resolve(results));
    });
  },

  /**
   * Get main financial intelligence summary
   */
  async getSummary(req, res) {
    try {
      const activeCompanyId = req.user.activeCompanyId;
      if (!activeCompanyId) return res.status(400).json({ message: 'Please activate a company.' });
      
      const overview = await financialService.getCompanyOverview(activeCompanyId);
      res.json(overview);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * AI Receipt/Image OCR Ingestion
   */
  async uploadReceipt(req, res) {
    try {
      const activeCompanyId = req.body.companyId || req.user.activeCompanyId;
      if (!activeCompanyId) return res.status(400).json({ message: 'Select a company first.' });
      if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });

      const filePath = req.file.path;
      const buffer = fs.readFileSync(filePath);
      const mimeType = req.file.mimetype;

      // Extract details via Vision AI
      const ocrData = await ocrService.extractReceiptData(buffer, mimeType);
      console.log('[Receipt] OCR returned:', JSON.stringify(ocrData));

      // Save to Ledger as EXPENSE
      const finalAmount = parseFloat(ocrData.amount) || 0;
      const newTransaction = await Transaction.create({
        companyId: activeCompanyId,
        date: new Date(ocrData.date || new Date()),
        description: ocrData.description || 'AI Extracted Receipt',
        amount: finalAmount,
        type: 'EXPENSE',
        category: ocrData.category || 'Uncategorized',
        status: 'CLEARED'
      });

      console.log(`[Receipt] Saved transaction: ₹${finalAmount} — ${ocrData.description}`);

      // Cleanup Temp File
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      res.status(201).json({
        message: `Receipt parsed successfully! Extracted ₹${finalAmount.toLocaleString('en-IN')} from ${ocrData.description}.`,
        transaction: newTransaction,
        ocrData
      });
      
    } catch (error) {
      console.error('OCR Controller Error:', error);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ message: `AI Image Processing Error: ${error.message}` });
    }
  },

  /**
   * List transactions with search, filter, sort, pagination
   */
  async listTransactions(req, res) {
    try {
      const activeCompanyId = req.query.companyId || req.user.activeCompanyId;
      if (!activeCompanyId) return res.status(400).json({ message: 'Select a company first.' });

      const {
        page = 1, limit = 50,
        search, type, category, status,
        startDate, endDate,
        sortBy = 'date', sortOrder = 'desc'
      } = req.query;

      // Build query
      const query = { companyId: activeCompanyId };
      if (search) query.description = { $regex: search, $options: 'i' };
      if (type) query.type = type;
      if (category) query.category = category;
      if (status) query.status = status;
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [transactions, total] = await Promise.all([
        Transaction.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
        Transaction.countDocuments(query)
      ]);

      // Get unique categories for filter dropdown
      const categories = await Transaction.distinct('category', { companyId: activeCompanyId });

      res.json({
        transactions,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        categories
      });
    } catch (error) {
      console.error('List Transactions Error:', error);
      res.status(500).json({ message: error.message });
    }
  }
};
