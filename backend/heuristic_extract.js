import fs from 'fs';

const filePath = 'F:\\Amit\\TranMgr.900';
const buffer = fs.readFileSync(filePath);
const utf16 = buffer.toString('utf16le');

// Regex for narrations (usually longer strings or specific prefixes)
const narrations = utf16.match(/By amt\.|To amt\.|Being amt\.|recd\. from|paid to/gi);

console.log(`Found ${narrations?.length || 0} potential narration markers.`);

// For each narration, scan the surrounding 256 bytes for date/amount patterns
const results = [];
let offset = 0;
while (true) {
  const match = /By amt\.|To amt\.|Being amt\.|recd\. from|paid to/gi.exec(utf16.slice(offset));
  if (!match) break;
  
  const absoluteOffset = offset + match.index;
  // Tally stores narration in UTF-16, so each char is 2 bytes.
  const binaryOffset = absoluteOffset * 2;
  
  // Extract a chunk around the narration
  const start = Math.max(0, binaryOffset - 128);
  const end = Math.min(buffer.length, binaryOffset + 512);
  const chunk = buffer.slice(start, end);
  
  // Search for DATE (YYYYMMDD) in ASCII
  const dateMatch = chunk.toString('ascii').match(/[12][0-9]{3}[01][0-9][0-3][0-9]/);
  
  // Search for binary FLOATs (Doubles)
  const amounts = [];
  for (let i = 0; i < chunk.length - 8; i += 4) {
    const val = chunk.readDoubleLE(i);
    // Real accounting amounts are usually positive, not infinity/nan, and not too huge/tiny
    if (!isNaN(val) && isFinite(val) && val > 0 && val < 10000000 && Math.floor(val) !== 0) {
      amounts.push(val);
    }
  }

  results.push({
    narration: match[0] + utf16.slice(absoluteOffset + match[0].length).split('\n')[0].trim(),
    date: dateMatch ? dateMatch[0] : 'Unknown',
    amounts: [...new Set(amounts)]
  });

  offset = absoluteOffset + 1;
  if (results.length > 50) break; // Limit for preview
}

console.log(JSON.stringify(results, null, 2));
