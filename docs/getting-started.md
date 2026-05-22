# Getting Started with agent-skills

agent-skills works with any AI coding agent that accepts Markdown instructions. This guide covers the universal approach. For tool-specific setup, see the dedicated guides.

## How Skills Work

Each skill is a Markdown file (`SKILL.md`) that describes a specific engineering workflow. When loaded into an agent's context, the agent follows the workflow — including verification steps, anti-patterns to avoid, and exit criteria.

**Skills are not reference docs.** They're step-by-step processes the agent follows.

## Quick Start (Any Agent)

### 1. Clone the repository

```bash
git clone https://github.com/addyosmani/agent-skills.git
```

### 2. Choose a skill

Browse the `skills/` directory. Each subdirectory contains a `SKILL.md` with:
- **When to use** — triggers that indicate this skill applies
- **Process** — step-by-step workflow
- **Verification** — how to confirm the work is done
- **Common rationalizations** — excuses the agent might use to skip steps
- **Red flags** — signs the skill is being violated

### 3. Load the skill into your agent

Copy the relevant `SKILL.md` content into your agent's system prompt, rules file, or conversation. The most common approaches:

**System prompt:** Paste the skill content at the start of the session.

**Rules file:** Add skill content to your project's rules file (CLAUDE.md, .cursorrules, etc.).

**Conversation:** Reference the skill when giving instructions: "Follow the test-driven-development process for this change."

### 4. Use the meta-skill for discovery

Start with the `using-agent-skills` skill loaded. It contains a flowchart that maps task types to the appropriate skill.

## Recommended Setup

### Minimal (Start here)

Load three essential skills into your rules file:

1. **spec-driven-development** — For defining what to build
2. **test-driven-development** — For proving it works
3. **code-review-and-quality** — For verifying quality before merge

These three cover the most critical quality gaps in AI-assisted development.

### Full Lifecycle

For comprehensive coverage, load skills by phase:

```
Starting a project:  spec-driven-development → planning-and-task-breakdown
During development:  incremental-implementation + test-driven-development
Before merge:        code-review-and-quality + security-and-hardening
Before deploy:       shipping-and-launch
```

### Context-Aware Loading

Don't load all skills at once — it wastes context. Load skills relevant to the current task:

- Working on UI? Load `frontend-ui-engineering`
- Debugging? Load `debugging-and-error-recovery`
- Setting up CI? Load `ci-cd-and-automation`

## Skill Anatomy

Every skill follows the same structure:

```
YAML frontmatter (name, description)
├── Overview — What this skill does
├── When to Use — Triggers and conditions
├── Core Process — Step-by-step workflow
├── Examples — Code samples and patterns
├── Common Rationalizations — Excuses and rebuttals
├── Red Flags — Signs the skill is being violated
└── Verification — Exit criteria checklist
```

See [skill-anatomy.md](skill-anatomy.md) for the full specification.

## Using Agents

The `agents/` directory contains pre-configured agent personas:

| Agent | Purpose |
|-------|---------|
| `code-reviewer.md` | Five-axis code review |
| `test-engineer.md` | Test strategy and writing |
| `security-auditor.md` | Vulnerability detection |

Load an agent definition when you need specialized review. For example, ask your coding agent to "review this change using the code-reviewer agent persona" and provide the agent definition.

## Using Commands

The `.claude/commands/` directory contains slash commands for Claude Code:

| Command | Skill Invoked |
|---------|---------------|
| `/spec` | spec-driven-development |
| `/plan` | planning-and-task-breakdown |
| `/build` | incremental-implementation + test-driven-development |
| `/test` | test-driven-development |
| `/review` | code-review-and-quality |
| `/ship` | shipping-and-launch |

## Using References

The `references/` directory contains supplementary checklists:

| Reference | Use With |
|-----------|----------|
| `testing-patterns.md` | test-driven-development |
| `performance-checklist.md` | performance-optimization |
| `security-checklist.md` | security-and-hardening |
| `accessibility-checklist.md` | frontend-ui-engineering |

Load a reference when you need detailed patterns beyond what the skill covers.

## Using superpowers + agent-skills together

If you are running the `superpowers` process backbone alongside `agent-skills`, see [superpowers-workflow.md](superpowers-workflow.md) for a full phase-by-phase reference: which skills fire at each phase, what the hard gates are, and common mistakes to watch for.

## Spec and task artifacts

The `/spec` and `/plan` commands create working artifacts (`SPEC.md`, `tasks/plan.md`, `tasks/todo.md`). Treat them as **living documents** while the work is in progress:

- Keep them in version control during development so the human and the agent have a shared source of truth.
- Update them when scope or decisions change.
- If your repo doesn’t want these files long‑term, delete them before merge or add the folder to `.gitignore` — the workflow doesn’t require them to be permanent.

## Tips

1. **Start with spec-driven-development** for any non-trivial work
2. **Always load test-driven-development** when writing code
3. **Don't skip verification steps** — they're the whole point
4. **Load skills selectively** — more context isn't always better
5. **Use the agents for review** — different perspectives catch different issues

---

## End-to-End Workflow Example

This walkthrough traces a single task — "add a tagging feature to a task manager" — through the full skill lifecycle. It shows which skill fires at each phase, what layer of the three-layer architecture handles it (skill / persona / command), and what artifact is produced.

### The Three Layers

Before the walkthrough, here is how the three layers interact:

| Layer | What it is | Examples |
|-------|-----------|---------|
| **Skills** | Step-by-step workflows the agent follows | `spec-driven-development`, `test-driven-development` |
| **Personas** | Role-scoped agents invoked for review or analysis | `code-reviewer`, `security-auditor`, `test-engineer` |
| **Commands** | Entry points that orchestrate skills and personas | `/spec`, `/build`, `/ship` |

The user calls a command. The command loads a skill. The skill may invoke a persona. Skills and personas never call each other directly — the command is the orchestrator.

### Walkthrough: "Add tagging to tasks"

| Phase | What happens | Layer | Skill / Persona / Command | Output |
|-------|-------------|-------|---------------------------|--------|
| **1. Define** | User runs `/spec`. Agent runs `interview-me` to surface the real requirement (tags per task, not per user; no tag hierarchy needed). | Command → Skill | `/spec` → `spec-driven-development` | `SPEC.md` with acceptance criteria |
| **2. Align vocabulary** | "Tag" appears in the spec without a definition. Agent runs `ubiquitous-language` and adds `Tag` to `CONTEXT.md`. | Skill | `ubiquitous-language` | `CONTEXT.md` updated |
| **3. Plan** | User runs `/plan`. Agent applies `vertical-slicing` to produce three slices: create tag, assign tag to task, filter tasks by tag. Tracer bullet is Slice 1. | Command → Skill | `/plan` → `vertical-slicing` → `planning-and-task-breakdown` | `tasks/plan.md`, `tasks/todo.md` |
| **4. Build – Slice 1** | User runs `/build`. Agent loads `incremental-implementation` and `test-driven-development`. Writes a failing test for "create tag," implements the minimum schema + API + UI, makes test pass, commits. | Command → Skill | `/build` → `incremental-implementation` + `test-driven-development` | Passing tests, committed slice |
| **5. Build – Slices 2–3** | Agent repeats the increment cycle for each remaining slice. Each slice is independently committed. | Skill | `incremental-implementation` + `test-driven-development` | Full feature committed |
| **6. Review** | User runs `/review`. Agent invokes the `code-reviewer` persona for a five-axis review. | Command → Persona | `/review` → `code-reviewer` | Review report with findings |
| **7. Ship** | User runs `/ship`. Three personas run in parallel (`code-reviewer`, `security-auditor`, `test-engineer`). Main agent merges reports. | Command → Personas | `/ship` → `code-reviewer` + `security-auditor` + `test-engineer` | GO / NO-GO report with rollback plan |

### What "parallel fan-out" looks like in practice

When `/ship` runs, the main agent issues three subagent calls in a single turn:

```
Main agent:
  → [concurrent] code-reviewer:    "Review the staged diff for correctness, readability, architecture, security, performance"
  → [concurrent] security-auditor: "Run a vulnerability pass against the staged diff"
  → [concurrent] test-engineer:    "Analyze test coverage for the staged diff"

Main agent waits for all three, then merges into a GO/NO-GO report.
```

For a full example of what that merged report looks like, see [ship-output-example.md](ship-output-example.md).

### Key insight: skills chain, not stack

A common mistake is thinking you need to load all skills at once. Skills chain — you load the skill for the current phase and move to the next skill when that phase completes. The session-start hook in `using-agent-skills` keeps the discovery flowchart always in context; individual skills load on demand.
