import React, { useEffect, useMemo, useState } from 'react'
import { MiddleTruncate, ShowMore, Truncate } from '../../src'

const LONG_TEXT =
  'This sentence keeps going so the component must clamp it safely. This extra copy ensures the browser truncates it in a narrow box.'
const SHOW_MORE_TEXT =
  'ShowMore should reveal the hidden text after interaction and allow collapsing again without leaving the browser page.'
const FILE_NAME = 'Quarterly-operating-report-final-reviewed-version-2026.pdf'
const RESIZE_TEXT =
  'Resizing the container should force truncation to recalculate and produce a shorter visible result in the narrow state.'
const INLINE_CHINESE_RICH_TEXT = (
  <>
    从前有座山，山上有座庙，庙里有个老和尚，老和尚一边讲故事，一边指向
    <a
      href="https://truncate.js.org"
      className="underline"
      rel="noopener noreferrer"
      target="_blank"
    >
      文档链接
    </a>
    ，还强调这是
    <span className="font-semibold" style={{ color: '#0ea5e9' }}>
      重点样式文本
    </span>
    。故事继续讲下去：从前有座山，山上有座庙，庙里有个老和尚，老和尚又提到了
    <a
      href="https://www.google.bg/"
      title="Google"
      rel="noopener noreferrer"
      target="_blank"
    >
      更多内容
    </a>
    ，然后继续讲从前有座山、山上有座庙、庙里有个老和尚的故事，让这段内容足够长，以便稳定触发裁剪并比较
    preserveMarkup 开关前后的折叠高度。
  </>
)

const sectionStyle: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
}

const boxStyle: React.CSSProperties = {
  border: '1px solid #d4d4d8',
  borderRadius: '8px',
  padding: '12px',
  background: '#fff',
}

export const App: React.FC = () => {
  const [ready, setReady] = useState(false)
  const [showMoreState, setShowMoreState] = useState<'collapsed' | 'expanded'>(
    'collapsed',
  )
  const [resizeWidth, setResizeWidth] = useState(240)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    window.dispatchEvent(new Event('resize'))
  }, [resizeWidth])

  const resizeStyle = useMemo<React.CSSProperties>(
    () => ({ width: `${resizeWidth}px` }),
    [resizeWidth],
  )

  return (
    <main
      style={{
        padding: '24px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        color: '#18181b',
        display: 'grid',
        gap: '20px',
        lineHeight: 1.5,
      }}
    >
      <h1>react-truncate e2e harness</h1>
      <div data-testid="e2e-ready">{String(ready)}</div>

      <section style={sectionStyle}>
        <h2>Truncate</h2>
        <div
          data-testid="truncate-example"
          style={{ ...boxStyle, width: '180px' }}
        >
          <Truncate lines={2}>{LONG_TEXT}</Truncate>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>ShowMore</h2>
        <div style={{ ...boxStyle, width: '210px' }}>
          <div data-testid="show-more-state">{showMoreState}</div>
          <div data-testid="show-more-example">
            <ShowMore
              lines={2}
              more="Expand"
              less="Collapse"
              onToggle={(expanded) =>
                setShowMoreState(expanded ? 'expanded' : 'collapsed')
              }
            >
              {SHOW_MORE_TEXT}
            </ShowMore>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>MiddleTruncate</h2>
        <div
          data-testid="middle-example"
          style={{ ...boxStyle, width: '220px' }}
        >
          <MiddleTruncate end={4}>{FILE_NAME}</MiddleTruncate>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Resize</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={() => setResizeWidth(120)}>
            Set narrow
          </button>
          <button type="button" onClick={() => setResizeWidth(240)}>
            Set wide
          </button>
        </div>
        <div data-testid="resize-width">{resizeWidth}</div>
        <div
          data-testid="resize-example"
          style={{ ...boxStyle, ...resizeStyle }}
        >
          <Truncate lines={2}>{RESIZE_TEXT}</Truncate>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Chinese preserve markup</h2>
        <div
          style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <div
            data-testid="zh-show-more-plain"
            style={{ ...boxStyle, width: '220px' }}
          >
            <ShowMore lines={3} separator="">
              {INLINE_CHINESE_RICH_TEXT}
            </ShowMore>
          </div>

          <div
            data-testid="zh-show-more-markup"
            style={{ ...boxStyle, width: '220px' }}
          >
            <ShowMore lines={3} separator="" preserveMarkup>
              {INLINE_CHINESE_RICH_TEXT}
            </ShowMore>
          </div>
        </div>
      </section>
    </main>
  )
}
