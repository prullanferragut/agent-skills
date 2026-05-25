# Skill Guardrail Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add explicit guardrails, close constraint-surfacing gaps, and remove noise-without-value content across 14 priority skills, guided by findings from the wheat-vs-chaff benchmark.

**Architecture:** Direct edits to SKILL.md files only — no new files, no structural changes. Each task is one skill file. The review criterion is: does each added constraint prevent a specific failure mode the benchmark identified, without adding noise?

**Tech Stack:** Markdown files only. No test runner needed — verification is re-reading the file after edit to confirm the constraint is present and correctly placed.

---

## Priority 1: Security / Data-Leakage Gaps

### Task 1: security-and-hardening — fix three gaps

**Files:**
- Modify: `skills/security-and-hardening/SKILL.md`

**Gaps to fix:**

1. **File upload magic bytes** — `validateUpload()` comment says "check magic bytes if critical". Magic bytes must be the default recommendation, not an escalation. Remove the "if critical" qualifier.

2. **Secret scan grep** — the `git diff --cached | grep` command misses JWT, PEM, AWS key IDs, base64 blobs. Add a note that this is a reminder, not a security control, and recommend a dedicated scanner.

3. **Broken access control ownership pattern** — the `task.ownerId !== req.user.id` example has no note that it only handles direct ownership. RBAC/hierarchical access needs a different check.

4. **"Ask First" tier has no non-interactive fallback** — if the session is unattended, "ask first" has nowhere to go. Add: if human approval cannot be obtained, stop and write a blocker note.

5. **Verification checklist missing error handler check** — the checklist has no item confirming error handlers suppress stack traces in production.

- [ ] **Step 1: Edit file upload comment** — change "Don't trust the file extension — check magic bytes if critical" to "Always verify file type by inspecting magic bytes — do not rely on the user-supplied MIME type or file extension, both are attacker-controlled."

- [ ] **Step 2: Add secret scan caveat** — after the `git diff --cached | grep ...` block, add a note:

```markdown
> **Note:** This grep catches obvious variable names but misses many common secret formats (JWT tokens, PEM blocks, AWS key IDs, base64-encoded credentials). For stronger coverage use a dedicated scanner: `git-secrets`, `truffleHog`, `gitleaks`, or `detect-secrets`. Treat the grep as a reminder, not a security control.
```

- [ ] **Step 3: Add access control note** — after the ownership check example, add:

```markdown
> **Note:** This pattern handles direct ownership only. For role-based or hierarchical access (e.g., admin can access any resource, team members share access), the check must verify the user's role grants the specific action on the specific resource — not just that they are authenticated.
```

- [ ] **Step 4: Add Ask First non-interactive constraint** — in the "Ask First" section, add a note:

```markdown
> **Non-interactive sessions:** If you cannot obtain human approval (autonomous run, unattended agent), do not proceed with an Ask First action. Write a note to the user describing what was blocked and why, then stop.
```

- [ ] **Step 5: Add error handler to verification checklist** — in the Verification section, add:

```
- [ ] Error handlers return generic messages in production — no stack traces, file paths, or internal service names in HTTP responses
```

- [ ] **Step 6: Verify** — re-read the file and confirm all five changes are present and correctly placed.

---

### Task 2: debugging-and-error-recovery — fix two gaps

**Files:**
- Modify: `skills/debugging-and-error-recovery/SKILL.md`

**Gaps to fix:**

1. **Safe fallback pattern is unsafe for secrets** — `getConfig()` returning `DEFAULTS[key] ?? ''` is presented as universally valid. Empty-string fallback for required secrets allows the app to start in a broken/insecure state.

2. **Instrumentation during hypothesis-testing can log PII/tokens** — Step 3 says to instrument one variable at a time but has no guard against logging sensitive data.

3. **Step 4 Reduce — reduction targets production files** — no constraint distinguishing reduction on a reproduction vs. the production codebase.

- [ ] **Step 1: Add caveat to `getConfig` example** — after the `getConfig` function, add:

```markdown
> **Important:** This safe-fallback pattern is appropriate for *optional* configuration with sensible defaults. For required secrets, database connection strings, signing keys, or any security-critical value, missing configuration must throw at startup — returning an empty default is a vulnerability, not a graceful fallback. Example: `if (!API_KEY) throw new Error('STRIPE_API_KEY is required — not set');`
```

- [ ] **Step 2: Add sensitive-data constraint to Step 3** — after the `[DEBUG-auth-flow]` tagging guidance in Step 3, add:

```markdown
> **Sensitive data constraint:** When debugging code that processes authentication tokens, passwords, user PII, or payment data, log metadata only (presence/absence, type, length) — never the values themselves. Any instrumentation that logs sensitive values must be removed before any commit, even if the commit is to a non-production branch.
```

- [ ] **Step 3: Add production-file constraint to Step 4** — at the start of Step 4, add:

```markdown
> **Scope constraint:** Reduction is performed on a reproduction — an isolated test, fixture, or throwaway branch — not on the production codebase or live data files. Never strip or delete production files to achieve a minimal case.
```

- [ ] **Step 4: Verify** — re-read and confirm all three changes are present.

---

### Task 3: doubt-driven-development — fix two gaps

**Files:**
- Modify: `skills/doubt-driven-development/SKILL.md`

**Gaps to fix:**

1. **Temp file has no permission/cleanup constraint** — the `doubt-prompt.md` example writes to `/tmp/` with no `chmod 600`, no cleanup trap, and no check for secrets before writing.

2. **EXTRACT step has no constraint against sending secrets to external CLI** — an artifact with credentials, PII, or proprietary code could be sent verbatim to Gemini/Codex with no warning.

3. **RECONCILE classification has no security-critical category** — "Valid trade-off" could silently accept a known vulnerability. Security findings cannot be traded off.

4. **Degraded fallback output has no required format marker** — the skill says "flag the result as degraded" but does not specify the required banner format.

- [ ] **Step 1: Add temp file security constraint** — after the `gemini --approval-mode plan` example, add:

```markdown
> **Temp file security:** Create the file with restricted permissions (`chmod 600 /tmp/doubt-prompt.md`) and clean it up after the CLI invocation, whether it succeeds or fails. If the artifact contains secrets, PII, or code under a confidentiality agreement, warn the user before writing it to disk.
```

- [ ] **Step 2: Add pre-send secret check to Step 2 (EXTRACT)** — before the "Strip your reasoning" paragraph, add:

```markdown
> **Before sending to any external CLI or model:** verify the artifact contains no secrets, credentials, PII, or code under confidentiality agreements. If it does, redact or replace with placeholders before passing externally — note in the contract what was redacted.
```

- [ ] **Step 3: Add security-critical classification to Step 4 (RECONCILE)** — after the four existing classification categories, add:

```markdown
5. **Security-critical** — the finding is a confirmed security vulnerability (injection, auth bypass, data exposure, etc.). These cannot be classified as trade-offs. They must be escalated to the user with a blocking recommendation before the artifact ships. If the finding is plausible but unconfirmed, classify as Valid + actionable and fix before continuing.
```

- [ ] **Step 4: Specify degraded fallback banner format** — in the Loading Constraints section, change "flag the result as degraded" to:

```
flag the result as degraded by opening the output with this exact banner before any finding:

> ⚠️ DEGRADED REVIEW: Self-review, not fresh-context. Cross-context contamination possible. Treat findings as preliminary — escalate to a fresh-context reviewer before shipping.
```

- [ ] **Step 5: Verify** — re-read and confirm all four changes are present.

---

## Priority 2: Irreversibility Guards

### Task 4: shipping-and-launch — fix two gaps

**Files:**
- Modify: `skills/shipping-and-launch/SKILL.md`

**Gaps to fix:**

1. **Migration rollback assumes reversibility** — the Rollback Plan template shows `npx prisma migrate rollback` without noting that many migrations cannot be safely rolled back.

2. **Feature flag cleanup has no zero-usage gate** — "Clean up flags within 2 weeks of full rollout" says nothing about verifying the old code path has zero active users before removing it.

3. **CI-only flag verification** — "Test both flag states (on and off) in CI" is listed as a rule but there's no gate blocking deploy when only one state was tested.

4. **Some checklist items require human/tooling sign-off** — no distinction between agent-verifiable and human-only items (e.g., screen reader testing, real load testing).

- [ ] **Step 1: Add migration reversibility gate to Rollback Plan template** — replace the Database Considerations line:

Old:
```
- Migration [X] has a rollback: `npx prisma migrate rollback`
```

New:
```
- Migration [X]: **reversible** — rollback: `npx prisma migrate rollback`
  OR
- Migration [X]: **IRREVERSIBLE** — dropping column / destructive rename / data backfill. Rollback requires data restore from backup. Document the restore procedure here before deploying.
```
Add a note before the template: "**Classify each migration as reversible or irreversible before writing the rollback plan.** An irreversible migration must have an explicit data restore procedure documented — not just a code revert step."

- [ ] **Step 2: Add zero-usage gate to feature flag cleanup rule** — change "Clean up flags within 2 weeks of full rollout" to: "Clean up flags within 2 weeks of full rollout — but only after confirming via telemetry or rollout metrics that the old code path has zero active users. Do not remove a flag or the code it guards based on calendar time alone."

- [ ] **Step 3: Add human-required marker to checklist items** — add a note before the Accessibility section: "Items marked **(human required)** cannot be verified by an agent — they require a human tester or external tooling to sign off before launch." Then mark these items: Screen reader, keyboard navigation end-to-end, and any load testing items as **(human required)**.

- [ ] **Step 4: Verify** — re-read and confirm all changes are present.

---

### Task 5: incremental-implementation — fix two gaps

**Files:**
- Modify: `skills/incremental-implementation/SKILL.md`

**Gaps to fix:**

1. **Database schema changes not called out as irreversible** — Rule -1 says stop if the change is "riskier than expected" but doesn't name schema migrations explicitly as requiring user confirmation regardless of caller count.

2. **Feature flag described as conditional** — Rule 3 says "if a feature isn't ready for users but you need to merge increments" — making it sound optional. It must be mandatory for incomplete user-visible surfaces.

3. **Verification checklist is Node/TypeScript specific** — `npm test`, `npm run build`, `npx tsc --noEmit` will fail on non-Node projects with no guidance on what to do.

4. **Rollback-friendly rule has no verification gate** — Rule 5 states "database migrations should have corresponding rollback migrations" but this is not in the Increment Checklist.

- [ ] **Step 1: Add irreversibility gate to Rule -1** — after "If the map reveals the change is riskier than expected... stop and tell the user", add:

```markdown
**Irreversible operations require explicit confirmation regardless of caller count.** Treat these as always requiring user sign-off before proceeding: database schema changes, data migrations, deleting stored data, and any operation that cannot be undone with a `git revert`.
```

- [ ] **Step 2: Make feature flag mandatory** — change Rule 3 header and opening sentence from "If a feature isn't ready for users but you need to merge increments" to "If a feature introduces any user-visible behavior that is not yet complete, a feature flag is **required**, not optional. Do not merge an incomplete user-visible surface without one."

- [ ] **Step 3: Make verification toolchain-agnostic** — in the Increment Checklist, add before the checklist items: "**Substitute your project's actual commands.** The commands below are Node/TypeScript defaults. Before running any verification, identify the project's test runner and build tool from the package manifest, Makefile, or CI config."

- [ ] **Step 4: Add rollback migration gate to checklist** — add to the Increment Checklist: `- [ ] If this increment includes a database migration, a rollback migration exists and has been verified`

- [ ] **Step 5: Verify** — re-read and confirm all four changes are present.

---

### Task 6: deprecation-and-migration — fix two gaps

**Files:**
- Modify: `skills/deprecation-and-migration/SKILL.md`

**Gaps to fix:**

1. **Zero-usage check in Step 4 is insufficient** — "Verify zero active usage (metrics, logs, dependency analysis)" misses batch/cron jobs, external partners, and mobile clients with long release cycles.

2. **Data lifecycle is implicit in code removal** — no constraint preventing an agent from deleting code that owns user data without a data retention decision.

3. **Feature flag migration cutover has no in-flight drain guard** — the flag switch can happen mid-operation for stateful operations.

4. **Adapter type coercions have no edge-case testing requirement** — `String(id)` is shown without noting that type coercions are the most common source of adapter bugs.

- [ ] **Step 1: Expand zero-usage check in Step 4** — after "Verify zero active usage (metrics, logs, dependency analysis)", add:

```markdown
> **Zero usage in metrics is necessary but not sufficient.** Also check: scheduled/cron jobs that may run infrequently (check monthly cadence, not just the last 7 days), external partners or API consumers not visible in internal logs, mobile clients that cache API versions with long release cycles, and SDK consumers. When uncertain, add a tombstone log line and wait one full business cycle before removing.
```

- [ ] **Step 2: Add data lifecycle constraint to Step 4** — after the removal steps list, add:

```markdown
> **Data lifecycle is separate from code removal.** If the deprecated system owns data (database tables, storage buckets, message queues, file archives), document the data retention policy before removing any code. Never treat data removal as implicit in code removal — these are two separate decisions requiring separate approval.
```

- [ ] **Step 3: Add in-flight drain guard to Feature Flag Migration** — after the `getTaskService` function, add:

```markdown
> **Stateful operation guard:** For operations involving database writes, queued jobs, financial transactions, or any stateful work, ensure in-flight requests complete before enabling the flag. A hard cutover mid-operation risks data corruption if old and new systems have different schemas or semantics.
```

- [ ] **Step 4: Add adapter edge-case testing note** — after the `LegacyTaskService` example, add:

```markdown
> **Adapter type coercions must be tested at edge cases.** The `String(id)` conversion above is correct for positive integers but may not handle zero, very large IDs, leading zeros, or null/undefined inputs correctly. Test adapters with: empty values, null/undefined, maximum values, special characters, and any input that could fail the coercion silently.
```

- [ ] **Step 5: Verify** — re-read and confirm all four changes are present.

---

### Task 7: git-workflow-and-versioning — fix two gaps

**Files:**
- Modify: `skills/git-workflow-and-versioning/SKILL.md`

**Gaps to fix:**

1. **Secret scan grep in Pre-Commit Hygiene is low-fidelity** — same issue as security-and-hardening: misses JWT, PEM, AWS key IDs.

2. **`git reset --hard` is presented without a stash-first guard** — the Save Point Pattern says to use it without warning it's unrecoverable.

3. **Worktree placement has no cloud-sync warning** — `../project-feature-a` could land inside Dropbox/iCloud.

4. **Branch-from-main instruction ignores protected branch setups** — enterprise repos may require branching from a different base.

- [ ] **Step 1: Add grep caveat to Pre-Commit Hygiene** — after the grep command, add:

```markdown
> **This grep catches obvious variable names but misses many common secret formats** (JWT tokens, PEM blocks, AWS key IDs starting with `AKIA`, base64-encoded credentials). For stronger coverage use a dedicated scanner: `git-secrets`, `truffleHog`, `gitleaks`, or `detect-secrets`. Treat the manual grep as a reminder, not a security control.
```

- [ ] **Step 2: Add stash-first guard to Save Point Pattern** — change the `git reset --hard HEAD` line in the Save Point Pattern from the current sentence to:

```
Test fails? → Stash changes first (`git stash`), then investigate OR revert to last commit (`git reset --hard HEAD` — **unrecoverable, destroys all uncommitted work**)
```

And add a note: "Prefer `git stash` over `git reset --hard` when uncommitted work may be worth keeping. `git reset --hard` is instant and unrecoverable without a narrow reflog window."

- [ ] **Step 3: Add cloud-sync warning to Worktrees section** — after the `git worktree add` example, add:

```markdown
> **Placement warning:** Create worktrees outside cloud-synced directories (Dropbox, iCloud Drive, OneDrive, Google Drive). Placing a git worktree inside a cloud-sync folder can corrupt the worktree state and generate thousands of spurious sync events. Also avoid placing worktrees inside other git repositories.
```

- [ ] **Step 4: Add base-branch confirmation note** — change "Branch from `main` (or the team's default branch)" to "Branch from `main` (or the team's default branch) — **confirm the correct base branch from the project's contributing guide or CI config before creating the branch**. Some repositories require branching from a release or integration branch rather than `main`; branching from the wrong base wastes the entire branch."

- [ ] **Step 5: Verify** — re-read and confirm all four changes are present.

---

## Priority 3: Missing Blocking Gates

### Task 8: planning-and-task-breakdown — fix two gaps

**Files:**
- Modify: `skills/planning-and-task-breakdown/SKILL.md`

**Gaps to fix:**

1. **No gate requiring a written spec before planning begins** — the skill assumes a spec exists but doesn't enforce it. An agent can produce a plan for an unwritten spec.

2. **"Files likely touched" field implies completeness it cannot guarantee** — executing agents may scope work to only the listed files.

3. **Risks table can be empty** — the verification checklist checks structure but not whether risks were actually identified.

4. **Parallel tasks can share files** — the parallelization guidance doesn't check for shared configuration, manifest, or schema files.

- [ ] **Step 1: Add spec gate to Step 1** — at the top of Step 1, add:

```markdown
> **Gate:** Before planning, confirm that a written spec or confirmed intent statement exists. If neither exists, stop and invoke `spec-driven-development` or `interview-me` first. Do not produce a task list for an unwritten spec — the plan will encode agent assumptions, not requirements.
```

- [ ] **Step 2: Rename "Files likely touched" to clarify it's an estimate** — change the field name in the task template from `**Files likely touched:**` to `**Files expected to change (estimate — may be incomplete):**` and add a note: "This is a planning estimate. During execution, Rule -1 from `incremental-implementation` takes precedence — map the actual dependency graph before touching files."

- [ ] **Step 3: Add risks gate to verification checklist** — add to the Verification section: `- [ ] The Risks and Mitigations table contains at least one identified risk, or explicitly states "No risks identified" with a one-sentence rationale`

- [ ] **Step 4: Add shared-files check to parallelization guidance** — in the "Parallelization Opportunities" section, add: "**Before marking tasks as safe to parallelize, check whether they touch any shared files** — configuration, package manifests, database schema, CI config, or seed data. If they do, either serialize those specific changes or designate one task to own each shared file and make the other tasks depend on it."

- [ ] **Step 5: Verify** — re-read and confirm all four changes are present.

---

### Task 9: spec-driven-development — fix two gaps

**Files:**
- Modify: `skills/spec-driven-development/SKILL.md`

**Gaps to fix:**

1. **Confirmed assumptions are not carried forward as enforceable constraints** — after "Proceed with these assumptions", the assumptions disappear. They should become Boundaries entries.

2. **Unresolved Open Questions don't block Phase 2** — an agent can have material uncertainty in Open Questions and still advance.

3. **Phase 4 has no gate preventing task N+1 from starting if task N failed verification**.

4. **Boundaries are advisory without enforcement hooks** — "Never" items that have no corresponding CI/pre-commit check are easily bypassed.

- [ ] **Step 1: Add assumption-to-boundary conversion** — after the `question` tool call in the assumptions section, add:

```markdown
> **Confirmed assumptions become Boundaries.** After the user proceeds, translate each confirmed assumption into an entry in the Boundaries section ("Always" or "Never"), making them enforceable checkpoints rather than one-time acknowledgments. Example: assumption "targeting modern browsers only" becomes `Never: use APIs or polyfills targeting IE11 or pre-Chromium Edge`.
```

- [ ] **Step 2: Add Open Questions gate between Phase 1 and Phase 2** — at the end of Phase 1, add:

```markdown
> **Open Questions gate:** Before advancing to Phase 2, review the Open Questions list. If any question is marked as blocking (material uncertainty that would change the architecture), stop and surface it to the user. Do not begin planning with unresolved architectural uncertainty — the plan will be wrong.
```

- [ ] **Step 3: Add intra-Phase-4 gate** — in Phase 4, change "Execute tasks one at a time" to: "Execute tasks one at a time, following `incremental-implementation` and `test-driven-development`. **Do not begin the next task until the current task's Verify step passes.** A failing Verify step means the current task is not complete — fix it before advancing."

- [ ] **Step 4: Add enforcement note to Boundaries** — in the Boundaries section of the spec template, add a note: "For each 'Never' boundary that is automatically enforceable (linter rule, pre-commit hook, CI check), name the enforcement mechanism. An unenforced 'Never' boundary is advisory — it will be bypassed under pressure."

- [ ] **Step 5: Verify** — re-read and confirm all four changes are present.

---

### Task 10: workflow-tracker — fix two gaps

**Files:**
- Modify: `skills/workflow-tracker/SKILL.md`

**Gaps to fix:**

1. **SPEC entry gate "task described" is trivially satisfied** — any message opens SPEC. The gate needs a specificity floor.

2. **Phase regression loop is unbounded** — no constraint on how many times the same phase can regress before human escalation is required.

3. **No guidance for mid-session resume** — if a session resumes after SPEC and PLAN are done, initializing with all phases pending misrepresents state.

- [ ] **Step 1: Strengthen SPEC entry gate** — in the Phase Gates table, change the SPEC Entry gate from "Task described" to: "Task described with enough specificity to identify at least one acceptance criterion. If the task is too vague, surface the lack of specificity before initializing — ask for one concrete success condition before opening SPEC."

- [ ] **Step 2: Add regression loop cap** — in the Phase Regression section, add:

```markdown
> **Regression loop cap:** If the same phase regresses more than twice without reaching its exit gate, stop and surface the repeated failure to the user. Present the options: "Continue with a modified approach", "Decompose the failing task further", or "Escalate — needs human decision." Do not continue looping silently past two regressions.
```

- [ ] **Step 3: Add mid-session resume guidance** — add a new section "Resuming Mid-Task":

```markdown
## Resuming Mid-Task

When resuming a task where prior phases have already been completed (e.g., SPEC and PLAN are done, resuming at BUILD):

1. Initialize only the remaining phases as `pending` or `in_progress`.
2. Mark already-completed phases as `completed` immediately.
3. Do not initialize all phases as `pending` — this misrepresents the true state of the work.

If you are unsure which phases are complete, review the conversation history or committed files before initializing.
```

- [ ] **Step 4: Verify** — re-read and confirm all three changes are present.

---

### Task 11: interview-me — fix one gap

**Files:**
- Modify: `skills/interview-me/SKILL.md`

**Gaps to fix:**

1. **Delegation loop has no cap** — if the user keeps responding with "whatever you think" the agent can loop indefinitely re-asking with two concrete options.

2. **Restate has no risks/compliance field** — a confirmed intent for a legally problematic ask passes through with no flag.

3. **Handoff to spec-driven-development must carry the full restate** — truncated handoffs silently drop the Out of scope line.

- [ ] **Step 1: Add delegation loop cap to Step 5** — after the "Whatever you think is best" guidance, add:

```markdown
> **Delegation loop cap:** If the user has delegated three or more times in a row without engaging substantively with either concrete option, stop presenting options and say: "I need at least one substantive answer to proceed — if you'd like to continue later, I can hold the restate. I won't guess." Do not proceed to a spec or plan without an explicit answer.
```

- [ ] **Step 2: Add risks field to restate template** — add an optional seventh line to the restate format in Step 4:

```
- Risks to flag: <one line — regulatory, legal, ethical, or welfare concerns surfaced during interview; omit if none>
```

And add a note: "Populate 'Risks to flag' when the interview surfaced anything touching regulated data (HIPAA, GDPR, PCI), third-party terms of service, children's platforms, or the welfare of people not in the conversation. This does not require the agent to be a legal expert — it requires surfacing the concern so the user can decide."

- [ ] **Step 3: Add full-restate handoff requirement** — in the "Interaction with Other Skills" section for `spec-driven-development`, add: "**Pass the complete restate (all fields, including Out of scope and Risks to flag if populated) as the starting context for the spec.** Do not summarize or truncate — silently dropping Out of scope is the most common source of downstream scope creep."

- [ ] **Step 4: Verify** — re-read and confirm all three changes are present.

---

## Priority 4: Correctness Bugs in Examples

### Task 12: code-simplification — fix one example bug

**Files:**
- Modify: `skills/code-simplification/SKILL.md`

**Gap to fix:**

The TypeScript "verbose conditional assignment" simplification example uses `||` where `??` is semantically correct:

```typescript
// After
const displayName = user.nickname || user.fullName;
```

If `user.nickname` is `""` (empty string), `0`, or `false`, `||` will fall through to `user.fullName`, which is not the same as the original `if/else` behavior. The correct operator is `??` (nullish coalescing), which only falls through on `null` or `undefined`.

- [ ] **Step 1: Fix the `||` example** — change the "After" in the conditional assignment example from:
```typescript
const displayName = user.nickname || user.fullName;
```
to:
```typescript
const displayName = user.nickname ?? user.fullName;
```

And add a comment after the example:
```typescript
// Use ?? (nullish coalescing) to fall back only on null/undefined.
// Use || (logical OR) only when falsy values (empty string, 0, false) should also trigger the fallback.
// These are semantically different — choosing the wrong one introduces a subtle bug.
```

- [ ] **Step 2: Verify** — confirm the change is present and the semantic distinction note is visible.

---

### Task 13: frontend-ui-engineering — fix one example gap

**Files:**
- Modify: `skills/frontend-ui-engineering/SKILL.md`

**Gaps to fix:**

1. **Optimistic update rollback example has a silent failure** — `context?.previous` with optional chaining means if `onMutate` failed and context is undefined, the rollback silently does nothing.

2. **No constraint against optimistic updates on irreversible operations** — the pattern is presented without warning it must not be used for payments, deletions, or account actions.

3. **Error state passes raw error message to UI** — `<ErrorState message="Failed to load tasks" />` has no note against using raw API error messages which could contain stack traces or internal details.

4. **Color section has no dark mode constraint** — semantic tokens work in dark mode, but hardcoded Tailwind color classes don't.

- [ ] **Step 1: Add irreversible operations guard to optimistic updates** — after the `useToggleTask` hook, add:

```markdown
> **Do not use optimistic updates for irreversible operations** — payments, account deletion, data export, or any action that cannot be undone. For those, the UI must show a pending state and wait for server confirmation before displaying success. A failed rollback on an irreversible action has no recovery path.
```

- [ ] **Step 2: Add optional-chaining note to the rollback** — add a comment in the `onError` handler:

```typescript
onError: (_err, _taskId, context) => {
  // context may be undefined if onMutate itself threw — verify before using
  if (context?.previous !== undefined) {
    queryClient.setQueryData(['tasks'], context.previous);
  }
},
```

- [ ] **Step 3: Add raw error message guard** — in the Component Architecture section, after the `ErrorState message="Failed to load tasks"` example, add:

```markdown
> **Never display raw API error messages in the UI.** Use a generic user-facing string. Raw API errors may contain stack traces, internal service names, database error codes, or file paths. Pass detailed error information to `console.error` or an error monitoring service — not to rendered UI.
```

- [ ] **Step 4: Add dark mode constraint to Color section** — after the semantic color tokens guidance, add:

```markdown
> **Dark mode:** If the project supports dark mode, all color usage must be through semantic tokens or Tailwind's `dark:` variant. Never use hardcoded color classes (e.g., `text-gray-900`, `bg-white`) that resolve to a single value — they will be invisible or unreadable in dark mode. Verify dark mode rendering before marking a component complete.
```

- [ ] **Step 5: Verify** — re-read and confirm all four changes are present.

---

## Priority 5: Noise Reduction (Rationalizations Tables)

### Task 14: trim rationalizations tables across all skills

**Files:**
- Modify: `skills/api-and-interface-design/SKILL.md`
- Modify: `skills/ci-cd-and-automation/SKILL.md`
- Modify: `skills/code-review-and-quality/SKILL.md`
- Modify: `skills/context-engineering/SKILL.md`
- Modify: `skills/debugging-and-error-recovery/SKILL.md`
- Modify: `skills/deprecation-and-migration/SKILL.md`
- Modify: `skills/git-workflow-and-versioning/SKILL.md`
- Modify: `skills/idea-refine/SKILL.md`
- Modify: `skills/incremental-implementation/SKILL.md`
- Modify: `skills/planning-and-task-breakdown/SKILL.md`
- Modify: `skills/security-and-hardening/SKILL.md`
- Modify: `skills/source-driven-development/SKILL.md`
- Modify: `skills/spec-driven-development/SKILL.md`
- Modify: `skills/ubiquitous-language/SKILL.md`
- Modify: `skills/using-agent-skills/SKILL.md`
- Modify: `skills/vertical-slicing/SKILL.md`
- Modify: `skills/workflow-tracker/SKILL.md`

**Rule for each skill:** Remove or trim any rationalization row that:
- Restates a constraint already enforced more precisely by a workflow step or the Red Flags section, AND
- Adds no new protection against a failure mode not already covered.

Keep rows that cover failure modes NOT already in Red Flags or explicit workflow steps.

For each file, the process is:
- [ ] Read the Common Rationalizations table
- [ ] For each row, check: does this prevent a failure mode not already covered by a workflow step or Red Flag?
- [ ] Remove rows that fail this test
- [ ] If all rows are redundant, remove the entire section
- [ ] Commit the change with: `docs: trim redundant rationalization rows in [skill-name]`

**Note:** This is the lowest-risk, lowest-priority task. Do Tasks 1–13 first. If time is constrained, skip this task — the guardrail improvements matter more than noise reduction.

---

## Verification Checklist (all tasks)

After completing all tasks:

- [ ] All 13 constraint additions are present in their respective files
- [ ] No existing guardrails were removed or weakened during edits
- [ ] The `||` vs `??` bug in code-simplification is fixed
- [ ] The optimistic update silent-rollback is fixed in frontend-ui-engineering
- [ ] All edits follow the existing style of each skill (no new sections unless specified)
- [ ] No new files were created
