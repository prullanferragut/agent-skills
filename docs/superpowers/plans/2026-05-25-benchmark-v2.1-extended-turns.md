# Benchmark v2.1 — Extended Turn Count Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend each benchmark test case from 4 to 8 scripted turns and re-run the full benchmark to produce scoreable restates.

**Architecture:** Update the 5 YAML files in `benchmarks/cases/` with 4 additional cooperative user turns per case, then execute the benchmark following `scripts/run-benchmark-v2.md` — 15 fresh conversations from scratch, judges score all restates, results appended to `results.json`.

**Tech Stack:** YAML (test cases), OpenCode subagent dispatcher, plain JSON for results.

---

## File Map

| Action | Path | Responsibility |
| --- | --- | --- |
| Modify | `benchmarks/cases/tc-01.yaml` | Add turns 5–8 |
| Modify | `benchmarks/cases/tc-02.yaml` | Add turns 5–8 |
| Modify | `benchmarks/cases/tc-03.yaml` | Add turns 5–8 |
| Modify | `benchmarks/cases/tc-04.yaml` | Add turns 5–8 |
| Modify | `benchmarks/cases/tc-05.yaml` | Add turns 5–8 |
| Modify | `docs/benchmarks/results.json` | Append 15 new v2.1 entries |
| Modify | `docs/benchmarks/wheat_vs_chaff_report.md` | Add v2.1 results section |

---

## Task 1: Extend YAML test cases to 8 turns

**Files:**
- Modify: `benchmarks/cases/tc-01.yaml` through `tc-05.yaml`

- [ ] **Step 1: Update each YAML file with the additional turns**

`benchmarks/cases/tc-01.yaml` — replace `scripted_turns` with:
```yaml
scripted_turns:
  - "For developers to share side projects"
  - "Yeah something like that, maybe with comments and upvotes"
  - "Just me and a few friends to start, maybe 10 people"
  - "Yes that sounds right"
  - "Yeah a web app makes most sense"
  - "Something simple, just post a project with a description and a link"
  - "Exactly, nothing fancy — we can always add more later"
  - "Yes, that's it"
```

`benchmarks/cases/tc-02.yaml` — replace `scripted_turns` with:
```yaml
scripted_turns:
  - "I mean it should handle growth"
  - "Honestly I just don't want to rewrite it in a year"
  - "Maybe 10k users in the first year would be success"
  - "Yes exactly"
  - "Yeah it's greenfield, we're starting from scratch"
  - "Just our small team, maybe 3 engineers adding features over time"
  - "Right, I want us to be able to add features without things breaking"
  - "Yes exactly, that captures it"
```

`benchmarks/cases/tc-03.yaml` — replace `scripted_turns` with:
```yaml
scripted_turns:
  - "The dashboard is the most important thing"
  - "My team lead checks it every morning to see if anything broke overnight"
  - "If it shows green/red status for all services that would be enough"
  - "Yes, start with the dashboard"
  - "We have maybe 8 services, all internal microservices"
  - "They expose health endpoints already, yeah"
  - "Just green if the endpoint responds 200, red if it doesn't or times out"
  - "Yes, start with the dashboard"
```

`benchmarks/cases/tc-04.yaml` — replace `scripted_turns` with:
```yaml
scripted_turns:
  - "I don't know, something for my startup"
  - "We're a 3-person team building a B2B SaaS"
  - "The founder checks metrics manually in Stripe right now, it takes an hour a day"
  - "Yes that's the problem"
  - "An email digest would be perfect actually"
  - "MRR, new customers this week, churn — those three would cover it"
  - "Yeah just those three, nothing else needed"
  - "Yes that's the problem"
```

`benchmarks/cases/tc-05.yaml` — replace `scripted_turns` with:
```yaml
scripted_turns:
  - "It's too slow and we keep having bugs"
  - "Login takes 3 seconds sometimes and we had two security incidents last year"
  - "Security incidents are the bigger problem honestly"
  - "Yes, security first"
  - "I don't know exactly what caused them, we never did a full postmortem"
  - "The team is scared to touch the auth code now, every change feels risky"
  - "If we could trust that a change won't cause another incident, that would be enough"
  - "Yes, security first, performance is secondary"
```

- [ ] **Step 2: Verify all files have exactly 8 scripted turns**

```bash
node -e "
const fs = require('fs');
['tc-01','tc-02','tc-03','tc-04','tc-05'].forEach(id => {
  const text = fs.readFileSync('benchmarks/cases/' + id + '.yaml', 'utf8');
  const matches = text.match(/^  - /gm) || [];
  if (matches.length !== 8) throw new Error(id + ': expected 8 turns, got ' + matches.length);
  console.log(id + ': ' + matches.length + ' turns ok');
});
"
```

Expected:
```
tc-01: 8 turns ok
tc-02: 8 turns ok
tc-03: 8 turns ok
tc-04: 8 turns ok
tc-05: 8 turns ok
```

- [ ] **Step 3: Commit**

```bash
git add benchmarks/cases/
git commit -m "feat: extend benchmark test cases to 8 scripted turns for v2.1 run"
```

---

## Task 2: Execute the v2.1 benchmark

This task is performed by the coordinator following `scripts/run-benchmark-v2.md`.

**Files:**
- Modify: `docs/benchmarks/results.json` (append 15 v2.1 entries)
- Modify: `docs/benchmarks/wheat_vs_chaff_report.md` (add Section 7)

The protocol is identical to v2 with one change: play back up to 8 scripted turns instead of 4. Stop early if a restate (all 5 fields present) is detected. Record `NO_RESTATE` only if none produced after turn 8.

- [ ] **Step 1: Read all 5 updated YAML files**

Read `benchmarks/cases/tc-01.yaml` through `tc-05.yaml`. Extract `initial_ask`, all 8 `scripted_turns`, and `judge_context` for each.

- [ ] **Step 2: Read `skills/interview-me/SKILL.md`**

Read the full file for injection into Chaff-Shot prompts.

- [ ] **Step 3: Run all 15 conversations**

For each test case, run Zero-Shot → Chaff → Wheat sequentially. Follow `scripts/run-benchmark-v2.md` exactly. Play back turns 0–7 (stopping early on restate detection). Collect transcript and restate for each.

- [ ] **Step 4: Dispatch judges in parallel per test case**

For each test case, dispatch 3 judge subagents in a single parallel message. Use the judge prompt from `scripts/run-benchmark-v2.md`. Collect JSON scores.

- [ ] **Step 5: Append 15 entries to `docs/benchmarks/results.json`**

Each entry uses `"benchmarkVersion": "v2.1"`. Read → parse → push × 15 → write back.

- [ ] **Step 6: Print summary table**

```
| Test Case | Zero-Shot | Chaff | Wheat | Delta (Chaff−Wheat) | Fidelity |
|-----------|-----------|-------|-------|---------------------|----------|
| tc-01     | ...       | ...   | ...   | ...                 | ✅/❌    |
| tc-02     | ...       | ...   | ...   | ...                 | ✅/❌    |
| tc-03     | ...       | ...   | ...   | ...                 | ✅/❌    |
| tc-04     | ...       | ...   | ...   | ...                 | ✅/❌    |
| tc-05     | ...       | ...   | ...   | ...                 | ✅/❌    |
```

Fidelity: ✅ if |Chaff−Wheat| ≤ 2, ❌ if delta ≥ 3.

- [ ] **Step 7: Append Section 7 to `docs/benchmarks/wheat_vs_chaff_report.md`**

Use this template, filling in actual scores:

```markdown
---

## 7. Benchmark v2.1 Results — Extended Turn Count (8 turns)

**Date:** 2026-05-25
**Change from v2:** Scripted turns extended from 4 to 8 per test case. Cooperative user responses designed to converge toward a restate by turn 6–7.

### Summary Table

| Test Case | Category | Zero-Shot | Chaff | Wheat | Delta (Chaff−Wheat) | Fidelity |
|-----------|----------|-----------|-------|-------|---------------------|----------|
| tc-01 | clean-trigger | ... | ... | ... | ... | ✅/❌ |
| tc-02 | jargon | ... | ... | ... | ... | ✅/❌ |
| tc-03 | multi-part | ... | ... | ... | ... | ✅/❌ |
| tc-04 | delegation | ... | ... | ... | ... | ✅/❌ |
| tc-05 | high-stakes | ... | ... | ... | ... | ✅/❌ |

### Interpretation

<fill in: how many restates produced, which cases passed/failed fidelity, overall conclusion>
```

- [ ] **Step 8: Commit everything**

```bash
git add docs/benchmarks/results.json docs/benchmarks/wheat_vs_chaff_report.md
git commit -m "data: add benchmark v2.1 run results (8-turn, wheat vs chaff)"
```

---

## Self-Review

### Spec coverage

| Requirement | Task |
| --- | --- |
| 8 turns per test case | Task 1 |
| Fresh conversations (not reusing v2 sessions) | Task 2 Step 3 |
| Same judge rubric and scoring protocol as v2 | Task 2 Step 4 |
| Results stored with benchmarkVersion v2.1 | Task 2 Step 5 |
| Report updated with actual scores | Task 2 Step 7 |

### Placeholder scan

Task 2 Step 7 contains `...` placeholders in the table — intentional, filled with actual run scores. No other placeholders.

### Type consistency

`benchmarkVersion: "v2.1"` used consistently in Step 5 and Step 7. All other schema fields identical to v2.
