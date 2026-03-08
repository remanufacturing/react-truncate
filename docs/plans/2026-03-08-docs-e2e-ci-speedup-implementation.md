# Docs E2E CI Speedup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce CI time for docs-page E2E by separating docs build work from docs preview test execution, so the docs suite does not rebuild the library and docs site inside Playwright setup.

**Architecture:** Keep `pnpm test:e2e:docs` as the convenient all-in-one local entry point, but split CI-facing responsibilities into two layers: a build layer that produces `dist/` and `docs/dist/`, and a preview-only Playwright layer that only launches `astro preview` against prebuilt assets. Wire CI to build once, then run docs E2E against the prebuilt output. Avoid artifact orchestration for now; rely on job-local reuse inside the same checkout to keep the change small and stable.

**Tech Stack:** pnpm, Playwright, Astro preview, GitHub Actions, Node.js 20

---

### Task 1: Add a preview-only docs E2E path

**Files:**
- Modify: `e2e/docs-global-setup.mjs`
- Modify: `package.json`
- Test: `playwright.docs.config.ts`

**Step 1: Write the failing expectation**

Define the intended split in commands:

```bash
pnpm test:e2e:docs
pnpm test:e2e:docs:preview e2e/tests/docs-pages.spec.ts
```

The first remains all-in-one. The second must only preview and test already-built docs.

**Step 2: Run command to verify it fails**

Run: `pnpm test:e2e:docs:preview --list`
Expected: FAIL because the script does not exist yet.

**Step 3: Write minimal implementation**

Update the docs E2E entrypoints so:

- `test:e2e:docs` still works as the all-in-one developer command
- `test:e2e:docs:preview` runs the same Playwright config with an env flag such as `SKIP_DOCS_E2E_BUILD=1`
- `e2e/docs-global-setup.mjs` skips `pnpm build:lib` and `pnpm -F docs build` when that env flag is set
- the setup still always starts and health-checks `astro preview`

**Step 4: Run command to verify it passes**

Run: `pnpm test:e2e:docs:preview --list`
Expected: PASS and list the docs-page specs.

**Step 5: Commit**

```bash
git add package.json e2e/docs-global-setup.mjs
git commit -m "test: split docs e2e preview from build"
```

### Task 2: Add a dedicated build command for CI reuse

**Files:**
- Modify: `package.json`

**Step 1: Write the failing expectation**

Define a single explicit command that CI can run once before docs-page Playwright:

```bash
pnpm build:docs:e2e
```

It should build both the library output and the docs static output needed by preview.

**Step 2: Run command to verify it fails**

Run: `pnpm build:docs:e2e`
Expected: FAIL because the script does not exist yet.

**Step 3: Write minimal implementation**

Add a script such as:

```json
{
  "scripts": {
    "build:docs:e2e": "run-s build:lib build:docs"
  }
}
```

Keep it small and explicit. Do not over-abstract the build matrix.

**Step 4: Run command to verify it passes**

Run: `pnpm build:docs:e2e`
Expected: PASS and produce `dist/` plus `docs/dist/`.

**Step 5: Commit**

```bash
git add package.json
git commit -m "build: add docs e2e build entrypoint"
```

### Task 3: Rewire CI so docs E2E reuses the prebuilt output

**Files:**
- Modify: `.github/workflows/github-ci.yml`

**Step 1: Write the failing checklist**

The `verify` job should satisfy this updated sequence:

- install dependencies once
- install Playwright Chromium once
- run `pnpm test:run`
- run `pnpm test:e2e`
- run `pnpm build:docs:e2e`
- run `pnpm test:e2e:docs:preview e2e/tests/docs-pages.spec.ts`
- only then continue to coverage or downstream jobs

**Step 2: Compare current workflow to the checklist**

Inspect: `.github/workflows/github-ci.yml`
Expected: FAIL because docs-page E2E is not yet wired as a preview-only post-build step.

**Step 3: Write minimal implementation**

Update CI so the `verify` job:

- builds docs-page E2E assets once with `pnpm build:docs:e2e`
- runs docs-page Playwright via `pnpm test:e2e:docs:preview e2e/tests/docs-pages.spec.ts`
- does not trigger a second docs rebuild inside Playwright setup

Do not add artifacts or extra jobs yet.

**Step 4: Verify the workflow definition**

Run: `sed -n '1,260p' .github/workflows/github-ci.yml`
Expected: the verify job clearly builds once and runs preview-only docs E2E after that build.

**Step 5: Commit**

```bash
git add .github/workflows/github-ci.yml
git commit -m "ci: reuse built docs output for docs e2e"
```

### Task 4: Run focused verification for the split flow

**Files:**
- Verify only

**Step 1: Run the build command**

Run: `pnpm build:docs:e2e`
Expected: PASS.

**Step 2: Run preview-only docs E2E**

Run: `pnpm test:e2e:docs:preview e2e/tests/docs-pages.spec.ts`
Expected: PASS without rebuilding docs inside Playwright setup.

**Step 3: Run the all-in-one command**

Run: `pnpm test:e2e:docs e2e/tests/docs-pages.spec.ts`
Expected: PASS so local developer ergonomics remain unchanged.

**Step 4: Review changed files**

Run:

```bash
git status --short
git diff --stat
```

Expected: only docs E2E entrypoints, scripts, and CI wiring changed for this speedup task.
