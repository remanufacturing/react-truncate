# E2E Suite Isolation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent docs-only Playwright specs from ever being picked up by the main source E2E suite again.

**Architecture:** Split Playwright specs by responsibility at the filesystem level. Keep source-app browser tests under `e2e/tests` for the main Vite-backed config, and move docs-page browser tests into `e2e/docs` for the Astro-preview-backed config. This removes suite overlap without depending on `testIgnore` filters.

**Tech Stack:** Playwright, pnpm, Astro preview, Vite

---

### Task 1: Separate docs specs from source specs

**Files:**
- Create: `e2e/docs/docs-pages.spec.ts`
- Modify: `playwright.docs.config.ts`
- Modify: `playwright.config.ts`
- Remove: `e2e/tests/docs-pages.spec.ts`

**Step 1: Write the failing expectation**

Define the intended suite boundaries:

```bash
pnpm test:e2e --list
pnpm test:e2e:docs:preview --list
```

The first should list only source-app tests. The second should list only docs-page tests.

**Step 2: Run commands to show current overlap risk**

Run: `pnpm test:e2e --list`
Expected: PASS but currently relies on `testIgnore`, proving the suite boundary is config-based instead of directory-based.

**Step 3: Write minimal implementation**

- Move `docs-pages.spec.ts` into `e2e/docs/`
- Point `playwright.docs.config.ts` at `./e2e/docs`
- Remove the temporary `testIgnore` from `playwright.config.ts`

**Step 4: Run commands to verify the split**

Run: `pnpm test:e2e --list`
Expected: PASS and list only `components.spec.ts`

Run: `pnpm test:e2e:docs:preview e2e/docs/docs-pages.spec.ts --workers=1`
Expected: PASS and run only the 2 docs-page tests

**Step 5: Commit**

```bash
git add playwright.config.ts playwright.docs.config.ts e2e/docs/docs-pages.spec.ts
git rm e2e/tests/docs-pages.spec.ts
git commit -m "test: isolate docs e2e suite"
```
