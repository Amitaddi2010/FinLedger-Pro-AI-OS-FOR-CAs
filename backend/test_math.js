import { calculateProrata, compareWithProrata } from './src/utils/prorata.js';

const target = 209;
const expected = calculateProrata(target);
const actual = -91900;

console.log('Target:', target);
console.log('Expected prorata:', expected);
console.log('Actual:', actual);

const comparison = compareWithProrata(actual, expected);
console.log('Result:', comparison);
