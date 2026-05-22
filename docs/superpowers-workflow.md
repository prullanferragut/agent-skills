# Using superpowers + agent-skills Together

**A workflow reference for daily use.**

---

## What each repo does

| Repo | Job | Installed as |
| ---- | --- | ------------ |
| `superpowers` | Process backbone — enforces *how* to work | OpenCode plugin (auto-loads on session start) |
| `agent-skills` | Lifecycle skills — covers *what* to do across the full SDLC | `AGENTS.md` + `.opencode/` package |

They do not conflict. `agent-skills` was derived from `superpowers` and extends it. When both are active, `superpowers` provides the core process gates and `agent-skills` provides the domain-specific skills on top.

---

## What loads automatically

Every time you open OpenCode, before you type anything:

1. `superpowers` session hook fires → injects `using-superpowers` into context
2. `agent-skills` `AGENTS.md` → injects the intent-to-skill mapping

The agent knows all skills exist. It will select the right one based on what you say.

**You do not need to name skills.** Just describe your task.

---

## The mental model

Every task moves through phases. Each phase has a skill. The agent applies the skill automatically — your job is to answer its questions and approve its outputs before it moves forward.

```
DEFINE ──→ PLAN ──→ BUILD ──→ VERIFY ──→ REVIEW ──→ SHIP
```

You are the gate between each phase. The agent cannot proceed to PLAN until you approve the spec. Cannot proceed to BUILD until you approve the plan. This is intentional.

---

## Phase by phase

### DEFINE — what are we building?

**Trigger:** You describe a feature, paste a task description, or say "I need to..."

**What fires:**

| Skill | Source | Purpose |
| ----- | ------ | ------- |
| `brainstorming` | superpowers | One-question-at-a-time interview; proposes 2–3 approaches; writes spec to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`; you must approve before anything else happens |
| `interview-me` | agent-skills | Alternative entry point — surfaces what you actually want vs what you said |
| `ubiquitous-language` | agent-skills | Fires when an unfamiliar domain term appears; updates `CONTEXT.md` immediately; sparingly offers ADRs |

**Your job:** Answer questions one at a time. Approve or revise the spec. Do not let the agent skip to planning.

**Output:** A spec file at `docs/superpowers/specs/`.

---

### PLAN — how are we building it?

**Trigger:** Approved spec exists.

**What fires:**

| Skill | Source | Purpose |
| ----- | ------ | ------- |
| `writing-plans` | superpowers | Produces a task-by-task plan with exact file paths, complete code, exact commands. No TBD placeholders allowed. Saves to `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` |
| `vertical-slicing` | agent-skills | Determines slice boundaries before `planning-and-task-breakdown` — each slice is a thin end-to-end cut, independently demoable |
| `planning-and-task-breakdown` | agent-skills | Decomposes into verifiable tasks with acceptance criteria, dependency ordering, and checkpoints |

**Your job:** Review the plan. Check that tasks are small (S or M — no XL), slices are vertical not horizontal, and there are no TBD placeholders.

**Output:** A plan file at `docs/superpowers/plans/`.

---

### BUILD — implementing

**Trigger:** Approved plan exists.

**What fires:**

| Skill | Source | Purpose |
| ----- | ------ | ------- |
| `subagent-driven-development` | superpowers | Dispatches a fresh subagent per task; spec-compliance review before code-quality review; four status codes: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED |
| `incremental-implementation` | agent-skills | Implement → test → verify → commit cycle per slice; scope discipline enforced |
| `test-driven-development` | agent-skills | Failing test first, then minimal code to pass; Beyoncé Rule — no untested behavior |
| `source-driven-development` | agent-skills | Verifies implementation against official docs before writing code |
| `context-engineering` | agent-skills | Manages what context the agent loads; prevents stale or irrelevant context |

**Your job:** Review task completion reports. A task is not done until `verification-before-completion` has run commands and shown you the output.

**Key rule:** `verification-before-completion` (superpowers) blocks any "it's done" claim until the agent runs the relevant command and reads the full output in the same message. If the agent says "tests should pass" without showing you the test run output, that is a violation.

---

### VERIFY — does it actually work?

**Trigger:** Implementation claims completion, or something is broken.

**What fires:**

| Skill | Source | Purpose |
| ----- | ------ | ------- |
| `verification-before-completion` | superpowers | Hard gate — no completion claim without evidence. Runs: identify command → run it → read full output → check exit code |
| `systematic-debugging` | superpowers | Four-phase: Root Cause → Pattern Analysis → Hypothesis and Testing → Implementation. "3+ fixes tried = architectural problem" rule |
| `debugging-and-error-recovery` | agent-skills | Reproduce → localize → fix → guard (adds regression test) |

**Your job:** If the agent says "done", look for the verification output in the same message. If it is not there, ask for it.

---

### REVIEW — is it good enough to merge?

**Trigger:** All tasks complete, verification passing.

**What fires:**

| Skill | Source | Purpose |
| ----- | ------ | ------- |
| `requesting-code-review` | superpowers | Structures what to review and how to present it |
| `code-review-and-quality` | agent-skills | Five-axis review: correctness, readability, architecture, security, performance |
| `security-and-hardening` | agent-skills | OWASP-style audit; input validation; least privilege |
| `code-simplification` | agent-skills | Removes unnecessary complexity without changing behavior |

**`/ship` parallel fan-out (agent-skills):** Spawns three subagents simultaneously — `code-reviewer`, `security-auditor`, `test-engineer` — and merges their reports into a single GO/NO-GO with a rollback plan.

**Your job:** Read the merged report. A NO-GO is not a failure — it is the system working. Address the blocking issues before merging.

---

### SHIP — deploying safely

**Trigger:** GO from review gate.

**What fires:**

| Skill | Source | Purpose |
| ----- | ------ | ------- |
| `finishing-a-development-branch` | superpowers | Structured options: merge, PR, or cleanup. Only fires when tests pass and you need to decide how to integrate |
| `git-workflow-and-versioning` | agent-skills | Atomic commits, clean history, branch strategy |
| `shipping-and-launch` | agent-skills | Pre-launch checklist, monitoring, rollback plan |
| `ci-cd-and-automation` | agent-skills | Automated quality gates on every change |

---

## Skill selection cheat sheet

| You say / situation | Skill that fires | Source |
| ------------------- | ---------------- | ------ |
| "I need to build X" | `brainstorming` | superpowers |
| "What does [term] mean in this codebase?" | `ubiquitous-language` | agent-skills |
| "Break this into tasks" | `vertical-slicing` → `planning-and-task-breakdown` | agent-skills |
| "Implement task N from the plan" | `subagent-driven-development` | superpowers |
| "Something is broken" | `systematic-debugging` | superpowers |
| "Is this done?" | `verification-before-completion` | superpowers |
| "Review this before I merge" | `code-review-and-quality` | agent-skills |
| "Ship it" | `finishing-a-development-branch` → `shipping-and-launch` | superpowers / agent-skills |

---

## The hard gates — what the agent cannot skip

These are non-negotiable blocks enforced by skill design:

| Gate | Skill | What it blocks |
| ---- | ----- | -------------- |
| No code before spec approved | `brainstorming` | Any implementation action |
| No plan before spec approved | `writing-plans` | Task generation |
| No completion claim without evidence | `verification-before-completion` | Saying "done" without running commands |
| No merging on NO-GO | `/ship` review | Git merge / PR creation |
| No TBD in plan | `writing-plans` | Plan is rejected by reviewer subagent |

If the agent tries to skip a gate, it is a red flag. Name it and ask the agent to go back.

---

## Files produced per session

| File | Written by | Location |
| ---- | ---------- | -------- |
| Spec | `brainstorming` / `spec-driven-development` | `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` |
| Plan | `writing-plans` | `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` |
| Domain glossary | `ubiquitous-language` | `CONTEXT.md` (repo root) |
| ADRs | `ubiquitous-language` | `docs/adr/NNNN-slug.md` |

These files persist across sessions. The agent reads them at the start of the next session to restore context.

---

## Common mistakes to watch for

| Mistake | What it looks like | Correct response |
| ------- | ------------------ | ---------------- |
| Agent skips spec | Starts planning immediately after you describe a task | "Stop. Use `brainstorming` first." |
| Horizontal slicing | Tasks named by layer: "build database schema", "build all API endpoints" | "Reslice vertically — each task should deliver a demoable behavior end-to-end." |
| Phantom verification | "Tests should pass" without showing output | "Run the tests and show me the output before claiming done." |
| Vocabulary drift | Agent uses a different word for a concept already in `CONTEXT.md` | "That term conflicts with CONTEXT.md — use `[canonical term]`." |
| Scope creep | Agent modifies files outside the current task | "That file is not in this task's scope. Revert and note it for a separate task." |
| ADR inflation | Agent wants to write an ADR for a reversible decision | "Does this meet all three conditions — hard to reverse, surprising, real trade-off? If not, skip it." |
