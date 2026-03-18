import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  year: { type: Number, required: true },
  annualRevenueTarget: { type: Number, required: true },
  annualProfitTarget: { type: Number, required: true },
  expectedMonthlyGrowthRate: { type: Number, default: 0 } // e.g., 0.05 for 5%
}, {
  timestamps: true
});

export const Budget = mongoose.model('Budget', budgetSchema);
