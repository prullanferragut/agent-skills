# Mechanical Accuracy Benchmark: Wheat vs. Chaff
**Date:** 2026-05-24
**Auditor Persona:** Active (Mechanical Accuracy Protocol)

## 1. Objective
To measure the performance delta (latency, token efficiency, and instruction fidelity) between narrative-heavy instructions ("Chaff") and compressed, imperative instructions ("Wheat") within the `agent-skills` repository.

## 2. Methodology
- **Subject:** `interview-me` skill.
- **Payload A (Chaff):** Full original `SKILL.md` (~3,200 tokens).
- **Payload B (Wheat):** Compressed imperative logic (~300 tokens).
- **Testing:** 5 A/B scenarios using nested stateful control loops (subagents).

## 3. Results Summary

| Metric | Chaff (Original) | Wheat (No-BS) | Improvement |
| :--- | :--- | :--- | :--- |
| **System Prompt Size** | ~1,600 tokens | ~150 tokens | **-90.6%** |
| **Avg. Response Latency** | ~2.4s | ~1.8s | **-25%** |
| **Instruction Fidelity** | 100% | 80% (drifted once) | **-20%** |
| **Signal-to-Noise Ratio** | Low | High | **N/A** |

### Key Findings
- **Wheat** is significantly more efficient for high-context windows, reducing retrieval decay risks.
- **Chaff** provides semantic guardrails; stripping negative constraints (e.g., "Don't use browser tools") can lead to instruction drift in edge cases.
- **Convergence:** Both versions successfully identified the underlying intent, but Wheat reached the technical probe faster.

## 4. Replication Plan for Cross-Model Benchmarking

To replicate this test on other LLMs (GPT-4o, Sonnet 3.5, Llama 3):

### Step 1: Payload Preparation
- **Chaff:** Use `skills/interview-me/SKILL.md`.
- **Wheat:** Use the following:
> "Role: Interviewer. 1. State HYPOTHESIS (one-sentence + confidence score). 2. Ask 1 question + append GUESS. 3. If user uses jargon, ask: 'If you didn't have to justify this to anyone, what would you actually want?'. 4. Finish with RESTATE (Outcome, User, Success, Constraint, Out of Scope). 5. Gate: Wait for 'yes'."

### Step 2: Test Execution
1. **Zero-Shot:** Provide task "Build a social network" without the skill.
2. **Chaff-Shot:** Provide task with Chaff payload.
3. **Wheat-Shot:** Provide task with Wheat payload.

### Step 3: Audit (Point System)
- [+1] Exactly one question.
- [+1] Confidence score present.
- [+1] GUESS present.
- [+1] Zero "introductory fluff" or apologies.

---
**Auditor's Recommendation:** For model-to-model interfaces, use **Wheat + Negative Constraints**. For human-in-the-loop, retain **Chaff** for the human's benefit but move it to the bottom of the prompt.

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
| `confidencePresent`  | Text matches `/confidence[:\s]+~?\d+%/i`       |
| `guessPresent`       | At least one line starting with `GUESS:`       |
| `noFluff`            | No introductory fluff or apology patterns      |

### Unit Tests

```bash
node scripts/score-response.test.js
```

### Results

Results are stored in `docs/benchmarks/results.json`. Each entry records per-variant scores and full response text for audit.

---

## 6. Benchmark v2 Results — Multi-Turn Outcome Equivalence

**Date:** 2026-05-25
**Method:** 5 test cases × 3 variants (Zero-Shot, Chaff, Wheat). Each variant ran a full multi-turn conversation with 4 scripted user turns. An LLM judge scored the final restate on 4 dimensions (1–5 each, total 4–20). Score of 4 = NO_RESTATE (minimum).

### Summary Table

| Test Case | Category | Zero-Shot | Chaff | Wheat | Delta (Chaff−Wheat) | Fidelity |
|-----------|----------|-----------|-------|-------|---------------------|----------|
| tc-01 | clean-trigger | 4 | 4 | 20 | −16 | ❌ FAIL |
| tc-02 | jargon | 4 | 4 | 4 | 0 | ✅ PASS |
| tc-03 | multi-part | 4 | 4 | 20 | −16 | ❌ FAIL |
| tc-04 | delegation | 4 | 20 | 4 | +16 | ❌ FAIL |
| tc-05 | high-stakes | 4 | 4 | 4 | 0 | ✅ PASS |

*Equivalence threshold: |delta| ≤ 2. Failure: |delta| ≥ 3.*

### Interpretation

**The fidelity claim cannot be evaluated from this run.** Only 3 of 15 conversations produced a restate within 4 scripted turns. The dominant finding is a design limit: 4 turns is insufficient for the interview skill to reach a confident restate in most cases. Both Chaff and Wheat exhibit this limit.

Where a restate was produced:
- Wheat succeeded on tc-01 and tc-03 (Chaff did not)
- Chaff succeeded on tc-04 (Wheat did not)
- Neither succeeded on tc-02 or tc-05

This means the three "fidelity failures" are artefacts of which variant happened to cross the restate threshold within the 4-turn window, not evidence of systematic quality differences. The two "passes" (tc-02, tc-05) are both floor ties — both variants scored minimum, which is an equally uninformative result.

### Required Fix Before Re-Running

Increase `scripted_turns` from 4 to 8 in each test case YAML. The interview-me skill typically requires 4–6 questions before producing a restate; 4 user turns is not enough runway.
