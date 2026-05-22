# Task: Improvement on Question Tooling and Plain Text Confirmations

## Problem

Approximately 19 skills in this repo use plain text confirmations (`yes / no / refine?`, `approve?`, `proceed?`, etc.) instead of the OpenCode `question` tool. This means users see raw text prompts rather than structured interactive forms.

OpenCode's `question` tool renders proper option lists with keyboard navigation. Users can select from provided options or type a custom answer. This is strictly better UX than plain text.

## Affected Files

Identified via `grep -rl "yes.*no.*refine\|Yes / No\|yes/no\|confirm\|approve\|proceed"`:

- `skills/idea-refine/SKILL.md`
- `skills/debugging-and-error-recovery/SKILL.md`
- `skills/using-agent-skills/SKILL.md`
- `skills/test-driven-development/SKILL.md`
- `skills/planning-and-task-breakdown/SKILL.md`
- `skills/incremental-implementation/SKILL.md`
- `skills/ubiquitous-language/SKILL.md`
- `skills/ci-cd-and-automation/SKILL.md`
- `skills/context-engineering/SKILL.md`
- `skills/shipping-and-launch/SKILL.md`
- `skills/workflow-tracker/SKILL.md`
- `skills/spec-driven-development/SKILL.md`
- `skills/code-review-and-quality/SKILL.md`
- `skills/security-and-hardening/SKILL.md`
- `skills/deprecation-and-migration/SKILL.md`
- `skills/interview-me/SKILL.md`
- `skills/code-simplification/SKILL.md`
- `skills/doubt-driven-development/SKILL.md`
- `skills/performance-optimization/SKILL.md`

## Work

For each affected skill:

1. Identify all confirmation/decision points (not informational output — only places where the agent pauses for user input)
2. Replace plain text prompts with `question` tool calls
3. Provide 2–4 concrete options per question (e.g., `Yes`, `No`, `Refine`) — OpenCode adds a free-text option automatically

## Notes

- `skills/interview-me/SKILL.md` is a local copy — the superpowers package version cannot be edited here
- The `question` tool docs: https://opencode.ai/docs/tools/#question
- Skills must remain platform-agnostic in their instructions; the `question` tool call is the agent's responsibility at runtime, not hardcoded in the skill prose
