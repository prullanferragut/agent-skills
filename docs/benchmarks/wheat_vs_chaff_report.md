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
