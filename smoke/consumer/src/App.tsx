import { MiddleTruncate, ShowMore, Truncate } from '@re-dev/react-truncate'
import React, { useEffect, useState } from 'react'

const TRUNCATE_TEXT =
  'The packed package should still truncate text correctly when consumed by another app.'
const SHOW_MORE_TEXT =
  'The packed package should also keep interactive expand and collapse behavior in a consumer project.'
const MIDDLE_TEXT = 'customer-contract-archive-reference-2026.pdf'

const imported = Boolean(Truncate && ShowMore && MiddleTruncate)

export const App: React.FC = () => {
  const [ready, setReady] = useState(false)
  const [showMoreState, setShowMoreState] = useState<'collapsed' | 'expanded'>(
    'collapsed',
  )

  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <main
      style={{
        padding: '24px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        display: 'grid',
        gap: '20px',
        lineHeight: 1.5,
      }}
    >
      <h1>react-truncate smoke consumer</h1>
      <div data-testid="smoke-page-ready">{String(ready)}</div>
      <div data-testid="smoke-package-imported">{String(imported)}</div>

      <div
        data-testid="smoke-truncate-example"
        style={{ width: '190px', padding: '12px', border: '1px solid #d4d4d8' }}
      >
        <Truncate lines={2}>{TRUNCATE_TEXT}</Truncate>
      </div>

      <div
        style={{ width: '210px', padding: '12px', border: '1px solid #d4d4d8' }}
      >
        <div data-testid="smoke-show-more-state">{showMoreState}</div>
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

      <div
        data-testid="smoke-middle-example"
        style={{ width: '210px', padding: '12px', border: '1px solid #d4d4d8' }}
      >
        <MiddleTruncate end={4}>{MIDDLE_TEXT}</MiddleTruncate>
      </div>
    </main>
  )
}
