# Truncate Internal Layering Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize `src/Truncate/` into a light internal directory structure without changing public API or runtime behavior.

**Architecture:** Keep `src/Truncate/Truncate.tsx` as the single public component implementation, but move engine-specific logic into `engines/`, markup-specific internals into `markup/`, and reusable helpers into `shared/`. This is a structure-only refactor backed by existing tests.

**Tech Stack:** React, TypeScript, Vitest, ESLint

---

### Task 1: Move shared helpers into `shared/`

**Files:**
- Create: `src/Truncate/shared/`
- Move: `src/Truncate/utils.tsx` -> `src/Truncate/shared/utils.tsx`
- Modify: imports that currently reference `src/Truncate/utils.tsx`
- Test: `test/Truncate.spec.tsx`

**Step 1: Perform the move**

Move `utils.tsx` into `shared/utils.tsx` without changing its contents.

**Step 2: Update imports**

Point all existing imports to the new shared path.

**Step 3: Run focused verification**

Run: `pnpm test:run test/Truncate.spec.tsx`

Expected: `Truncate` tests still pass after the path move.

### Task 2: Move engines into `engines/`

**Files:**
- Create: `src/Truncate/engines/`
- Move: `src/Truncate/plain-text.tsx` -> `src/Truncate/engines/plain-text.tsx`
- Move: `src/Truncate/markup-truncate.tsx` -> `src/Truncate/engines/markup.tsx`
- Modify: `src/Truncate/Truncate.tsx`
- Test: `test/Truncate.spec.tsx`
- Test: `test/ShowMore.spec.tsx`

**Step 1: Perform the moves**

Move the plain-text and markup engine files into `engines/`.

**Step 2: Update imports**

Update `Truncate.tsx` and any tests or utilities that reference the old engine paths.

**Step 3: Run focused verification**

Run: `pnpm test:run test/Truncate.spec.tsx test/ShowMore.spec.tsx`

Expected: both suites pass with no behavior changes.

### Task 3: Move markup internals into `markup/`

**Files:**
- Create: `src/Truncate/markup/`
- Move: `src/Truncate/markup-snapshot.ts` -> `src/Truncate/markup/snapshot.ts`
- Move: `src/Truncate/render-markup.tsx` -> `src/Truncate/markup/render.tsx`
- Modify: `src/Truncate/engines/markup.tsx`
- Modify: tests that import snapshot helpers directly
- Test: `test/Truncate.spec.tsx`

**Step 1: Perform the moves**

Move the snapshot and render helpers into the new `markup/` directory.

**Step 2: Update imports**

Update the markup engine and snapshot tests to use the new locations.

**Step 3: Run focused verification**

Run: `pnpm test:run test/Truncate.spec.tsx`

Expected: snapshot-related tests and markup-preservation tests remain green.

### Task 4: Clean up top-level `Truncate` exports and imports

**Files:**
- Modify: `src/Truncate/Truncate.tsx`
- Modify: `src/Truncate/index.ts`
- Reference: `src/index.ts`

**Step 1: Verify top-level API remains stable**

Ensure public exports still expose the same component and public types only.

**Step 2: Normalize local imports**

Make sure the top-level `Truncate.tsx` now clearly reads as an orchestration file that imports from `engines/` and `shared/`.

**Step 3: Run API-facing verification**

Run: `pnpm test:run test/Truncate.spec.tsx test/ShowMore.spec.tsx test/MiddleTruncate.spec.tsx`

Expected: all wrapper-facing behavior remains unchanged.

### Task 5: Run full verification and stop

**Files:**
- Reference: `src/Truncate/**`
- Test: `test/Truncate.spec.tsx`
- Test: `test/ShowMore.spec.tsx`
- Test: `test/MiddleTruncate.spec.tsx`

**Step 1: Run lint**

Run: `pnpm lint`

Expected: import ordering and path updates are clean.

**Step 2: Run full unit tests**

Run: `pnpm test:run`

Expected: all current unit tests pass with no behavior regressions.

**Step 3: Stop after the move**

Do not introduce extra abstraction beyond the agreed directory layering. If a new cleanup idea appears, capture it separately instead of extending this refactor.
