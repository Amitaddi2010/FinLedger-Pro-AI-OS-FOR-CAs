import fs from 'fs';
import zlib from 'zlib';

const buffer = fs.readFileSync('F:\\Amit\\TranMgr.900');
try {
  const decompressed = zlib.inflateSync(buffer.slice(0, 1024));
  console.log('Zlib Decompressed:', decompressed.toString('ascii'));
} catch (e) {
  console.log('Zlib failed.');
}
