import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['CLEARED', 'PENDING', 'FLAGGED'], default: 'CLEARED' },
  gstDetails: {
    gstin: String,
    taxRate: Number,
    taxAmount: Number
  }
}, {
  timestamps: true
});

// Compound indexes for fast queries
transactionSchema.index({ companyId: 1, date: -1 });
transactionSchema.index({ companyId: 1, type: 1, date: -1 });
transactionSchema.index({ companyId: 1, category: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
