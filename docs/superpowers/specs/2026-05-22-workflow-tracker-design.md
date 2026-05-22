# Spec: workflow-tracker skill

**Date:** 2026-05-22  
**Status:** Approved

---

## Problem

The DEFINE→PLAN→BUILD→VERIFY→REVIEW→SHIP workflow has many phases and gates. Users lose track of the current phase, what gates have been passed, and what is required next — especially in long sessions.

---

## Goal

A skill that enforces three tracking mechanisms as a companion layer to any lifecycle task, keeping the user oriented without requiring them to memorize the workflow.

---

## Mechanisms

### 1 — Phase transition header

When the agent crosses a phase boundary, it emits a formatted block before its next response:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE: BUILD  (was: PLAN)
Gate passed: Plan approved by user
Next gate: verification-before-completion
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- Emitted only on phase transitions, not every response
- Includes: new phase, previous phase, gate that was just passed, next required gate

### 2 — `status` command

When the user types `status`, the agent responds with a full state summary:

```
Current phase:   BUILD
Tasks:           3 of 5 complete
Last gate:       Plan approved
Next gate:       verification-before-completion (blocks VERIFY)
Spec:            docs/superpowers/specs/YYYY-MM-DD-foo-design.md
Plan:            docs/superpowers/plans/YYYY-MM-DD-foo.md
```

- Reads from existing spec/plan files and current TodoWrite list
- No new state file required
- If no task is active, reports "No active task. Start with: describe what you want to build."

### 3 — TodoWrite phase structure

When any task begins, the agent initializes a TodoWrite list mapped to workflow phases:

```
[ ] DEFINE  — spec written and approved
[ ] PLAN    — plan written and approved
[ ] BUILD   — all tasks complete
[ ] VERIFY  — verification output shown
[ ] REVIEW  — code review passed
[ ] SHIP    — branch merged / PR created
```

- Phases already completed when the skill loads are marked done immediately
- BUILD expands to one todo per task from the plan (e.g., "BUILD — task 1: add route handler")
- The list is updated in real time as gates are passed

---

## Skill trigger

- Fires automatically as a companion whenever any lifecycle skill fires: `brainstorming`, `writing-plans`, `incremental-implementation`, `test-driven-development`, `verification-before-completion`, `code-review-and-quality`, `shipping-and-launch`
- Also added to `AGENTS.md` intent mapping so it activates at the start of any task description
- Can be invoked directly by the user at any time to re-initialize tracking

---

## Skill location

```
skills/workflow-tracker/
  SKILL.md
skills/workflow-tracker.zip
```

Added to:
- `AGENTS.md` — intent mapping entry: "Any task" → `workflow-tracker`
- `.opencode/` package registration (if applicable)

---

## Out of scope

- Persisting state across sessions in a file (SESSION.md) — not in this version; spec/plan files already provide cross-session continuity
- Automated gate enforcement (blocking the agent from proceeding) — gates are already enforced by individual skills; this skill only tracks and surfaces state
- Slack/external notifications

---

## Success criteria

1. Typing `status` at any point during a task returns the current phase, task count, last gate, next gate, and file paths
2. Every phase transition is announced with the formatted header before the next response
3. TodoWrite list at the start of any task shows all six phases with correct initial states
4. The skill does not add noise to responses that are not phase transitions
