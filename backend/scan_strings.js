import fs from 'fs';
const buffer = fs.readFileSync('F:\\Amit\\TranMgr.900');
const strings = buffer.toString('ascii').match(/[\x20\x2D-\x7E]{4,}/g);
if (strings) {
  console.log('--- FOUND STRINGS ---');
  console.log(strings.slice(0, 100).join('\n'));
} else {
  console.log('No strings found.');
}
