# Coverage 99+ Design

**Goal:** Raise unit-test coverage from the current post-fix level to 99%+ without changing production behavior.

**Context:** The recent `preserveMarkup` work added substantial new logic under `src/Truncate/engines/markup.tsx` and `src/Truncate/markup/render.tsx`. CI focused on browser E2E coverage, so Codecov correctly reported a project-level drop. A first recovery pass already moved local coverage to `98.41%`, leaving only a handful of defensive branches uncovered.

**Recommended Approach:** Add focused unit tests only, centered in `test/Markup.spec.tsx`, and avoid any production refactor. This keeps the fix surgical, preserves behavior, and directly addresses the Codecov signal instead of muting it.

## Options Considered

### Option A: Add focused helper and engine tests
- Keep all changes in tests
- Target the remaining uncovered branches directly
- Fastest path to 99%+

**Trade-off:** A few tests will exercise fairly defensive branches, so they are slightly more synthetic than top-level component tests.

### Option B: Refactor helper internals for easier direct testing
- Could make each branch easier to target
- Might reduce test setup complexity

**Trade-off:** Changes production code purely for coverage, which is unnecessary for this CI repair.

### Option C: Relax or reshape coverage rules
- Fast to make CI green

**Trade-off:** Hides a real test gap and weakens the project signal. Rejected.

## Design

### Scope
- Modify only `test/Markup.spec.tsx`
- Do not modify `src/**` unless a genuine bug is discovered
- Keep existing E2E coverage unchanged

### Test strategy
- Cover the remaining helper branches in `render.tsx`
- Cover the remaining defensive cleanup branches in `markup.tsx`
- Reuse the current measurement sandbox so tests stay close to the real `preserveMarkup` execution path

### Success criteria
- `pnpm vitest run test/Markup.spec.tsx` passes
- `pnpm coverage` reports total coverage at `99%+`
- No production behavior changes
