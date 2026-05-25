# Repo Quality Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix broken CI jobs, correct documentation that contradicts reality, remove merged/dead content, and gitignore ephemeral planning artifacts.

**Architecture:** Four independent tracks — CI workflow YAML, three doc files, one skill directory deletion, one gitignore update. All tracks touch different files and can be executed in parallel. No new features, no structural changes, no new dependencies.

**Tech Stack:** YAML (GitHub Actions), Markdown, Node.js (existing scripts only), bash.

---

### Task 1: Fix broken CI job versions

**Files:**
- Modify: `.github/workflows/test-plugin-install.yml:27` (validate job)
- Modify: `.github/workflows/test-plugin-install.yml:40` (test-install job)

Both `validate` and `test-install` jobs use `actions/checkout@v6`, which does not exist. The current latest is `@v4`. These jobs currently fail every CI run.

- [ ] **Step 1: Read the current workflow file**

```bash
cat .github/workflows/test-plugin-install.yml
```

Confirm both `validate` and `test-install` jobs contain `uses: actions/checkout@v6`.

- [ ] **Step 2: Fix both occurrences**

In `.github/workflows/test-plugin-install.yml`, replace both instances of:
```yaml
      - uses: actions/checkout@v6
```
with:
```yaml
      - uses: actions/checkout@v4
```

There are exactly two occurrences — one in the `validate` job and one in `test-install`.

- [ ] **Step 3: Verify no @v6 references remain**

```bash
grep -n "checkout@v6" .github/workflows/test-plugin-install.yml
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/test-plugin-install.yml
git commit -m "fix: use actions/checkout@v4 in validate and test-install CI jobs"
```

---

### Task 2: Add score-response and hook tests to CI

**Files:**
- Modify: `.github/workflows/test-plugin-install.yml`

`scripts/score-response.test.js` and `hooks/session-start-test.sh` / `hooks/simplify-ignore-test.sh` exist and pass locally but are never run in CI. Regressions in these are invisible.

- [ ] **Step 1: Verify the test scripts pass locally**

```bash
node scripts/score-response.test.js
```
Expected output: `All scorer tests passed.`

```bash
bash hooks/session-start-test.sh
```
Expected output: `session-start JSON payload OK`

```bash
bash hooks/simplify-ignore-test.sh
```
Expected: exits 0 with no error output (or similar success message).

- [ ] **Step 2: Add two new jobs to the workflow**

In `.github/workflows/test-plugin-install.yml`, add the following two jobs after the existing `validate-skills` job (before `validate:`). These run in parallel with `validate-skills` — no `needs:` dependency on each other:

```yaml
  test-scorer:
    name: Test response scorer
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run scorer tests
        run: node scripts/score-response.test.js

  test-hooks:
    name: Test session hooks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Test session-start hook
        run: bash hooks/session-start-test.sh

      - name: Test simplify-ignore hook
        run: bash hooks/simplify-ignore-test.sh
```

- [ ] **Step 3: Verify YAML is valid**

```bash
node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/test-plugin-install.yml','utf8')); console.log('YAML valid')" 2>/dev/null || python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/test-plugin-install.yml')); print('YAML valid')"
```

Expected: `YAML valid`

- [ ] **Step 4: Confirm both new jobs appear**

```bash
grep "name:" .github/workflows/test-plugin-install.yml
```

Expected output includes `Test response scorer` and `Test session hooks`.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/test-plugin-install.yml
git commit -m "ci: add score-response and hook tests to CI pipeline"
```

---

### Task 3: Align CLAUDE.md with lifecycle.md

**Files:**
- Modify: `CLAUDE.md`

`CLAUDE.md` uses wrong phase names (Define/Verify instead of SPEC/TEST), omits the SIMPLIFY phase, is missing several skills from the phase mapping, and incorrectly states `npm test` is not applicable.

- [ ] **Step 1: Read the current file**

```bash
cat CLAUDE.md
```

- [ ] **Step 2: Replace the Skills by Phase section**

Find and replace the entire `## Skills by Phase` section. Current content:

```markdown
## Skills by Phase

**Define:** interview-me, idea-refine, spec-driven-development
**Plan:** planning-and-task-breakdown
**Build:** incremental-implementation, test-driven-development, context-engineering, source-driven-development, doubt-driven-development, frontend-ui-engineering, api-and-interface-design
**Verify:** browser-testing-with-devtools, debugging-and-error-recovery
**Review:** code-review-and-quality, code-simplification, security-and-hardening, performance-optimization
**Ship:** git-workflow-and-versioning, ci-cd-and-automation, deprecation-and-migration, documentation-and-adrs, shipping-and-launch
```

Replace with:

```markdown
## Skills by Phase

**SPEC:** interview-me, idea-refine, spec-driven-development, ubiquitous-language
**PLAN:** planning-and-task-breakdown
**BUILD:** incremental-implementation, test-driven-development, context-engineering, source-driven-development, doubt-driven-development, frontend-ui-engineering, api-and-interface-design
**TEST:** test-driven-development, browser-testing-with-devtools, debugging-and-error-recovery
**REVIEW:** code-review-and-quality, security-and-hardening, performance-optimization
**SIMPLIFY:** code-simplification
**SHIP:** git-workflow-and-versioning, ci-cd-and-automation, deprecation-and-migration, documentation-and-adrs, shipping-and-launch
**Meta:** workflow-tracker, using-agent-skills
```

- [ ] **Step 3: Fix the npm test line**

Find:
```markdown
- `npm test` — Not applicable (this is a documentation project)
```

Replace with:
```markdown
- `npm test` — `node scripts/validate-skills.js && node scripts/score-response.test.js && bash hooks/session-start-test.sh`
```

- [ ] **Step 4: Fix the Validate description**

Find:
```markdown
- Validate: Check that all SKILL.md files have valid YAML frontmatter with name and description
```

Replace with:
```markdown
- Validate: `node scripts/validate-skills.js` — checks YAML frontmatter (name, description), name matches directory, description ≤ 1024 chars, required sections present (Overview, When to Use, Common Rationalizations, Red Flags, Verification), and cross-skill references point to known skills
```

- [ ] **Step 5: Verify the file looks correct**

```bash
cat CLAUDE.md
```

Confirm: SPEC/PLAN/BUILD/TEST/REVIEW/SIMPLIFY/SHIP phases present, `ubiquitous-language` in SPEC, `code-simplification` in SIMPLIFY (not REVIEW), Meta row present, npm test line updated.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: align CLAUDE.md phases and skill mapping with lifecycle.md"
```

---

### Task 4: Correct AGENTS.md scripts and zip requirements

**Files:**
- Modify: `AGENTS.md:92-94`

`AGENTS.md` marks `scripts/` and `{skill-name}.zip` as "Required" in the directory structure template. Neither is true — 25 of 26 skills have no `scripts/` directory and no zip files exist anywhere in the repo.

Also the Lifecycle Mapping section uses the old phase names (DEFINE/VERIFY) instead of SPEC/TEST and is missing SIMPLIFY.

- [ ] **Step 1: Read the current file**

```bash
cat AGENTS.md
```

- [ ] **Step 2: Fix the directory structure template**

Find in the `### Directory Structure` section:
```
skills/
  {skill-name}/           # kebab-case directory name
    SKILL.md              # Required: skill definition
    scripts/              # Required: executable scripts
      {script-name}.sh    # Bash scripts (preferred)
  {skill-name}.zip        # Required: packaged for distribution
```

Replace with:
```
skills/
  {skill-name}/           # kebab-case directory name
    SKILL.md              # Required: skill definition
    scripts/              # Optional: only when the skill ships runnable helpers
      {script-name}.sh    # Bash scripts (preferred)
  {skill-name}.zip        # Optional: for manual distribution outside the plugin manager
```

- [ ] **Step 3: Fix the Lifecycle Mapping section**

Find the `### Lifecycle Mapping (Implicit Commands)` section:
```markdown
- DEFINE → `spec-driven-development`
- PLAN → `planning-and-task-breakdown`
- BUILD → `incremental-implementation` + `test-driven-development`
- VERIFY → `debugging-and-error-recovery`
- REVIEW → `code-review-and-quality`
- SHIP → `shipping-and-launch`
```

Replace with:
```markdown
- SPEC → `spec-driven-development`
- PLAN → `planning-and-task-breakdown`
- BUILD → `incremental-implementation` + `test-driven-development`
- TEST → `debugging-and-error-recovery`, `browser-testing-with-devtools`
- REVIEW → `code-review-and-quality`
- SIMPLIFY → `code-simplification`
- SHIP → `shipping-and-launch`
```

- [ ] **Step 4: Verify the changes**

```bash
grep -A5 "Directory Structure" AGENTS.md | head -10
grep -A10 "Lifecycle Mapping" AGENTS.md | head -12
```

Confirm `scripts/` is "Optional", zip is "Optional", phases are SPEC/TEST/SIMPLIFY.

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md
git commit -m "docs: correct AGENTS.md scripts and zip requirements to Optional, fix phase names"
```

---

### Task 5: Fix lifecycle.md skill mapping

**Files:**
- Modify: `references/lifecycle.md:49`

`deprecation-and-migration` is missing from the SHIP row. `vertical-slicing` appears in the PLAN row but has been merged into `planning-and-task-breakdown`.

- [ ] **Step 1: Read the current file**

```bash
cat references/lifecycle.md
```

- [ ] **Step 2: Fix the SHIP row**

Find:
```markdown
| SHIP | `git-workflow-and-versioning`, `ci-cd-and-automation`, `documentation-and-adrs`, `shipping-and-launch` |
```

Replace with:
```markdown
| SHIP | `git-workflow-and-versioning`, `ci-cd-and-automation`, `deprecation-and-migration`, `documentation-and-adrs`, `shipping-and-launch` |
```

- [ ] **Step 3: Fix the PLAN row**

Find:
```markdown
| PLAN | `planning-and-task-breakdown`, `vertical-slicing` |
```

Replace with:
```markdown
| PLAN | `planning-and-task-breakdown` |
```

- [ ] **Step 4: Verify**

```bash
cat references/lifecycle.md
```

Confirm `deprecation-and-migration` appears in SHIP, `vertical-slicing` is gone from PLAN.

- [ ] **Step 5: Commit**

```bash
git add references/lifecycle.md
git commit -m "docs: add deprecation-and-migration to SHIP phase, remove merged vertical-slicing from PLAN"
```

---

### Task 6: Remove merged vertical-slicing skill directory

**Files:**
- Delete: `skills/vertical-slicing/` (entire directory)

The `vertical-slicing` skill has been merged into `planning-and-task-breakdown`. The directory is stale. The validator will emit a dead cross-reference warning for any skill that still references `vertical-slicing` by name — verify and fix those too.

- [ ] **Step 1: Confirm the directory exists and is tracked**

```bash
git ls-files skills/vertical-slicing/
```

Expected: lists `skills/vertical-slicing/SKILL.md` (and any other files in that dir).

- [ ] **Step 2: Check for cross-references to vertical-slicing in other skills**

```bash
grep -r "vertical-slicing" skills/ --include="*.md" -l
```

For each file listed, check if the reference needs to be removed or updated. Most likely `references/lifecycle.md` (handled in Task 5) and possibly `AGENTS.md` intent mapping.

- [ ] **Step 3: Remove the directory from git**

```bash
git rm -r skills/vertical-slicing/
```

Expected output: `rm 'skills/vertical-slicing/SKILL.md'`

- [ ] **Step 4: Run the validator to confirm no new errors**

```bash
node scripts/validate-skills.js
```

Expected: 25 skills checked (one fewer), 0 errors. There may be warnings about dead cross-references to `vertical-slicing` from other skills — fix each one by removing the reference or replacing it with `planning-and-task-breakdown`.

- [ ] **Step 5: Fix any dead cross-reference warnings**

For each warning like `Dead cross-reference: 'vertical-slicing' is not a known skill`, open the flagged file and either:
- Remove the `vertical-slicing` reference if it is no longer relevant
- Replace with `planning-and-task-breakdown` if the reference describes the same capability

Re-run `node scripts/validate-skills.js` after each fix until 0 warnings.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove merged vertical-slicing skill directory"
```

---

### Task 7: Gitignore ephemeral artifacts and delete empty wheat dir

**Files:**
- Modify: `.gitignore`
- Delete: `wheat/` (empty directory)

`.superpowers/`, `docs/superpowers/`, `docs/plans/`, `docs/specs/`, `docs/tasks/` are agent-generated planning artifacts that should not be tracked. `wheat/` is an empty, purposeless directory.

- [ ] **Step 1: Confirm current untracked status**

```bash
git status --short | grep "^??"
```

Expected: `?? .superpowers/`, `?? docs/superpowers/plans/...`, `?? docs/workflow-tracker-todo-screenshot.md`, etc.

- [ ] **Step 2: Delete the empty wheat directory**

```bash
rm -rf wheat/
```

Confirm it is gone:
```bash
ls wheat/ 2>&1
```
Expected: `ls: wheat/: No such file or directory`

- [ ] **Step 3: Add gitignore entries**

Open `.gitignore` and append the following block at the end:

```
# Ephemeral agent-generated planning artifacts
.superpowers/
docs/superpowers/
docs/plans/
docs/specs/
docs/tasks/
```

- [ ] **Step 4: Verify the untracked noise is gone**

```bash
git status --short
```

Expected: `?? docs/workflow-tracker-todo-screenshot.md` may remain (it is a legitimate doc asset, not a planning artifact). The `.superpowers/` and `docs/superpowers/` entries should no longer appear.

- [ ] **Step 5: Commit**

```bash
git add .gitignore
git commit -m "chore: gitignore ephemeral planning artifacts and remove empty wheat dir"
```

---

## Self-Review Checklist

After all tasks complete, verify:

- [ ] `grep "checkout@v6" .github/workflows/test-plugin-install.yml` → no output
- [ ] `grep "test-scorer\|test-hooks" .github/workflows/test-plugin-install.yml` → both present
- [ ] `grep "SIMPLIFY" CLAUDE.md` → present
- [ ] `grep "Not applicable" CLAUDE.md` → no output
- [ ] `grep "Required: executable" AGENTS.md` → no output
- [ ] `grep "Required: packaged" AGENTS.md` → no output
- [ ] `grep "deprecation-and-migration" references/lifecycle.md` → present in SHIP row
- [ ] `grep "vertical-slicing" references/lifecycle.md` → no output
- [ ] `ls skills/vertical-slicing/ 2>&1` → `No such file or directory`
- [ ] `node scripts/validate-skills.js` → 25 skills, 0 errors, 0 warnings
- [ ] `git status --short` → `.superpowers/` and `docs/superpowers/` no longer appear as untracked
