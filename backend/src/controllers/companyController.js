import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { Budget } from '../models/Budget.js';
import { AuditLog } from '../models/AuditLog.js';

export const companyController = {
  async createCompany(req, res) {
    try {
      const { name, registrationNumber, industry, annualRevenueTarget, annualProfitTarget } = req.body;
      
      const company = await Company.create({
        name,
        registrationNumber,
        industry,
        ownerId: req.user._id
      });

      // Initialize yearly budget
      if (annualRevenueTarget && annualProfitTarget) {
        await Budget.create({
          companyId: company._id,
          year: new Date().getFullYear(),
          annualRevenueTarget,
          annualProfitTarget
        });
      }

      res.status(201).json(company);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getCompanies(req, res) {
    try {
      const companies = await Company.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async switchCompany(req, res) {
    try {
      const { companyId } = req.params;
      const company = await Company.findOne({ _id: companyId, ownerId: req.user._id });
      
      if (!company) {
        return res.status(404).json({ message: 'Company not found or access denied.' });
      }

      req.user.activeCompanyId = company._id;
      await req.user.save();

      res.json({ message: `Switched to ${company.name}`, activeCompanyId: company._id });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getAuditLogs(req, res) {
    try {
      const companyId = req.user.activeCompanyId;
      if (!companyId) return res.status(400).json({ message: 'No active company.' });

      // Fetch latest 100 audit logs with user details populated
      const logs = await AuditLog.find({ companyId })
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .limit(100);

      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
