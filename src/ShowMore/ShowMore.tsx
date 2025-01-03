import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { Truncate, type TruncateProps } from '../Truncate'
import { ToggleButton } from './ToggleButton'
import {
  type ShowMoreToggleLinesFn,
  type ShowMoreProps,
  type ShowMoreRef,
} from './types'

export const ShowMore = forwardRef<ShowMoreRef, ShowMoreProps>(
  (
    {
      lines = 3,
      more = 'Expand',
      less = 'Collapse',
      anchorClass,
      onToggle,
      onTruncate,
      children,
      ...rests
    },
    ref,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { width, middle, end, ellipsis, ...truncateProps } =
      rests as TruncateProps

    const [truncated, setTruncated] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const expandedLines = useMemo(() => {
      if (expanded) return 0
      return lines
    }, [expanded, lines])

    const handleTruncate = useCallback(
      (didTruncate: boolean) => {
        if (didTruncate !== truncated) {
          setTruncated(didTruncate)
        }
      },
      [truncated],
    )

    const toggleLines: ShowMoreToggleLinesFn = useCallback((e) => {
      e.preventDefault()
      setExpanded((prev) => !prev)
    }, [])

    useImperativeHandle(ref, () => {
      return {
        toggleLines,
      }
    })

    useEffect(() => {
      if (typeof onToggle !== 'function') return
      onToggle(expanded)
    }, [expanded, onToggle])

    return (
      <div style={{ width: '100%' }}>
        <Truncate
          {...truncateProps}
          lines={expandedLines}
          ellipsis={
            <ToggleButton
              type="more"
              label={more}
              className={anchorClass}
              toggleLines={toggleLines}
            />
          }
          onTruncate={(disTruncate) => {
            handleTruncate(disTruncate)

            if (!expanded) {
              onTruncate?.(disTruncate)
            }
          }}
        >
          {children}
        </Truncate>

        {!truncated && expanded && (
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
