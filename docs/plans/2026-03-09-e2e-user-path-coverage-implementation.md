# E2E User-Path Coverage Implementation Plan

**Goal:** Implement layered, user-path-focused end-to-end coverage across docs demos, the local component harness, and the packed consumer smoke app in both English and Chinese, without weakening assertions to accommodate incorrect behavior.

**Architecture:** Use docs-page Playwright as the richest live-demo layer, keep the main harness as a minimal browser-level validation layer for core components, and keep smoke as the final packed-package consumer validation layer. Favor small reusable helpers inside tests and only add new test IDs when existing accessible selectors are insufficient.

**Tech Stack:** pnpm, Playwright, Astro docs preview, Vite harness app, packed smoke consumer, React 19

---

### Task 1: Lock in the docs coverage target before changing tests

**Files:**
- Review: `e2e/docs/docs-pages.spec.ts`
- Review: `docs/src/content/docs/reference/show-more.mdx`
- Review: `docs/src/content/docs/reference/middle-truncate.mdx`
- Review: `docs/src/content/docs/reference/truncate.mdx`

**Step 1: Write the failing checklist**

Capture the required docs behaviors:

- home page language switch works in both directions
- `ShowMore` page covers English and Chinese live demos
- `ShowMore` custom button, dialog, tooltip, and `preserveMarkup` paths are exercised
- `MiddleTruncate` page covers English and Chinese live demos
- `Truncate` page verifies localized content and `preserveMarkup` examples are present

**Step 2: Compare current tests to the checklist**

Run:

```bash
sed -n '1,260p' e2e/docs/docs-pages.spec.ts
```

Expected: FAIL the checklist because current coverage is mostly limited to `ShowMore preserveMarkup`.

**Step 3: Record the selector gaps**

Identify which interactions are already reachable via roles/text and which require new `data-testid` values.

**Step 4: Keep the target strict**

Document the assertions that must remain strict even if they currently fail:

- no extra collapsed line regressions
- rich text preserved only when the option is enabled
- tooltip and dialog content must visibly appear
- localized routes must actually switch

---

### Task 2: Add failing docs E2E for home and `ShowMore` user paths

**Files:**
- Modify: `e2e/docs/docs-pages.spec.ts`
- Maybe modify: `docs/src/components/examples/show-more/*.tsx`
- Maybe modify: `docs/src/components/examples/Widgets.tsx`

**Step 1: Write the failing tests**

Add docs Playwright tests for:

- home page English → Chinese switch and Chinese → English switch
- `ShowMore` basic expand/collapse in English and Chinese
- `ShowMore` live demo `custom buttons` flow in English and Chinese
- `ShowMore` dialog demo open/close in English and Chinese
- `ShowMore` tooltip demo visible content in English and Chinese
- existing `preserveMarkup` assertions stay intact and remain strict

**Step 2: Run only the new docs tests to verify RED**

Run a focused command such as:

```bash
pnpm test:e2e:docs --grep "ShowMore|language switch|tooltip|dialog"
```

Expected: FAIL for missing selectors or missing coverage wiring, not because of syntax mistakes.

**Step 3: Add the minimal support needed**

Only if needed:

- add stable `data-testid` hooks to the specific docs examples
- add tiny test helpers inside `e2e/docs/docs-pages.spec.ts`
- do not change component behavior unless a genuine bug is revealed

**Step 4: Re-run the focused docs tests to verify GREEN**

Run the same focused docs command.

Expected: PASS.

---

### Task 3: Add failing docs E2E for `MiddleTruncate` and `Truncate` localized paths

**Files:**
- Modify: `e2e/docs/docs-pages.spec.ts`
- Maybe modify: `docs/src/components/examples/middle-truncate/ControllableMiddleTruncate.tsx`
- Maybe modify: docs components under `docs/src/components/examples/**`

**Step 1: Write the failing tests**

Add docs Playwright coverage for:

- `MiddleTruncate` live demo in English and Chinese
- width slider changes visibly affect truncation
- end-position changes preserve the expected tail behavior
- rich-text toggle keeps the demo functional
- `Truncate` English and Chinese docs routes load the expected localized content and `preserveMarkup` example text

**Step 2: Run the focused docs tests to verify RED**

Run:

```bash
pnpm test:e2e:docs --grep "MiddleTruncate|Truncate"
```

Expected: FAIL because the new tests are not yet supported.

**Step 3: Implement the minimal support**

- add only the selectors needed for stable assertions
- keep assertions behavioral rather than DOM-shape-dependent
- preserve strict locale-sensitive checks

**Step 4: Re-run the focused docs tests to verify GREEN**

Run the same `--grep` command.

Expected: PASS.

---

### Task 4: Extend the local harness for stronger bilingual core-path coverage

**Files:**
- Modify: `e2e/app/App.tsx`
- Modify: `e2e/tests/components.spec.ts`

**Step 1: Write the failing tests**

Add harness Playwright tests for:

- English and Chinese `ShowMore` state toggles
- bilingual `preserveMarkup` collapsed-height comparisons where applicable
- bilingual `MiddleTruncate` tail preservation
- width recalculation remaining strict after resizing

**Step 2: Run the focused harness tests to verify RED**

Run:

```bash
pnpm test:e2e --grep "Chinese|English|preserveMarkup|MiddleTruncate|resize"
```

Expected: FAIL because the harness does not yet expose every required bilingual assertion surface.

**Step 3: Add the minimal harness surface**

- add localized fixture content to `e2e/app/App.tsx`
- add `data-testid` hooks only where role/text selectors are not robust enough
- avoid duplicating docs-only behavior such as full page navigation

**Step 4: Re-run the focused harness tests to verify GREEN**

Run the same command.

Expected: PASS.

---

### Task 5: Extend smoke coverage for packed-package user paths

**Files:**
- Modify: `smoke/consumer/src/App.tsx`
- Modify: `smoke/tests/package-smoke.spec.ts`

**Step 1: Write the failing smoke tests**

Add consumer-path Playwright coverage for:

- packed package imports still succeed
- English and Chinese truncate examples render and truncate
- `ShowMore` interaction still works with explicit state changes
- `MiddleTruncate` preserves the expected suffix

**Step 2: Run focused smoke tests to verify RED**

Run:

```bash
pnpm test:smoke --grep "packed package|Chinese|ShowMore|MiddleTruncate"
```

Expected: FAIL because the consumer app does not yet expose all required localized scenarios.

**Step 3: Add the minimal consumer fixtures**

- extend `smoke/consumer/src/App.tsx` with localized fixture examples
- keep the consumer app intentionally small and realistic
- do not recreate the full docs demo shell inside smoke

**Step 4: Re-run focused smoke tests to verify GREEN**

Run the same `--grep` command.

Expected: PASS.

---

### Task 6: Run full verification before claiming completion

**Files:**
- Verify only

**Step 1: Run docs E2E**

```bash
pnpm test:e2e:docs
```

Expected: PASS.

**Step 2: Run harness E2E**

```bash
pnpm test:e2e
```

Expected: PASS.

**Step 3: Run smoke E2E**

```bash
pnpm test:smoke
```

Expected: PASS.

**Step 4: Review the final diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only docs plans, tests, and minimal test-surface changes are present.
