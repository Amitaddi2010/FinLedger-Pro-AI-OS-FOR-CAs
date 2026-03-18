import mongoose from 'mongoose';

const deadlineSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['GST', 'TDS', 'IT', 'LABOUR', 'OTHER'],
    default: 'OTHER'
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'OVERDUE', 'UPCOMING'],
    default: 'PENDING'
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const Deadline = mongoose.model('Deadline', deadlineSchema);
