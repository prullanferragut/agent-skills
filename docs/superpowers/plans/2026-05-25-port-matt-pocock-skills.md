# Port Matt Pocock Skills — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fold six Matt Pocock workflows into four existing skills and four commands. No new skill directories are created.

**Architecture:** All content is merged in-place. Each existing skill gets one focused expansion. Commands get updated references to trigger the new behaviour.

**Tech Stack:** Markdown only.

---

## Folding Map

| Matt Pocock workflow                  | Folds into                          | Where                                      |
|---------------------------------------|-------------------------------------|--------------------------------------------|
| `diagnose` — 6-phase feedback loop    | `debugging-and-error-recovery`      | Replaces / expands the Reproduce step      |
| `grill-with-docs` — domain stress-test| `spec-driven-development`           | New step in Phase 1                        |
| `prototype` — logic/UI branches       | `spec-driven-development`           | New step in Phase 1                        |
| `zoom-out` — module map               | `incremental-implementation`        | New Rule -1 before Rule 0                  |
| `handoff` — session continuity doc    | `context-engineering`               | New section at end of skill                |
| `improve-codebase-architecture`       | `code-review-and-quality`           | Expands Architecture axis (axis 3)         |

---

## Task 1: Expand `debugging-and-error-recovery` with diagnose

Fold the 6-phase feedback-loop-first workflow into the existing Reproduce step. The current skill has a thin decision tree; replace it with the full loop-construction discipline.

**Files:**
- Modify: `skills/debugging-and-error-recovery/SKILL.md`

- [ ] **Step 1: Read the current Reproduce section to locate the insertion point**

```bash
grep -n "Step 1\|Reproduce\|non-reproducible\|Step 2\|Localize" skills/debugging-and-error-recovery/SKILL.md
```

- [ ] **Step 2: Replace the content of `### Step 1: Reproduce` with the expanded version**

Replace everything under `### Step 1: Reproduce` (up to but not including `### Step 2: Localize`) with:

```markdown
### Step 1: Reproduce — Build a feedback loop first

**The feedback loop is the skill.** Before hypothesising or instrumenting anything, build a fast, deterministic, agent-runnable pass/fail signal. Everything else (bisection, hypothesis-testing, instrumentation) consumes that signal. Without it, no amount of code-reading will reliably find the cause.

#### Ways to construct a loop — try in roughly this order

1. **Failing test** at whatever seam reaches the bug — unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture input, diffing stdout against a known-good snapshot.
4. **Headless browser script** (Playwright/Puppeteer) — drives the UI, asserts on DOM/console/network.
5. **Replay a captured trace.** Save a real network request/payload/event log to disk; replay it through the code path in isolation.
6. **Throwaway harness.** Spin up a minimal subset of the system (one service, mocked deps) that exercises the bug code path with a single function call.
7. **Property / fuzz loop.** If the bug is "sometimes wrong output", run 1000 random inputs and look for the failure mode.
8. **Bisection harness.** If the bug appeared between two known states (commit, dataset, version), automate "boot at state X, check, repeat" so you can `git bisect run` it.
9. **Differential loop.** Run the same input through old-version vs new-version (or two configs) and diff outputs.

Once you have a loop, improve it:
- Can I make it faster? (Cache setup, skip unrelated init, narrow scope.)
- Can I make the signal sharper? (Assert on the specific symptom, not "didn't crash".)
- Can I make it more deterministic? (Pin time, seed RNG, isolate filesystem, freeze network.)

#### Non-deterministic bugs

The goal is not a clean repro but a higher reproduction rate. Loop 100×, parallelise, add stress, narrow timing windows, inject sleeps. A 50%-flake bug is debuggable; 1% is not — keep raising the rate until it is.

#### When you genuinely cannot build a loop

Stop and say so explicitly. List what you tried. Ask the user for: (a) access to whatever environment reproduces it, (b) a captured artifact (HAR file, log dump, core dump), or (c) permission to add temporary production instrumentation. Do **not** proceed to Step 2 without a loop.

```
Can you reproduce the failure with a reliable loop?
├── YES → Proceed to Step 2
└── NO
    ├── Work through the loop-construction list above
    ├── For timing-dependent bugs: add stress, parallelise, inject sleeps
    ├── For environment-dependent bugs: compare versions, env vars, data state
    ├── For state-dependent bugs: check leaked state, globals, shared caches
    └── If truly impossible: document conditions, add defensive logging, revisit when it recurs
```
```

- [ ] **Step 3: Add hypothesise and instrument steps after Localize and Reduce**

After `### Step 3: Reduce`, add a new `### Step 3b: Hypothesise` section:

```markdown
### Step 3b: Hypothesise

Generate **3–5 ranked hypotheses** before testing any of them. Single-hypothesis generation anchors on the first plausible idea.

Each hypothesis must be falsifiable:

> "If X is the cause, then changing Y will make the bug disappear / changing Z will make it worse."

Show the ranked list to the user before testing — they often have domain knowledge that re-ranks instantly. Proceed with your ranking if the user is unavailable.

**Instrument one variable at a time.** Each probe maps to a specific prediction. Tool preference:
1. **Debugger / REPL inspection** if the env supports it. One breakpoint beats ten logs.
2. **Targeted logs** at the boundaries that distinguish hypotheses.
3. Never "log everything and grep".

Tag every debug log with a unique prefix, e.g. `[DEBUG-a4f2]`. Cleanup at the end becomes a single grep.
```

- [ ] **Step 4: Add post-mortem note to Step 5 (Guard Against Recurrence)**

At the end of `### Step 5: Guard Against Recurrence`, append:

```markdown
**Post-mortem:** After the fix is in, ask: what would have prevented this bug? If the answer involves architectural change — no good test seam existed, modules were too tightly coupled — note it for an architecture review. The `code-review-and-quality` Architecture axis covers how to assess this.

Remove all `[DEBUG-...]` instrumentation before closing (grep the prefix).
```

- [ ] **Step 5: Verify**

```bash
grep -n "feedback loop\|loop-construction\|Hypothesise\|DEBUG-" skills/debugging-and-error-recovery/SKILL.md
```
Expected: matches for all four terms.

- [ ] **Step 6: Commit**

```bash
git add skills/debugging-and-error-recovery/SKILL.md
git commit -m "feat: expand debugging-and-error-recovery with 6-phase feedback-loop-first workflow"
```

---

## Task 2: Expand `spec-driven-development` with grill-with-docs and prototype

Add two new steps to Phase 1: domain-model grounding (from `grill-with-docs`) and a prototype branch (from `prototype`).

**Files:**
- Modify: `skills/spec-driven-development/SKILL.md`

- [ ] **Step 1: Locate the insertion point**

```bash
grep -n "Surface assumptions\|high-level vision\|clarifying questions" skills/spec-driven-development/SKILL.md
```

- [ ] **Step 2: Add domain-grounding step after the opening sentence of Phase 1**

After "Start with a high-level vision. Ask the human clarifying questions until requirements are concrete." add:

```markdown
**Check the domain model first.** Before writing any spec content, look for:

- `CONTEXT.md` at the repo root — the project glossary. Any term you use in the spec should either be in here or be explicitly new.
- `docs/adr/` — architectural decisions that constrain the design space. Don't spec something an ADR has already ruled out without surfacing the conflict.

If terminology in the requirements is fuzzy or conflicts with `CONTEXT.md`, run the following grilling loop before writing anything:

1. Interview the user one question at a time about each contested term.
2. Provide your recommended definition before asking.
3. When a term is resolved, update `CONTEXT.md` immediately — don't batch.
4. `CONTEXT.md` is a glossary only: no implementation details, no file paths. Format:
   ```
   ### [Term]
   [One or two sentences. What it is. What it is not.]
   ```
5. Offer an ADR only when a decision is hard to reverse, surprising without context, and the result of a real trade-off. Skip it otherwise.
```

- [ ] **Step 3: Add prototype branch step after the domain-grounding step**

Immediately after the domain-grounding block, add:

```markdown
**Consider a prototype before speccing.** If a key design question is uncertain — "does this state model feel right?" or "what should this look like?" — answer it with a throwaway prototype rather than speccing something you'll need to re-spec.

Pick the branch that matches the question:

- **"Does this logic / state model feel right?"** → Build a small interactive terminal app. Implement minimal state transitions in memory, wire a simple REPL or menu loop, print full state after every action. One command to run. No tests, no persistence, no abstractions.
- **"What should this look like?"** → Generate 3–4 radically different UI variations on a single route, toggled via a `?variant=` URL param and a floating bottom bar. One command to run using the existing dev server.

Rules for both: name it clearly as a prototype, locate it near the code it explores, no polish, delete it when done. Capture the answer in a commit message, ADR, or `NOTES.md` before deleting. Once the question is answered, return here and write the spec against the validated decision.
```

- [ ] **Step 4: Verify**

```bash
grep -c "CONTEXT.md\|prototype\|state model" skills/spec-driven-development/SKILL.md
```
Expected: at least 3 matches total.

- [ ] **Step 5: Commit**

```bash
git add skills/spec-driven-development/SKILL.md
git commit -m "feat: expand spec-driven-development with domain grounding and prototype branch"
```

---

## Task 3: Expand `incremental-implementation` with zoom-out

Add Rule -1 before Rule 0: map before you touch unfamiliar code.

**Files:**
- Modify: `skills/incremental-implementation/SKILL.md`

- [ ] **Step 1: Locate Rule 0**

```bash
grep -n "Rule 0\|Simplicity First" skills/incremental-implementation/SKILL.md
```

- [ ] **Step 2: Insert Rule -1 immediately before Rule 0**

```markdown
### Rule -1: Map before you touch

If the code area you're about to change is unfamiliar, build a module map before writing a single line:

1. **Identify the entry point** — the function, file, or module where work will happen.
2. **Map upward (callers)** — who calls this? Who calls them? Go up two levels unless the graph is very shallow.
3. **Map downward (dependencies)** — what does this depend on? Identify direct dependencies and their interfaces — you don't need their internals, just what they expose.
4. **Identify seams** — where are the interface boundaries? What could change without affecting callers, and what can't?
5. **Check domain vocabulary** — if the project has a `CONTEXT.md` or `docs/adr/`, scan it. Use the project's terms, don't invent new names for existing concepts.
6. **Present the map** before touching any code:
   ```
   [Entry point]: <one-line responsibility>
     ← called by: [caller A], [caller B]
     → depends on: [dep X] (<one-line interface summary>)
                   [dep Y] (<one-line interface summary>)
     seams: [where the interface lives and what varies across it]
   ```

If the map reveals the change is riskier than expected (many callers, tight coupling, undocumented contracts), surface that before proceeding.

Skip Rule -1 only when you have recent, direct familiarity with the code. "I read it once" is not familiarity. "I modified it last week and remember the structure" is.
```

- [ ] **Step 3: Verify**

```bash
grep -n "Rule -1\|Map before\|entry point\|called by" skills/incremental-implementation/SKILL.md
```
Expected: matches for all four terms.

- [ ] **Step 4: Commit**

```bash
git add skills/incremental-implementation/SKILL.md
git commit -m "feat: expand incremental-implementation with zoom-out mapping step for unfamiliar code"
```

---

## Task 4: Expand `code-review-and-quality` with improve-codebase-architecture

Replace the one-liner Architecture axis with the full depth/seam/module vocabulary and a candidate-surfacing workflow.

**Files:**
- Modify: `skills/code-review-and-quality/SKILL.md`

- [ ] **Step 1: Locate the Architecture axis**

```bash
grep -n "### 3\. Architecture\|module boundaries\|circular depend" skills/code-review-and-quality/SKILL.md
```

- [ ] **Step 2: Replace the content under `### 3. Architecture`**

Replace everything from `### 3. Architecture` down to (but not including) `### 4. Security` with:

```markdown
### 3. Architecture

Does the change fit the system's design, and does it move the codebase toward **deeper modules**?

**Vocabulary** (use these terms exactly — don't substitute "service", "component", or "boundary"):

- **Module** — anything with an interface and an implementation (function, class, package, slice).
- **Interface** — everything a caller must know: types, invariants, error modes, ordering, config. Not just the type signature.
- **Depth** — leverage at the interface: a large amount of behaviour behind a small interface. **Deep** = high leverage. **Shallow** = interface nearly as complex as the implementation.
- **Seam** — where an interface lives; a place behaviour can be altered without editing in place.
- **Deletion test** — imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.

**Questions to ask:**

- Does it follow existing patterns, or introduce a new one? If new, is it justified?
- Are new modules **deep** — a large amount of behaviour behind a small interface — or **shallow**?
- Does it maintain clean **seams** — places where behaviour can be altered without editing in place?
- Apply the **deletion test** to any new module added by this change.
- Is there code duplication that should be pulled behind a shared interface?
- Are dependencies flowing in the right direction (no circular dependencies)?
- Is the abstraction level appropriate — not over-engineered, not too coupled?

**If significant architectural friction is found:** surface deepening opportunities using this structure:

- **Files** — which files/modules are involved
- **Problem** — why the current structure causes friction (use the vocabulary above)
- **Solution** — plain English description of what would change
- **Benefits** — in terms of locality (change concentrated in one place) and leverage (more capability per unit of interface)
- **Recommendation strength** — `Strong`, `Worth exploring`, or `Speculative`

If a candidate contradicts an existing ADR, mark it: "contradicts ADR-XXXX — but worth reopening because…". Only surface it when friction is real enough to justify revisiting.

Do **not** propose a new interface inline during a review. Flag the candidate and let it become a dedicated task.
```

- [ ] **Step 3: Verify**

```bash
grep -n "Depth\|Seam\|deletion test\|deepening" skills/code-review-and-quality/SKILL.md
```
Expected: matches for all four terms.

- [ ] **Step 4: Commit**

```bash
git add skills/code-review-and-quality/SKILL.md
git commit -m "feat: expand code-review-and-quality architecture axis with depth/seam/module vocabulary"
```

---

## Task 5: Expand `context-engineering` with handoff

Add a Handoff section at the end of the skill for session continuity.

**Files:**
- Modify: `skills/context-engineering/SKILL.md`

- [ ] **Step 1: Read the end of the skill to find the insertion point**

```bash
tail -20 skills/context-engineering/SKILL.md
```

- [ ] **Step 2: Append a Handoff section before the Verification checklist**

```markdown
## Handoff

When a session is ending mid-task — context limit approaching, switching tools, or handing off to another agent — write a handoff document before closing.

**Save to the OS temp directory**, not the workspace (`$TMPDIR` on macOS/Linux, `%TEMP%` on Windows). Name it `handoff-<topic>-<YYYY-MM-DD>.md`. Tell the user the absolute path.

**Do not duplicate** content already in plan files, ADRs, commits, or specs. Reference them by path instead.

**Redact** any sensitive information (API keys, passwords, PII).

Structure:

```markdown
# Handoff: [Topic]

**Date:** YYYY-MM-DD
**Session summary:** One sentence on what this session accomplished.

## Current state
What is done, what is in progress, what is blocked.
Reference diffs, commits, or plan files rather than restating their content.

## Active decisions
Decisions made this session not yet captured in a spec, ADR, or plan.
Format: **Decision:** [what] — **Reason:** [why]

## Remaining work
What still needs doing. Reference the plan file if one exists.

## Suggested skills
Which skills the next session should invoke first, and why.

## Context the next agent needs
Anything not in files: constraints mentioned verbally, user preferences, known dead ends, caveats.
```
```

- [ ] **Step 3: Verify**

```bash
grep -n "Handoff\|handoff\|TMPDIR\|session summary" skills/context-engineering/SKILL.md
```
Expected: matches for all four terms.

- [ ] **Step 4: Commit**

```bash
git add skills/context-engineering/SKILL.md
git commit -m "feat: expand context-engineering with handoff section for session continuity"
```

---

## Task 6: Update commands

**Files:**
- Modify: `.claude/commands/spec.md`
- Modify: `.claude/commands/test.md`
- Modify: `.claude/commands/review.md`
- Modify: `.claude/commands/build.md`

- [ ] **Step 1: Update `spec.md`**

Append to `.claude/commands/spec.md`:

```markdown
Before writing the spec, check for `CONTEXT.md` and `docs/adr/`. If terminology is fuzzy or contested, run the domain-grounding grilling loop in the agent-skills:spec-driven-development skill before writing anything.

If a key design question is too uncertain to spec directly, build a throwaway prototype first using the prototype branch in agent-skills:spec-driven-development, then return to speccing.
```

- [ ] **Step 2: Update `test.md`**

After the Prove-It pattern steps, append:

```markdown
If the bug resists reproduction in steps 1–2, escalate to the full feedback-loop-first workflow in agent-skills:debugging-and-error-recovery before continuing.
```

- [ ] **Step 3: Update `review.md`**

Append to `.claude/commands/review.md`:

```markdown
For significant architectural friction found in axis 3, surface deepening candidates using the vocabulary and candidate structure in agent-skills:code-review-and-quality. Do not propose a new interface inline — flag it as a follow-up task.
```

- [ ] **Step 4: Update `build.md`**

After the first step ("Read the task's acceptance criteria"), insert:

```markdown
0. If the code area is unfamiliar, run Rule -1 from agent-skills:incremental-implementation — map the entry point, callers, and dependencies before touching any code.
```

- [ ] **Step 5: Commit**

```bash
git add .claude/commands/spec.md .claude/commands/test.md .claude/commands/review.md .claude/commands/build.md
git commit -m "feat: update commands to surface folded-in workflows from Matt Pocock skills"
```

---

## Verification Checklist

After all tasks complete:

- [ ] `skills/debugging-and-error-recovery/SKILL.md` contains "feedback loop", "loop-construction", "Hypothesise", "DEBUG-"
- [ ] `skills/spec-driven-development/SKILL.md` contains "CONTEXT.md", "prototype", "state model"
- [ ] `skills/incremental-implementation/SKILL.md` contains "Rule -1", "Map before", "called by"
- [ ] `skills/code-review-and-quality/SKILL.md` contains "Depth", "Seam", "deletion test", "deepening"
- [ ] `skills/context-engineering/SKILL.md` contains "Handoff", "TMPDIR", "session summary"
- [ ] All four commands reference the expanded workflows
- [ ] No new directories created under `skills/`
- [ ] `git log --oneline -6` shows 6 clean commits, one per task
