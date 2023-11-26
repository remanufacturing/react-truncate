import React, { useState } from 'react'
import { RichText } from 'example-shared/data'
import { ShowMore } from '@re-dev/react-truncate'
import { ExampleContainer } from './ExampleContainer'

export const ControllableShowMore: React.FC = () => {
  const [range, setRange] = useState(100)

  return (
    <>
      <div className="flex items-center gap-3 my-6">
        <input
          className="w-100 max-w-3/4 cursor-pointer"
          type="range"
          min="50"
          max="100"
          defaultValue={100}
          onChange={(e) => setRange(Number(e.target.value))}
        />

        <span>{range}%</span>
      </div>

      <ExampleContainer style={{ width: `${range}%` }}>
        <ShowMore>
          <RichText />
        </ShowMore>
      </ExampleContainer>
    </>
  )
}
