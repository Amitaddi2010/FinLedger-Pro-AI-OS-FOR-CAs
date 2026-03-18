import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const transactionSchema = new mongoose.Schema({ companyId: mongoose.Schema.Types.ObjectId, amount: Number });
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

const auditLogSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, action: String, createdAt: Date });
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

async function checkIngestion() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finledger_pro');
  
  console.log('--- DATABASE STATUS ---');
  const count = await Transaction.countDocuments();
  console.log(`Total Transactions: ${count}`);
  
  const lastLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(5);
  console.log('--- LAST AUDIT LOGS ---');
  lastLogs.forEach(l => console.log(`${l.createdAt} - ${l.action}`));
  
  const latestTransactions = await Transaction.find().sort({ _id: -1 }).limit(5);
  console.log('--- LATEST TRANSACTIONS ---');
  latestTransactions.forEach(t => console.log(`${t._id} - ${t.amount} - ${t.companyId}`));
  
  await mongoose.disconnect();
}

checkIngestion();
