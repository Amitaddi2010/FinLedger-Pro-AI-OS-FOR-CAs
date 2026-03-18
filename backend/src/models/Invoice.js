import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  hsnSac: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  caFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The CA creating it
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, // The client being billed
  invoiceNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'DRAFT' },
  notes: { type: String }
}, {
  timestamps: true
});

// Index for quick lookups by firm and client
invoiceSchema.index({ caFirmId: 1, clientId: 1, issueDate: -1 });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
