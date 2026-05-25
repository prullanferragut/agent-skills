# Wheat vs. Chaff Benchmark Replication — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replicate the Wheat-vs-Chaff benchmark from `docs/benchmarks/wheat_vs_chaff_report.md` using OpenCode subagents as the LLM calls, then score and record the results.

**Architecture:** A coordinator (this session) dispatches three `general` subagents in parallel — Zero-Shot, Chaff-Shot, Wheat-Shot — each receiving the task "Build a social network" with the appropriate context injected into their prompt. The coordinator collects each response, scores it on the four-point rubric, prints a summary table, and appends a timestamped run to `docs/benchmarks/results.json`. No SDK or API key management required; the subagent dispatcher *is* the LLM API call.

**Tech Stack:** OpenCode subagent dispatcher (`Task` tool with `general` subagent type), plain JSON for results, Node.js only for a standalone scorer utility that can be run to verify scoring logic independently.

---

## File Map

| Action | Path | Responsibility |
| ------ | ---- | -------------- |
| Create | `docs/benchmarks/results.json` | Accumulated run results (seed: `[]`) |
| Create | `scripts/score-response.js` | Pure scorer function + CLI — no API calls |
| Create | `scripts/score-response.test.js` | Unit tests for the scorer |
| Modify | `docs/benchmarks/wheat_vs_chaff_report.md` | Add "How to Replicate" section |

The benchmark *run* itself is not a script — it is performed directly in the coordinator session using the Task tool. The scorer script exists so the scoring logic is testable and auditable independently of a live run.

---

## Task 1: Seed the results file

**Files:**
- Create: `docs/benchmarks/results.json`

- [ ] **Step 1: Create the seed file**

```bash
echo "[]" > docs/benchmarks/results.json
```

- [ ] **Step 2: Verify it is valid JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('docs/benchmarks/results.json','utf8')); console.log('valid')"
```

Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add docs/benchmarks/results.json
git commit -m "chore: seed benchmark results file"
```

---

## Task 2: Write failing unit tests for the scorer

**Files:**
- Create: `scripts/score-response.test.js`

The scorer receives a string (a subagent's raw response) and returns:
`{ exactlyOneQuestion: boolean, confidencePresent: boolean, guessPresent: boolean, noFluff: boolean, total: number }`

- [ ] **Step 1: Write the test file**

```javascript
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
```

- [ ] **Step 2: Run tests — expect failure**

```bash
node scripts/score-response.test.js
```

Expected: `Error: Cannot find module './score-response.js'`

- [ ] **Step 3: Commit failing tests**

```bash
git add scripts/score-response.test.js
git commit -m "test: add failing unit tests for wheat-vs-chaff scorer"
```

---

## Task 3: Implement the scorer to make tests pass

**Files:**
- Create: `scripts/score-response.js`

- [ ] **Step 1: Write the scorer**

```javascript
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
  const questionCount    = (response.match(/^Q:/gm) || []).length;
  const exactlyOneQuestion = questionCount === 1;
  const confidencePresent  = /confidence[:\s]+\d+%/i.test(response);
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
```

- [ ] **Step 2: Run tests — expect all pass**

```bash
node scripts/score-response.test.js
```

Expected: `All scorer tests passed.`

- [ ] **Step 3: Commit**

```bash
git add scripts/score-response.js
git commit -m "feat: implement wheat-vs-chaff response scorer"
```

---

## Task 4: Run the benchmark using OpenCode subagents

This task is performed by the coordinator in an interactive OpenCode session. It produces actual benchmark results.

**Files:**
- Modify: `docs/benchmarks/results.json` (append one run entry)

The coordinator dispatches three `general` subagents in a **single parallel message** (one Task tool call per variant). Each subagent prompt specifies exactly what to do and what to return.

### Subagent prompt templates

**Zero-Shot subagent prompt:**
```
You are an AI assistant. A user has sent you the following message:

"Build a social network"

Respond to this message directly. Do not ask for clarification. Begin your response immediately.
Return your full response as plain text.
```

**Chaff-Shot subagent prompt:**
```
You are an AI assistant. Apply the following skill instructions exactly:

---
[INSERT FULL CONTENT OF skills/interview-me/SKILL.md HERE]
---

A user has sent you the following message:

"Build a social network"

Apply the skill. Return your full response as plain text. Do not explain what you are doing.
```

**Wheat-Shot subagent prompt:**
```
You are an AI assistant. Apply these instructions exactly:

Role: Interviewer. 1. State HYPOTHESIS (one-sentence + confidence score). 2. Ask 1 question + append GUESS. 3. If user uses jargon, ask: 'If you didn't have to justify this to anyone, what would you actually want?'. 4. Finish with RESTATE (Outcome, User, Success, Constraint, Out of Scope). 5. Gate: Wait for 'yes'.

A user has sent you the following message:

"Build a social network"

Apply the instructions. Return your full response as plain text. Do not explain what you are doing.
```

### Execution steps

- [ ] **Step 1: Read the full SKILL.md content** (for injection into the Chaff-Shot prompt)

Read `skills/interview-me/SKILL.md` and copy the full text into the Chaff-Shot subagent prompt where `[INSERT FULL CONTENT...]` appears.

- [ ] **Step 2: Dispatch all three subagents in parallel**

Send a single message with three Task tool calls using `subagent_type: "general"`. Capture the response text from each.

- [ ] **Step 3: Score each response using the scorer**

For each response text, run:

```bash
node scripts/score-response.js "<response text>"
```

Or call `scoreResponse` inline. Record the JSON output for each variant.

- [ ] **Step 4: Append results to results.json**

The JSON entry format:

```json
{
  "runDate": "2026-05-24T00:00:00.000Z",
  "results": [
    {
      "variant": "zero-shot",
      "score": { "exactlyOneQuestion": false, "confidencePresent": false, "guessPresent": false, "noFluff": true, "total": 1 },
      "response": "<full response text>"
    },
    {
      "variant": "chaff-shot",
      "score": { "exactlyOneQuestion": true, "confidencePresent": true, "guessPresent": true, "noFluff": true, "total": 4 },
      "response": "<full response text>"
    },
    {
      "variant": "wheat-shot",
      "score": { "exactlyOneQuestion": true, "confidencePresent": true, "guessPresent": true, "noFluff": true, "total": 4 },
      "response": "<full response text>"
    }
  ]
}
```

Read the current `docs/benchmarks/results.json`, parse it, push the new entry, and write it back.

- [ ] **Step 5: Print summary table**

```
| Variant    | exactlyOneQ | confidence | guess | noFluff | Total |
| ---------- | ----------- | ---------- | ----- | ------- | ----- |
| zero-shot  | ...         | ...        | ...   | ...     | .../4 |
| chaff-shot | ...         | ...        | ...   | ...     | .../4 |
| wheat-shot | ...         | ...        | ...   | ...     | .../4 |
```

- [ ] **Step 6: Commit**

```bash
git add docs/benchmarks/results.json
git commit -m "data: add benchmark run results (wheat vs chaff, subagent-driven)"
```

---

## Task 5: Document replication steps in the report

**Files:**
- Modify: `docs/benchmarks/wheat_vs_chaff_report.md`

- [ ] **Step 1: Append the following section to the report**

```markdown
---

## 5. Automated Replication (OpenCode Subagents)

The benchmark is replicated by dispatching three OpenCode subagents in parallel from a coordinator session — no SDK or API key configuration required.

### How to Run

Open an OpenCode session in this repo and instruct the coordinator:

> "Run the wheat-vs-chaff benchmark as described in docs/benchmarks/wheat_vs_chaff_report.md. Follow the plan at docs/superpowers/plans/2026-05-24-wheat-vs-chaff-benchmark-replication.md, Task 4."

The coordinator will:
1. Dispatch three `general` subagents in parallel (Zero-Shot, Chaff-Shot, Wheat-Shot).
2. Score each response using `scripts/score-response.js`.
3. Append results to `docs/benchmarks/results.json`.
4. Print a summary table.

### Scoring Rubric (automated via `scripts/score-response.js`)

| Check                | Criterion                                      |
| -------------------- | ---------------------------------------------- |
| `exactlyOneQuestion` | Exactly one line starting with `Q:`            |
| `confidencePresent`  | Text matches `/confidence[:\s]+\d+%/i`         |
| `guessPresent`       | At least one line starting with `GUESS:`       |
| `noFluff`            | No introductory fluff or apology patterns      |

### Unit Tests

```bash
node scripts/score-response.test.js
```

### Results

Results are stored in `docs/benchmarks/results.json`. Each entry records per-variant scores and full response text for audit.
```

- [ ] **Step 2: Verify the file is readable**

```bash
node -e "require('fs').readFileSync('docs/benchmarks/wheat_vs_chaff_report.md','utf8'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add docs/benchmarks/wheat_vs_chaff_report.md
git commit -m "docs: add subagent-driven replication section to benchmark report"
```

---

## Self-Review

### Spec coverage

| Report requirement | Task covering it |
| --- | --- |
| Three scenarios: Zero-Shot, Chaff-Shot, Wheat-Shot | Task 4 (subagent dispatch) |
| Four-point scoring rubric | Tasks 2–3 (scorer) |
| Results in machine-readable format | Task 1 (seed), Task 4 (append) |
| Documented replication steps | Task 5 |
| No SDK / API key required | Architecture (subagents replace API calls) |

### Placeholder scan

No TBD, TODO, or "add appropriate" phrases. All code blocks are complete. Task 4 Step 1 instructs reading the file; the content to inject is the full SKILL.md already available at `skills/interview-me/SKILL.md`.

### Type consistency

`scoreResponse` returns `{ exactlyOneQuestion, confidencePresent, guessPresent, noFluff, total }` consistently across Task 2 (tests), Task 3 (implementation), and Task 4 (usage). Results JSON schema defined once in Task 4 Step 4.
