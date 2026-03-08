import {
  getSnapshotTextLength,
  renderMarkupLines,
  renderMarkupPrefix,
} from '../markup/render'
import { createMarkupSnapshot } from '../markup/snapshot'
import type React from 'react'

interface MarkupTruncationOptions {
  ellipsis: React.ReactNode
  ellipsisNode: HTMLSpanElement | null
  fallbackDidTruncate: boolean
  fallbackVisibleTextLines: string[]
  lines: number
  node: HTMLSpanElement | null
  rootNode: HTMLSpanElement | null
  separator: string
  trimWhitespace: boolean
}

interface MarkupTruncationResult {
  didTruncate: boolean
  result: React.ReactNode
}

const normalizeText = (text: string, separator: string) => {
  return text.replace(/\r\n|\r|\n/g, separator)
}

const parsePixelValue = (value: string) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getAvailableWidth = (
  rootNode: HTMLSpanElement | null,
  fallbackWidth: number,
) => {
  const parent = rootNode?.parentElement

  if (!parent) {
    return fallbackWidth
  }

  const rectWidth = parent.getBoundingClientRect().width
  const style = window.getComputedStyle(parent)
  const horizontalPadding =
    parsePixelValue(style.paddingLeft) + parsePixelValue(style.paddingRight)
  const horizontalBorder =
    parsePixelValue(style.borderLeftWidth) +
    parsePixelValue(style.borderRightWidth)

  const contentWidth = Math.floor(
    rectWidth - horizontalPadding - horizontalBorder,
  )

  return contentWidth > 0 ? contentWidth : fallbackWidth
}

const createMeasureRoot = (
  rootNode: HTMLSpanElement | null,
  width: number,
): HTMLSpanElement => {
  const measureRoot = document.createElement('span')
  const style = rootNode ? window.getComputedStyle(rootNode) : null

  measureRoot.setAttribute('aria-hidden', 'true')
  measureRoot.style.position = 'fixed'
  measureRoot.style.top = '0'
  measureRoot.style.left = '0'
  measureRoot.style.visibility = 'hidden'
  measureRoot.style.pointerEvents = 'none'
  measureRoot.style.display = 'block'
  measureRoot.style.margin = '0'
  measureRoot.style.padding = '0'
  measureRoot.style.border = '0'
  measureRoot.style.boxSizing = 'content-box'
  measureRoot.style.width = `${Math.max(width, 1)}px`
  measureRoot.style.whiteSpace = style?.whiteSpace || 'normal'
  measureRoot.style.wordBreak = style?.wordBreak || 'normal'
  measureRoot.style.overflowWrap = style?.overflowWrap || 'break-word'
  measureRoot.style.font = style?.font || ''
  measureRoot.style.fontFamily = style?.fontFamily || ''
  measureRoot.style.fontSize = style?.fontSize || ''
  measureRoot.style.fontStyle = style?.fontStyle || ''
  measureRoot.style.fontWeight = style?.fontWeight || ''
  measureRoot.style.letterSpacing = style?.letterSpacing || ''
  measureRoot.style.lineHeight = style?.lineHeight || ''
  measureRoot.style.wordSpacing = style?.wordSpacing || ''
  measureRoot.style.textTransform = style?.textTransform || ''
  measureRoot.style.textIndent = style?.textIndent || ''
  measureRoot.style.direction = style?.direction || ''

  return measureRoot
}

const appendEllipsisClone = (
  fragment: DocumentFragment,
  ellipsisNode: HTMLSpanElement | null,
) => {
  if (!ellipsisNode) return

  Array.from(ellipsisNode.childNodes).forEach((childNode) => {
    fragment.appendChild(childNode.cloneNode(true))
  })
}

const trimTrailingCloneWhitespace = (node: Node) => {
  const childNodes = Array.from(node.childNodes)

  for (let index = childNodes.length - 1; index >= 0; index -= 1) {
    const childNode = childNodes[index]

    if (childNode instanceof HTMLBRElement) {
      childNode.remove()
      continue
    }

    if (childNode.nodeType === Node.TEXT_NODE) {
      const trimmedText = (childNode.textContent || '').replace(/\s+$/, '')

      if (!trimmedText) {
        childNode.remove()
        continue
      }

      childNode.textContent = trimmedText
      return
    }

    if (childNode.nodeType === Node.ELEMENT_NODE) {
      trimTrailingCloneWhitespace(childNode)

      if (childNode.childNodes.length === 0) {
        childNode.remove()
        continue
      }

      return
    }

    childNode.remove()
  }
}

const truncateCloneToLength = (
  node: Node,
  remaining: number,
  separator: string,
): number => {
  const childNodes = Array.from(node.childNodes)
  let nextRemaining = remaining

  childNodes.forEach((childNode) => {
    if (nextRemaining <= 0) {
      childNode.remove()
      return
    }

    if (childNode instanceof HTMLBRElement) {
      nextRemaining -= 1
      return
    }

    if (childNode.nodeType === Node.TEXT_NODE) {
      const normalized = normalizeText(childNode.textContent || '', separator)

      if (normalized.length <= nextRemaining) {
        childNode.textContent = normalized
        nextRemaining -= normalized.length
        return
      }

      childNode.textContent = normalized.slice(0, nextRemaining)
      nextRemaining = 0
      return
    }

    if (childNode.nodeType === Node.ELEMENT_NODE) {
      nextRemaining = truncateCloneToLength(childNode, nextRemaining, separator)

      if (childNode.childNodes.length === 0) {
        childNode.remove()
      }

      return
    }

    childNode.remove()
  })

  return nextRemaining
}

const createCandidateFragment = ({
  ellipsisNode,
  node,
  separator,
  trimWhitespace,
  visibleLength,
}: {
  ellipsisNode: HTMLSpanElement | null
  node: HTMLSpanElement
  separator: string
  trimWhitespace: boolean
  visibleLength?: number
}) => {
  const fragment = document.createDocumentFragment()
  const clone = node.cloneNode(true) as HTMLSpanElement

  if (typeof visibleLength === 'number') {
    truncateCloneToLength(clone, visibleLength, separator)

    if (trimWhitespace) {
      trimTrailingCloneWhitespace(clone)
    }
  }

  Array.from(clone.childNodes).forEach((childNode) => {
    fragment.appendChild(childNode)
  })

  if (typeof visibleLength === 'number') {
    appendEllipsisClone(fragment, ellipsisNode)
  }

  return fragment
}

const getMeasuredHeight = (
  measureRoot: HTMLSpanElement,
  content: DocumentFragment,
) => {
  measureRoot.replaceChildren(content)
  return measureRoot.getBoundingClientRect().height
}

export const getMarkupTruncation = ({
  ellipsis,
  ellipsisNode,
  fallbackDidTruncate,
  fallbackVisibleTextLines,
  lines,
  node,
  rootNode,
  separator,
  trimWhitespace,
}: MarkupTruncationOptions): MarkupTruncationResult => {
  if (!node) {
    return {
      didTruncate: false,
      result: null,
    }
  }

  const snapshot = createMarkupSnapshot(node, separator)
  const totalLength = getSnapshotTextLength(snapshot)
  const fallbackResult = {
    didTruncate: fallbackDidTruncate,
    result: fallbackDidTruncate
      ? renderMarkupLines(snapshot, fallbackVisibleTextLines, ellipsis)
      : null,
  }

  if (totalLength === 0) {
    return {
      didTruncate: false,
      result: null,
    }
  }

  const measureRoot = createMeasureRoot(
    rootNode,
    getAvailableWidth(
      rootNode,
      rootNode?.parentElement?.getBoundingClientRect().width || 0,
    ),
  )

  document.body.appendChild(measureRoot)

  try {
    const singleLineFragment = document.createDocumentFragment()
    singleLineFragment.appendChild(document.createTextNode('A'))

    const rawSingleLineHeight = getMeasuredHeight(
      measureRoot,
      singleLineFragment,
    )

    if (rawSingleLineHeight === 0) {
      return fallbackResult
    }

    const singleLineHeight = Math.max(rawSingleLineHeight, 1)
    const maxAllowedHeight = singleLineHeight * lines + 0.5
    const fullContentHeight = getMeasuredHeight(
      measureRoot,
      createCandidateFragment({
        ellipsisNode,
        node,
        separator,
        trimWhitespace,
      }),
    )

    if (fullContentHeight === 0) {
      return fallbackResult
    }

    if (fullContentHeight <= maxAllowedHeight) {
      return {
        didTruncate: false,
        result: null,
      }
    }

    let low = 0
    let high = totalLength
    let bestLength = 0

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const candidateHeight = getMeasuredHeight(
        measureRoot,
        createCandidateFragment({
          ellipsisNode,
          node,
          separator,
          trimWhitespace,
          visibleLength: mid,
        }),
      )

      if (candidateHeight <= maxAllowedHeight) {
        bestLength = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    return {
      didTruncate: true,
      result: renderMarkupPrefix(
        snapshot,
        bestLength,
        ellipsis,
        trimWhitespace,
      ),
    }
  } finally {
    measureRoot.remove()
  }
}
