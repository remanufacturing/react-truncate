import React, { useCallback, useMemo, useState } from 'react'
import { Truncate, type TruncateProps } from './Truncate'

export interface ShowMoreProps
  extends Omit<TruncateProps, 'lines' | 'ellipsis'> {
  lines?: TruncateProps['lines']
  ellipsis?: TruncateProps['ellipsis']
  more?: string
  less?: string
  anchorClass?: string
  children: React.ReactNode
}

export const ShowMore: React.FC<ShowMoreProps> = ({
  lines = 3,
  ellipsis,
  more = 'Expand',
  less = 'Collapse',
  anchorClass,
  children,
  ...others
}) => {
  const [expanded, setExpanded] = useState(false)
  const [truncated, setTruncated] = useState(false)

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

  const expandedLines = useMemo(() => {
    if (!expanded) return lines
    return 0
  }, [expanded, lines])

  return (
    <>
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
    </>
  )
}
