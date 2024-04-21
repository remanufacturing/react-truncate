import React, { useMemo, useState } from 'react'
import { MiddleTruncate } from '@re-dev/react-truncate'
import {
  RichText,
  ChineseRichText,
  ChineseStringText,
  StringText,
} from './ExampleData'
import {
  DEFAULT_END_VALUE,
  DEFAULT_HTML_VALUE,
  DEFAULT_WIDTH_VALUE,
  ExampleContainer,
  FormRange,
  FormSwitch,
} from './ExampleWidgets'
import { type Languages } from '@/i18n'

const CurrentContent: React.FC<{
  isZh: boolean
  html: boolean
}> = ({ isZh, html }) => {
  if (isZh) {
    return html ? <ChineseRichText /> : <ChineseStringText />
  }

  return html ? <RichText /> : <StringText />
}

export const ControllableMiddleTruncate: React.FC<{
  lang: Languages
}> = ({ lang }) => {
  const [width, setWidth] = useState(DEFAULT_WIDTH_VALUE)
  const [end, setEnd] = useState(DEFAULT_END_VALUE)
  const [html, setHtml] = useState(DEFAULT_HTML_VALUE)

  const isZh = useMemo(() => {
    return lang === 'zh'
  }, [lang])

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
        labelKey="example.end"
        value={end}
        min="1"
        max="10"
        defaultValue={DEFAULT_END_VALUE}
        onChange={(v) => setEnd(v)}
        percentable={false}
      />

      <FormSwitch
        lang={lang}
        labelKey="example.html"
        checked={html}
        onChange={(v) => setHtml(v)}
      />

      <ExampleContainer style={{ width: `${width}%` }}>
        <MiddleTruncate separator={isZh ? '' : ' '} end={end}>
          <CurrentContent isZh={isZh} html={html} />
        </MiddleTruncate>
      </ExampleContainer>
    </>
  )
}
