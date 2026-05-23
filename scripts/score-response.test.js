// scripts/score-response.test.js
'use strict';
const assert = require('assert');
const { scoreResponse } = require('./score-response.js');

// Perfect response: one Q:, confidence %, GUESS:, no fluff
const perfect = [
  'HYPOTHESIS: You want a mobile app. Confidence: 70%.',
  'Q: What platform are you targeting?',
  'GUESS: iOS, because you mentioned App Store.',
].join('\n');

const r1 = scoreResponse(perfect);
assert.strictEqual(r1.exactlyOneQuestion, true,  'exactlyOneQuestion: perfect');
assert.strictEqual(r1.confidencePresent,  true,  'confidencePresent: perfect');
assert.strictEqual(r1.guessPresent,       true,  'guessPresent: perfect');
assert.strictEqual(r1.noFluff,            true,  'noFluff: perfect');
assert.strictEqual(r1.total,              4,     'total: perfect');

// Two questions — fails exactlyOneQuestion
const twoQ = [
  'HYPOTHESIS: Something. Confidence: 50%.',
  'Q: Question one?',
  'GUESS: Maybe yes.',
  'Q: Question two?',
].join('\n');

const r2 = scoreResponse(twoQ);
assert.strictEqual(r2.exactlyOneQuestion, false, 'exactlyOneQuestion: two Q');
assert.strictEqual(r2.total,              3,     'total: two Q');

// Introductory fluff
const fluffy = [
  'Great question! Happy to help.',
  'HYPOTHESIS: You want X. Confidence: 60%.',
  'Q: What is your timeline?',
  'GUESS: Short.',
].join('\n');

const r3 = scoreResponse(fluffy);
assert.strictEqual(r3.noFluff, false, 'noFluff: fluffy');
assert.strictEqual(r3.total,   3,    'total: fluffy');

// Missing confidence
const noConf = [
  'Q: What platform?',
  'GUESS: Web.',
].join('\n');

const r4 = scoreResponse(noConf);
assert.strictEqual(r4.confidencePresent, false, 'confidencePresent: missing');
assert.strictEqual(r4.total,             2,    'total: missing conf');

// Missing GUESS
const noGuess = [
  'HYPOTHESIS: Something. Confidence: 80%.',
  'Q: What is your budget?',
].join('\n');

const r5 = scoreResponse(noGuess);
assert.strictEqual(r5.guessPresent, false, 'guessPresent: missing');
assert.strictEqual(r5.total,        2,    'total: missing guess');

console.log('All scorer tests passed.');
