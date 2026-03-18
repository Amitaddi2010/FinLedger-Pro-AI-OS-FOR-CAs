import express from 'express';
import { User } from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Update the user's active company ID for the current session and persistence.
 */
router.patch('/active-company', protect, async (req, res) => {
  try {
    const { companyId } = req.body;
    if (!companyId) return res.status(400).json({ message: 'Company ID is required' });

    const user = await User.findById(req.user._id);
    user.activeCompanyId = companyId;
    await user.save();

    res.status(200).json({ message: 'Active company updated successfully.', activeCompanyId: user.activeCompanyId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
