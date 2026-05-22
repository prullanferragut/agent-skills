# Spec: Question Tooling — Replace Plain-Text Confirmations

## Objective

Replace all plain-text confirmation prompts in skill files with structured `question` tool calls. Users currently see raw text like `Yes / no / refine?` or `→ Correct me now or I'll proceed with these.` instead of interactive option lists. The `question` tool renders proper option lists with keyboard navigation; this is strictly better UX.

**User:** Any agent (Claude, OpenCode, Copilot, etc.) following a skill from this repo.

**Success looks like:** Every decision/confirmation point in the 19 affected skills instructs the agent to use the `question` tool with 2–4 concrete options. No plain-text `yes/no/refine` prompts remain.

## Tech Stack

- Markdown files only — no build system, no tests, no dependencies
- Skills live in `skills/<skill-name>/SKILL.md`
- `interview-me` is a local copy; it can be edited like any other skill in this repo

## Commands

```
Lint: grep -rn "Yes / No\|yes/no\|Y/N" skills/
Verify: manually read each changed SKILL.md and confirm no plain-text prompts remain
```

## Project Structure

```
skills/<skill-name>/SKILL.md   → skill definition files (only these are modified)
docs/specs/                    → this spec lives here
docs/tasks/                    → original task description
```

## Code Style

Skills are platform-agnostic prose. The `question` tool call is the **agent's responsibility at runtime**, not hardcoded markdown. Skills describe *when* and *why* to ask, and specify what options to offer. The agent then uses the `question` tool accordingly.

**Pattern to follow — before:**

```
→ Correct me now or I'll proceed with these.
```

**After:**

```
Use the `question` tool to ask whether to proceed with these assumptions. Offer: "Proceed", "Correct an assumption".
```

**Constraints:**

- Do NOT add `question` tool call syntax (JSON/code blocks) into the SKILL.md prose — skills are platform-agnostic
- DO instruct the agent to use the `question` tool with named options
- Keep wording concise; skill files should stay under 500 lines

## Decision Points Identified

The following 20 genuine user decision points were identified across 11 skills (8 of the 19 listed files have no genuine pause-and-ask points):

| Skill | Location | Decision | Options |
|---|---|---|---|
| `idea-refine` | Phase 1, sharpening questions | Gather sharpening input before generating variations | Ask questions / Skip |
| `idea-refine` | Phase 3 output | Save idea one-pager to disk | Save to default path / Save elsewhere / Don't save |
| `debugging-and-error-recovery` | Safety rules | Proceed with action found in error output | Proceed / Skip / Show me first |
| `using-agent-skills` | Assumption surfacing | Confirm assumptions before proceeding | Proceed / Correct an assumption |
| `using-agent-skills` | Confusion stop | Resolve conflicting requirements | Choose interpretation A / Choose interpretation B / Provide context |
| `incremental-implementation` | Out-of-scope notices | Create tasks for noticed issues | Create all / Create specific ones / Ignore |
| `ubiquitous-language` | Ambiguous context | Which bounded context applies | Context A / Context B / Spans multiple |
| `ubiquitous-language` | Naming conflict | Canonical name when conflict exists | Use existing / Use new / Use a third term |
| `ubiquitous-language` | Spec alias substitution | Replace alias in spec before editing | Replace all / Replace specific / Leave as-is |
| `context-engineering` | Spec vs. codebase conflict | Which pattern to follow | Follow spec / Follow existing patterns / Provide more context |
| `context-engineering` | Missing requirement | Behavior for unspecified edge case | Simplest / Strictest / Auto-disambiguate / Specify other |
| `spec-driven-development` | Assumption surfacing | Confirm assumptions before writing spec | Proceed / Correct an assumption |
| `spec-driven-development` | Reframed success criteria | Confirm derived targets are correct | Correct / Adjust / Wrong — specify |
| `code-review-and-quality` | Dead code deletion | Remove now-unused elements after refactor | Remove all / Remove specific / Leave in place |
| `interview-me` | After each question | Wait for user response (core mechanic — no change needed, already structured) | — |
| `interview-me` | Intent restatement | Confirm restatement is correct | Yes / No / Refine |
| `interview-me` | Delegation response | Choose between two concrete alternatives | Option A / Option B |
| `interview-me` | Save intent doc | Persist confirmed intent to file | Save / Don't save |
| `doubt-driven-development` | After single-model review | Escalate to cross-model review | Gemini CLI / Codex CLI / Manual / Skip |
| `doubt-driven-development` | After 3 unresolved cycles | How to proceed with unresolved artifact | Escalate / Ship with trade-offs / Decompose |

**Skills with no genuine pause-and-ask points (no changes needed):**

`test-driven-development`, `planning-and-task-breakdown`, `ubiquitous-language` (line 44 only — covered above), `ci-cd-and-automation`, `shipping-and-launch`, `workflow-tracker`, `security-and-hardening`, `code-simplification`, `performance-optimization`

> Note: `planning-and-task-breakdown` lines 122/223 are checklist items, not inline agent pause instructions. No change needed.

## Testing Strategy

No automated tests. Verification is manual:

1. After each skill is updated, grep for residual plain-text confirmation patterns
2. Read the updated section to confirm the `question` tool instruction is unambiguous
3. Final sweep: `grep -rn "Yes / No\|yes/no\|Y/N\|proceed with these\|Correct me now" skills/`

## Boundaries

- **Always:** Keep skill prose platform-agnostic; describe tool use in instructions, don't embed tool call syntax
- **Ask first:** Any change that alters the *meaning* of a decision point (not just its format)
- **Never:** Add `question` tool JSON/code-block syntax inside SKILL.md files; remove or merge decision points

## Success Criteria

- [ ] All 20 identified decision points instruct the agent to use the `question` tool with named options
- [ ] No plain-text `Yes / No`, `yes/no`, `Y/N`, `→ Correct me now`, or `proceed?` patterns remain at decision points
- [ ] No skill file exceeds its prior line count by more than 10 lines
- [ ] Skills that had no decision points are unchanged
- [ ] `interview-me` line 106 (`Yes / no / refine?`) is the one exception: it is example output text in a code block showing what the agent should present; the surrounding prose already instructs use of the question tool — verify and leave or update accordingly

## Open Questions

None — requirements are complete.
