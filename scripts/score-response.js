// scripts/score-response.js
'use strict';

const FLUFF_PATTERNS = [
  /\bgreat question\b/i,
  /\bhappy to help\b/i,
  /\bi('d| would) be happy to\b/i,
  /\bof course\b/i,
  /\bcertainly\b/i,
  /\bsure[,!]/i,
  /\babsolutely\b/i,
  /\bi('m| am) here to help\b/i,
  /\bi understand\b/i,
  /\bI appreciate\b/i,
];

/**
 * Score a subagent response against the four-point rubric from
 * docs/benchmarks/wheat_vs_chaff_report.md §3 "Step 3: Audit":
 *   [+1] Exactly one question (line starting with "Q:").
 *   [+1] Confidence score present ("Confidence: N%").
 *   [+1] GUESS present (line starting with "GUESS:").
 *   [+1] Zero introductory fluff or apologies.
 *
 * @param {string} response
 * @returns {{ exactlyOneQuestion: boolean, confidencePresent: boolean, guessPresent: boolean, noFluff: boolean, total: number }}
 */
function scoreResponse(response) {
  const questionCount      = (response.match(/^Q:/gm) || []).length;
  const exactlyOneQuestion = questionCount === 1;
  const confidencePresent  = /confidence[:\s]+~?\d+%/i.test(response);
  const guessPresent       = /^GUESS:/im.test(response);
  const noFluff            = !FLUFF_PATTERNS.some((re) => re.test(response));
  const total = [exactlyOneQuestion, confidencePresent, guessPresent, noFluff].filter(Boolean).length;
  return { exactlyOneQuestion, confidencePresent, guessPresent, noFluff, total };
}

module.exports = { scoreResponse };

// CLI: node scripts/score-response.js "response text"
if (require.main === module) {
  const text = process.argv.slice(2).join(' ');
  if (!text) { console.error('Usage: node score-response.js "<response text>"'); process.exit(1); }
  console.log(JSON.stringify(scoreResponse(text), null, 2));
}
