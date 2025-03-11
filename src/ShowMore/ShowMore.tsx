import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Truncate, type TruncateProps } from '@/Truncate'
import { ToggleButton } from './ToggleButton'
import {
  type ShowMoreProps,
  type ShowMoreRef,
  type ShowMoreToggleLinesFn,
} from './types'

export const ShowMore = forwardRef<ShowMoreRef, ShowMoreProps>(
  (
    {
      defaultExpanded = false,
      expanded: controlledExpanded,
      lines = 3,
      more = 'Expand',
      less = 'Collapse',
      anchorClass,
      onToggle,
      children,
      ...rests
    },
    ref,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { width, middle, end, ellipsis, ...truncateProps } =
      rests as TruncateProps

    // To force update without triggering unnecessary state updates
    // useState({}) is used here to trigger a re-render without changing any component state.
    // This approach forces a re-render while keeping the component's internal state untouched,
    // as we don't need to modify any of the data — just trigger a fresh render when `expandedStateRef` changes.
    const [, setState] = useState({})
    const forceUpdate = useCallback(() => setState({}), [])

    // Supports initial state, controlled and uncontrolled mode
    const expandedStateRef = useRef(defaultExpanded)
    const isControlled = typeof controlledExpanded === 'boolean'
    const finalExpanded = isControlled
      ? controlledExpanded
      : expandedStateRef.current

    const toggleLines: ShowMoreToggleLinesFn = useCallback(
      (e) => {
        e.preventDefault()

        const newExpanded = !finalExpanded

        // Only update `expandedStateRef` in uncontrolled mode
        if (!isControlled) {
          expandedStateRef.current = newExpanded
          forceUpdate()
        }

        // Call the provided onToggle function if available
        onToggle?.(newExpanded)
      },
      [finalExpanded, isControlled, onToggle, forceUpdate],
    )

    useImperativeHandle(ref, () => {
      return {
        toggleLines,
      }
    })

    return (
      <div style={{ width: '100%' }} data-testid="show-more-root">
        <Truncate
          {...truncateProps}
          lines={finalExpanded ? 0 : lines}
          ellipsis={
            <ToggleButton
              type="more"
              label={more}
              className={anchorClass}
              toggleLines={toggleLines}
            />
          }
        >
          {children}
        </Truncate>

        {finalExpanded && (
          <ToggleButton
            type="less"
            label={less}
            className={anchorClass}
            toggleLines={toggleLines}
          />
        )}
      </div>
    )
  },
)

ShowMore.displayName = 'ShowMore'
