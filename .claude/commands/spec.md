---
description: Start spec-driven development — write a structured specification before writing code
---

Invoke the agent-skills:spec-driven-development skill.

Begin by understanding what the user wants to build. Ask clarifying questions about:
1. The objective and target users
2. Core features and acceptance criteria
3. Tech stack preferences and constraints
4. Known boundaries (what to always do, ask first about, and never do)

Then generate a structured spec covering all six core areas: objective, commands, project structure, code style, testing strategy, and boundaries.

Save the spec as SPEC.md in the project root and confirm with the user before proceeding.

Before writing the spec, check for `CONTEXT.md` and `docs/adr/`. If terminology is fuzzy or contested, run the domain-grounding grilling loop in the agent-skills:spec-driven-development skill before writing anything.

If a key design question is too uncertain to spec directly, build a throwaway prototype first using the prototype branch in agent-skills:spec-driven-development, then return to speccing.
