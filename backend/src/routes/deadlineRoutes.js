import express from 'express';
import { Deadline } from '../models/Deadline.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Get all deadlines for the active company
 */
router.get('/', protect, async (req, res) => {
  try {
    const activeCompanyId = req.user.activeCompanyId;
    if (!activeCompanyId) return res.status(400).json({ message: 'Select a company first.' });

    const deadlines = await Deadline.find({ companyId: activeCompanyId }).sort({ date: 1 });
    res.status(200).json(deadlines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Create a new custom deadline
 */
router.post('/', protect, async (req, res) => {
  try {
    const activeCompanyId = req.user.activeCompanyId;
    const { title, date, type, description } = req.body;
    
    if (!activeCompanyId) return res.status(400).json({ message: 'Select a company first.' });

    const deadline = await Deadline.create({
      companyId: activeCompanyId,
      title,
      date,
      type: type || 'OTHER',
      description,
      status: new Date(date) < new Date() ? 'OVERDUE' : 'PENDING',
      createdBy: req.user._id
    });

    res.status(201).json(deadline);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
