import fs from 'fs';

const buf = fs.readFileSync('F:\\Amit\\TranMgr.900').slice(63624, 63624 + 1024);
console.log('Hex for Groq Analysis:');
console.log(buf.toString('hex'));
console.log('--- UTF-16 ---');
console.log(buf.toString('utf16le').replace(/[^\x20-\x7E]/g, '.'));
