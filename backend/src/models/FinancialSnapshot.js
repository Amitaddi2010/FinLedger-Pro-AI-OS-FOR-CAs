import mongoose from 'mongoose';

const financialSnapshotSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  period: { type: String, required: true }, // e.g., '2026-03', '2026-Q1'
  periodType: { type: String, enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'], default: 'MONTHLY' },
  revenue: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  netMargin: { type: Number, default: 0 },
  topExpenseCategories: [{
    category: String,
    amount: Number
  }],
  topRevenueCategories: [{
    category: String,
    amount: Number
  }]
}, {
  timestamps: true
});

financialSnapshotSchema.index({ companyId: 1, period: 1 }, { unique: true });

export const FinancialSnapshot = mongoose.model('FinancialSnapshot', financialSnapshotSchema);
