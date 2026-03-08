import { renderMarkupPrefix } from '../markup/render'
import { createMarkupSnapshot } from '../markup/snapshot'
import type React from 'react'

interface MarkupTruncationOptions {
  ellipsis: React.ReactNode
  node: HTMLSpanElement | null
  separator: string
  visibleTextLines: string[]
}

export const getMarkupTruncation = ({
  ellipsis,
  node,
  separator,
  visibleTextLines,
}: MarkupTruncationOptions) => {
  const snapshot = createMarkupSnapshot(node, separator)
  return renderMarkupPrefix(snapshot, visibleTextLines, ellipsis)
}
