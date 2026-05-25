# Wheat vs. Chaff Benchmark v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the static artifacts (YAML test cases + coordinator runbook) and execute the v2 benchmark (15 conversations × LLM judge scoring), appending results to `docs/benchmarks/results.json`.

**Architecture:** Tasks 1–2 create files only (no code). Task 3 is the benchmark run itself — the coordinator dispatches subagents following the runbook, collects transcripts, dispatches the judge, and writes results. Task 4 updates the report.

**Tech Stack:** YAML (test cases), Markdown (runbook), OpenCode subagent dispatcher (`Task` tool with `general` subagent type), plain JSON for results.

---

## File Map

| Action | Path | Responsibility |
| --- | --- | --- |
| Create | `benchmarks/cases/tc-01.yaml` | Test case: clean trigger |
| Create | `benchmarks/cases/tc-02.yaml` | Test case: jargon |
| Create | `benchmarks/cases/tc-03.yaml` | Test case: multi-part |
| Create | `benchmarks/cases/tc-04.yaml` | Test case: delegation |
| Create | `benchmarks/cases/tc-05.yaml` | Test case: high-stakes |
| Create | `scripts/run-benchmark-v2.md` | Coordinator runbook |
| Modify | `docs/benchmarks/results.json` | Append v2 run results (15 entries) |
| Modify | `docs/benchmarks/wheat_vs_chaff_report.md` | Add v2 results section |

---

## Task 1: Create YAML test cases

**Files:**
- Create: `benchmarks/cases/tc-01.yaml` through `tc-05.yaml`

- [ ] **Step 1: Create the `benchmarks/cases/` directory and all 5 YAML files**

```bash
mkdir -p benchmarks/cases
```

`benchmarks/cases/tc-01.yaml`:
```yaml
id: tc-01
category: clean-trigger
initial_ask: "Build a social network"
scripted_turns:
  - "For developers to share side projects"
  - "Yeah something like that, maybe with comments and upvotes"
  - "Just me and a few friends to start, maybe 10 people"
  - "Yes that sounds right"
judge_context: "User wants a small private platform for ~10 developers to share and get feedback on side projects, not a public social network."
```

`benchmarks/cases/tc-02.yaml`:
```yaml
id: tc-02
category: jargon
initial_ask: "Make it scalable and clean"
scripted_turns:
  - "I mean it should handle growth"
  - "Honestly I just don't want to rewrite it in a year"
  - "Maybe 10k users in the first year would be success"
  - "Yes exactly"
judge_context: "User's real constraint is avoiding a rewrite in 12 months; 'scalable' is a proxy for that fear, not a genuine scale requirement."
```

`benchmarks/cases/tc-03.yaml`:
```yaml
id: tc-03
category: multi-part
initial_ask: "I need a dashboard and also an API and maybe some alerts"
scripted_turns:
  - "The dashboard is the most important thing"
  - "My team lead checks it every morning to see if anything broke overnight"
  - "If it shows green/red status for all services that would be enough"
  - "Yes, start with the dashboard"
judge_context: "User needs a simple service-status dashboard for a team lead's morning check — the API and alerts are secondary and can be deferred."
```

`benchmarks/cases/tc-04.yaml`:
```yaml
id: tc-04
category: delegation
initial_ask: "Just do whatever you think is best"
scripted_turns:
  - "I don't know, something for my startup"
  - "We're a 3-person team building a B2B SaaS"
  - "The founder checks metrics manually in Stripe right now, it takes an hour a day"
  - "Yes that's the problem"
judge_context: "User needs to eliminate an hour-a-day manual metrics review in Stripe; the solution space is a simple internal metrics view, not a full analytics platform."
```

`benchmarks/cases/tc-05.yaml`:
```yaml
id: tc-05
category: high-stakes-underspecified
initial_ask: "Rewrite our auth system"
scripted_turns:
  - "It's too slow and we keep having bugs"
  - "Login takes 3 seconds sometimes and we had two security incidents last year"
  - "Security incidents are the bigger problem honestly"
  - "Yes, security first"
judge_context: "User's binding constraint is security (two incidents), not performance; a targeted security audit and hardening is the right scope, not a full rewrite."
```

- [ ] **Step 2: Verify all 5 files exist and are valid YAML**

```bash
node -e "
const fs = require('fs');
const path = require('path');
['tc-01','tc-02','tc-03','tc-04','tc-05'].forEach(id => {
  const f = fs.readFileSync(\`benchmarks/cases/\${id}.yaml\`, 'utf8');
  // basic presence checks
  if (!f.includes('initial_ask')) throw new Error(\`\${id}: missing initial_ask\`);
  if (!f.includes('scripted_turns')) throw new Error(\`\${id}: missing scripted_turns\`);
  if (!f.includes('judge_context')) throw new Error(\`\${id}: missing judge_context\`);
  console.log(\`\${id}: ok\`);
});
"
```

Expected:
```
tc-01: ok
tc-02: ok
tc-03: ok
tc-04: ok
tc-05: ok
```

- [ ] **Step 3: Commit**

```bash
git add benchmarks/
git commit -m "feat: add wheat-vs-chaff v2 test cases (tc-01 through tc-05)"
```

---

## Task 2: Create the coordinator runbook

**Files:**
- Create: `scripts/run-benchmark-v2.md`

The runbook is a step-by-step protocol for the coordinator to follow when running the benchmark in an OpenCode session. It is not a script — it is instructions for a human or AI coordinator.

- [ ] **Step 1: Create `scripts/run-benchmark-v2.md` with the following content**

````markdown
# Wheat vs. Chaff Benchmark v2 — Coordinator Runbook

## Overview

Run 5 test cases × 3 variants = 15 conversations. For each, dispatch a subagent interviewer, play back scripted user lines, collect the restate, dispatch a judge, and record results.

## Payloads

**Zero-Shot:** No system context.

**Chaff:** Full content of `skills/interview-me/SKILL.md` as system context.

**Wheat:**
```
Role: Interviewer. 1. State HYPOTHESIS (one-sentence + confidence score). 2. Ask 1 question + append GUESS. 3. If user uses jargon, ask: 'If you didn't have to justify this to anyone, what would you actually want?'. 4. Finish with RESTATE (Outcome, User, Success, Constraint, Out of Scope). 5. Gate: Wait for 'yes'.
```

## Per Test Case Protocol

Repeat for each of the 5 YAML files in `benchmarks/cases/`. Run all 3 variants before moving to the next test case.

### Step 1: Read the test case YAML

Read the YAML file. Extract:
- `initial_ask`
- `scripted_turns` (4 lines, indexed 0–3)
- `judge_context`

### Step 2: Run Zero-Shot variant

Dispatch a `general` subagent with this prompt:

```
You are an AI assistant with no special instructions.

The user has sent you: "<initial_ask>"

Respond. Then I will send you the user's next message. Continue the conversation.
After each of your responses, wait — I will provide the next user message.
When you produce a restate (a structured summary containing "Outcome:", "User:", "Success:", "Constraint:", "Out of scope:"), output the restate clearly and stop.
If after 4 user messages you have not produced a restate, output exactly: NO_RESTATE
```

After each subagent response, check if it contains `Outcome:`. If yes, stop and record the restate. If no, resume the subagent with the next scripted turn appended as: `User: "<scripted_turns[n]>"`. Do this for up to 4 turns. If no restate after turn 4, record `NO_RESTATE`.

Collect the full exchange as a transcript array:
```json
[
  {"role": "user", "content": "<initial_ask>"},
  {"role": "assistant", "content": "<response>"},
  {"role": "user", "content": "<scripted_turns[0]>"},
  ...
]
```

### Step 3: Run Chaff variant

Same as Step 2, but prepend the full content of `skills/interview-me/SKILL.md` to the subagent prompt as system context:

```
You are an AI assistant. Apply the following skill instructions exactly:

---
<FULL CONTENT OF skills/interview-me/SKILL.md>
---

The user has sent you: "<initial_ask>"

[rest of prompt identical to Zero-Shot]
```

### Step 4: Run Wheat variant

Same as Step 2, but prepend the Wheat payload as system context:

```
You are an AI assistant. Apply these instructions exactly:

Role: Interviewer. 1. State HYPOTHESIS (one-sentence + confidence score). 2. Ask 1 question + append GUESS. 3. If user uses jargon, ask: 'If you didn't have to justify this to anyone, what would you actually want?'. 4. Finish with RESTATE (Outcome, User, Success, Constraint, Out of Scope). 5. Gate: Wait for 'yes'.

The user has sent you: "<initial_ask>"

[rest of prompt identical to Zero-Shot]
```

### Step 5: Judge all 3 variants

For each variant's transcript + restate, dispatch a `general` subagent with this prompt:

```
You are a benchmark judge. Score the following interview restate on 4 dimensions.

## True underlying intent (ground truth)
<judge_context>

## Conversation transcript
<transcript as JSON array>

## Restate produced
<restate text, or "NO_RESTATE">

## Scoring rubric

Score each dimension 1–5:

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| outcome_captured | No outcome stated | Vague outcome | Specific outcome matching the true intent |
| user_identified | No user stated | Generic ("users") | Specific person/role with context |
| success_criterion | Absent | Present but unmeasurable | Concrete and checkable |
| out_of_scope_stated | Absent | Implied | Explicit line in restate |

If the restate is NO_RESTATE, all dimensions score 1.

Return ONLY valid JSON, no prose:
{
  "outcome_captured": <1-5>,
  "user_identified": <1-5>,
  "success_criterion": <1-5>,
  "out_of_scope_stated": <1-5>,
  "total": <sum>,
  "rationale": "<one sentence per dimension, separated by |>"
}
```

### Step 6: Append results

For each variant, append one entry to `docs/benchmarks/results.json`:

```json
{
  "runDate": "<ISO timestamp>",
  "benchmarkVersion": "v2",
  "model": "claude-sonnet-4-6 (opencode subagents)",
  "testCaseId": "<id>",
  "variant": "<zero-shot|chaff-shot|wheat-shot>",
  "judgeScores": <judge JSON output>,
  "transcript": <transcript array>,
  "restate": "<restate text or NO_RESTATE>"
}
```

## After All 15 Runs

Print this summary table:

```
| Test Case | Zero-Shot | Chaff | Wheat | Chaff-Wheat delta |
|-----------|-----------|-------|-------|-------------------|
| tc-01     | ...       | ...   | ...   | ...               |
| tc-02     | ...       | ...   | ...   | ...               |
| tc-03     | ...       | ...   | ...   | ...               |
| tc-04     | ...       | ...   | ...   | ...               |
| tc-05     | ...       | ...   | ...   | ...               |
```

**Interpret results:**
- Delta ≤ 2 on all cases → fidelity claim supported
- Delta ≥ 3 on any case → fidelity failure on that case, flag it

Commit results:
```bash
git add docs/benchmarks/results.json
git commit -m "data: add benchmark v2 run results (wheat vs chaff, multi-turn)"
```
````

- [ ] **Step 2: Verify the file exists**

```bash
node -e "require('fs').readFileSync('scripts/run-benchmark-v2.md','utf8'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add scripts/run-benchmark-v2.md
git commit -m "docs: add benchmark v2 coordinator runbook"
```

---

## Task 3: Execute the benchmark

This task is performed by the coordinator in an interactive OpenCode session, following `scripts/run-benchmark-v2.md`.

**Files:**
- Modify: `docs/benchmarks/results.json` (append 15 entries)

- [ ] **Step 1: Read all 5 YAML test cases**

Read `benchmarks/cases/tc-01.yaml` through `tc-05.yaml`. Extract `initial_ask`, `scripted_turns`, and `judge_context` for each.

- [ ] **Step 2: Read `skills/interview-me/SKILL.md`**

Read the full file. This is the Chaff payload injected into Chaff-Shot subagent prompts.

- [ ] **Step 3: For each test case, run Zero-Shot → Chaff → Wheat**

Follow the runbook (`scripts/run-benchmark-v2.md`) exactly. For each variant:
- Dispatch a `general` subagent
- Play back scripted turns by resuming the subagent with each scripted line
- Detect restate by presence of `Outcome:` in a response
- Collect transcript array and restate text

Run variants sequentially (not in parallel) within each test case to avoid coordinator context bleed.

- [ ] **Step 4: For each of the 15 transcripts, dispatch a judge subagent**

The three judges for a single test case can run in parallel (one message, 3 Task tool calls). Use the judge prompt template from the runbook.

- [ ] **Step 5: Append all 15 result entries to `docs/benchmarks/results.json`**

Read the current file, push 15 entries, write back. Use the schema from the runbook.

- [ ] **Step 6: Print the summary table**

Print scores for all test cases × variants and the Chaff–Wheat delta per test case.

- [ ] **Step 7: Commit**

```bash
git add docs/benchmarks/results.json
git commit -m "data: add benchmark v2 run results (wheat vs chaff, multi-turn)"
```

---

## Task 4: Update the benchmark report

**Files:**
- Modify: `docs/benchmarks/wheat_vs_chaff_report.md`

- [ ] **Step 1: Append a v2 results section to the report**

Add the following at the end of `docs/benchmarks/wheat_vs_chaff_report.md`, filling in actual scores from Task 3:

```markdown
---

## 6. Benchmark v2 Results — Multi-Turn Outcome Equivalence

**Date:** <run date>
**Method:** 5 test cases × 3 variants (Zero-Shot, Chaff, Wheat). Each variant ran a full multi-turn conversation with scripted user lines. An LLM judge scored the final restate on 4 dimensions (1–5 each, total 4–20).

### Summary Table

| Test Case | Category | Zero-Shot | Chaff | Wheat | Delta (Chaff−Wheat) |
|-----------|----------|-----------|-------|-------|---------------------|
| tc-01 | clean trigger | ... | ... | ... | ... |
| tc-02 | jargon | ... | ... | ... | ... |
| tc-03 | multi-part | ... | ... | ... | ... |
| tc-04 | delegation | ... | ... | ... | ... |
| tc-05 | high-stakes | ... | ... | ... | ... |

### Interpretation

**Equivalence threshold:** Delta ≤ 2 = equivalent. Delta ≥ 3 = fidelity failure.

<Replace with actual interpretation: how many cases passed, any failures, overall conclusion about the fidelity claim.>
```

- [ ] **Step 2: Verify the file is readable**

```bash
node -e "require('fs').readFileSync('docs/benchmarks/wheat_vs_chaff_report.md','utf8'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add docs/benchmarks/wheat_vs_chaff_report.md
git commit -m "docs: add benchmark v2 results section to report"
```

---

## Self-Review

### Spec coverage

| Spec requirement | Task covering it |
|---|---|
| 5 YAML test cases with id/initial_ask/scripted_turns/judge_context | Task 1 |
| Coordinator runbook with runner + judge + results protocol | Task 2 |
| 15 conversations run (5 cases × 3 variants) | Task 3 |
| Judge scores per transcript (4 dimensions, JSON) | Task 3 Step 4 |
| Results appended to results.json with benchmarkVersion: v2 | Task 3 Step 5 |
| Summary table + fidelity interpretation | Task 3 Step 6, Task 4 |
| Report updated with v2 results | Task 4 |

### Placeholder scan

Task 4 Step 1 contains placeholder `...` values in the table — intentional, to be filled with actual scores from Task 3. No other placeholders.

### Type consistency

`judgeScores` JSON schema defined once in Task 2 (runbook) and referenced in Task 3 Step 5. `transcript` is an array of `{role, content}` objects, consistent throughout.
