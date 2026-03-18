import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  type: {
    type: String,
    enum: ['ANOMALY', 'PRORATA_DEVIATION', 'CASHFLOW_RISK', 'SYSTEM'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Object, // Flexible field for category names, amounts involved, etc.
    default: {}
  }
}, { timestamps: true });

export const Alert = mongoose.model('Alert', alertSchema);
