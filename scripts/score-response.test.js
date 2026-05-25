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
assert.strictEqual(r4.total,             3,    'total: missing conf');

// Missing GUESS
const noGuess = [
  'HYPOTHESIS: Something. Confidence: 80%.',
  'Q: What is your budget?',
].join('\n');

const r5 = scoreResponse(noGuess);
assert.strictEqual(r5.guessPresent, false, 'guessPresent: missing');
assert.strictEqual(r5.total,        3,    'total: missing guess');

// Zero questions — fails exactlyOneQuestion
const zeroQ = [
  'HYPOTHESIS: You want a social network. Confidence: 60%.',
  'GUESS: Something for communities.',
  'Here is what I think you need...',
].join('\n');

const r6 = scoreResponse(zeroQ);
assert.strictEqual(r6.exactlyOneQuestion, false, 'exactlyOneQuestion: zero Q');
assert.strictEqual(r6.total,              3,     'total: zero Q');

// Additional fluff patterns
const fluffy2 = 'Of course! HYPOTHESIS: X. Confidence: 55%.\nQ: What do you want?\nGUESS: Speed.';
const r7 = scoreResponse(fluffy2);
assert.strictEqual(r7.noFluff, false, 'noFluff: "of course" pattern');

const fluffy3 = 'Certainly. HYPOTHESIS: X. Confidence: 55%.\nQ: What do you want?\nGUESS: Speed.';
const r8 = scoreResponse(fluffy3);
assert.strictEqual(r8.noFluff, false, 'noFluff: "certainly" pattern');

const fluffy4 = 'I appreciate your question. HYPOTHESIS: X. Confidence: 55%.\nQ: What do you want?\nGUESS: Speed.';
const r9 = scoreResponse(fluffy4);
assert.strictEqual(r9.noFluff, false, 'noFluff: "I appreciate" pattern');

// Approximate confidence with tilde (common LLM output: "Confidence: ~15%")
const approxConf = [
  'HYPOTHESIS: You want X. Confidence: ~15%.',
  'Q: What do you want?',
  'GUESS: Speed.',
].join('\n');

const r10 = scoreResponse(approxConf);
assert.strictEqual(r10.confidencePresent, true, 'confidencePresent: tilde prefix (~15%)');
assert.strictEqual(r10.total,             4,    'total: tilde confidence');

console.log('All scorer tests passed.');
