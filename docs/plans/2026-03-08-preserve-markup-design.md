# Preserve Markup Truncation Design

**Date:** 2026-03-08

**Problem Statement**

`Truncate` currently uses the plain-text engine to decide the collapsed range, then optionally reconstructs inline DOM when `preserveMarkup` is enabled. This fixes semantic loss such as dropped links, classes, and inline styles, but it still inherits the measurement blind spots of plain-text truncation.

That remaining gap matters in real usage:

- inline styles such as `font-weight`, `font-style`, `letter-spacing`, or custom font stacks can change line wrapping
- nested inline markup such as `a > span`, `strong`, `code`, or linkified output can occupy more width than the flattened plain-text measurement predicts
- the collapsed result can therefore overflow into an extra rendered line even when the algorithm expected it to fit

This is especially visible in docs demos, where users compare examples side by side and immediately notice when `preserveMarkup` says “3 lines” but the browser renders 4.

## Goals

- Preserve rendered inline markup in the collapsed state when explicitly requested
- Make `preserveMarkup` measurement style-aware instead of relying on plain-text width guesses
- Keep the current default performance profile for users who do not opt into `preserveMarkup`
- Add stable docs-page E2E coverage for the library’s own live demos so obvious regressions are caught before release

## Non-Goals

- Do not change the default plain-text truncation behavior for existing users
- Do not promise perfect preservation of arbitrary React component identity, refs, or internal state
- Do not guarantee block-level layout truncation in the first phase
- Do not force `MiddleTruncate` onto the new measurement path in this iteration

## Public API Direction

Keep the existing public components unchanged and continue to expose a single opt-in prop on `Truncate`:

```ts
interface TruncateProps {
  preserveMarkup?: boolean
}
```

Recommended behavior:

- `preserveMarkup` defaults to `false`
- `false` keeps the current plain-text engine unchanged
- `true` enables a markup-preserving, style-aware measurement engine
- `ShowMore` transparently forwards `preserveMarkup`
- `MiddleTruncate` remains out of scope for this style-aware phase

## Why The Existing Hybrid Approach Is Not Enough

The current hybrid approach is:

1. use the plain-text engine to compute visible text lines
2. rebuild preserved markup from a DOM snapshot

This is not sufficient because the truncation boundary is already wrong before markup reconstruction begins. Once the browser applies real inline styles, the supposedly safe prefix may wrap differently and spill into one more line.

That means the root cause sits in the measurement layer, not the render layer.

## Recommended Architecture

`Truncate` keeps two internal engines:

1. **Plain-text engine**
   - default path
   - current measurement behavior
   - optimized for performance

2. **Style-aware markup engine**
   - used only when `preserveMarkup === true && middle !== true`
   - computes truncation from rendered DOM structure and actual browser layout
   - reconstructs collapsed output from a markup snapshot

### Internal Layers

#### 1. Snapshot layer

- traverse the hidden rendered node
- capture text nodes, inline elements, and `br`
- preserve rendered DOM semantics such as `href`, `class`, `style`, and nested inline structure
- avoid trying to preserve React component identity

#### 2. Style-aware measurement layer

- build a hidden measurement container that inherits the relevant width and text layout constraints
- render candidate collapsed output using the preserved snapshot plus ellipsis
- measure actual browser layout with DOM APIs such as `Range` and `getClientRects()` or equivalent rendered-height checks
- determine whether the candidate fits within the requested number of lines

#### 3. Search layer

- binary-search the maximum visible prefix that still fits with the ellipsis included
- reuse the snapshot tree while varying only the visible text boundary
- support end truncation first

#### 4. Render layer

- rebuild the collapsed React output from the chosen snapshot prefix
- append the ellipsis node after preserved markup
- keep inline structure intact wherever possible

## Measurement Strategy Details

### Why real DOM measurement

The browser already knows the true width impact of:

- `font-weight`
- `font-style`
- `letter-spacing`
- inline `style`
- nested `span`, `strong`, `em`, `code`, `a`
- third-party renderers that output standard inline DOM

Trying to approximate these effects from flattened text is fragile. Measuring the actual candidate DOM is more expensive, but it directly matches what the user sees.

### Proposed fit check

For each candidate prefix:

1. render the visible prefix plus ellipsis into the hidden measurement container
2. inspect the rendered layout
3. treat the candidate as valid only if it stays within the requested line count

Preferred implementation direction:

- use actual DOM layout from a hidden but measurable container
- use line-aware APIs such as `Range#getClientRects()` when that gives stable line counts
- fall back to container height checks only when line-rect counting is insufficient

### Constraints for stability

The measurement container should:

- share the target width
- inherit text styles from the visible root
- stay measurable while visually hidden
- avoid affecting page layout or user interaction

## Supported Scope

### Phase 1

`Truncate` and `ShowMore` support markup preservation for rendered inline content, including:

- text nodes
- `a`
- `span`
- `strong`
- `em`
- `code`
- inline classes
- inline styles
- components such as `linkify-react` that finally render standard inline DOM nodes

### Phase 1 limitations

- no guarantee for block elements
- no guarantee for custom component behavior beyond the DOM they render
- no guarantee for refs or component state preservation in collapsed output
- no style-aware `middle` truncation yet

## Component Responsibilities

### `Truncate`

- owns engine selection
- owns measurement strategy
- owns collapsed rendering
- defines the official support boundary for `preserveMarkup`

### `ShowMore`

- owns expand/collapse state only
- forwards `preserveMarkup` to `Truncate`
- does not implement a separate markup-specific layout algorithm

### `MiddleTruncate`

- remains on the existing path for now
- can adopt the snapshot primitives later in a dedicated phase

## Performance Strategy

Markup preservation remains more expensive than plain-text truncation because it requires DOM traversal, candidate rendering, and repeated layout checks.

To avoid regressing the default path:

- keep the plain-text engine as the default path
- only enable style-aware measurement when `preserveMarkup === true`
- skip this engine for `middle` truncation in the first phase
- avoid repeated work when `ShowMore` is expanded
- reuse the snapshot representation across binary-search iterations

## Docs-Page E2E Strategy

The docs site is the library’s public contract in action. If its live demos visibly overflow, users will assume the library is broken even if unit tests pass.

Add browser E2E coverage against the real docs preview site for the pages that demonstrate this feature:

- `/reference/truncate/`
- `/reference/show-more/`
- `/zh/reference/show-more/`

### E2E design principles

- add stable `data-testid` anchors to the live demo containers and key preserved nodes
- use fixed demo width, fixed content, and fixed line-height where needed to keep tests deterministic
- assert behavior, not implementation details

### Core docs assertions

- `preserveMarkup` collapsed output does not render an extra line compared with the intended line budget
- preserved collapsed output still contains expected inline nodes such as links or styled spans
- `ShowMore` expands and collapses correctly in docs demos
- at least one Chinese docs example covers the previous extra-line regression path

## Migration and Compatibility

- existing users see no behavior change unless they opt in
- existing plain-text tests stay valid
- docs should explicitly describe `preserveMarkup` as opt-in, more expensive, and best-effort for rendered inline markup

## Recommended Rollout

1. Replace the markup engine’s plain-text-derived boundary with style-aware measurement
2. Keep snapshot/render primitives but rebase them on the new fit-check loop
3. Preserve `ShowMore` compatibility by forwarding the prop unchanged
4. Add stable docs-page E2E for the actual live demos
5. Defer `MiddleTruncate` style-aware support to a later phase

## Risks

- binary-search candidate rendering may become expensive in markup-heavy lists
- line counting can differ across environments if tests depend on unstable fonts or container styles
- nested inline reconstruction may still reveal edge cases when truncation cuts inside deeply styled content

## Decision Summary

Keep `preserveMarkup` opt-in, but make it truly style-aware by measuring real rendered DOM instead of deriving boundaries from flattened plain text. Back the feature with docs-page E2E coverage so the project’s own demos cannot silently regress into obvious overflow bugs.
