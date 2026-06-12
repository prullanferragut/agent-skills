# Repo Quality Cleanup — Design Spec

**Date:** 2026-05-25
**Status:** Approved

## Goal

Fix all definite bugs, documentation contradictions, and orphaned/dead content identified in the repo audit. Four independent tracks executed in parallel.

## Architecture

Purely mechanical edits — no new features, no structural changes. Each track targets a different set of files and can be implemented and committed independently.

---

## Track 1: CI Fixes

**File:** `.github/workflows/test-plugin-install.yml`

### Changes

1. **Fix `actions/checkout@v6` → `actions/checkout@v4`** in both `validate` and `test-install` jobs. `@v6` does not exist; these jobs currently fail silently.

2. **Add `test-scorer` job** that runs `node scripts/score-response.test.js`. Runs in parallel with `validate-skills` (no `needs:` dependency). Uses Node 20, same setup as `validate-skills`.

3. **Add `test-hooks` job** that runs `bash hooks/session-start-test.sh` followed by `bash hooks/simplify-ignore-test.sh`. Runs in parallel with `validate-skills`.

### Success criteria
- `validate` and `test-install` jobs use `@v4`
- `test-scorer` and `test-hooks` jobs exist and run on every push/PR
- All four leaf jobs pass locally when simulated

---

## Track 2: Docs Contradicting Reality

### File: `CLAUDE.md`

1. **Phase names** — Replace the current phase list:
   ```
   Define / Plan / Build / Verify / Review / Ship
   ```
   With the canonical phases from `references/lifecycle.md`:
   ```
   SPEC / PLAN / BUILD / TEST / REVIEW / SIMPLIFY / SHIP
   ```

2. **Skills by Phase** — Update the mapping to match `lifecycle.md`:
   - SPEC: `interview-me`, `idea-refine`, `spec-driven-development`, `ubiquitous-language`
   - PLAN: `planning-and-task-breakdown` (remove `vertical-slicing` — merged)
   - BUILD: unchanged
   - TEST: `test-driven-development`, `browser-testing-with-devtools`, `debugging-and-error-recovery`
   - REVIEW: `code-review-and-quality`, `security-and-hardening`, `performance-optimization`
   - SIMPLIFY: `code-simplification` (new phase, was missing)
   - SHIP: `git-workflow-and-versioning`, `ci-cd-and-automation`, `deprecation-and-migration`, `documentation-and-adrs`, `shipping-and-launch`
   - Add **Meta** row: `workflow-tracker`, `using-agent-skills`

3. **`npm test` line** — Replace `Not applicable (this is a documentation project)` with:
   ```
   node scripts/validate-skills.js && node scripts/score-response.test.js && bash hooks/session-start-test.sh
   ```

4. **Validate description** — Replace the one-line description with the actual full check list: frontmatter, name matches dir, description length, required sections, cross-skill references.

### File: `AGENTS.md`

1. **`scripts/` directory** — Change `# Required: executable scripts` to `# Optional: only when the skill ships runnable helpers`

2. **`{skill-name}.zip`** — Change `# Required: packaged for distribution` to `# Optional: for manual distribution outside the plugin manager`

3. **Lifecycle Mapping** — Update the phase names from "DEFINE/VERIFY" to "SPEC/TEST" to match `lifecycle.md`. Add SIMPLIFY phase. Remove the DEFINE alias.

### File: `references/lifecycle.md`

1. **SHIP skill mapping** — Add `deprecation-and-migration` to the SHIP row.
2. **PLAN skill mapping** — Remove `vertical-slicing` (merged into `planning-and-task-breakdown`).

---

## Track 3: Content Deletion and Gitignore

### Delete

- `skills/vertical-slicing/` — merged into `planning-and-task-breakdown`, directory is stale

### Add to `.gitignore`

```
.superpowers/
docs/superpowers/
docs/plans/
docs/specs/
docs/tasks/
```

These are ephemeral agent-generated planning artifacts. They are not deleted — just excluded from git tracking so they don't show as untracked noise.

Also delete the empty `wheat/` directory: `rm -rf wheat/`. It is untracked and empty; gitignore alone won't remove it from `git status` output since there is nothing to ignore.

---

## Track 4: Validator Cleanup

**File:** `scripts/validate-skills.js`

Remove the `vertical-slicing` entry from `SECTION_EXEMPT_SKILLS`. Once the skill directory is deleted, the entry is dead and would print a confusing "exempted skill not found" warning.

Note: `vertical-slicing` is not currently in `SECTION_EXEMPT_SKILLS` — only `using-agent-skills` and `idea-refine` are. No change needed unless the validator gains a stale-exemption check. Verify before editing.

---

## Commit Strategy

One commit per logical change:

| Commit message | Track |
|---|---|
| `fix: use actions/checkout@v4 in validate and test-install CI jobs` | 1 |
| `ci: add score-response and hook tests to CI pipeline` | 1 |
| `docs: align CLAUDE.md phases and skill mapping with lifecycle.md` | 2 |
| `docs: correct AGENTS.md scripts and zip requirements to Optional` | 2 |
| `docs: add deprecation-and-migration to SHIP phase in lifecycle.md` | 2 |
| `chore: remove merged vertical-slicing skill directory` | 3 |
| `chore: gitignore ephemeral planning artifacts` | 3 |

---

## Out of Scope

- Adding `GEMINI.md`, `CHANGELOG.md`, or any new content (missing content work deferred)
- Any changes to skill content
- Any new features to `validate-skills.js` beyond removing the stale exemption if found
