import React from 'react'
import clsx from 'clsx'

interface ExampleContainerProps {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export const ExampleContainer: React.FC<ExampleContainerProps> = ({
  className,
  style,
  children,
}) => {
  const cls = clsx(
    'bg-example',
    'rounded-xl my-3 lg:my-6 box-border p-3',
    className,
  )

  return (
    <div className={cls} style={style}>
      {children}
    </div>
  )
}
