# Design: Merge vertical-slicing into planning-and-task-breakdown

**Date:** 2026-05-25
**Status:** Approved

## Problem

Agents must invoke two skills — `vertical-slicing` and `planning-and-task-breakdown` — for what is a single activity: breaking a spec into implementable tasks. This is one invocation too many. Vertical slicing is a technique *inside* planning, not a separate workflow.

## Decision

Merge all content from `skills/vertical-slicing/SKILL.md` into `skills/planning-and-task-breakdown/SKILL.md` using a restructured information architecture. Delete `vertical-slicing` as a skill.

## New Information Architecture for planning-and-task-breakdown

```
1. Enter Plan Mode          — gate: spec must exist
2. Identify Behaviors       — from spec → user-observable behaviors, not layers
3. Slice Vertically         — expanded to absorb all vertical-slicing content
   3a. Slice types: Tracer Bullet, HITL, AFK (with decision table)
   3b. Order by dependency and risk (tracer bullet always first)
   3c. Write each slice (title, type, layers, acceptance criteria, blocked-by, demoable-as)
   3d. Validate slices (checklist)
4. Identify the Dependency Graph   — within and between slices
5. Write Tasks              — from slices → task format
6. Order and Checkpoint
```

Key change: "Identify Behaviors" becomes an explicit Step 2 (currently absent). Step 3 "Slice Vertically" expands from a brief contrast paragraph into a full subsection. Dependency graph moves to Step 4 — you need slices before you can map dependencies between them.

## Content Disposition

### Absorbed into Step 3 (Slice Vertically)
- Tracer Bullet, HITL, AFK slice type definitions and decision table
- Ordering rules: dependency order, risk order, tracer bullet first
- Per-slice write format: title, type, layers touched, acceptance criteria, blocked-by, demoable-as
- Slice sizing rules (too large / too small)
- Slice validation checklist

### Merged into Common Rationalizations
- All rationalizations from `vertical-slicing` merged with existing ones

### Merged into Red Flags
- All red flags from `vertical-slicing` merged in

### Merged into Verification
- Slice-level verification checklist merged with existing task-level checklist

## Deletions

- `skills/vertical-slicing/SKILL.md` and its directory
- `skills/vertical-slicing.zip`

## Cross-reference Updates Required

| File | Change |
| ---- | ------ |
| `skills/using-agent-skills/SKILL.md` | Remove `vertical-slicing` from routing table and skill index |
| `references/lifecycle.md` | Remove `vertical-slicing` from PLAN phase |
| `skills/incremental-implementation/SKILL.md` | Update "companion to vertical-slicing" references |
| `README.md` | Remove `vertical-slicing` from skill index and directory tree |
| `docs/superpowers-workflow.md` | Update PLAN phase table and skill selection cheat sheet |
| `docs/getting-started.md` | Update phase 3 walkthrough reference |
| `.opencode/skills/vertical-slicing/` | Remove symlink/copy if present |

## Success Criteria

- [ ] A single `planning-and-task-breakdown` invocation gives an agent everything needed to produce well-sliced, ordered tasks including tracer bullet identification
- [ ] No file in the repo references `vertical-slicing` as an invokable skill
- [ ] `planning-and-task-breakdown` reads as a unified process, not planning + imported concept
- [ ] All existing content from both skills is preserved (no concept lost)
