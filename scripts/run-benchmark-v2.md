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

After the subagent responds, check if the response contains `Outcome:`. If yes, stop and record the restate. If no, resume the subagent (using the same task_id) with the next scripted turn as: `User: "<scripted_turns[n]>"`. Do this for up to 4 turns. If no restate after turn 4, record `NO_RESTATE`.

Collect the full exchange as a transcript array:
```json
[
  {"role": "user", "content": "<initial_ask>"},
  {"role": "assistant", "content": "<response>"},
  {"role": "user", "content": "<scripted_turns[0]>"},
  {"role": "assistant", "content": "<response>"},
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

Respond. Then I will send you the user's next message. Continue the conversation.
After each of your responses, wait — I will provide the next user message.
When you produce a restate (a structured summary containing "Outcome:", "User:", "Success:", "Constraint:", "Out of scope:"), output the restate clearly and stop.
If after 4 user messages you have not produced a restate, output exactly: NO_RESTATE
```

### Step 4: Run Wheat variant

Same as Step 2, but prepend the Wheat payload as system context:

```
You are an AI assistant. Apply these instructions exactly:

Role: Interviewer. 1. State HYPOTHESIS (one-sentence + confidence score). 2. Ask 1 question + append GUESS. 3. If user uses jargon, ask: 'If you didn't have to justify this to anyone, what would you actually want?'. 4. Finish with RESTATE (Outcome, User, Success, Constraint, Out of Scope). 5. Gate: Wait for 'yes'.

The user has sent you: "<initial_ask>"

Respond. Then I will send you the user's next message. Continue the conversation.
After each of your responses, wait — I will provide the next user message.
When you produce a restate (a structured summary containing "Outcome:", "User:", "Success:", "Constraint:", "Out of scope:"), output the restate clearly and stop.
If after 4 user messages you have not produced a restate, output exactly: NO_RESTATE
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

The three judges for a single test case can be dispatched in parallel (one message, 3 Task tool calls).

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
| Test Case | Zero-Shot | Chaff | Wheat | Chaff−Wheat delta |
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
