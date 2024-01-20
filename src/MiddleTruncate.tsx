import React, { forwardRef, useCallback, useState } from 'react'
import { Truncate, type TruncateProps } from './Truncate'

export type MiddleTruncateProps = Omit<TruncateProps, 'lines' | 'width'>

export const MiddleTruncate = forwardRef<HTMLDivElement, MiddleTruncateProps>(
  ({ children, ...rests }, ref) => {
    const [truncated, setTruncated] = useState(false)

    const handleTruncate = useCallback(
      (didTruncate: boolean) => {
        if (didTruncate !== truncated) {
          setTruncated(didTruncate)
        }
      },
      [truncated],
    )

    return (
      <div ref={ref} style={{ width: '100%' }}>
        <Truncate {...rests} onTruncate={handleTruncate}>
          {children}
        </Truncate>
      </div>
    )
  },
)

MiddleTruncate.displayName = 'MiddleTruncate'
