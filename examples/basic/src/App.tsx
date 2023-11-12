import React from 'react'
import { RichText } from 'shared/data'
import { ShowMore } from '@re-dev/react-truncate'

const App: React.FC = () => {
  return (
    <ShowMore>
      <RichText />
    </ShowMore>
  )
}

export default App
