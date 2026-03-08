# Preserve Markup Truncation Design

**Date:** 2026-03-08

**Problem Statement**

`Truncate` currently flattens `children` into plain text before computing the collapsed result. This makes the collapsed state lose rendered markup semantics such as links, inline styles, classes, and DOM structure produced by components like `linkify-react`. As a result:

- issue `#22` cannot keep clickable links in the collapsed state
- issue `#26` loses `Linkify` styling in `ShowMore` while collapsed
- `ShowMore` and `MiddleTruncate` inherit the same limitation because they are thin wrappers around `Truncate`

## Goals

- Preserve rendered inline markup in the collapsed state when explicitly requested
- Keep the existing default performance profile for plain-text users
- Make `ShowMore` inherit the capability without new public components
- Prepare `MiddleTruncate` for phased support instead of forcing full parity immediately

## Non-Goals

- Do not guarantee perfect preservation of arbitrary React component identity
- Do not guarantee block-level layout truncation in the first phase
- Do not change the default truncation behavior for existing users
- Do not introduce a parallel public component family such as `MarkupTruncate`

## Public API Direction

Keep the existing public components unchanged and add one opt-in prop on `Truncate`:

```ts
interface TruncateProps {
  preserveMarkup?: boolean
}
```

Recommended behavior:

- `preserveMarkup` defaults to `false`
- `false` keeps the current plain-text truncation engine
- `true` enables a markup-preserving engine that works from rendered DOM output
- `ShowMore` transparently forwards `preserveMarkup`
- `MiddleTruncate` is phased separately and should not promise full support in the first release

## Why Not a New Public Component

Creating a public `MarkupTruncate` would split the API surface and quickly raise follow-up questions such as whether `MarkupShowMore` and `MarkupMiddleTruncate` are also required. Keeping a single public `Truncate` with an opt-in flag gives users one mental model, keeps docs smaller, and isolates the performance cost to users who need the feature.

## Internal Architecture

`Truncate` remains the only public entry point but internally routes between two engines:

1. **Plain-text engine**
   - current logic
   - default path
   - optimized for performance

2. **Markup engine**
   - enabled only when `preserveMarkup === true`
   - works from rendered DOM structure instead of flattened text

Recommended internal split:

- **Measurement layer**
  - container width
  - ellipsis width
  - font measurement
- **Markup snapshot layer**
  - traverse the rendered hidden node
  - capture text nodes, inline elements, and line breaks
  - keep rendered DOM semantics rather than React component identity
- **Truncation layer**
  - compute the maximum visible range within width and line limits
  - support end truncation first
  - reuse the same snapshot model for later middle truncation
- **Render layer**
  - rebuild the collapsed React output from the truncated snapshot
  - append the ellipsis node while preserving inline structure as much as possible

## Supported Scope

### Phase 1

`Truncate` and `ShowMore` support markup preservation for rendered inline content, including typical output such as:

- text nodes
- `a`
- `span`
- `strong`
- `em`
- `code`
- inline classes and inline styles
- components like `linkify-react` that finally render standard inline DOM nodes

### Phase 1 Limitations

- no guarantee for block elements
- no guarantee for complex interactive custom component behavior in collapsed state
- no guarantee for React refs or internal component state preservation
- no guarantee for exact equivalence of deeply nested custom component trees

### Phase 2

Extend the markup engine to support `middle` truncation for `MiddleTruncate`, starting with simple inline markup only.

## Component Responsibilities

### `Truncate`

- owns measurement
- owns truncation strategy selection
- owns collapsed-state rendering
- defines the official support boundary for markup preservation

### `ShowMore`

- owns expand/collapse state only
- forwards `preserveMarkup` to `Truncate`
- does not implement any extra markup compatibility logic

### `MiddleTruncate`

- remains a semantic wrapper around `Truncate`
- should reuse the same snapshot model and rendering layer
- can lag one phase behind `Truncate` and `ShowMore`

## Performance Strategy

Markup preservation is more expensive than the current plain-text approach because it requires DOM traversal, snapshot creation, truncation against a richer model, and node reconstruction. To avoid regressing users who only need plain-text truncation:

- keep the plain-text engine as the default path
- make markup preservation strictly opt-in via `preserveMarkup`
- memoize snapshot work where possible
- skip collapsed-state computation when `ShowMore` is expanded
- reuse existing width measurement primitives where possible

## Migration and Compatibility

- existing users see no behavior change unless they opt in
- existing tests for plain-text behavior should remain valid
- docs must explain that markup preservation is best-effort for rendered inline markup, not full arbitrary React component preservation

## Recommended Rollout

1. Refactor `Truncate` just enough to support dual engines
2. Ship end truncation markup support behind `preserveMarkup`
3. Forward the prop through `ShowMore`
4. Document support boundaries and performance trade-offs
5. Add `MiddleTruncate` markup support in a separate phase

## Risks

- attribute and child-node preservation bugs during reconstruction
- resize-triggered recomputation cost in markup-heavy lists
- awkward edge cases when truncation cuts through nested inline structures
- over-promising support for arbitrary custom components in docs

## Recommendation

Adopt a single public `Truncate` API with an opt-in `preserveMarkup` prop, backed by an internal dual-engine architecture. Deliver `Truncate` and `ShowMore` first, then extend `MiddleTruncate` in a second phase once the shared snapshot and rendering primitives are stable.
