import { Invoice } from '../models/Invoice.js';
import { Company } from '../models/Company.js';

export const invoiceController = {
  // Get all invoices for the CA Firm
  async getInvoices(req, res) {
    try {
      // Find invoices where the current user is the CA Firm, populate the client company details
      const invoices = await Invoice.find({ caFirmId: req.user._id })
        .populate('clientId', 'name industry')
        .sort({ issueDate: -1 });
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create a new invoice
  async createInvoice(req, res) {
    try {
      const { clientId, items, dueDate, taxRate = 18, notes } = req.body;
      
      // Calculate totals
      let subtotal = 0;
      items.forEach(item => {
        subtotal += (item.rate * item.quantity);
        item.amount = (item.rate * item.quantity);
      });
      
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;

      // Generate a simple invoice number (e.g., INV-TIMESTAMP)
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

      const invoice = await Invoice.create({
        caFirmId: req.user._id,
        clientId,
        invoiceNumber,
        issueDate: new Date(),
        dueDate: new Date(dueDate),
        items,
        subtotal,
        taxAmount,
        totalAmount,
        notes,
        status: 'SENT'
      });

      // Populate client details before returning
      await invoice.populate('clientId', 'name');

      res.status(201).json(invoice);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update invoice status (e.g., mark as PAID)
  async updateInvoiceStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const invoice = await Invoice.findOneAndUpdate(
        { _id: id, caFirmId: req.user._id },
        { status },
        { new: true }
      ).populate('clientId', 'name industry');

      if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });

      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
