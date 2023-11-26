import React from 'react'
import { RichText } from 'example-shared/data'
import { ShowMore } from '@re-dev/react-truncate'
import { ExampleContainer } from './ExampleContainer'

export const DefaultShowMore: React.FC = () => {
  return (
    <ExampleContainer>
      <ShowMore>
        <RichText />
      </ShowMore>
    </ExampleContainer>
  )
}
