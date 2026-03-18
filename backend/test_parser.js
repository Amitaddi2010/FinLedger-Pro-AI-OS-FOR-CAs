import { tallyService } from './src/services/tallyService.js';
import mongoose from 'mongoose';

async function test() {
  const txs = await tallyService.processTallyFile('F:\\Amit\\TranMgr.900', new mongoose.Types.ObjectId());
  console.log(`Extracted: ${txs.length} transactions.`);
  console.log('Sample 1:', txs[0]);
  console.log('Sample 2:', txs[txs.length - 1]);
}

test();
