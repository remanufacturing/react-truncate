import {
  ShowMore,
  type ShowMoreRef,
  type ShowMoreToggleLinesFn,
} from '@re-dev/react-truncate'
import React, { useMemo, useRef, useState } from 'react'
import {
  InlineChineseRichText,
  InlineRichText,
} from '@/components/examples/Data'
import {
  DEFAULT_CUSTOM_VALUE,
  DEFAULT_HTML_VALUE,
  DEFAULT_LINES_VALUE,
  DEFAULT_WIDTH_VALUE,
  EW,
} from '@/components/examples/Widgets'
import { useRefreshKey } from '@/hooks/use-refresh-key'
import { type Languages, useLang } from '@/i18n'

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
  }, [isZh, type])

  return (
    <button className="ml-2 cursor-pointer text-xs" onClick={onClick}>
      {label}
    </button>
  )
}

export const ControllableShowMore: React.FC<{
  lang: Languages
}> = ({ lang }) => {
  const { isZh } = useLang(lang)
  const testIdPrefix = `docs-show-more-demo-${lang}`

  const [width, setWidth] = useState(DEFAULT_WIDTH_VALUE)
  const [lines, setLines] = useState(DEFAULT_LINES_VALUE)
  const [html, setHtml] = useState(DEFAULT_HTML_VALUE)
  const [custom, setCustom] = useState(DEFAULT_CUSTOM_VALUE)
  const [preserveMarkup, setPreserveMarkup] = useState(false)

  const ref = useRef<ShowMoreRef>(null)

  const toggleLines: ShowMoreToggleLinesFn = (e) => {
    ref.current?.toggleLines(e)
  }

  const { refreshKey } = useRefreshKey([
    width,
    lines,
    html,
    custom,
    preserveMarkup,
  ])

  return (
    <div data-testid={testIdPrefix}>
      <EW.Range
        lang={lang}
        labelKey="example.width"
        value={width}
        min="50"
        max="100"
        defaultValue={DEFAULT_WIDTH_VALUE}
        onChange={(v) => setWidth(v)}
        data-testid={`${testIdPrefix}-width`}
      />

      <EW.Range
        lang={lang}
        labelKey="example.lines"
        value={lines}
        min="1"
        max="10"
        defaultValue={DEFAULT_LINES_VALUE}
        onChange={(v) => setLines(v)}
        percentable={false}
        data-testid={`${testIdPrefix}-lines`}
      />

      <EW.Switch
        lang={lang}
        labelKey="example.html"
        checked={html}
        onChange={(v) => setHtml(v)}
        data-testid={`${testIdPrefix}-html`}
      />

      <EW.Switch
        lang={lang}
        labelKey="example.preserveMarkup"
        checked={preserveMarkup}
        onChange={(v) => setPreserveMarkup(v)}
        data-testid={`${testIdPrefix}-preserve-markup`}
      />

      <EW.Switch
        lang={lang}
        labelKey="example.custom"
        checked={custom}
        onChange={(v) => setCustom(v)}
        data-testid={`${testIdPrefix}-custom`}
      />

      <EW.Container
        data-testid={`${testIdPrefix}-container`}
        style={{ width: `${width}%`, lineHeight: '24px' }}
      >
        <ShowMore
          key={refreshKey}
          ref={ref}
          data-testid={`${testIdPrefix}-content`}
          lines={lines}
          separator={isZh ? '' : ' '}
          preserveMarkup={preserveMarkup}
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
          {html ? (
            isZh ? (
              <InlineChineseRichText />
            ) : (
              <InlineRichText />
            )
          ) : (
            <EW.Content isZh={isZh} />
          )}
        </ShowMore>
      </EW.Container>
    </div>
  )
}
