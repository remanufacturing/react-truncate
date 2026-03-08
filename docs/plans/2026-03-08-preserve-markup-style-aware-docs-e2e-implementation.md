# Preserve Markup Style-Aware Measurement and Docs E2E Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current plain-text-derived `preserveMarkup` boundary with style-aware DOM measurement, and add stable docs-page Playwright coverage for the real docs demos.

**Architecture:** Keep `Truncate` as the single public entry point with two internal engines. The default engine remains the current plain-text path. The opt-in `preserveMarkup` path switches to a style-aware markup engine that measures actual rendered DOM in a hidden container, binary-searches the largest fitting prefix, and re-renders the collapsed output from the markup snapshot. Add a separate Playwright config for docs preview so the reference pages are tested as they are actually published.

**Tech Stack:** React 19, TypeScript, Playwright, Astro preview, DOM Range/layout measurement, Vitest

---

### Task 1: Lock down the style-aware regression in unit tests

**Files:**
- Modify: `test/Truncate.spec.tsx`
- Modify: `test/ShowMore.spec.tsx`

**Step 1: Write the failing tests**

Add focused tests that fail with the current hybrid approach:

- `Truncate preserveMarkup` with nested inline styles whose rendered width causes a plain-text estimate to spill into an extra line
- `ShowMore preserveMarkup` collapsed content that should stay within the requested line count even when inline markup widens the text
- a regression case where preserved markup still keeps `href`, `class`, and `style` while fitting the target line budget

Use deterministic container width and line-height so the assertions are not tied to incidental layout.

**Step 2: Run the targeted suite to verify failure**

Run: `pnpm test:run test/Truncate.spec.tsx test/ShowMore.spec.tsx`

Expected: the new style-aware cases fail with the current implementation, while existing non-markup cases stay green.

**Step 3: Keep the failure evidence small and focused**

Do not broaden the test scope yet. Only prove the bug exists in the current measurement model.

**Step 4: Commit**

```bash
git add test/Truncate.spec.tsx test/ShowMore.spec.tsx
git commit -m "test: capture style-aware preserveMarkup regressions"
```

### Task 2: Refactor the markup engine around real DOM fit checks

**Files:**
- Modify: `src/Truncate/Truncate.tsx`
- Modify: `src/Truncate/engines/markup.tsx`
- Modify: `src/Truncate/markup/render.tsx`
- Modify: `src/Truncate/markup/snapshot.ts`
- Modify: `src/Truncate/types.ts`

**Step 1: Write the failing helper-level tests if needed**

If the new engine needs isolated helper coverage, add narrowly scoped assertions in `test/Truncate.spec.tsx` for:

- snapshot prefix slicing
- leading whitespace handling before the ellipsis
- counting rendered lines from a hidden measurement container

**Step 2: Run the targeted suite to verify failure**

Run: `pnpm test:run test/Truncate.spec.tsx`

Expected: helper assertions fail before the new fit-check helpers exist.

**Step 3: Implement the style-aware measurement path**

Update the markup engine so it:

- no longer depends on plain-text `visibleTextLines`
- builds a preserved snapshot from the hidden rendered node
- renders candidate prefixes plus ellipsis into a hidden measurement container
- counts whether the candidate fits inside the requested line budget using actual DOM layout
- binary-searches the largest fitting prefix
- returns reconstructed collapsed markup that preserves inline DOM semantics

Keep this path gated behind `preserveMarkup === true && middle !== true`.

**Step 4: Run the targeted suite to verify it passes**

Run: `pnpm test:run test/Truncate.spec.tsx test/ShowMore.spec.tsx`

Expected: the new style-aware cases pass and existing preserveMarkup behavior continues to preserve links, classes, styles, and ReactNode ellipsis.

**Step 5: Commit**

```bash
git add src/Truncate/Truncate.tsx src/Truncate/engines/markup.tsx src/Truncate/markup/render.tsx src/Truncate/markup/snapshot.ts src/Truncate/types.ts test/Truncate.spec.tsx test/ShowMore.spec.tsx
git commit -m "feat: make preserveMarkup measurement style-aware"
```

### Task 3: Add stable docs demo anchors for Playwright

**Files:**
- Modify: `docs/src/components/examples/show-more/ControllableShowMore.tsx`
- Modify: `docs/src/components/examples/Widgets.tsx`
- Modify: `docs/src/components/examples/Data.tsx`
- Modify: `docs/src/content/docs/reference/truncate.mdx`
- Modify: `docs/src/content/docs/reference/show-more.mdx`
- Modify: `docs/src/content/docs/zh/reference/show-more.mdx`

**Step 1: Write the failing docs-page tests first**

Create tests that expect stable docs-page selectors to exist before adding them.

Required selectors should cover:

- the docs demo root
- the preserveMarkup toggle
- the rendered collapsed content container
- a preserved inline link or styled span inside the demo
- current expanded/collapsed state for `ShowMore`

**Step 2: Run the docs-page tests to verify failure**

Run: `pnpm test:e2e:docs --list`

Expected: either the docs-page test file is missing or the selectors do not exist yet.

**Step 3: Add deterministic docs demo hooks**

Update the docs demos so Playwright can assert them reliably:

- add stable `data-testid` attributes
- keep demo content fixed and intentionally truncatable
- ensure the demo container uses deterministic width and line-height values for the regression cases

Do not add test-only user-facing copy. Prefer structural hooks and fixed example layout.

**Step 4: Run the docs build-facing checks**

Run: `pnpm -F docs build`

Expected: docs compile successfully with the new demo anchors.

**Step 5: Commit**

```bash
git add docs/src/components/examples/show-more/ControllableShowMore.tsx docs/src/components/examples/Widgets.tsx docs/src/components/examples/Data.tsx docs/src/content/docs/reference/truncate.mdx docs/src/content/docs/reference/show-more.mdx docs/src/content/docs/zh/reference/show-more.mdx
git commit -m "test: add stable docs demo hooks for preserveMarkup"
```

### Task 4: Add a docs-preview Playwright suite

**Files:**
- Create: `playwright.docs.config.ts`
- Create: `e2e/docs-global-setup.mjs`
- Create: `e2e/docs-global-teardown.mjs`
- Create: `e2e/tests/docs-pages.spec.ts`
- Modify: `package.json`

**Step 1: Write the failing docs-page tests**

Add Playwright coverage for these scenarios against the real docs preview server:

- `/reference/truncate/`: `preserveMarkup` collapsed output keeps preserved inline markup and does not exceed the intended line budget
- `/reference/show-more/`: toggling preserveMarkup keeps collapsed output stable and `ShowMore` still expands and collapses
- `/zh/reference/show-more/`: the Chinese preserveMarkup demo does not grow an extra collapsed line

Assert against stable `data-testid` hooks and measured element heights rather than brittle prose.

**Step 2: Run the docs-page suite to verify failure**

Run: `pnpm test:e2e:docs e2e/tests/docs-pages.spec.ts`

Expected: FAIL because the docs Playwright config and preview server setup do not exist yet.

**Step 3: Implement the docs-preview harness**

Add a dedicated Playwright config that:

- builds and previews the Astro docs site
- serves it on a dedicated port
- tears the preview process down cleanly
- keeps source-component E2E and docs-page E2E separate

Expose a root script such as:

```json
{
  "scripts": {
    "test:e2e:docs": "playwright test --config playwright.docs.config.ts"
  }
}
```

**Step 4: Run the docs-page suite to verify it passes**

Run: `pnpm test:e2e:docs e2e/tests/docs-pages.spec.ts`

Expected: PASS for the real docs preview scenarios.

**Step 5: Commit**

```bash
git add playwright.docs.config.ts e2e/docs-global-setup.mjs e2e/docs-global-teardown.mjs e2e/tests/docs-pages.spec.ts package.json
git commit -m "test: cover preserveMarkup in docs preview e2e"
```

### Task 5: Update public docs for the opt-in cost and support boundary

**Files:**
- Modify: `README.md`
- Modify: `docs/src/content/docs/reference/truncate.mdx`
- Modify: `docs/src/content/docs/reference/show-more.mdx`
- Modify: `docs/src/content/docs/zh/reference/truncate.mdx`
- Modify: `docs/src/content/docs/zh/reference/show-more.mdx`

**Step 1: Write the docs changes**

Clarify:

- `preserveMarkup` is opt-in
- style-aware measurement is more expensive than the plain-text default path
- support is aimed at rendered inline DOM, not arbitrary component identity
- docs demos are representative regression cases, not full guarantee of every third-party renderer

**Step 2: Run the relevant validation**

Run: `pnpm -F docs build`

Expected: docs build succeeds after the copy updates.

**Step 3: Commit**

```bash
git add README.md docs/src/content/docs/reference/truncate.mdx docs/src/content/docs/reference/show-more.mdx docs/src/content/docs/zh/reference/truncate.mdx docs/src/content/docs/zh/reference/show-more.mdx
git commit -m "docs: clarify style-aware preserveMarkup behavior"
```

### Task 6: Run focused and broader verification

**Files:**
- Verify only

**Step 1: Run focused unit tests**

Run: `pnpm test:run test/Truncate.spec.tsx test/ShowMore.spec.tsx`

Expected: PASS.

**Step 2: Run source harness E2E**

Run: `pnpm test:e2e e2e/tests/components.spec.ts`

Expected: PASS.

**Step 3: Run docs-page E2E**

Run: `pnpm test:e2e:docs e2e/tests/docs-pages.spec.ts`

Expected: PASS.

**Step 4: Run broader regression checks**

Run:

```bash
pnpm test:run
pnpm build
```

Expected: PASS. If unrelated failures appear, record them separately instead of expanding scope.

**Step 5: Review the diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only the preserveMarkup measurement, docs demo, and docs-page E2E files are changed.
