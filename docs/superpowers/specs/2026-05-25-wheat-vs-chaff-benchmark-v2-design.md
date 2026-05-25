# Wheat vs. Chaff Benchmark v2 — Design Spec

**Date:** 2026-05-25
**Status:** Approved

## Objective

Test the fidelity claim: *Wheat (compressed instructions) produces the same interview outcome as Chaff (full SKILL.md) when run through a full multi-turn conversation.*

Outcome equivalence is defined as: both variants independently receive a quality score from an LLM judge, and those scores are within ±2 points (out of 20) on the same test case.

---

## Scope

**In scope:**
- Multi-turn conversation runner (scripted user lines)
- LLM judge scoring restate quality independently per variant
- 5 test cases covering distinct input categories
- Results stored in `docs/benchmarks/results.json` alongside existing format

**Out of scope:**
- Latency or token measurement (covered by v1)
- Human annotation
- Branching conversation scripts
- Cross-model comparison (future work)

---

## Architecture

Four components:

### 1. Test Cases

YAML files in `benchmarks/cases/`. Each file defines:
- `id` — unique identifier (e.g. `tc-01`)
- `initial_ask` — the user's opening message
- `scripted_turns` — ordered list of user responses (4 per case)
- `judge_context` — one sentence describing the user's true underlying intent (given to the judge only, not to the interview model)

### 2. Runner

The coordinator (OpenCode session) dispatches one `general` subagent per variant per test case. The subagent:
1. Receives the variant payload (none / full SKILL.md / Wheat string) as system context
2. Receives the initial ask
3. Responds; the coordinator plays back the next scripted user line
4. Repeats until the model produces a restate (detected by presence of `Outcome:` in the response) or 6 turns are exhausted
5. Returns the full transcript and the final restate (or `NO_RESTATE` if none produced within 6 turns)

The three variants run sequentially per test case (not in parallel) to avoid context bleed in the coordinator session.

### 3. Judge

A separate `general` subagent receives:
- The full conversation transcript
- The final restate (or `NO_RESTATE`)
- The `judge_context` (true underlying intent)
- The scoring rubric

It returns a JSON object:
```json
{
  "outcome_captured": 1-5,
  "user_identified": 1-5,
  "success_criterion": 1-5,
  "out_of_scope_stated": 1-5,
  "total": 4-20,
  "rationale": "one sentence per dimension"
}
```

If `NO_RESTATE`, all dimensions score 1.

### 4. Results

Each run appends to `docs/benchmarks/results.json`:
```json
{
  "runDate": "ISO timestamp",
  "benchmarkVersion": "v2",
  "model": "claude-sonnet-4-6 (opencode subagents)",
  "testCaseId": "tc-01",
  "variant": "chaff-shot",
  "judgeScores": {
    "outcome_captured": 4,
    "user_identified": 3,
    "success_criterion": 5,
    "out_of_scope_stated": 4,
    "total": 16,
    "rationale": "..."
  },
  "transcript": [...],
  "restate": "..."
}
```

---

## Test Cases

### tc-01 — Clean trigger (baseline)
- **Initial ask:** "Build a social network"
- **Scripted turns:**
  1. "For developers to share side projects"
  2. "Yeah something like that, maybe with comments and upvotes"
  3. "Just me and a few friends to start, maybe 10 people"
  4. "Yes that sounds right"
- **Judge context:** User wants a small private platform for ~10 developers to share and get feedback on side projects, not a public social network.

### tc-02 — Jargon / sophistication-signaling
- **Initial ask:** "Make it scalable and clean"
- **Scripted turns:**
  1. "I mean it should handle growth"
  2. "Honestly I just don't want to rewrite it in a year"
  3. "Maybe 10k users in the first year would be success"
  4. "Yes exactly"
- **Judge context:** User's real constraint is avoiding a rewrite in 12 months; "scalable" is a proxy for that fear, not a genuine scale requirement.

### tc-03 — Multi-part ask
- **Initial ask:** "I need a dashboard and also an API and maybe some alerts"
- **Scripted turns:**
  1. "The dashboard is the most important thing"
  2. "My team lead checks it every morning to see if anything broke overnight"
  3. "If it shows green/red status for all services that would be enough"
  4. "Yes, start with the dashboard"
- **Judge context:** User needs a simple service-status dashboard for a team lead's morning check — the API and alerts are secondary and can be deferred.

### tc-04 — Delegation / non-answer
- **Initial ask:** "Just do whatever you think is best"
- **Scripted turns:**
  1. "I don't know, something for my startup"
  2. "We're a 3-person team building a B2B SaaS"
  3. "The founder checks metrics manually in Stripe right now, it takes an hour a day"
  4. "Yes that's the problem"
- **Judge context:** User needs to eliminate an hour-a-day manual metrics review in Stripe; the solution space is a simple internal metrics view, not a full analytics platform.

### tc-05 — High-stakes underspecified ask
- **Initial ask:** "Rewrite our auth system"
- **Scripted turns:**
  1. "It's too slow and we keep having bugs"
  2. "Login takes 3 seconds sometimes and we had two security incidents last year"
  3. "Security incidents are the bigger problem honestly"
  4. "Yes, security first"
- **Judge context:** User's binding constraint is security (two incidents), not performance; a targeted security audit and hardening is the right scope, not a full rewrite.

---

## Judge Rubric

The judge scores each restate on 4 dimensions (1–5 each, total 4–20):

| Dimension | 1 | 3 | 5 |
| --- | --- | --- | --- |
| **outcome_captured** | No outcome stated | Vague outcome | Specific outcome matching judge_context |
| **user_identified** | No user stated | Generic ("users") | Specific person/role with context |
| **success_criterion** | Absent | Present but unmeasurable | Concrete and checkable |
| **out_of_scope_stated** | Absent | Implied | Explicit line in restate |

**Equivalence threshold:** Chaff and Wheat scores within ±2 points on the same test case = equivalent outcome.

**Failure signal:** If Wheat scores ≥3 points below Chaff on any single test case, that case is flagged as a fidelity failure.

---

## Wheat Payload

```
Role: Interviewer. 1. State HYPOTHESIS (one-sentence + confidence score). 2. Ask 1 question + append GUESS. 3. If user uses jargon, ask: 'If you didn't have to justify this to anyone, what would you actually want?'. 4. Finish with RESTATE (Outcome, User, Success, Constraint, Out of Scope). 5. Gate: Wait for 'yes'.
```

## Chaff Payload

Full content of `skills/interview-me/SKILL.md`.

---

## File Map

| Action | Path | Responsibility |
| --- | --- | --- |
| Create | `benchmarks/cases/tc-01.yaml` | Test case: clean trigger |
| Create | `benchmarks/cases/tc-02.yaml` | Test case: jargon |
| Create | `benchmarks/cases/tc-03.yaml` | Test case: multi-part |
| Create | `benchmarks/cases/tc-04.yaml` | Test case: delegation |
| Create | `benchmarks/cases/tc-05.yaml` | Test case: high-stakes |
| Create | `scripts/run-benchmark-v2.md` | Coordinator runbook (step-by-step instructions for running the benchmark in an OpenCode session) |
| Modify | `docs/benchmarks/results.json` | Append v2 run results |
| Modify | `docs/benchmarks/wheat_vs_chaff_report.md` | Add v2 results section |

The runner and judge are not scripts — they are OpenCode subagent dispatches performed by the coordinator following the runbook.

---

## Success Criteria

The benchmark run is considered complete when:
- All 5 test cases × 3 variants = 15 conversations have been run
- All 15 restates have been scored by the judge
- Results are appended to `results.json`
- A summary table (test case × variant × total score) is printed

The fidelity claim is supported if Wheat and Chaff scores are within ±2 on all 5 test cases.
The fidelity claim is refuted if Wheat scores ≥3 below Chaff on any test case.
