# Utils Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add missing unit tests so the current `vitest` coverage scope for `src/**` reaches 100% without changing production code.

**Architecture:** Keep all changes in the existing `test/Truncate.spec.tsx` suite. Target uncovered branches in `src/Truncate/utils.tsx`, especially the expansion, proportional truncation, and final fine-tuning paths inside `getMiddleTruncateFragments`.

**Tech Stack:** React, Vitest, Testing Library, Sinon

---

### Task 1: Add failing coverage tests for `getMiddleTruncateFragments`

**Files:**
- Modify: `test/Truncate.spec.tsx`
- Test: `test/Truncate.spec.tsx`

**Step 1: Write the failing test**

Add focused test cases for:
- expanding `startFragment` before hitting `targetWidth`
- expanding `endFragment` when more width remains
- truncating `endFragment` when it is proportionally wider
- truncating only one side after the opposite side becomes empty
- fine-tuning with one extra character added to `startFragment`
- fine-tuning with one extra character added to `endFragment`

**Step 2: Run test to verify expected behavior**

Run: `pnpm test test/Truncate.spec.tsx`

Expected: the new cases either pass immediately because behavior already exists, or fail with assertion output that identifies the remaining uncovered path.

### Task 2: Verify full coverage

**Files:**
- Test: `test/Truncate.spec.tsx`

**Step 1: Run the targeted suite**

Run: `pnpm test test/Truncate.spec.tsx`

Expected: all tests pass.

**Step 2: Run coverage**

Run: `pnpm coverage`

Expected: `src/**` coverage reaches 100% for statements, branches, functions, and lines. If any path remains uncovered, add one more focused test and re-run coverage.
