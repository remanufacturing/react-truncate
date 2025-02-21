import React, { isValidElement, useMemo } from 'react'
import { type ShowMoreToggleLinesFn } from './types'

interface ToggleButtonProps {
  type: 'more' | 'less'
  label: React.ReactNode
  className?: string
  toggleLines: ShowMoreToggleLinesFn
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  type,
  label,
  className,
  toggleLines,
}) => {
  const prefix = useMemo(() => (type === 'more' ? `… ` : ' '), [type])

  if (isValidElement(label)) {
    return label
  }

  return (
    <span>
      {prefix}
      <a
        href="#"
        className={className}
        onClick={toggleLines}
        data-testid={`${type}-button`}
      >
        {label}
      </a>
    </span>
  )
}
