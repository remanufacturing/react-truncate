import React, { useState } from 'react'
import { MiddleTruncate } from '@re-dev/react-truncate'
import {
  DEFAULT_END_VALUE,
  DEFAULT_HTML_VALUE,
  DEFAULT_WIDTH_VALUE,
  EW,
} from '@/components/examples/Widgets'
import { useLang, type Languages } from '@/i18n'

export const ControllableMiddleTruncate: React.FC<{
  lang: Languages
}> = ({ lang }) => {
  const { isZh } = useLang(lang)

  const [width, setWidth] = useState(DEFAULT_WIDTH_VALUE)
  const [end, setEnd] = useState(DEFAULT_END_VALUE)
  const [html, setHtml] = useState(DEFAULT_HTML_VALUE)

  return (
    <>
      <EW.Range
        lang={lang}
        labelKey="example.width"
        value={width}
        min="50"
        max="100"
        defaultValue={DEFAULT_WIDTH_VALUE}
        onChange={(v) => setWidth(v)}
      />

      <EW.Range
        lang={lang}
        labelKey="example.end"
        value={end}
        min="-100"
        max="100"
        defaultValue={DEFAULT_END_VALUE}
        onChange={(v) => setEnd(v)}
        percentable={false}
      />

      <EW.Switch
        lang={lang}
        labelKey="example.html"
        checked={html}
        onChange={(v) => setHtml(v)}
      />

      <EW.Container style={{ width: `${width}%` }}>
        <MiddleTruncate separator={isZh ? '' : ' '} end={end}>
          <EW.Content isZh={isZh} html={html} />
        </MiddleTruncate>
      </EW.Container>
    </>
  )
}
