# Merge vertical-slicing into planning-and-task-breakdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Absorb all content from `skills/vertical-slicing/SKILL.md` into a restructured `skills/planning-and-task-breakdown/SKILL.md`, delete `vertical-slicing` as a skill, and update all cross-references — so agents invoke one skill for the complete plan→slice→task workflow.

**Architecture:** `planning-and-task-breakdown` is restructured with a new information architecture: Identify Behaviors → Slice Vertically (with tracer bullet / HITL / AFK types, ordering rules, slice write format, sizing, validation checklist) → Identify Dependency Graph → Write Tasks → Order and Checkpoint. The vertical-slicing skill directory and zip are deleted. All files that reference `vertical-slicing` as an invokable skill are updated to point to `planning-and-task-breakdown`.

**Tech Stack:** Markdown only — no code changes.

---

## File Map

| Action | File |
| ------ | ---- |
| Rewrite | `skills/planning-and-task-breakdown/SKILL.md` |
| Delete | `skills/vertical-slicing/SKILL.md` |
| Delete | `skills/vertical-slicing/` directory |
| Delete | `skills/vertical-slicing.zip` |
| Modify | `skills/using-agent-skills/SKILL.md` |
| Modify | `skills/incremental-implementation/SKILL.md` |
| Modify | `references/lifecycle.md` |
| Modify | `README.md` |
| Modify | `docs/superpowers-workflow.md` |
| Modify | `docs/getting-started.md` |
| Modify | `.opencode/skills/vertical-slicing/` → delete symlink/copy |

---

## Task 1: Rewrite planning-and-task-breakdown/SKILL.md

**Files:**
- Modify: `skills/planning-and-task-breakdown/SKILL.md`

This is the core task. The new skill must read as a unified process — not planning with imported vertical-slicing appended. Every concept from the old `vertical-slicing/SKILL.md` must appear in its natural place within the planning workflow.

- [ ] **Step 1: Replace the file with the merged content**

Replace the entire contents of `skills/planning-and-task-breakdown/SKILL.md` with:

```markdown
---
name: planning-and-task-breakdown
description: Breaks work into ordered, vertically-sliced tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
---

# Planning and Task Breakdown

## Overview

Decompose work into thin, vertical slices — each one delivers working, testable behavior through every layer of the stack. Good task breakdown is the difference between an agent that completes work reliably and one that produces a tangled mess. Every slice should be small enough to implement, test, and verify in a single focused session.

A vertical slice cuts through all layers of the stack — schema, API, logic, UI, tests — for one narrow piece of behavior, and delivers something demoable at the end. The alternative, horizontal slicing, builds one entire layer before moving to the next. Horizontal slicing feels organized but routinely produces integration failures at the end, tests that test imagined behavior, and work that cannot be reviewed or demoed mid-stream.

## When to Use

- You have a spec and need to break it into implementable units
- A task feels too large or vague to start
- Work needs to be parallelized across multiple agents or sessions
- You need to communicate scope to a human
- The implementation order is not obvious

**When NOT to use:** Single-file changes with obvious scope, or when the spec already contains well-defined tasks.

## The Core Distinction

```
HORIZONTAL (avoid):
  Task 1: All database schemas
  Task 2: All API endpoints
  Task 3: All UI components
  Task 4: Connect everything and hope

VERTICAL (use this):
  Slice 1: User can create a task        ← schema + API + UI + tests
  Slice 2: User can view their tasks     ← query + API + UI + tests
  Slice 3: User can delete a task        ← delete + API + UI + tests
```

Each vertical slice is independently demoable. If the project stops after Slice 1, something real was shipped.

## The Planning Process

### Step 1: Enter Plan Mode

> **Gate:** Before planning, confirm that a written spec or confirmed intent statement exists. If neither exists, stop and invoke `spec-driven-development` or `interview-me` first. Do not produce a task list for an unwritten spec — the plan will encode agent assumptions, not requirements.

Before writing any code, operate in read-only mode:

- Read the spec and relevant codebase sections
- Identify existing patterns and conventions
- Note risks and unknowns

**Do NOT write code during planning.** The output is a plan document, not implementation.

### Step 2: Identify the Behaviors

From the spec or task, list every piece of user-visible or system-observable behavior. Not layers — behaviors.

```
Spec: "Users can manage their tasks"

Behaviors:
- Create a task with a title
- View a list of tasks
- Mark a task as complete
- Delete a task
- Filter tasks by status
```

These behaviors become your slices. One behavior = one slice (or smaller, if a behavior is too large).

### Step 3: Slice Vertically

#### Slice Types

Not all slices are the same. Three types matter:

**Tracer Bullet**

The first slice in any feature. Its job is not to be complete — it is to prove the path exists end-to-end. A tracer bullet slice is intentionally thin: the minimum surface area that touches every layer and confirms they connect.

```
Tracer bullet for a task management feature:
  - Schema: one table, two columns (id, title)
  - API: one endpoint, POST /tasks
  - UI: a text input and a submit button
  - Test: user enters a title and submits; task appears in response
```

If the tracer bullet fails, you discover the integration problem before investing in any real functionality. Ship the tracer bullet first, always.

**HITL Slice (Human-in-the-Loop)**

A slice that requires a human decision or action before it can be completed. Examples: an architectural decision, a design review, an external approval, a manual verification step that cannot be automated.

Mark these explicitly so they are not handed to an AFK agent that will block.

**AFK Slice (Away From Keyboard)**

A slice that an agent can implement, test, and merge without human interaction. The majority of slices should be AFK. If a slice requires human judgment mid-implementation, it is either a HITL slice or it is not well-enough specified.

| Use HITL when... | Use AFK when... |
| ---------------- | --------------- |
| Acceptance criteria reference taste or judgment ("looks correct", "makes sense") | Acceptance criteria are fully mechanical (test passes, API returns X) |
| An external approval or design review is required | No external approvals needed |
| The decision depends on information the agent does not have at slice start | The agent has all information required at slice start |

If uncertain, mark as HITL. A false HITL blocks briefly; a false AFK blocks indefinitely.

#### Order by Dependency and Risk

- **Tracer bullet first:** The first slice is always the tracer bullet — the thinnest possible path that proves end-to-end connectivity.
- **Dependency order:** If Slice B cannot exist without Slice A (e.g., "mark complete" requires a task to exist), A comes first.
- **Risk order:** Put the riskiest slice early. A risky slice is one where the approach is uncertain, the integration is novel, or failure would invalidate subsequent slices. Discovering a risk early is cheap. Discovering it after five slices is expensive.

#### Write Each Slice

Each slice needs:

| Field | Content |
| ----- | ------- |
| **Title** | One short verb phrase describing the behavior: "User can create a task" |
| **Type** | AFK or HITL |
| **Layers touched** | Which layers this slice passes through (schema, API, logic, UI, tests) |
| **Acceptance criteria** | Specific, testable conditions — not implementation steps |
| **Blocked by** | Which prior slices must complete first, or "None" |
| **Demoable as** | What you can show or verify when this slice is complete |

#### Slice Sizing

The right size for a slice is the smallest surface that produces demoable behavior.

**Too large:** A slice that takes more than one focused session to implement, or whose acceptance criteria cannot be stated in three or fewer bullet points, or that touches two or more independent subsystems.

**Too small:** A slice that does not produce anything demoable. If completing the slice leaves the system in an untestable intermediate state, it is not a slice — it is a horizontal layer pretending to be a slice.

When a slice feels too large, ask: "What is the minimum behavior that would be worth showing to a human?" That is the boundary of the slice.

#### Validate the Slices

Before moving to task writing, check each slice against:

- [ ] Does completing this slice produce something demoable or verifiable on its own?
- [ ] Does it pass through every layer it needs to (not just one layer)?
- [ ] Could an AFK agent complete it without a human decision mid-way?
- [ ] Is the acceptance criteria testable without knowing implementation internals?
- [ ] Is the title a behavior, not a layer? ("User can create a task" not "Add task schema")

### Step 4: Identify the Dependency Graph

Map what depends on what across and within slices:

```
Database schema
    │
    ├── API models/types
    │       │
    │       ├── API endpoints
    │       │       │
    │       │       └── Frontend API client
    │       │               │
    │       │               └── UI components
    │       │
    │       └── Validation logic
    │
    └── Seed data / migrations
```

Implementation order follows the dependency graph bottom-up: build foundations first.

### Step 5: Write Tasks

Each task follows this structure:

```markdown
## Task [N]: [Short descriptive title]

**Description:** One paragraph explaining what this task accomplishes.

**Acceptance criteria:**
- [ ] [Specific, testable condition]
- [ ] [Specific, testable condition]

**Verification:**
- [ ] Tests pass: `npm test -- --grep "feature-name"`
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: [description of what to verify]

**Dependencies:** [Task numbers this depends on, or "None"]

**Files expected to change (estimate — may be incomplete):**
- `src/path/to/file.ts`
- `tests/path/to/test.ts`

> This is a planning estimate. During execution, Rule -1 from `incremental-implementation` takes precedence — map the actual dependency graph before touching files.

**Estimated scope:** [Small: 1-2 files | Medium: 3-5 files | Large: 5+ files]
```

### Step 6: Order and Checkpoint

Arrange tasks so that:

1. Dependencies are satisfied (build foundation first)
2. Each task leaves the system in a working state
3. Verification checkpoints occur after every 2-3 tasks
4. High-risk tasks are early (fail fast)

Add explicit checkpoints:

```markdown
## Checkpoint: After Tasks 1-3
- [ ] All tests pass
- [ ] Application builds without errors
- [ ] Core user flow works end-to-end
- [ ] Review with human before proceeding
```

## Task Sizing Guidelines

| Size | Files | Scope | Example |
|------|-------|-------|---------|
| **XS** | 1 | Single function or config change | Add a validation rule |
| **S** | 1-2 | One component or endpoint | Add a new API endpoint |
| **M** | 3-5 | One feature slice | User registration flow |
| **L** | 5-8 | Multi-component feature | Search with filtering and pagination |
| **XL** | 8+ | **Too large — break it down further** | — |

If a task is L or larger, it should be broken into smaller tasks. An agent performs best on S and M tasks.

**When to break a task down further:**
- It would take more than one focused session (roughly 2+ hours of agent work)
- You cannot describe the acceptance criteria in 3 or fewer bullet points
- It touches two or more independent subsystems (e.g., auth and billing)
- You find yourself writing "and" in the task title (a sign it is two tasks)

## Plan Document Template

```markdown
# Implementation Plan: [Feature/Project Name]

## Overview
[One paragraph summary of what we're building]

## Architecture Decisions
- [Key decision 1 and rationale]
- [Key decision 2 and rationale]

## Task List

### Phase 1: Foundation
- [ ] Task 1: ...
- [ ] Task 2: ...

### Checkpoint: Foundation
- [ ] Tests pass, builds clean

### Phase 2: Core Features
- [ ] Task 3: ...
- [ ] Task 4: ...

### Checkpoint: Core Features
- [ ] End-to-end flow works

### Phase 3: Polish
- [ ] Task 5: ...
- [ ] Task 6: ...

### Checkpoint: Complete
- [ ] All acceptance criteria met
- [ ] Ready for review

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | [High/Med/Low] | [Strategy] |

## Open Questions
- [Question needing human input]
```

## Parallelization Opportunities

When multiple agents or sessions are available:

- **Safe to parallelize:** Independent feature slices, tests for already-implemented features, documentation
- **Must be sequential:** Database migrations, shared state changes, dependency chains
- **Needs coordination:** Features that share an API contract (define the contract first, then parallelize)

> **Before marking tasks as safe to parallelize, check whether they touch any shared files** — configuration, package manifests, database schema, CI config, or seed data. If they do, either serialize those specific changes or designate one task to own each shared file and make the other tasks depend on it.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It's faster to build the whole database first" | Faster to type, slower to discover that the API you designed does not fit the UI you need. |
| "We can't demo anything until the UI is done" | The tracer bullet proves the path. A form that submits and shows a response is demoable. |
| "These layers are too coupled to slice vertically" | That coupling is the problem. Vertical slicing forces you to confront it early instead of at integration time. |
| "The slices are too thin to be useful tasks" | A thin slice that delivers demoable behavior is exactly the right size. Thin is not small — it is precise. |
| "I'll add the tests after all slices are done" | Tests written after the fact test imagined behavior. Tests written per slice test actual behavior. |
| "I'll figure it out as I go" | That's how you end up with a tangled mess and rework. 10 minutes of planning saves hours. |
| "The tasks are obvious" | Write them down anyway. Explicit tasks surface hidden dependencies and forgotten edge cases. |
| "Planning is overhead" | Planning is the task. Implementation without a plan is just typing. |
| "I can hold it all in my head" | Context windows are finite. Written plans survive session boundaries and compaction. |

## Red Flags

- A task title names a layer, not a behavior ("Add database schema", "Build API endpoints")
- The first task in a plan does not produce anything demoable
- No task is marked as a tracer bullet
- All tasks depend on all previous tasks (no parallel work is possible)
- Acceptance criteria describe implementation steps, not observable outcomes
- A slice cannot be completed without a human decision mid-way but is marked AFK
- Starting implementation without a written task list
- Tasks that say "implement the feature" without acceptance criteria
- No verification steps in the plan
- All tasks are XL-sized
- No checkpoints between tasks
- Dependency order is not considered

## Verification

Before starting implementation, confirm:

- [ ] First slice is a tracer bullet that proves end-to-end connectivity
- [ ] Every slice title describes a behavior, not a layer
- [ ] Every slice has acceptance criteria stated as observable outcomes
- [ ] Every slice is independently demoable or verifiable when complete
- [ ] HITL and AFK types are correctly assigned
- [ ] Dependency order is correct (blockers listed explicitly)
- [ ] No slice is large enough to require more than one focused implementation session
- [ ] Every task has acceptance criteria
- [ ] Every task has a verification step
- [ ] No task touches more than ~5 files
- [ ] Checkpoints exist between major phases
- [ ] The human has reviewed and approved the plan
- [ ] The Risks and Mitigations table contains at least one identified risk, or explicitly states "No risks identified" with a one-sentence rationale
```

- [ ] **Step 2: Verify the file was written correctly**

Run: `wc -l skills/planning-and-task-breakdown/SKILL.md`
Expected: Approximately 260-280 lines

- [ ] **Step 3: Commit**

```bash
git add skills/planning-and-task-breakdown/SKILL.md
git commit -m "feat: merge vertical-slicing content into planning-and-task-breakdown"
```

---

## Task 2: Delete vertical-slicing skill

**Files:**
- Delete: `skills/vertical-slicing/SKILL.md`
- Delete: `skills/vertical-slicing/` directory
- Delete: `skills/vertical-slicing.zip`
- Delete: `.opencode/skills/vertical-slicing/` (symlink or copy)

- [ ] **Step 1: Remove the skill directory and zip**

```bash
rm -rf skills/vertical-slicing
rm -f skills/vertical-slicing.zip
```

- [ ] **Step 2: Remove the .opencode copy**

```bash
rm -rf .opencode/skills/vertical-slicing
```

- [ ] **Step 3: Verify deletion**

```bash
ls skills/ | grep vertical
ls .opencode/skills/ | grep vertical
```
Expected: no output from either command

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: delete vertical-slicing skill (merged into planning-and-task-breakdown)"
```

---

## Task 3: Update using-agent-skills/SKILL.md

**Files:**
- Modify: `skills/using-agent-skills/SKILL.md`

Two locations need updating: the skill discovery flowchart (line 23) and the lifecycle sequence (line 147) and the quick reference table (line 171).

- [ ] **Step 1: Remove vertical-slicing from discovery flowchart**

In the `## Skill Discovery` section, find:
```
    ├── Breaking spec into slices? ────→ vertical-slicing
    ├── Have a spec, need tasks? ──────→ planning-and-task-breakdown
```

Replace with:
```
    ├── Have a spec, need tasks? ──────→ planning-and-task-breakdown
```

- [ ] **Step 2: Remove vertical-slicing from the lifecycle sequence**

Find:
```
5.  vertical-slicing            → Determine slice boundaries before task breakdown
6.  planning-and-task-breakdown → Break into verifiable chunks
```

Replace with:
```
5.  planning-and-task-breakdown → Break into vertically-sliced, verifiable chunks
```

Renumber all subsequent items (6 → 5, 7 → 6, etc.).

- [ ] **Step 3: Remove vertical-slicing from the quick reference table**

Find:
```
| Plan | `/plan` | vertical-slicing | Thin end-to-end slices, each independently demoable |
| Plan | `/plan` | planning-and-task-breakdown | Decompose into small, verifiable tasks |
```

Replace with:
```
| Plan | `/plan` | planning-and-task-breakdown | Vertically-sliced, verifiable tasks with tracer bullet, HITL/AFK types, and dependency ordering |
```

- [ ] **Step 4: Verify no remaining vertical-slicing references**

```bash
grep -n "vertical-slicing" skills/using-agent-skills/SKILL.md
```
Expected: no output

- [ ] **Step 5: Commit**

```bash
git add skills/using-agent-skills/SKILL.md
git commit -m "feat: remove vertical-slicing from using-agent-skills routing"
```

---

## Task 4: Update references/lifecycle.md

**Files:**
- Modify: `references/lifecycle.md`

- [ ] **Step 1: Remove vertical-slicing from PLAN phase**

Find:
```
| PLAN | `planning-and-task-breakdown`, `vertical-slicing` |
```

Replace with:
```
| PLAN | `planning-and-task-breakdown` |
```

- [ ] **Step 2: Verify**

```bash
grep -n "vertical-slicing" references/lifecycle.md
```
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add references/lifecycle.md
git commit -m "feat: remove vertical-slicing from lifecycle PLAN phase"
```

---

## Task 5: Update incremental-implementation/SKILL.md

**Files:**
- Modify: `skills/incremental-implementation/SKILL.md`

The skill refers to itself as a "companion" to vertical-slicing. Update to reference planning-and-task-breakdown instead.

- [ ] **Step 1: Check for vertical-slicing references**

```bash
grep -n "vertical.slic" skills/incremental-implementation/SKILL.md
```

Note the line numbers returned.

- [ ] **Step 2: Update references**

The `## Slicing Strategies` section heading `### Vertical Slices (Preferred)` is fine to keep — it describes the technique, not the skill. Only update any references to `vertical-slicing` as a skill name (backtick-quoted).

If there are no backtick-quoted `vertical-slicing` references, this step is a no-op. Only commit if changes were made.

- [ ] **Step 3: Commit if changed**

```bash
git add skills/incremental-implementation/SKILL.md
git commit -m "feat: update incremental-implementation to remove vertical-slicing skill reference"
```

---

## Task 6: Update README.md

**Files:**
- Modify: `README.md`

Two locations: the Plan skill table (line 145) and the project structure directory tree (line 254).

- [ ] **Step 1: Remove vertical-slicing row from Plan table**

Find:
```
| [vertical-slicing](skills/vertical-slicing/SKILL.md) | Thin end-to-end slices that each deliver verifiable, demoable functionality through every layer | Breaking down a spec into tasks, when implementation order is unclear, or when horizontal layering is tempting |
```

Delete this entire row.

- [ ] **Step 2: Update planning-and-task-breakdown description**

Find:
```
| [planning-and-task-breakdown](skills/planning-and-task-breakdown/SKILL.md) | Decompose specs into small, verifiable tasks with acceptance criteria and dependency ordering | You have a spec and need implementable units |
```

Replace with:
```
| [planning-and-task-breakdown](skills/planning-and-task-breakdown/SKILL.md) | Vertical slicing, tracer bullet, HITL/AFK types, dependency ordering, verifiable tasks with acceptance criteria | You have a spec and need implementable units, or you need to determine slice boundaries |
```

- [ ] **Step 3: Remove vertical-slicing from directory tree**

Find:
```
│   ├── vertical-slicing/              #   Plan
```

Delete this line.

- [ ] **Step 4: Update the skill count in the project structure header**

Find (approximately):
```
├── skills/                            # 26 skills (24 lifecycle + 2 meta)
```

Update the count by subtracting 1 (26 → 25, 24 lifecycle → 23 lifecycle):
```
├── skills/                            # 25 skills (23 lifecycle + 2 meta)
```

- [ ] **Step 5: Verify no remaining vertical-slicing references**

```bash
grep -n "vertical-slicing" README.md
```
Expected: no output

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "feat: remove vertical-slicing from README skill index and project structure"
```

---

## Task 7: Update docs/superpowers-workflow.md

**Files:**
- Modify: `docs/superpowers-workflow.md`

Two locations: the PLAN phase table (line 72) and the skill selection cheat sheet (line 157).

- [ ] **Step 1: Remove vertical-slicing from PLAN phase table**

Find:
```
| `vertical-slicing` | agent-skills | Determines slice boundaries before `planning-and-task-breakdown` — each slice is a thin end-to-end cut, independently demoable |
```

Delete this entire row.

- [ ] **Step 2: Update planning-and-task-breakdown description in PLAN table**

Find:
```
| `planning-and-task-breakdown` | agent-skills | Decomposes into verifiable tasks with acceptance criteria, dependency ordering, and checkpoints |
```

Replace with:
```
| `planning-and-task-breakdown` | agent-skills | Identifies behaviors, slices vertically (tracer bullet first, HITL/AFK types), orders by risk and dependency, decomposes into verifiable tasks with acceptance criteria and checkpoints |
```

- [ ] **Step 3: Update skill selection cheat sheet**

Find:
```
| "Break this into tasks" | `vertical-slicing` → `planning-and-task-breakdown` | agent-skills |
```

Replace with:
```
| "Break this into tasks" | `planning-and-task-breakdown` | agent-skills |
```

- [ ] **Step 4: Verify no remaining vertical-slicing references**

```bash
grep -n "vertical-slicing" docs/superpowers-workflow.md
```
Expected: no output

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers-workflow.md
git commit -m "feat: remove vertical-slicing from superpowers-workflow PLAN phase"
```

---

## Task 8: Update docs/getting-started.md

**Files:**
- Modify: `docs/getting-started.md`

One location: the end-to-end walkthrough table at line 172.

- [ ] **Step 1: Update the Plan phase row in the walkthrough**

Find:
```
| **3. Plan** | User runs `/plan`. Agent applies `vertical-slicing` to produce three slices: create tag, assign tag to task, filter tasks by tag. Tracer bullet is Slice 1. | Command → Skill | `/plan` → `vertical-slicing` → `planning-and-task-breakdown` | `tasks/plan.md`, `tasks/todo.md` |
```

Replace with:
```
| **3. Plan** | User runs `/plan`. Agent applies `planning-and-task-breakdown` to identify behaviors, produce three vertical slices (create tag, assign tag to task, filter tasks by tag), mark Slice 1 as the tracer bullet, and write tasks with acceptance criteria. | Command → Skill | `/plan` → `planning-and-task-breakdown` | `tasks/plan.md`, `tasks/todo.md` |
```

- [ ] **Step 2: Check for any other vertical-slicing references**

```bash
grep -n "vertical-slicing" docs/getting-started.md
```
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add docs/getting-started.md
git commit -m "feat: remove vertical-slicing from getting-started walkthrough"
```

---

## Checkpoint: After All Tasks

- [ ] No file in the repo references `vertical-slicing` as an invokable skill:

```bash
grep -r "vertical-slicing" . --include="*.md" | grep -v "docs/superpowers/specs/2026-05-25-merge-vertical-slicing" | grep -v "docs/superpowers/plans/2026-05-25-merge-vertical-slicing"
```
Expected: no output (only the spec and plan files for this change may reference the name)

- [ ] `skills/vertical-slicing/` directory does not exist:

```bash
ls skills/ | grep vertical
```
Expected: no output

- [ ] `planning-and-task-breakdown/SKILL.md` contains all key terms:

```bash
grep -c "tracer bullet\|HITL\|AFK\|Identify the Behaviors\|Slice Vertically" skills/planning-and-task-breakdown/SKILL.md
```
Expected: 5

- [ ] All tests/verification pass (no automated tests in this repo — manual check that all modified files parse as valid Markdown with no broken links to `vertical-slicing`).

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| A reference to `vertical-slicing` is missed in a file not listed | Low | Final grep check in checkpoint catches stragglers |
| Merged skill is too long / hard to read | Medium | Kept under ~280 lines; process steps are numbered and scannable |
| Skill count in README is wrong after deletion | Low | Explicit step to update count in Task 6 |
