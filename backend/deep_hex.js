import fs from 'fs';

const buffer = fs.readFileSync('F:\\Amit\\TranMgr.900');
const utf16 = buffer.toString('utf16le');

// Search for Voucher entries
const keyword = 'recd from'; // Very common in Indian Tally leads
const results = [];
let idx = 0;

while (true) {
  idx = utf16.indexOf(keyword, idx);
  if (idx === -1) break;

  const binOffset = idx * 2;
  const chunk = buffer.slice(binOffset - 64, binOffset + 256);
  
  results.push({
    offset: binOffset,
    hex: chunk.toString('hex'),
    ascii: chunk.toString('ascii').replace(/[^\x20-\x7E]/g, '.')
  });

  idx += 1;
  if (results.length >= 5) break;
}

console.log(JSON.stringify(results, null, 2));
