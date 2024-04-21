import React, { forwardRef, useCallback, useEffect, useState } from 'react'
import { Truncate, type TruncateProps } from '../Truncate'
import { type MiddleTruncateProps } from './types'

export const MiddleTruncate = forwardRef<HTMLDivElement, MiddleTruncateProps>(
  ({ children, onTruncate, ...rests }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { width, middle, lines, ...truncateProps } = rests as TruncateProps

    const [truncated, setTruncated] = useState(false)

    const handleTruncate = useCallback(
      (didTruncate: boolean) => {
        if (didTruncate !== truncated) {
          setTruncated(didTruncate)
        }
      },
      [truncated],
    )

    useEffect(() => {
      if (typeof onTruncate !== 'function') return
      onTruncate(truncated)
    }, [onTruncate, truncated])

    return (
      <div ref={ref} style={{ width: '100%' }}>
        <Truncate {...truncateProps} middle onTruncate={handleTruncate}>
          {children}
        </Truncate>
      </div>
    )
  },
)

MiddleTruncate.displayName = 'MiddleTruncate'
