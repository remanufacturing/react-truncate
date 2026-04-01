import { MiddleTruncate } from '@re-dev/react-truncate'
import React, { useState } from 'react'
import {
  DEFAULT_END_VALUE,
  DEFAULT_HTML_VALUE,
  DEFAULT_WIDTH_VALUE,
  EW,
} from '@/components/examples/Widgets'
import { useRefreshKey } from '@/hooks/use-refresh-key'
import { type Languages, useLang } from '@/i18n'

export const ControllableMiddleTruncate: React.FC<{
  lang: Languages
}> = ({ lang }) => {
  const { isZh } = useLang(lang)
  const testIdPrefix = `docs-middle-truncate-demo-${lang}`

  const [width, setWidth] = useState(DEFAULT_WIDTH_VALUE)
  const [end, setEnd] = useState(DEFAULT_END_VALUE)
  const [html, setHtml] = useState(DEFAULT_HTML_VALUE)

  const { refreshKey } = useRefreshKey([width, end])

  return (
    <div data-testid={testIdPrefix}>
      <EW.Range
        lang={lang}
        labelKey="example.width"
        value={width}
        min="50"
        max="100"
        defaultValue={DEFAULT_WIDTH_VALUE}
        onChange={setWidth}
        data-testid={`${testIdPrefix}-width`}
      />

      <EW.Range
        lang={lang}
        labelKey="example.end"
        value={end}
        min="-100"
        max="100"
        defaultValue={DEFAULT_END_VALUE}
        onChange={setEnd}
        percentable={false}
        data-testid={`${testIdPrefix}-end`}
      />

      <EW.Switch
        lang={lang}
        labelKey="example.html"
        checked={html}
        onChange={setHtml}
        data-testid={`${testIdPrefix}-html`}
      />

      <EW.Container
        data-testid={`${testIdPrefix}-container`}
        style={{ width: `${width}%` }}
      >
        <MiddleTruncate
          separator={isZh ? '' : ' '}
          end={end}
          key={refreshKey}
          data-testid={`${testIdPrefix}-content`}
        >
          <EW.Content isZh={isZh} html={html} />
        </MiddleTruncate>
      </EW.Container>
    </div>
  )
}
