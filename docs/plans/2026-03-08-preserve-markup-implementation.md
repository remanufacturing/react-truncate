# Preserve Markup Truncation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add opt-in markup-preserving truncation to `Truncate`, forward it through `ShowMore`, and keep the existing plain-text path as the default behavior.

**Architecture:** Keep `src/Truncate/Truncate.tsx` as the single public entry point, but split its internal work into a plain-text engine and a markup engine selected by `preserveMarkup`. Build the markup path around a rendered DOM snapshot model so collapsed output can preserve inline links, classes, and styles produced by children like `linkify-react`.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Happy DOM

---

### Task 1: Add failing API and regression tests for the default path

**Files:**
- Modify: `src/Truncate/types.ts`
- Modify: `test/Truncate.spec.tsx`
- Modify: `test/ShowMore.spec.tsx`

**Step 1: Write the failing test**

Add tests that assert:

- `Truncate` accepts `preserveMarkup`
- default behavior without `preserveMarkup` still renders collapsed plain text
- `ShowMore` without `preserveMarkup` keeps its current collapsed behavior

**Step 2: Run test to verify the baseline**

Run: `pnpm test:run test/Truncate.spec.tsx test/ShowMore.spec.tsx`

Expected: the new type or behavior assertions fail before implementation changes are made.

### Task 2: Extract the current plain-text engine from `Truncate`

**Files:**
- Modify: `src/Truncate/Truncate.tsx`
- Create: `src/Truncate/plain-text.tsx`
- Modify: `src/Truncate/utils.tsx`
- Test: `test/Truncate.spec.tsx`

**Step 1: Write the failing refactor-safety test**

Add targeted tests for existing behaviors that must not change:

- multi-line truncation
- custom `ellipsis`
- `trimWhitespace`
- `middle` mode for the existing plain-text path

**Step 2: Run the targeted suite**

Run: `pnpm test:run test/Truncate.spec.tsx`

Expected: all new assertions describe current behavior and fail only if the refactor changes it.

**Step 3: Move the plain-text logic**

Extract the current `innerText`-based truncation flow from `src/Truncate/Truncate.tsx` into a dedicated internal module, keeping behavior unchanged.

**Step 4: Verify the refactor**

Run: `pnpm test:run test/Truncate.spec.tsx`

Expected: all plain-text tests pass after the extraction.

### Task 3: Add the markup snapshot model

**Files:**
- Create: `src/Truncate/markup-snapshot.ts`
- Modify: `src/Truncate/utils.tsx`
- Test: `test/Truncate.spec.tsx`

**Step 1: Write the failing unit tests**

Add focused tests for a snapshot helper that walks rendered children and captures:

- text nodes
- nested inline elements
- `br`
- inline class and style attributes on preserved elements

**Step 2: Run the targeted suite**

Run: `pnpm test:run test/Truncate.spec.tsx`

Expected: snapshot helper tests fail because the helper does not exist yet.

**Step 3: Implement the minimal snapshot layer**

Create a serializable internal representation for rendered inline markup and a helper to build it from the hidden DOM node.

**Step 4: Verify the helper**

Run: `pnpm test:run test/Truncate.spec.tsx`

Expected: snapshot tests pass and plain-text tests stay green.

### Task 4: Implement markup-preserving end truncation in `Truncate`

**Files:**
- Modify: `src/Truncate/Truncate.tsx`
- Create: `src/Truncate/markup-truncate.tsx`
- Create: `src/Truncate/render-markup.tsx`
- Modify: `src/Truncate/types.ts`
- Test: `test/Truncate.spec.tsx`

**Step 1: Write the failing behavior tests**

Add tests that render collapsed `Truncate preserveMarkup` content containing:

- an anchor element that stays clickable in the DOM
- nested styled spans whose classes or inline styles remain present
- a ReactNode ellipsis appended after preserved markup

**Step 2: Run the targeted suite**

Run: `pnpm test:run test/Truncate.spec.tsx`

Expected: the new `preserveMarkup` cases fail while plain-text tests still pass.

**Step 3: Implement the markup engine**

Route `Truncate` through a new markup path when `preserveMarkup` is true. Use the snapshot model to compute the visible range for end truncation and rebuild the collapsed output while preserving inline DOM semantics.

**Step 4: Verify the behavior**

Run: `pnpm test:run test/Truncate.spec.tsx`

Expected: markup-preservation cases pass and the plain-text suite remains green.

### Task 5: Forward `preserveMarkup` through `ShowMore`

**Files:**
- Modify: `src/ShowMore/types.ts`
- Modify: `src/ShowMore/ShowMore.tsx`
- Test: `test/ShowMore.spec.tsx`

**Step 1: Write the failing tests**

Add tests that render `ShowMore preserveMarkup` with inline rich content and assert:

- collapsed output preserves anchor elements and inline styles
- expanded output still renders the original children directly
- toggling between collapsed and expanded states keeps behavior stable

**Step 2: Run the targeted suite**

Run: `pnpm test:run test/ShowMore.spec.tsx`

Expected: the `preserveMarkup` scenarios fail before the prop is forwarded.

**Step 3: Implement the forwarding path**

Ensure `ShowMore` passes the prop through to `Truncate` without adding its own markup-specific rendering rules.

**Step 4: Verify the suite**

Run: `pnpm test:run test/ShowMore.spec.tsx`

Expected: `ShowMore` passes the new markup tests and existing toggle behavior tests.

### Task 6: Document the new opt-in behavior

**Files:**
- Modify: `README.md`
- Modify: `docs/src/content/docs/reference/truncate.mdx`
- Modify: `docs/src/content/docs/reference/show-more.mdx`
- Modify: `docs/src/content/docs/zh/reference/truncate.mdx`
- Modify: `docs/src/content/docs/zh/reference/show-more.mdx`

**Step 1: Write the docs update**

Document:

- the new `preserveMarkup` prop
- default performance-first behavior
- supported inline markup scope
- known limitations for arbitrary custom components and block elements

**Step 2: Verify the docs build path that matters**

Run: `pnpm test:run test/Truncate.spec.tsx test/ShowMore.spec.tsx`

Expected: code-facing validation remains green after the docs edits.

### Task 7: Run focused verification and note the deferred scope

**Files:**
- Test: `test/Truncate.spec.tsx`
- Test: `test/ShowMore.spec.tsx`
- Reference: `src/MiddleTruncate/MiddleTruncate.tsx`
- Reference: `test/MiddleTruncate.spec.tsx`

**Step 1: Run focused tests**

Run: `pnpm test:run test/Truncate.spec.tsx test/ShowMore.spec.tsx test/MiddleTruncate.spec.tsx`

Expected: `Truncate` and `ShowMore` pass with the new feature, and `MiddleTruncate` remains unaffected by the phase-one change.

**Step 2: Run broader verification**

Run: `pnpm test:run`

Expected: the unit test suite passes without regressions. If unrelated failures appear, record them separately instead of broadening the current feature scope.

**Step 3: Record the deferred work**

Add a short follow-up note in the implementation summary or release notes that `MiddleTruncate` markup preservation remains a separate second-phase task.
