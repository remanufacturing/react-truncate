import React, { useState } from 'react'
import {
  RichText,
  StringText,
  ChineseRichText,
  ChineseStringText,
} from 'example-shared/data'
import { ShowMore } from '@re-dev/react-truncate'

const App: React.FC = () => {
  const [range, setRange] = useState(100)

  return (
    <div className="container">
      <p>
        <a
          href="https://github.com/remanufacturing/react-truncate/blob/main/examples/basic/src/App.tsx"
          target="_blank"
          rel="noreferrer"
        >
          🔗 Source code of this example
        </a>
      </p>

      <div className="tips">
        <h3>Controllable Usage:</h3>
        <p>Defaults to 3 lines and will follow window size changes.</p>
        <p>
          Adjust the width of the parent element and it will change accordingly.
        </p>
        <p>
          <input
            className="range"
            type="range"
            min="50"
            max="100"
            defaultValue={100}
            onChange={(e) => setRange(Number(e.target.value))}
          />

          <span>{range}%</span>
        </p>
      </div>

      <div style={{ width: `${range}%` }}>
        <h2>Rich Text</h2>

        <ShowMore>
          <RichText />
        </ShowMore>
      </div>

      <hr />

      <div style={{ width: `${range}%` }}>
        <h2>String Text</h2>

        <ShowMore>
          <StringText />
        </ShowMore>
      </div>

      <hr />

      <div style={{ width: `${range}%` }}>
        <h2>Chinese Rich Text</h2>

        <ShowMore separator="">
          <ChineseRichText />
        </ShowMore>
      </div>

      <hr />

      <div style={{ width: `${range}%` }}>
        <h2>Chinese String Text</h2>

        <ShowMore separator="">
          <ChineseStringText />
        </ShowMore>
      </div>
    </div>
  )
}

export default App
