'use client'

import React, { forwardRef } from 'react'
import { Truncate, type TruncateProps } from '@/Truncate'
import { type MiddleTruncateProps } from './types'

export const MiddleTruncate = forwardRef<HTMLDivElement, MiddleTruncateProps>(
  ({ children, ...rests }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { width, middle, lines, ...truncateProps } = rests as TruncateProps

    return (
      <div ref={ref} style={{ width: '100%' }}>
        <Truncate {...truncateProps} middle>
          {children}
        </Truncate>
      </div>
    )
  },
)

MiddleTruncate.displayName = 'MiddleTruncate'
