# workflow-tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a `workflow-tracker` skill that keeps users oriented in the DEFINE→PLAN→BUILD→VERIFY→REVIEW→SHIP lifecycle via a TodoWrite list mapped to workflow phases.

**Architecture:** A markdown-only skill (no scripts needed) in `skills/workflow-tracker/SKILL.md`. The skill is invoked as a companion to any lifecycle task and defines the TodoWrite structure the agent must maintain. No AGENTS.md or CLAUDE.md changes — the skill activates only when explicitly invoked or when another lifecycle skill invokes it as a companion.

**Tech Stack:** Markdown only — no code, no scripts, no dependencies.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `skills/workflow-tracker/SKILL.md` | The skill definition |
| Create | `skills/workflow-tracker.zip` | Packaged skill for distribution |

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
description: Keeps the user oriented across the DEFINE→PLAN→BUILD→VERIFY→REVIEW→SHIP lifecycle via a TodoWrite list mapped to workflow phases. Use at the start of any development task to maintain workflow visibility.
---

# Workflow Tracker

Maintains a TodoWrite list mapped to the six workflow phases so the user always sees where they are and what comes next — without needing to memorize the workflow.

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
workflow-tracker/SKILL.md
```

- [ ] **Step 3: Commit**

```bash
git add skills/workflow-tracker.zip
git commit -m "chore: package workflow-tracker skill"
```

Expected: commit succeeds, 1 file changed.

---

## Verification Checklist

After all tasks complete, confirm:

- [ ] `skills/workflow-tracker/SKILL.md` exists and has valid frontmatter (`name`, `description`)
- [ ] `skills/workflow-tracker.zip` exists and contains `workflow-tracker/SKILL.md`
- [ ] No changes made to `AGENTS.md`, `CLAUDE.md`, or any other context file
- [ ] Two commits exist: skill file, zip
