# Coverage 99+ Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Raise project unit-test coverage to 99%+ by adding focused tests for the remaining uncovered `preserveMarkup` helper branches.

**Architecture:** Keep production code unchanged and extend the existing focused spec `test/Markup.spec.tsx`. Use narrowly scoped assertions that target the remaining uncovered defensive branches in the snapshot/render helpers and markup truncation engine, then verify with the existing `vitest` coverage workflow.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Sinon, Happy DOM

---

### Task 1: Cover remaining render helper branches

**Files:**
- Modify: `test/Markup.spec.tsx`
- Reference: `src/Truncate/markup/render.tsx`

**Step 1: Write the failing tests**
- Add tests for `sliceSnapshotNodes` with zero or fractional remaining width.
- Add tests for `trimLeadingWhitespace` when the first node is a line break.
- Add tests for any still-uncovered whitespace handling branches.

**Step 2: Run test to verify it fails or expands coverage needfully**
Run: `pnpm vitest run test/Markup.spec.tsx`
Expected: Existing suite stays green or a new assertion fails for the uncovered branch.

**Step 3: Write minimal test-only implementation**
- Adjust only test fixtures/assertions until the branch is exercised correctly.

**Step 4: Run test to verify it passes**
Run: `pnpm vitest run test/Markup.spec.tsx`
Expected: PASS

### Task 2: Cover remaining markup engine defensive branches

**Files:**
- Modify: `test/Markup.spec.tsx`
- Reference: `src/Truncate/engines/markup.tsx`

**Step 1: Write the failing tests**
- Add a test that forces recursive cleanup of whitespace-only text and empty elements.
- Add a test that exercises unsupported child-node cleanup in the truncation clone path.

**Step 2: Run test to verify it fails or expands coverage needfully**
Run: `pnpm vitest run test/Markup.spec.tsx`
Expected: Targeted assertions prove the branch is now reached.

**Step 3: Write minimal test-only implementation**
- Keep the change isolated to fixture setup and expectations in `test/Markup.spec.tsx`.

**Step 4: Run test to verify it passes**
Run: `pnpm vitest run test/Markup.spec.tsx`
Expected: PASS

### Task 3: Verify project coverage

**Files:**
- Verify: `test/Markup.spec.tsx`

**Step 1: Run focused tests**
Run: `pnpm vitest run test/Markup.spec.tsx`
Expected: PASS

**Step 2: Run full coverage**
Run: `pnpm coverage`
Expected: Total coverage reaches at least `99%`

**Step 3: Review result**
- Confirm no production files changed.
- Confirm only test/docs plan files were touched.
