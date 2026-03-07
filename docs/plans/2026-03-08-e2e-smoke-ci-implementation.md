# E2E, Smoke, and CI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add practical Playwright-based source E2E tests, packed-package smoke tests, and CI automation for this React component library without depending on the docs site.

**Architecture:** Build a minimal `e2e` harness app that imports the library source in a real browser and exposes stable assertions through `data-testid`. Build a separate `smoke` consumer app that installs the packed tarball, verifies package exports in a realistic consumer environment, and runs Playwright against that app. Keep unit coverage in `vitest`, browser behavior in `Playwright`, and wire all three into GitHub Actions.

**Tech Stack:** React 19, Vite, Playwright, pnpm, GitHub Actions

---

### Task 1: Add test tooling and scripts

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Step 1: Write the failing test**

Create commands that should exist after the feature is complete:

```bash
pnpm test:e2e --list
pnpm test:smoke --list
```

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e --list`
Expected: FAIL because the script does not exist yet.

**Step 3: Write minimal implementation**

Add root dev dependencies and scripts:

```json
{
  "scripts": {
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "smoke:prepare": "node ./smoke/scripts/prepare-smoke-package.mjs",
    "test:smoke": "playwright test --config smoke/playwright.config.ts"
  },
  "devDependencies": {
    "@playwright/test": "...",
    "@vitejs/plugin-react": "...",
    "vite": "..."
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test:e2e --list`
Expected: Playwright starts and lists zero-or-more tests instead of script-not-found.

### Task 2: Add source E2E harness and failing browser tests

**Files:**

- Create: `playwright.config.ts`
- Create: `e2e/index.html`
- Create: `e2e/app/main.tsx`
- Create: `e2e/app/App.tsx`
- Create: `e2e/global-setup.mjs`
- Create: `e2e/global-teardown.mjs`
- Create: `e2e/vite.config.ts`
- Create: `e2e/tests/components.spec.ts`

**Step 1: Write the failing test**

Add Playwright tests for these source-level scenarios:

```ts
test('renders truncate scenario in browser', ...)
test('show-more expands and collapses', ...)
test('middle-truncate preserves suffix', ...)
test('truncate recalculates after resize', ...)
```

Use `data-testid` markers like `truncate-text`, `show-more-state`, `middle-text`, and `resize-width` in the harness app so the tests assert user-visible behavior.

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e e2e/tests/components.spec.ts`
Expected: FAIL because the harness app/config/files do not exist yet.

**Step 3: Write minimal implementation**

Build a Vite-powered React harness rooted at `e2e/` that renders:

- a narrow `Truncate` example with long text
- a `ShowMore` example with clear expand/collapse labels
- a `MiddleTruncate` example with a deterministic file-like string
- a resize scenario driven by container width state and buttons

Start/stop the harness server from Playwright global setup and teardown, matching the `vue-picture-cropper` pattern.

**Step 4: Run test to verify it passes**

Run: `pnpm test:e2e e2e/tests/components.spec.ts`
Expected: PASS for the new source E2E tests.

### Task 3: Add packed-package smoke consumer and failing smoke tests

**Files:**

- Create: `smoke/consumer/index.html`
- Create: `smoke/consumer/package.json`
- Create: `smoke/consumer/tsconfig.json`
- Create: `smoke/consumer/vite.config.ts`
- Create: `smoke/consumer/src/main.tsx`
- Create: `smoke/consumer/src/App.tsx`
- Create: `smoke/global-setup.mjs`
- Create: `smoke/global-teardown.mjs`
- Create: `smoke/playwright.config.ts`
- Create: `smoke/scripts/prepare-smoke-package.mjs`
- Create: `smoke/tests/package-smoke.spec.ts`

**Step 1: Write the failing test**

Add smoke assertions for the packed tarball consumer:

```ts
test('renders packed package consumer page', ...)
test('packed package show-more interaction works', ...)
```

The consumer should expose stable status nodes like `smoke-page-ready`, `smoke-package-imported`, `smoke-truncate-text`, and `smoke-show-more-state`.

**Step 2: Run test to verify it fails**

Run: `pnpm test:smoke --list`
Expected: FAIL because the smoke config/consumer do not exist yet.

**Step 3: Write minimal implementation**

Follow the reference repository pattern:

- build the library tarball with `pnpm pack`
- rewrite `smoke/consumer/package.json` to install the tarball
- install consumer dependencies
- start the consumer app with Vite
- run Playwright against the consumer app

Keep the smoke app minimal and only prove that real package exports render and interact correctly.

**Step 4: Run test to verify it passes**

Run: `pnpm test:smoke`
Expected: PASS for the smoke scenarios.

### Task 4: Update CI for unit, E2E, smoke, and deploy

**Files:**

- Modify: `.github/workflows/github-ci.yml`

**Step 1: Write the failing test**

Define the expected CI stages as a checklist:

- verify install on Node 20 with pnpm cache
- install Playwright Chromium
- run `pnpm test:run`
- run `pnpm test:e2e`
- build library and docs
- optionally run coverage and smoke on `main`

**Step 2: Run test to verify it fails**

Compare the current workflow against the checklist.
Expected: FAIL because it does not install Playwright or run the new E2E/smoke commands.

**Step 3: Write minimal implementation**

Restructure CI into separate `verify`, `smoke`, and `deploy` jobs following the proven layout from the reference repo, adapted to this repo’s docs output directory.

**Step 4: Run test to verify it passes**

Run: `pnpm exec tsc --noEmit` only if needed for changed TS files, then inspect `.github/workflows/github-ci.yml` against the checklist.
Expected: Workflow definition includes all required jobs and commands.

### Task 5: Final verification

**Files:**

- Verify only

**Step 1: Run focused checks**

```bash
pnpm test:e2e e2e/tests/components.spec.ts
pnpm test:smoke
```

**Step 2: Run broader checks**

```bash
pnpm test:run
pnpm build
```

**Step 3: Review changed files**

```bash
git status --short
git diff --stat
```

**Step 4: Summarize evidence**

Record exact commands run and whether they passed before claiming completion.
