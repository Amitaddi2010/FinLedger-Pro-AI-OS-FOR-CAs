import mongoose from 'mongoose';

const companyMembershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  role: { type: String, enum: ['OWNER', 'EDITOR', 'VIEWER'], default: 'OWNER' },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

companyMembershipSchema.index({ userId: 1, companyId: 1 }, { unique: true });

export const CompanyMembership = mongoose.model('CompanyMembership', companyMembershipSchema);
