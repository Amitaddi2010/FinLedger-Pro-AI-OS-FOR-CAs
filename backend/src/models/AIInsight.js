import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  triggerType: { type: String, enum: ['WEEKLY', 'MONTHLY', 'ANOMALY', 'ON_DEMAND'], default: 'ON_DEMAND' },
  context: { type: mongoose.Schema.Types.Mixed }, // raw financial summary that was analyzed
  response: {
    keyInsight: { type: String },
    whatIsHappening: [{ type: String }],
    rootCause: [{ type: String }],
    actions: [{ type: String }],
    impact: { type: String }
  }
}, {
  timestamps: true
});

export const AIInsight = mongoose.model('AIInsight', aiInsightSchema);
