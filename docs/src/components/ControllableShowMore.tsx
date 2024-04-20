import React, { useMemo, useRef, useState } from 'react'
import {
  ShowMore,
  type ShowMoreRef,
  type ShowMoreToggleLinesFn,
} from '@re-dev/react-truncate'
import {
  RichText,
  ChineseRichText,
  ChineseStringText,
  StringText,
} from './ExampleData'
import { ExampleContainer, FormRange, FormSwitch } from './ExampleWidgets'
import { type Languages } from '@/i18n'

const CustomButton: React.FC<{
  type: 'more' | 'less'
  isZh: boolean
  onClick: ShowMoreToggleLinesFn
}> = ({ type, isZh, onClick }) => {
  const label = useMemo(() => {
    if (isZh) {
      return type === 'more' ? `展开` : '收起'
    }
    return type === 'more' ? `Show More` : 'Show Less'
  }, [type])

  return (
    <button className="text-xs ml-2 cursor-pointer" onClick={onClick}>
      {label}
    </button>
  )
}

const CurrentContent: React.FC<{
  isZh: boolean
  html: boolean
}> = ({ isZh, html }) => {
  if (isZh) {
    return html ? <ChineseRichText /> : <ChineseStringText />
  }

  return html ? <RichText /> : <StringText />
}

const DEFAULT_WIDTH_VALUE = 100
const DEFAULT_LINES_VALUE = 3
const DEFAULT_HTML_VALUE = true
const DEFAULT_CUSTOM_VALUE = false

export const ControllableShowMore: React.FC<{
  lang: Languages
}> = ({ lang }) => {
  const [width, setWidth] = useState(DEFAULT_WIDTH_VALUE)
  const [lines, setLines] = useState(DEFAULT_LINES_VALUE)
  const [html, setHtml] = useState(DEFAULT_HTML_VALUE)
  const [custom, setCustom] = useState(DEFAULT_CUSTOM_VALUE)

  const isZh = useMemo(() => {
    return lang === 'zh'
  }, [])

  const ref = useRef<ShowMoreRef>(null)

  const toggleLines: ShowMoreToggleLinesFn = (e) => {
    ref.current?.toggleLines(e)
  }

  return (
    <>
      <FormRange
        lang={lang}
        labelKey="example.width"
        value={width}
        min="50"
        max="100"
        defaultValue={DEFAULT_WIDTH_VALUE}
        onChange={(v) => setWidth(v)}
      />

      <FormRange
        lang={lang}
        labelKey="example.lines"
        value={lines}
        min="1"
        max="10"
        defaultValue={DEFAULT_LINES_VALUE}
        onChange={(v) => setLines(v)}
      />

      <FormSwitch
        lang={lang}
        labelKey="example.html"
        checked={html}
        onChange={(v) => setHtml(v)}
      />

      <FormSwitch
        lang={lang}
        labelKey="example.custom"
        checked={custom}
        onChange={(v) => setCustom(v)}
      />

      <ExampleContainer style={{ width: `${width}%` }}>
        <ShowMore
          ref={ref}
          lines={lines}
          separator={isZh ? '' : ' '}
          more={
            custom ? (
              <CustomButton type="more" isZh={isZh} onClick={toggleLines} />
            ) : undefined
          }
          less={
            custom ? (
              <CustomButton type="less" isZh={isZh} onClick={toggleLines} />
            ) : undefined
          }
        >
          <CurrentContent isZh={isZh} html={html} />
        </ShowMore>
      </ExampleContainer>
    </>
  )
}
