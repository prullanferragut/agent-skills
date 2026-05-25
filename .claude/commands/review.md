---
description: Conduct a five-axis code review — correctness, readability, architecture, security, performance
---

Invoke the agent-skills:code-review-and-quality skill.

Review the current changes (staged or recent commits) across all five axes:

1. **Correctness** — Does it match the spec? Edge cases handled? Tests adequate?
2. **Readability** — Clear names? Straightforward logic? Well-organized?
3. **Architecture** — Follows existing patterns? Clean boundaries? Right abstraction level?
4. **Security** — Input validated? Secrets safe? Auth checked? (Use security-and-hardening skill)
5. **Performance** — No N+1 queries? No unbounded ops? (Use performance-optimization skill)

Categorize findings as Critical, Important, or Suggestion.
Output a structured review with specific file:line references and fix recommendations.

For significant architectural friction found in axis 3, surface deepening candidates using the vocabulary and candidate structure in agent-skills:code-review-and-quality. Do not propose a new interface inline — flag it as a follow-up task.
