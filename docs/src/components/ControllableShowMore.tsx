import React, { useState } from 'react'
import { clsx } from 'clsx'
import { ShowMore } from '@re-dev/react-truncate'
import {
  RichText,
  ChineseRichText,
  ChineseStringText,
  StringText,
} from './ExampleData'
import { ExampleContainer } from './ExampleContainer'
import { getTranslation, type Languages } from '@/i18n'

const CurrentContent: React.FC<{
  lang: Languages
  html: boolean
}> = ({ lang, html }) => {
  if (lang === 'zh') {
    return html ? <ChineseRichText /> : <ChineseStringText />
  }

  return html ? <RichText /> : <StringText />
}

const DEFAULT_WIDTH = 100
const DEFAULT_LINES = 10
const DEFAULT_HTML = true

export const ControllableShowMore: React.FC<{
  lang: Languages
}> = ({ lang }) => {
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [lines, setLines] = useState(DEFAULT_LINES)
  const [html, setHtml] = useState(DEFAULT_HTML)

  const cls = clsx('flex items-center gap-3 my-6')
  const inputCls = clsx('w-100 max-w-3/4 cursor-pointer')
  const titleCls = clsx('flex flex-shrink-0 w-18')

  return (
    <>
      <div className={cls}>
        <span className={titleCls}>
          {getTranslation(lang, 'example.width')}
        </span>

        <input
          className={inputCls}
          type="range"
          min="50"
          max="100"
          defaultValue={DEFAULT_WIDTH}
          onChange={(e) => setWidth(Number(e.target.value))}
        />

        <span>{width}%</span>
      </div>

      <div className={cls}>
        <span className={titleCls}>
          {getTranslation(lang, 'example.lines')}
        </span>

        <input
          className={inputCls}
          type="range"
          min="1"
          max="10"
          defaultValue={DEFAULT_LINES}
          onChange={(e) => setLines(Number(e.target.value))}
        />

        <span>{lines}</span>
      </div>

      <div className={cls}>
        <span className={titleCls}>{getTranslation(lang, 'example.html')}</span>

        <label className="switch">
          <input
            type="checkbox"
            checked={html}
            onChange={(e) => setHtml(e.target.checked)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <ExampleContainer style={{ width: `${width}%` }}>
        <ShowMore lines={lines} separator={lang === 'zh' ? '' : ' '}>
          <CurrentContent lang={lang} html={html} />
        </ShowMore>
      </ExampleContainer>
    </>
  )
}
