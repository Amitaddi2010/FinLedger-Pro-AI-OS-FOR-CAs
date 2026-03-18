import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['PDF', 'IMAGE', 'CSV', 'XML', 'TSF', '900'],
    required: true
  },
  size: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Tax Documents', 'Financials', 'Audit', 'Bank Statements', 'Legal', 'General'],
    default: 'General'
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const Document = mongoose.model('Document', documentSchema);
