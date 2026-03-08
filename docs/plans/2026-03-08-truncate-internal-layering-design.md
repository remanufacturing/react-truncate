# Truncate Internal Layering Design

**Date:** 2026-03-08

**Scope**

This design only reorganizes the internal structure of `src/Truncate/`. It does not expand scope into `ShowMore` or `MiddleTruncate`, because both are thin wrappers and do not need early abstraction pressure.

## Problem Statement

`Truncate` has evolved from a mostly plain-text truncation component into a dual-engine component:

- default plain-text truncation path
- opt-in markup-preserving truncation path via `preserveMarkup`

The new behavior is already separated by responsibility at the code level, but the files are still mostly flat under `src/Truncate/`. That makes it harder to understand which files are public API, which ones are engines, and which ones are markup-specific internals.

## Goals

- Keep the public API unchanged
- Improve discoverability inside `src/Truncate/`
- Make `Truncate.tsx` read like an orchestration layer, not a feature dump
- Separate plain-text and markup paths more clearly
- Create a directory structure that can support future phase-two work for markup-aware middle truncation

## Non-Goals

- No new public components
- No behavior changes
- No early restructuring of `ShowMore` or `MiddleTruncate`
- No additional abstraction such as hooks, factories, or contexts unless clearly needed later

## Options Considered

### Option A: Keep a flat directory and only rename files

**Pros**
- Smallest possible diff
- Low movement cost

**Cons**
- File count still grows in one place
- The difference between engine files, markup files, and shared helpers remains implicit
- Future `MiddleTruncate` markup support will likely make the flat structure noisy again

**Decision**
- Rejected

### Option B: Add light internal layering under `src/Truncate/`

**Pros**
- Clearer mental model without over-engineering
- Keeps `Truncate.tsx` as a simple public entry point
- Gives markup-specific code a home without exposing it publicly
- Supports future reuse for phase-two markup work

**Cons**
- Requires moving files and updating imports
- Slightly more initial churn than renaming only

**Decision**
- Recommended

### Option C: Fully feature-style nested module tree

**Pros**
- Most formal long-term modularity

**Cons**
- Too heavy for current project size
- Risks turning a cleanup into a framework-style re-architecture
- Adds indirection before it adds enough value

**Decision**
- Rejected for now

## Recommended Structure

```text
src/Truncate/
  Truncate.tsx
  index.ts
  types.ts
  engines/
    plain-text.tsx
    markup.tsx
  markup/
    snapshot.ts
    render.tsx
  shared/
    utils.tsx
```

## Responsibilities

### `Truncate.tsx`

- Remains the only public component implementation
- Owns prop parsing, measurement lifecycle, engine selection, and `onTruncate`
- Must not contain detailed snapshot or reconstruction logic

### `engines/plain-text.tsx`

- Owns plain-text truncation behavior
- Can depend on shared helpers
- Must not depend on markup internals

### `engines/markup.tsx`

- Owns markup-preserving truncation behavior
- Can depend on `markup/*`
- Must not own React lifecycle or DOM measurement concerns beyond its direct inputs

### `markup/snapshot.ts`

- Converts rendered DOM into an internal snapshot structure
- Knows about inline DOM semantics only
- Must not know about lines, `onTruncate`, or public component concerns

### `markup/render.tsx`

- Converts a truncated snapshot back into React output
- Handles attribute normalization needed for React rendering
- Must stay independent from engine selection logic

### `shared/utils.tsx`

- Contains only helpers shared across multiple paths
- Candidate contents:
  - `innerText`
  - `trimRight`
  - `getEllipsisWidth`
  - `getMiddleTruncateFragments`
  - `renderLine`
- Must not depend on engines or markup modules

## Dependency Rules

Allowed direction:

- `Truncate.tsx` -> `engines/*`, `shared/*`, `types.ts`
- `engines/plain-text.tsx` -> `shared/*`
- `engines/markup.tsx` -> `markup/*`
- `markup/*` -> local helpers only
- `shared/*` -> no upward dependencies

Disallowed direction:

- `shared/*` -> `engines/*`
- `shared/*` -> `markup/*`
- `markup/*` -> `engines/*`

The rule is simple: dependencies should flow downward only.

## Why This Is the Right Size

This structure improves readability without over-designing:

- public entry remains obvious
- engine split is visible
- markup-specific internals stop polluting the top-level directory
- future phase-two work has a natural home

At the same time, it avoids premature patterns such as deeply nested modules, contexts, or hook-only decomposition.

## Migration Strategy

1. Move files into the new directories without changing behavior
2. Update imports only
3. Run focused tests for `Truncate`, `ShowMore`, and `MiddleTruncate`
4. Run full unit tests and lint
5. Stop after structure is stabilized

## Risk Management

Primary risks:

- broken relative import paths
- minor lint issues from import ordering after file moves
- accidental behavior changes if movement and refactor are mixed together

Mitigation:

- keep the change as a pure structure move
- avoid opportunistic rewrites while relocating files
- rely on existing passing tests as regression coverage

## Recommendation

Proceed with a light internal layering refactor for `src/Truncate/` only. Keep the public API and behavior unchanged, move files into `engines/`, `markup/`, and `shared/`, and stop once the directory semantics are clear and tests are green.
