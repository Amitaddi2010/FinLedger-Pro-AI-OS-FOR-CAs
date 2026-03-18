import fs from 'fs';
const buffer = fs.readFileSync('F:\\Amit\\TranMgr.900').slice(0, 1024);
console.log(buffer.toString('hex').match(/.{1,32}/g).join('\n'));
console.log('--- ASCII ---');
console.log(buffer.toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
