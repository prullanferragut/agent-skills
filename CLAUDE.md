---
name: claude-setup
description: Setup and configuration documentation for the agent-skills Claude plugin.
---

# agent-skills

This is the agent-skills project — a collection of production-grade engineering skills for AI coding agents.

## Project Structure

```
skills/       → Core skills (SKILL.md per directory)
agents/       → Reusable agent personas (code-reviewer, test-engineer, security-auditor)
hooks/        → Session lifecycle hooks
.claude/commands/ → Slash commands (/spec, /plan, /build, /test, /review, /code-simplify, /ship)
references/   → Supplementary checklists (testing, performance, security, accessibility)
docs/         → Setup guides for different tools
```

## Skills by Phase

**SPEC:** spec-driven-development, idea-refine, ubiquitous-language
**PLAN:** planning-and-task-breakdown
**BUILD:** incremental-implementation, test-driven-development, context-engineering, source-driven-development, doubt-driven-development, frontend-ui-engineering, api-and-interface-design
**TEST:** test-driven-development, browser-testing-with-devtools, debugging-and-error-recovery
**REVIEW:** code-review-and-quality, security-and-hardening, performance-optimization
**SIMPLIFY:** code-simplification
**SHIP:** git-workflow-and-versioning, ci-cd-and-automation, deprecation-and-migration, documentation-and-adrs, shipping-and-launch
**Meta:** workflow-tracker, using-agent-skills

## Conventions

- Every skill lives in `skills/<name>/SKILL.md`
- YAML frontmatter with `name` and `description` fields
- Description starts with what the skill does (third person), followed by trigger conditions ("Use when...")
- Every skill has: Overview, When to Use, Process, Common Rationalizations, Red Flags, Verification
- References are in `references/`, not inside skill directories
- Supporting files only created when content exceeds 100 lines

## Commands

- `npm test` — `node scripts/validate-skills.js && node scripts/score-response.test.js && bash hooks/session-start-test.sh`
- Validate: `node scripts/validate-skills.js` — checks YAML frontmatter (name, description), name matches directory, description ≤ 1024 chars, required sections present (Overview, When to Use, Common Rationalizations, Red Flags, Verification), and cross-skill references point to known skills

## Boundaries

- Always: Follow the skill-anatomy.md format for new skills
- Never: Add skills that are vague advice instead of actionable processes
- Never: Duplicate content between skills — reference other skills instead
