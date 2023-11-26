import React from 'react'
import clsx from 'clsx'
import { RichText } from 'example-shared/data'
import { ShowMore } from '@re-dev/react-truncate'

interface ExampleContainerProps {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export const ExampleContainer: React.FC<ExampleContainerProps> = ({
  className,
  style,
}) => {
  const cls = clsx(
    'bg-example',
    'rounded-xl my-3 lg:my-6 box-border p-3',
    className,
  )

  return (
    <div className={cls} style={style}>
      <ShowMore>
        <RichText />
      </ShowMore>
    </div>
  )
}
