import fs from 'fs';
const buffer = fs.readFileSync('F:\\Amit\\TranMgr.900');
const utf16 = buffer.toString('utf16le');
const strings = utf16.match(/[\x20-\x7E]{4,}/g);
if (strings) {
  console.log('--- FOUND UTF-16 STRINGS ---');
  console.log(strings.slice(0, 100).join('\n'));
} else {
  console.log('No UTF-16 strings found.');
}
