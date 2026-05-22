# workflow-tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a `workflow-tracker` skill that keeps users oriented in the DEFINE→PLAN→BUILD→VERIFY→REVIEW→SHIP lifecycle via three mechanisms: phase transition headers, a `status` command, and a TodoWrite phase structure.

**Architecture:** A markdown-only skill (no scripts needed) in `skills/workflow-tracker/SKILL.md`. The skill is invoked as a companion to any lifecycle task and defines exact behavior rules the agent must follow. AGENTS.md gets one new intent mapping entry so it activates automatically.

**Tech Stack:** Markdown, AGENTS.md rules — no code, no scripts, no dependencies.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `skills/workflow-tracker/SKILL.md` | The skill definition |
| Create | `skills/workflow-tracker.zip` | Packaged skill for distribution |
| Modify | `AGENTS.md` | Add intent mapping entry |

---

### Task 1: Create `skills/workflow-tracker/SKILL.md`

**Files:**
- Create: `skills/workflow-tracker/SKILL.md`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p skills/workflow-tracker
```

Expected: directory created, no output.

- [ ] **Step 2: Write `SKILL.md`**

Create `skills/workflow-tracker/SKILL.md` with this exact content:

```markdown
---
name: workflow-tracker
description: Keeps the user oriented across the DEFINE→PLAN→BUILD→VERIFY→REVIEW→SHIP lifecycle. Use at the start of any task. Activates three mechanisms: phase transition headers, a `status` command, and a TodoWrite phase structure. Use when starting any development task to maintain workflow visibility.
---

# Workflow Tracker

Keeps you oriented across the full development lifecycle without requiring you to memorize the workflow. Three mechanisms work together: a phase header on every transition, a `status` command for on-demand state dumps, and a TodoWrite list that maps directly to workflow phases.

## How It Works

### On task start — initialize the phase TodoWrite list

When any task begins, immediately create a TodoWrite list with these items. Mark phases already complete as `completed`, the current phase as `in_progress`, and future phases as `pending`:

```
[ ] DEFINE  — spec written and approved
[ ] PLAN    — plan written and approved
[ ] BUILD   — all tasks complete
[ ] VERIFY  — verification output shown
[ ] REVIEW  — code review passed
[ ] SHIP    — branch merged / PR created
```

If a plan exists with multiple tasks, expand BUILD into one item per task:
```
[ ] BUILD — task 1: <task name from plan>
[ ] BUILD — task 2: <task name from plan>
...
```

Update items in real time as gates are passed — do not batch updates.

### On phase transition — emit header

Whenever the workflow crosses a phase boundary (DEFINE→PLAN, PLAN→BUILD, BUILD→VERIFY, VERIFY→REVIEW, REVIEW→SHIP), emit this block **before** the response content:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE: <NEW PHASE>  (was: <PREVIOUS PHASE>)
Gate passed: <what was just approved or completed>
Next gate: <what must happen before the next transition>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Do NOT emit the header on regular responses within a phase — only on transitions.

**Phase boundary definitions:**

| Transition | Gate passed | Next gate |
|------------|-------------|-----------|
| DEFINE→PLAN | Spec approved by user | Plan approved by user |
| PLAN→BUILD | Plan approved by user | verification-before-completion on each task |
| BUILD→VERIFY | All BUILD tasks complete | verification output shown in same message |
| VERIFY→REVIEW | Verification passing | code-review-and-quality passed |
| REVIEW→SHIP | Code review GO | branch merged or PR created |

### On `status` command

When the user types `status` (case-insensitive, may appear alone or at the start of a message), respond with:

```
Current phase:   <PHASE>
Tasks:           <N> of <M> complete  (or "N/A — no plan yet")
Last gate:       <description of most recently passed gate>
Next gate:       <description of next required gate, and which phase transition it unlocks>
Spec:            <path to spec file, or "none yet">
Plan:            <path to plan file, or "none yet">
```

Read the current phase from the TodoWrite list. Read spec and plan paths by checking `docs/superpowers/specs/` and `docs/superpowers/plans/` for files matching the current task topic. If no task is active, respond:

```
No active task.
Start with: describe what you want to build.
```

## Phase Reference

| Phase | Entry gate | Exit gate |
|-------|-----------|-----------|
| DEFINE | Task described | Spec approved by user |
| PLAN | Spec approved | Plan approved by user |
| BUILD | Plan approved | All tasks verified complete |
| VERIFY | Tasks complete | Verification output shown |
| REVIEW | Verification passing | Code review GO |
| SHIP | Review GO | Merged / PR created |

## Trigger

This skill is a companion — it activates alongside any lifecycle skill:
- `brainstorming` / `spec-driven-development` → initialize tracker at DEFINE
- `writing-plans` / `planning-and-task-breakdown` → update tracker to PLAN
- `incremental-implementation` / `test-driven-development` → update tracker to BUILD
- `verification-before-completion` → update tracker to VERIFY
- `code-review-and-quality` → update tracker to REVIEW
- `shipping-and-launch` / `finishing-a-development-branch` → update tracker to SHIP

It also activates directly when the user types `status`.
```

- [ ] **Step 3: Verify the file was written**

```bash
cat skills/workflow-tracker/SKILL.md
```

Expected: full file content printed, frontmatter visible at top with `name: workflow-tracker`.

- [ ] **Step 4: Commit**

```bash
git add skills/workflow-tracker/SKILL.md
git commit -m "feat: add workflow-tracker skill"
```

Expected: commit succeeds, 1 file changed.

---

### Task 2: Package the skill as a zip

**Files:**
- Create: `skills/workflow-tracker.zip`

- [ ] **Step 1: Create the zip from inside the skills directory**

```bash
cd skills && zip -r workflow-tracker.zip workflow-tracker/
```

Expected: `workflow-tracker.zip` created in `skills/`, no errors.

- [ ] **Step 2: Verify the zip contains the expected file**

```bash
unzip -l skills/workflow-tracker.zip
```

Expected output contains:
```
skills/workflow-tracker/SKILL.md
```

- [ ] **Step 3: Commit**

```bash
git add skills/workflow-tracker.zip
git commit -m "chore: package workflow-tracker skill"
```

Expected: commit succeeds, 1 file changed.

---

### Task 3: Add intent mapping to `AGENTS.md`

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Read AGENTS.md to find the Intent → Skill Mapping section**

Open `AGENTS.md` and locate the `### Intent → Skill Mapping` section. It currently reads:

```markdown
- Feature / new functionality → `spec-driven-development`, then `incremental-implementation`, `test-driven-development`
- Planning / breakdown → `planning-and-task-breakdown`
- Bug / failure / unexpected behavior → `debugging-and-error-recovery`
- Code review → `code-review-and-quality`
- Refactoring / simplification → `code-simplification`
- API or interface design → `api-and-interface-design`
- UI work → `frontend-ui-engineering`
```

- [ ] **Step 2: Add the workflow-tracker entry**

Add this line at the top of the intent mapping list (it should fire for every task):

```markdown
- Any development task → `workflow-tracker` (companion — load alongside the primary skill)
```

So the section becomes:

```markdown
- Any development task → `workflow-tracker` (companion — load alongside the primary skill)
- Feature / new functionality → `spec-driven-development`, then `incremental-implementation`, `test-driven-development`
- Planning / breakdown → `planning-and-task-breakdown`
- Bug / failure / unexpected behavior → `debugging-and-error-recovery`
- Code review → `code-review-and-quality`
- Refactoring / simplification → `code-simplification`
- API or interface design → `api-and-interface-design`
- UI work → `frontend-ui-engineering`
```

- [ ] **Step 3: Verify the edit**

```bash
grep -A 10 "Intent → Skill Mapping" AGENTS.md
```

Expected: `workflow-tracker` line appears first in the list.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md
git commit -m "feat: register workflow-tracker in AGENTS.md intent mapping"
```

Expected: commit succeeds, 1 file changed.

---

## Verification Checklist

After all tasks complete, confirm:

- [ ] `skills/workflow-tracker/SKILL.md` exists and has valid frontmatter (`name`, `description`)
- [ ] `skills/workflow-tracker.zip` exists and contains `skills/workflow-tracker/SKILL.md`
- [ ] `AGENTS.md` intent mapping has `workflow-tracker` as the first entry
- [ ] Three commits exist: skill file, zip, AGENTS.md update
- [ ] Running `status` in a new session with no active task returns the "No active task" message
