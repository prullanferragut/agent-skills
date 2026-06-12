---
name: spec-driven-development
description: Discovers what to build and writes a structured specification before any code. Use when starting a new project, feature, or significant change. Use when requirements are unclear, ambiguous, or only exist as a vague idea. Also triggers on "interview me", "grill me", "are we sure?", "stress-test my thinking", or any underspecified ask ("build me X" without "for whom" or "why now").
---

# Spec-Driven Development

## Overview

What people ask for and what they actually want are different things. Before writing any code, this skill runs two sequential gates: first it confirms the *intent* (when the ask is underspecified), then it formalizes the *spec* (always). Code without a spec is guessing. A spec without confirmed intent is guessing twice.

## When to Use

- Starting a new project or feature
- Requirements are ambiguous or incomplete
- The change touches multiple files or modules
- You're about to make an architectural decision
- The task would take more than 30 minutes to implement
- The ask is missing at least one of: **who** the user is, **why** they want it, what **success** looks like, what the binding **constraint** is
- The user explicitly invokes: "interview me", "grill me", "before we start, are we sure?", "stress-test my thinking"

**When NOT to use:** Single-line fixes, typo corrections, renames, or changes where requirements are unambiguous and self-contained.

## Loading Constraints

Phase 0 needs a live, responsive user. **Do not run Phase 0 in non-interactive contexts** (CI pipelines, scheduled runs, autonomous-loop). If the context is non-interactive and the ask is underspecified, flag it as a blocker instead of guessing. Default to non-interactive when uncertain — the cost of a blocker note is lower than hanging an autonomous loop.

## The Gated Workflow

```
INTERVIEW ──→ SPECIFY ──→ PLAN ──→ TASKS ──→ IMPLEMENT
(if needed)      │          │        │          │
    │            ▼          ▼        ▼          ▼
    ▼          Human      Human    Human      Human
 ~95%          reviews   reviews  reviews    reviews
 intent
 confirmed
```

**Entry gate:** If the ask is concrete — you can name outcome, user, success criteria, and constraint without guessing — skip Phase 0 and go directly to Phase 1. If any of those four are missing, run Phase 0 first.

Do not advance to the next phase until the current one is validated.

---

## Phase 0: Interview (run when ask is underspecified)

### Step 1: Hypothesize, with a confidence number

Before asking anything, write down your current best read in **one sentence** plus an honest confidence number (0–100%):

```
HYPOTHESIS: You want a way to answer "how are we doing?" in standup, and "dashboard" came to mind.
CONFIDENCE: ~30%
```

The number forces honesty. If you wrote a high number but can't predict the user's reactions to the next three questions, the number is wrong. Start at the confidence level you can defend.

### Step 2: Ask one question at a time, each with a guess attached

```
Q: <one focused question>
GUESS: <your hypothesis for the answer, with the reasoning that produced it>
```

Wait for the user to react before asking the next question. Do not batch — the third question often depends on the answer to the first. Attaching a guess makes the user react faster and commits you to a hypothesis you can be visibly wrong about. Mitigate sycophancy by being visibly willing to be wrong, and occasionally guessing in a direction you expect the user to push back on.

### Step 3: Listen for "want vs. should want"

Watch for sophistication-signaling answers: "scalable", "clean architecture", "the standard approach", "I should probably…". When you hear these, ask:

> *"If you didn't have to justify this to anyone, what would you actually want?"*

That single question often does more work than the previous five.

### Step 4: Restate intent in the user's own words

When confidence is high, write back what you now think the user wants:

```
Here's what I now think you want:

- Outcome:       <one line>
- User:          <one line — who benefits>
- Why now:       <one line — what changed>
- Success:       <one line — how we know it worked>
- Constraint:    <one line — the binding limit>
- Out of scope:  <one line — what we're explicitly not doing>
- Risks to flag: <one line — regulated data, legal, ethical concerns; omit if none>

Yes / no / refine?
```

Collect the response using the `question` tool: "Yes — this is correct, proceed", "No — one or more lines are wrong (specify)", "Refine — partially correct, needs adjustment".

Including "Out of scope" is non-negotiable. Half of misalignment is silent disagreement about what is *not* being built. Populate "Risks to flag" when the interview surfaced anything touching regulated data (HIPAA, GDPR, PCI), third-party terms of service, or the welfare of people not in the conversation.

### Step 5: Confirm — explicit yes only

The gate is an explicit "yes." The following are **not** yes:

- "Whatever you think is best." → Delegation. Re-ask with two concrete options using the `question` tool.
- "Sounds good." → Ambiguous. Ask: "Anything you'd refine?"
- "Sure, let's go." → Often a polite exit. Same follow-up.

> **Delegation loop cap:** If the user delegates three or more times in a row without engaging substantively, stop. Say: "I need at least one substantive answer to proceed — I won't guess." Do not proceed to a spec without an explicit answer.

### The 95% Confidence Stop

Done when you can answer yes to:

> *Can I predict the user's reaction to the next three questions I would ask?*

If you've gone several rounds and still can't predict, say: "I've asked X questions and I still can't predict your reactions. Something foundational is missing. Want to step back?"

**Handoff to Phase 1:** Pass the complete restate (all fields, including Out of scope and Risks to flag) as starting context for the spec. Do not summarize or truncate — silently dropping Out of scope is the most common source of downstream scope creep.

---

## Phase 1: Specify

**Check the domain model first.** Four steps in order: (1) check the domain model, (2) consider a prototype for uncertain design questions, (3) surface assumptions, (4) write the spec.

Before writing any spec content, look for:
- `CONTEXT.md` at the repo root — the project glossary. Any term you use in the spec should either be in here or be explicitly new.
- `docs/adr/` — architectural decisions that constrain the design space. Don't spec something an ADR has already ruled out without surfacing the conflict.

If terminology is fuzzy or conflicts with `CONTEXT.md`, run the grilling loop before writing:

1. **Discover existing context.** Look for `CONTEXT-MAP.md` first — if it exists, find the relevant bounded context and read that context's `CONTEXT.md`. If only a root `CONTEXT.md` exists, read it. If neither exists, create `CONTEXT.md` lazily when the first term is ready (heading `# Context: [Project Name]`, section `## Language`).

2. **Check for conflict.** Does `CONTEXT.md` already define this concept under a different name? If so, use the `question` tool: "Use the existing term as canonical, mark new term as alias", "Use the new term as canonical, update existing references", or "Define a third term (specify)".

3. **Interview one at a time.** Provide your recommended definition before asking. Stop when no contested terms remain. If a term is contested for three consecutive exchanges without resolution, document the ambiguity in Open Questions and proceed.

4. **Write the entry** under `## Language` immediately — do not batch:
   ```
   **[Term]**:
   [One or two sentences. What it IS, not what it does. No implementation details.]
   _Avoid_: [synonym], [alias]
   ```
   If the term's boundaries with related concepts are non-obvious, add a short example dialogue that shows where one concept ends and another begins.

5. **CONTEXT.md constraints:** glossary only — no class names, table names, API paths, specs, plans, or general programming concepts a reader could infer without domain knowledge.

6. **Scan for alias drift.** After adding an entry, search all in-progress spec files for any terms listed under `_Avoid_`. If found, use the `question` tool: "Replace all alias occurrences with the canonical name", "Leave as-is for now", or "Replace only specific occurrences (specify)".

7. **Offer an ADR** only when a decision is hard to reverse, surprising without context, and the result of a real trade-off. See `documentation-and-adrs` for the format and the 3-condition threshold.

**Consider a prototype before speccing.** If a key design question is uncertain:
- **"Does this logic / state model feel right?"** → Build a small interactive terminal app. Minimal state in memory, simple REPL or menu loop, print full state after every action. One command to run. No tests, no persistence, no abstractions.
- **"What should this look like?"** → Generate 3–4 UI variations on a single route, toggled via `?variant=` and a floating bottom bar. One command to run using the existing dev server.

Rules: name it as a prototype, locate it near the code it explores, no polish, delete it when done. Capture the decision in a commit message or ADR before deleting.

> **Loop-back constraint:** If new questions from the prototype are architectural, return to Phase 1 and resolve them before writing spec content. Limit to one iteration — if a second prototype also raises architectural questions, document the open questions, proceed with explicit uncertainty, and mark those sections as provisional.

**Surface assumptions immediately.** Before writing any spec content:

```
ASSUMPTIONS I'M MAKING:
1. This is a web application (not native mobile)
2. Authentication uses session-based cookies (not JWT)
3. The database is PostgreSQL (based on existing Prisma schema)
4. We're targeting modern browsers only (no IE11)
```

Use the `question` tool: "Proceed with these assumptions" or "Correct an assumption".

> **Confirmed assumptions become Boundaries.** Translate each into an entry in the spec's Boundaries section under "Always" or "Never". Example: "targeting modern browsers only" → `Never: use APIs or polyfills targeting IE11 or pre-Chromium Edge`.

**Write a spec document covering these six core areas:**

1. **Objective** — What are we building and why? Who is the user? What does success look like?
   *(If Phase 0 ran, seed this directly from the confirmed restate: Outcome → objective, User → user, Success → success criteria, Out of scope → Boundaries/Never.)*

2. **Commands** — Full executable commands with flags.
   ```
   Build: npm run build
   Test:  npm test -- --coverage
   Lint:  npm run lint --fix
   Dev:   npm run dev
   ```

3. **Project Structure** — Where source code lives, where tests go, where docs belong.

4. **Code Style** — One real code snippet showing your style beats three paragraphs describing it.

5. **Testing Strategy** — Framework, test locations, coverage expectations, test levels.

6. **Boundaries** — Three-tier system:
   - **Always do:** Run tests before commits, follow naming conventions, validate inputs
   - **Ask first:** Database schema changes, adding dependencies, changing CI config
   - **Never do:** Commit secrets, edit vendor directories, remove failing tests without approval
   > For each "Never" boundary that is automatically enforceable (linter rule, pre-commit hook, CI check), name the enforcement mechanism. An unenforced "Never" is advisory — it will be bypassed under pressure.

**Spec template:**

```markdown
# Spec: [Project/Feature Name]

## Objective
[What we're building and why. User stories or acceptance criteria.]

## Tech Stack
[Framework, language, key dependencies with versions]

## Commands
[Build, test, lint, dev — full commands]

## Project Structure
[Directory layout with descriptions]

## Code Style
[Example snippet + key conventions]

## Testing Strategy
[Framework, test locations, coverage requirements, test levels]

## Boundaries
- Always: [...]
- Ask first: [...]
- Never: [...]

## Success Criteria
[How we'll know this is done — specific, testable conditions]

## Open Questions
[Anything unresolved that needs human input]
```

**Reframe vague instructions as success criteria:**

```
REQUIREMENT: "Make the dashboard faster"

REFRAMED SUCCESS CRITERIA:
- Dashboard LCP < 2.5s on 4G connection
- Initial data load completes in < 500ms
- No layout shift during load (CLS < 0.1)
```

After presenting reframed criteria, confirm with the `question` tool: "Yes, these are correct", "Adjust one or more targets", "No — these are wrong (specify)".

> **Open Questions gate:** Before advancing to Phase 2, review Open Questions. If any question represents material architectural uncertainty (a question whose answer would change the system design or data model), stop and surface it. Do not begin planning with unresolved architectural uncertainty — the plan will be wrong.

---

## Phase 2: Plan

With the validated spec, generate a technical implementation plan:

1. Identify the major components and their dependencies
2. Determine the implementation order (what must be built first)
3. Note risks and mitigation strategies
4. Identify what can be built in parallel vs. sequentially
5. Define verification checkpoints between phases

The plan should be reviewable: the human should be able to say "yes, that's the right approach" or "no, change X."

---

## Phase 3: Tasks

Break the plan into discrete, implementable tasks:

- Each task completable in a single focused session
- Each task has explicit acceptance criteria
- Each task includes a verification step (test, build, manual check)
- Tasks ordered by dependency, not perceived importance
- No task should require changing more than ~5 files

**Task template:**
```markdown
- [ ] Task: [Description]
  - Acceptance: [What must be true when done]
  - Verify: [How to confirm — test command, build, manual check]
  - Files: [Which files will be touched]
```

---

## Phase 4: Implement

Execute tasks one at a time following `incremental-implementation` and `test-driven-development`. **Do not begin the next task until the current task's Verify step passes.** Use `context-engineering` to load the right spec sections and source files at each step rather than flooding the agent with the entire spec.

---

## Keeping the Spec Alive

The spec is a living document, not a one-time artifact:

- **Update when decisions change** — Update the spec first, then implement.
- **Update when scope changes** — Features added or cut must be reflected in the spec.
- **Commit the spec** — The spec belongs in version control alongside the code.
- **Reference the spec in PRs** — Link back to the spec section that each PR implements.

---

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The ask is clear enough" | If you can't write the user's desired outcome in one sentence right now, it isn't clear. Run Phase 0 before deciding. |
| "Asking questions wastes their time" | 4–6 targeted questions are small. Building the wrong thing is enormous, and the user bears that cost. |
| "They said 'whatever you think,' so I should decide" | "Whatever you think" is delegation, not decision. Re-ask with two concrete options. |
| "I'll figure it out as I build" | Switching costs after code exists are 10x what they are now. Discovery during implementation is rework. |
| "I'll write the spec after I code it" | That's documentation, not specification. The spec's value is in forcing clarity *before* code. |
| "The spec will slow us down" | A 15-minute spec prevents hours of rework. Waterfall in 15 minutes beats debugging in 15 hours. |

---

## Red Flags

- Starting to write code without any written requirements
- Asking "should I just start building?" before clarifying what "done" means
- Three or more questions in a single message (batching, not interviewing)
- A question in Phase 0 without your hypothesis attached (surveying, not committing)
- Accepting "whatever you think is best" as a terminal answer
- The user gives a sophistication-signaling answer ("scalable", "clean", "modern") and you accept it without probing
- Implementing features not mentioned in any spec or task list
- Making architectural decisions without documenting them
- Skipping Phase 0 when the ask is missing who, why, success, or constraint
- Skipping the "Out of scope" line in the intent restate

---

## Verification

After Phase 0 (if it ran):
- [ ] An explicit hypothesis with a confidence number was stated in the first turn
- [ ] Questions were asked one at a time, each with the agent's guess attached
- [ ] At least one "what would you actually want if you didn't have to justify it?" probe ran when the user gave a sophistication-signaling answer
- [ ] A concrete restate (Outcome / User / Why now / Success / Constraint / Out of scope) was written back to the user
- [ ] The user confirmed the restate with an explicit yes (not "whatever you think," not "sounds good," not silence)

Before proceeding to implementation (after Phase 1):
- [ ] The spec covers all six core areas
- [ ] The human has reviewed and approved the spec
- [ ] Success criteria are specific and testable
- [ ] Boundaries (Always/Ask First/Never) are defined
- [ ] The spec is saved to a file in the repository
