# E2E User-Path Coverage Design

**Goal:** Expand end-to-end coverage beyond the recent `ShowMore`-focused docs checks so the project exercises realistic user paths across docs live demos, the local browser harness, and the packed-package smoke consumer in both English and Chinese.

**Context:** Current docs-page Playwright coverage is intentionally narrow and centered on the newly added `preserveMarkup` behavior in `ShowMore`. That was the right short-term focus, but it leaves gaps around navigation, language switching, `MiddleTruncate`, `Truncate`, custom actions such as dialog and tooltip flows, and consumer-package behavior. The user also reported prior language-specific truncation differences, so English-only checks are not sufficient.

**Recommended Approach:** Use a layered user-path strategy. Keep docs E2E as the main source of truth for live demos, extend the main `e2e` harness to cover minimal but meaningful browser scenarios for core components, and extend the smoke suite to verify the packed package still behaves correctly in a consumer app. Prefer strong behavioral assertions over snapshots or overly permissive text checks.

## Options Considered

### Option A: Expand only docs E2E
- Smallest change surface
- Directly targets live demo regressions

**Trade-off:** Misses regressions that only appear in the lightweight harness or packed consumer app.

### Option B: Layered user-path coverage across docs, harness, and smoke
- Covers docs live demos where users actually interact
- Covers minimal core-component behavior outside the docs shell
- Covers real package consumption behavior after packing/installing
- Lets English and Chinese assertions exist at each layer where they add signal

**Trade-off:** More tests and longer total runtime.

### Option C: Full component-prop matrix in Playwright
- Broadest theoretical behavioral coverage

**Trade-off:** High maintenance cost, duplicated assertions, and too much coupling between docs demos and implementation details. Rejected.

## Design

### Scope
- Extend docs-page Playwright coverage for:
  - home page navigation and language switching
  - `ShowMore` live demos in English and Chinese
  - `MiddleTruncate` live demos in English and Chinese
  - `Truncate` docs page sanity coverage in English and Chinese
- Extend the local browser harness so Playwright can assert bilingual core behavior without relying on the docs shell
- Extend the smoke consumer so packed-package behavior is validated through realistic user paths, including language-sensitive truncation examples

### Test philosophy
- Assert the intended user-visible behavior, not implementation accidents.
- Do **not** weaken assertions to match incorrect output.
- If current code is wrong, tests must fail and expose it.
- Prefer explicit checks such as:
  - collapsed vs. expanded state changes
  - presence of `…`
  - preserved inline rich-text nodes when `preserveMarkup` is enabled
  - stable collapsed height with no extra line regressions
  - preserved suffix for middle truncation
  - language switch reaching the correct localized route
- Avoid screenshot or pixel-perfect assertions because they are brittle across text rendering differences.

### Suite layout
- `e2e/docs/docs-pages.spec.ts`
  - Organize by page with `test.describe()` blocks
  - Split English and Chinese paths explicitly rather than hiding locale in loops that become hard to debug
  - Add lightweight helpers for sliders, switches, text extraction, and localized route checks
- `e2e/tests/components.spec.ts`
  - Keep the harness focused on minimal core browser behavior
  - Add only the scenarios that add signal beyond docs, especially bilingual truncation and width recalculation
- `smoke/tests/package-smoke.spec.ts`
  - Keep assertions high-value and consumer-focused
  - Validate import success, rendering success, and core interactive behavior in both languages where supported

### Selector strategy
- Reuse existing `data-testid` attributes wherever possible
- Add targeted new `data-testid` values only when a behavior cannot be asserted reliably through accessible roles or existing structure
- For Radix tooltip assertions, target visible popper content rather than the hidden accessibility helper node

### Non-goals
- No visual regression snapshots
- No exhaustive prop Cartesian-product matrix
- No production refactor unless a real bug is discovered while writing tests
- No test behavior that “accepts” broken truncation output just to keep CI green

### Success criteria
- `pnpm test:e2e:docs` passes with broader English and Chinese user-path coverage
- `pnpm test:e2e` passes with stronger bilingual core-harness coverage
- `pnpm test:smoke` passes with stronger consumer-path coverage
- New assertions are strict enough to fail on known classes of incorrect truncation behavior, especially locale-sensitive regressions
