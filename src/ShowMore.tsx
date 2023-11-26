import React, { forwardRef, useCallback, useMemo, useState } from 'react'
import { Truncate, type TruncateProps } from './Truncate'

export interface ShowMoreProps
  extends Omit<TruncateProps, 'lines' | 'ellipsis' | 'width'> {
  lines?: TruncateProps['lines']
  ellipsis?: TruncateProps['ellipsis']
  more?: string
  less?: string
  anchorClass?: string
  children: React.ReactNode
  observeParent?: boolean
}

export const ShowMore = forwardRef<HTMLDivElement, ShowMoreProps>(
  (
    {
      lines = 3,
      ellipsis,
      more = 'Expand',
      less = 'Collapse',
      anchorClass,
      children,
      ...others
    },
    ref,
  ) => {
    const [truncated, setTruncated] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const expandedLines = useMemo(() => {
      if (!expanded) return lines
      return 0
    }, [expanded, lines])

    const handleTruncate = useCallback(
      (didTruncate: boolean) => {
        if (didTruncate !== truncated) {
          setTruncated(didTruncate)
        }
      },
      [truncated],
    )

    const toggleLines = useCallback(
      (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.preventDefault()
        setExpanded((prev) => !prev)
      },
      [],
    )

    return (
      <div ref={ref} style={{ width: '100%' }}>
        <Truncate
          {...others}
          lines={expandedLines}
          ellipsis={
            ellipsis || (
              <span>
                ...{' '}
                <a href="#" className={anchorClass} onClick={toggleLines}>
                  {more}
                </a>
              </span>
            )
          }
          onTruncate={handleTruncate}
        >
          {children}
        </Truncate>

        {!truncated && expanded && (
          <span>
            {' '}
            <a href="#" className={anchorClass} onClick={toggleLines}>
              {less}
            </a>
          </span>
        )}
      </div>
    )
  },
)

ShowMore.displayName = 'ShowMore'
