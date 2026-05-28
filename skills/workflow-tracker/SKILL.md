---
name: workflow-tracker
description: Use at the start of any development task alongside lifecycle skills to track progress across SPEC→PLAN→BUILD→TEST→REVIEW→SIMPLIFY→SHIP phases via a TodoWrite list. Phases derive from the slash commands in `.claude/commands/` — see `references/lifecycle.md` for the canonical order and per-command phase sets.
---

# Workflow Tracker

## Overview

Companion skill — activates alongside lifecycle skills to maintain a live phase tracker mapped to the active workflow phases so the user always sees where they are and what comes next.

Prefers the `TodoWrite` tool when available. Falls back to inline markdown output when it is not (see [Fallback](#fallback-no-todowrite)).

## When to Use

- At the start of any development task that uses a lifecycle skill or slash command
- When the user needs to track progress across multiple phases (SPEC → PLAN → BUILD → TEST → REVIEW → SIMPLIFY → SHIP)
- When resuming a task mid-phase and the current position in the workflow needs to be visible

**When NOT to use:** Single-step tasks where there is only one phase to complete and no phase progression is needed.

## Activation

Invoke alongside any lifecycle skill or slash command:

| Slash command | Phases to initialize |
|--------------|----------------------|
| `/spec` | SPEC → PLAN → BUILD → TEST → REVIEW → SIMPLIFY → SHIP |
| `/plan` | PLAN → BUILD → TEST → REVIEW → SIMPLIFY → SHIP |
| `/build` | BUILD → TEST → REVIEW → SIMPLIFY → SHIP |
| `/test` | TEST → REVIEW → SIMPLIFY → SHIP |
| `/review` | REVIEW → SIMPLIFY → SHIP |
| `/code-simplify` | SIMPLIFY → SHIP |
| `/ship` | SHIP |

The canonical phase list and order is defined in `references/lifecycle.md`. If new slash commands are added, update that file — this skill derives its phase sets from it.

## Initialization

When a task begins, immediately create a `TodoWrite` list containing only the phases relevant to the invoked command (see table above). Use these statuses:

- `in_progress` — the current phase
- `pending` — future phases
- `completed` — phases already done

**Example: `/review` invoked**

```
[in_progress] REVIEW — code review passed
[pending]     SIMPLIFY — complexity reduced
[pending]     SHIP — branch merged / PR created
```

**Example: `/spec` invoked**

```
[in_progress] SPEC — spec written and approved
[pending]     PLAN — plan written and approved
[pending]     BUILD — all tasks complete
[pending]     TEST — verification output shown
[pending]     REVIEW — code review passed
[pending]     SIMPLIFY — complexity reduced
[pending]     SHIP — branch merged / PR created
```

If a formal plan from `planning-and-task-breakdown` exists with multiple tasks, expand BUILD into one `TodoWrite` item per task:

```
[pending] BUILD — task 1: <task name from plan>
[pending] BUILD — task 2: <task name from plan>
...
```

## Phase Gates

| Phase | Entry gate | Exit gate |
|-------|-----------|-----------|
| SPEC | Task described with enough specificity to identify at least one acceptance criterion. If the task is too vague, surface the lack of specificity before initializing — ask for one concrete success condition before opening SPEC. | Spec approved by user |
| PLAN | Spec approved | Plan approved by user |
| BUILD | Plan approved | All tasks verified complete |
| TEST | Tasks complete | Verification output shown and passing |
| REVIEW | Verification passing | Code review GO |
| SIMPLIFY | Review GO | Simplification complete or explicitly skipped |
| SHIP | Simplify complete | Merged / PR created |

## Real-time Updates

Update tracker items in real time as gates are passed — do not batch updates.

Mark a phase `completed` the moment its exit gate is reached. Mark the next phase `in_progress` immediately after.

## Phase Regression

Phases are not always linear. When a phase must be revisited (e.g., TEST fails and work returns to BUILD):

1. Set the previously-completed phase back to `in_progress`
2. Do **not** add a duplicate item — update the existing one
3. When it passes again, mark it `completed` and re-advance

> **Regression loop cap:** If the same phase regresses more than twice without reaching its exit gate, stop and surface the repeated failure to the user. Present these options: "Continue with a modified approach", "Decompose the failing task further", or "Escalate — needs human decision." Do not continue looping silently past two regressions.

## Resuming Mid-Task

When resuming a task where prior phases have already been completed (e.g., SPEC and PLAN are done, resuming at BUILD):

1. Initialize only the remaining phases as `pending` or `in_progress`.
2. Mark already-completed phases as `completed` immediately.
3. Do not initialize all phases as `pending` — this misrepresents the true state of the work.

If you are unsure which phases are complete, review the conversation history or committed files before initializing.

## Completion

The tracker is complete when SHIP is marked `completed`.

## Fallback (No TodoWrite)

If the `TodoWrite` tool is not available in the current environment (e.g. pi, OpenCode, or any agent harness that lacks it), print a formatted tracker block directly in the conversation output.

Use this exact format:

```
📋 WORKFLOW TRACKER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  SPEC     — spec written and approved
✅  PLAN     — plan written and approved
🔄  BUILD    — all tasks complete         ← current
⏳  TEST     — verification output shown
⏳  REVIEW   — code review passed
⏳  SIMPLIFY — complexity reduced
⏳  SHIP     — branch merged / PR created
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Legend: `✅` completed · `🔄` in progress · `⏳` pending

Print the block immediately on task start, and **reprint the full updated block after every phase transition** — do not emit a partial diff. This gives the user a consistent snapshot each time.

When expanding BUILD into per-task items, list each task on its own line:

```
🔄  BUILD    — task 1: <task name>        ← current
⏳  BUILD    — task 2: <task name>
⏳  BUILD    — task 3: <task name>
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The user can track phases themselves" | Agents lose phase context across tool calls. An explicit tracker is the only reliable signal of current position. |
| "I don't have TodoWrite so I'll skip tracking" | The fallback markdown block provides equivalent visibility. Always emit it. |

## Red Flags

- Initializing phases not relevant to the invoked command (use the table above to scope correctly)
- Batching tracker updates instead of updating each phase as its gate is passed
- Marking a phase `completed` before its exit gate is actually reached
- Adding duplicate items when a phase regresses — update the existing item instead
- Forgetting to mark the next phase `in_progress` immediately after marking the current one `completed`
- Skipping the fallback block because `TodoWrite` is unavailable — always emit the markdown block instead

## Verification

After initialization:
- [ ] Tracker created (via `TodoWrite` or fallback markdown block) with correct phases for the invoked command
- [ ] Current phase is marked `in_progress`
- [ ] Future phases are marked `pending`
- [ ] Any already-completed phases are marked `completed`

After each phase transition:
- [ ] Completed phase is marked `completed`
- [ ] Next phase is marked `in_progress` immediately
- [ ] No duplicate items in the list
- [ ] If using fallback: full block reprinted with updated statuses
