# Implementation Plan: Question Tooling — Replace Plain-Text Confirmations

## Overview

Update 11 skill files to replace plain-text confirmation prompts with instructions to use the `question` tool. 20 decision points across 11 skills. All changes are prose edits to `SKILL.md` files — no build system, no tests, no dependencies.

## Architecture Decisions

- Skills remain platform-agnostic: no JSON/code-block tool call syntax in prose. Each change instructs the agent *to use* the `question` tool with named options.
- 8 of the 19 listed skills have no genuine pause-and-ask points and are left unchanged.
- Tasks are grouped by skill (one task per skill) since each skill is independent.

## Task List

All tasks are independent — they can be parallelized freely. Each task is XS–S scope (1 file, 1–4 prose edits).

---

### Phase 1: Skills with 1 decision point each (simplest)

- [ ] Task 1: `debugging-and-error-recovery` — 1 point (safety rule: confirm before executing actions from error output)
- [ ] Task 2: `code-review-and-quality` — 1 point (ask before deleting dead code)
- [ ] Task 3: `incremental-implementation` — 1 point (offer to create tasks for noticed out-of-scope issues)

### Checkpoint: Phase 1

- [ ] 3 files updated, grep shows no residual plain-text confirmation patterns in those files

---

### Phase 2: Skills with 2 decision points each

- [ ] Task 4: `using-agent-skills` — 2 points (assumption surfacing; confusion stop)
- [ ] Task 5: `spec-driven-development` — 2 points (assumption surfacing; reframed success criteria confirmation)
- [ ] Task 6: `doubt-driven-development` — 2 points (cross-model review offer; 3-cycle escalation)

### Checkpoint: Phase 2

- [ ] 6 files updated, grep clean

---

### Phase 3: Skills with 2–3 decision points (multi-point edits)

- [ ] Task 7: `ubiquitous-language` — 3 points (ambiguous context; naming conflict; spec alias substitution)
- [ ] Task 8: `context-engineering` — 2 points (spec vs. codebase conflict; missing requirement)
- [ ] Task 9: `idea-refine` — 2 points (sharpening questions gather; save one-pager offer) — also replaces `AskUserQuestion` reference with `question`

### Checkpoint: Phase 3

- [ ] 9 files updated, grep clean

---

### Phase 4: `interview-me` (most decision points, most nuanced)

- [ ] Task 10: `interview-me` — 4 points (intent restatement `Yes / no / refine?`; delegation response; save intent doc offer; verify core mechanic loop already implies structured questioning — update or leave as-is)

### Checkpoint: Phase 4

- [ ] 10 files updated, grep clean

---

### Phase 5: Final sweep and verification

- [ ] Task 11: Run final grep sweep across all 19 skills, confirm 8 untouched skills are unchanged, confirm no residual plain-text prompts remain at decision points

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Changing the *meaning* of a decision point while reformatting | Medium | Each task acceptance criterion requires meaning to be preserved — only the format changes |
| `interview-me` core loop is tightly coupled to its prose style | Low | The one-question-at-a-time loop is a behavioral instruction, not a UI call — only explicit `Yes / no / refine?` and save offer need updating |
| Skill file grows beyond 500 lines | Low | `question` tool instructions are concise; replacements should be net-neutral or shorter |

## Open Questions

None.
