import { render } from '@testing-library/react'
import React from 'react'
import sinon from 'sinon'
import { getMarkupTruncation } from '@/Truncate/engines/markup'
import {
  getSnapshotTextLength,
  renderMarkupLines,
  renderMarkupPrefix,
  renderSnapshotNodes,
  sliceSnapshotNodes,
  trimLeadingWhitespace,
  trimTrailingWhitespace,
} from '@/Truncate/markup/render'
import {
  type MarkupSnapshotNode,
  createMarkupSnapshot,
} from '@/Truncate/markup/snapshot'
import { separator } from './config/test-config'

const createRect = (width = 0, height = 0) => {
  const rect = new DOMRect()
  rect.width = width
  rect.height = height
  return rect
}

const renderMarkup = (content: React.ReactNode) => {
  return render(<div data-testid="markup-host">{content}</div>)
}

const createSnapshotFromHtml = (html: string) => {
  const root = document.createElement('span')
  root.innerHTML = html
  return createMarkupSnapshot(root, separator)
}

const createStyleDeclaration = (styles: Record<string, string>) => {
  return styles as unknown as CSSStyleDeclaration
}

const setupMeasurementSandbox = ({
  parentWidth = 100,
  parentPadding = 0,
  parentBorder = 0,
  singleLineHeight = 10,
  zeroFullContent = false,
  zeroSingleLine = false,
}: {
  parentBorder?: number
  parentPadding?: number
  parentWidth?: number
  singleLineHeight?: number
  zeroFullContent?: boolean
  zeroSingleLine?: boolean
} = {}) => {
  const parent = document.createElement('div')
  const rootNode = document.createElement('span')
  const node = document.createElement('span')

  parent.appendChild(rootNode)
  rootNode.appendChild(node)
  document.body.appendChild(parent)

  sinon
    .stub(parent, 'getBoundingClientRect')
    .returns(createRect(parentWidth, 0))

  sinon.stub(window, 'getComputedStyle').callsFake((element: Element) => {
    if (element === parent) {
      return createStyleDeclaration({
        borderLeftWidth: `${parentBorder}px`,
        borderRightWidth: `${parentBorder}px`,
        paddingLeft: `${parentPadding}px`,
        paddingRight: `${parentPadding}px`,
      })
    }

    return createStyleDeclaration({
      direction: 'ltr',
      font: '16px Arial',
      fontFamily: 'Arial',
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: '400',
      letterSpacing: '0px',
      lineHeight: `${singleLineHeight}px`,
      overflowWrap: 'break-word',
      textIndent: '0px',
      textTransform: 'none',
      whiteSpace: 'normal',
      wordBreak: 'normal',
      wordSpacing: '0px',
    })
  })

  sinon
    .stub(HTMLSpanElement.prototype, 'getBoundingClientRect')
    .callsFake(function (this: HTMLSpanElement) {
      if (this.getAttribute('aria-hidden') !== 'true') {
        return createRect(0, 0)
      }

      const width = Number.parseFloat(this.style.width || `${parentWidth}`)

      if ((this.textContent || '') === 'A') {
        return createRect(width, zeroSingleLine ? 0 : singleLineHeight)
      }

      if (zeroFullContent) {
        return createRect(width, 0)
      }

      const charactersPerLine = Math.max(1, Math.floor(width / 10))
      const textLength = this.textContent?.length || 0
      const lineBreakCount = this.querySelectorAll('br').length
      const lineCount = Math.max(
        1,
        lineBreakCount + Math.ceil(textLength / charactersPerLine),
      )

      return createRect(width, lineCount * singleLineHeight)
    })

  return { node, parent, rootNode }
}

describe('markup helpers', () => {
  afterEach(() => {
    sinon.restore()
    document.body.innerHTML = ''
  })

  it('creates a snapshot for text, line breaks, elements, and ignores unsupported nodes', () => {
    const host = document.createElement('span')

    host.append('Hello\n')

    const link = document.createElement('a')
    link.setAttribute('class', 'rich-link')
    link.setAttribute('data-id', '1')
    link.append('world')
    host.append(link)
    host.append(document.createComment('ignore me'))
    host.append(document.createElement('br'))

    const emphasis = document.createElement('em')
    emphasis.append('!')
    host.append(emphasis)

    expect(createMarkupSnapshot(host, separator)).toEqual([
      { text: 'Hello ', type: 'text' },
      {
        attributes: { class: 'rich-link', 'data-id': '1' },
        children: [{ text: 'world', type: 'text' }],
        tagName: 'a',
        type: 'element',
      },
      { type: 'line-break' },
      {
        attributes: {},
        children: [{ text: '!', type: 'text' }],
        tagName: 'em',
        type: 'element',
      },
    ])
  })

  it('renders snapshot nodes with normalized attributes and skips empty elements', () => {
    const nodes: MarkupSnapshotNode[] = [
      {
        attributes: {
          class: 'rich-link',
          href: '/docs',
          style: 'color: red; background-color: blue; border-left-width: 1px;',
        },
        children: [{ text: 'Read docs', type: 'text' }],
        tagName: 'a',
        type: 'element',
      },
      { type: 'line-break' },
      {
        attributes: { class: 'ignored-node' },
        children: [],
        tagName: 'span',
        type: 'element',
      },
    ]

    const { container } = renderMarkup(renderSnapshotNodes(nodes))

    const link = container.querySelector('a[href="/docs"]')
    expect(link).toBeInTheDocument()
    expect(link).toHaveClass('rich-link')
    expect(link).toHaveStyle({
      backgroundColor: 'blue',
      borderLeftWidth: '1px',
      color: 'red',
    })
    expect(container.querySelectorAll('br')).toHaveLength(1)
    expect(container.querySelector('.ignored-node')).toBeNull()
  })

  it('slices nested snapshots and tracks the remaining nodes', () => {
    const nodes: MarkupSnapshotNode[] = [
      {
        attributes: {},
        children: [{ text: 'hello', type: 'text' }],
        tagName: 'strong',
        type: 'element',
      },
      { type: 'line-break' },
      { text: 'world', type: 'text' },
    ]

    expect(sliceSnapshotNodes(nodes, 2)).toEqual({
      remaining: 0,
      rest: [
        {
          attributes: {},
          children: [{ text: 'llo', type: 'text' }],
          tagName: 'strong',
          type: 'element',
        },
        { type: 'line-break' },
        { text: 'world', type: 'text' },
      ],
      taken: [
        {
          attributes: {},
          children: [{ text: 'he', type: 'text' }],
          tagName: 'strong',
          type: 'element',
        },
      ],
    })
  })

  it('returns untouched rest nodes when slicing starts with no remaining space', () => {
    const nodes: MarkupSnapshotNode[] = [{ text: 'hello', type: 'text' }]

    expect(sliceSnapshotNodes(nodes, 0)).toEqual({
      remaining: 0,
      rest: nodes,
      taken: [],
    })
  })

  it('keeps a line-break in the rest set when less than one character is available', () => {
    expect(sliceSnapshotNodes([{ type: 'line-break' }], 0.5)).toEqual({
      remaining: 0.5,
      rest: [{ type: 'line-break' }],
      taken: [],
    })
  })

  it('trims leading and trailing whitespace through nested elements', () => {
    const nodes: MarkupSnapshotNode[] = [
      {
        attributes: {},
        children: [{ text: '   ', type: 'text' }],
        tagName: 'span',
        type: 'element',
      },
      {
        attributes: {},
        children: [{ text: '  hello', type: 'text' }],
        tagName: 'strong',
        type: 'element',
      },
      { text: ' world  ', type: 'text' },
      { type: 'line-break' },
    ]

    expect(trimLeadingWhitespace(nodes)).toEqual([
      {
        attributes: {},
        children: [{ text: 'hello', type: 'text' }],
        tagName: 'strong',
        type: 'element',
      },
      { text: ' world  ', type: 'text' },
      { type: 'line-break' },
    ])

    expect(trimTrailingWhitespace(nodes)).toEqual([
      {
        attributes: {},
        children: [{ text: '   ', type: 'text' }],
        tagName: 'span',
        type: 'element',
      },
      {
        attributes: {},
        children: [{ text: '  hello', type: 'text' }],
        tagName: 'strong',
        type: 'element',
      },
      { text: ' world', type: 'text' },
    ])
  })

  it('leaves leading line breaks untouched when trimming leading whitespace', () => {
    const nodes: MarkupSnapshotNode[] = [
      { type: 'line-break' },
      { text: ' hello', type: 'text' },
    ]

    expect(trimLeadingWhitespace(nodes)).toEqual(nodes)
  })

  it('counts snapshot text length across text, line breaks, and nested elements', () => {
    const nodes = createSnapshotFromHtml('Hi<strong> there</strong><br />!')
    expect(getSnapshotTextLength(nodes)).toBe(10)
  })

  it('renders markup lines and preserves empty intermediate lines', () => {
    const nodes = createSnapshotFromHtml('Hello <strong>world</strong>')

    const { container } = renderMarkup(
      renderMarkupLines(nodes, ['Hello', '', 'world'], <em>…</em>),
    )

    expect(container.querySelectorAll('br')).toHaveLength(2)
    expect(container.querySelector('strong')).toHaveTextContent('world')
    expect(container.textContent).toBe('Helloworld…')
  })

  it('renders a markup prefix and trims trailing whitespace before the ellipsis', () => {
    const nodes = createSnapshotFromHtml('Hello <strong>world  </strong>')

    const { container } = renderMarkup(
      renderMarkupPrefix(nodes, 13, <em>…</em>, true),
    )

    expect(container.textContent).toBe('Hello world…')
    expect(container.querySelector('strong')).toHaveTextContent('world')
  })

  it('drops whitespace-only trailing nodes and keeps the untrimmed prefix when requested', () => {
    const whitespaceOnlyText: MarkupSnapshotNode[] = [
      { text: 'hello', type: 'text' },
      { text: '   ', type: 'text' },
    ]

    expect(trimTrailingWhitespace(whitespaceOnlyText)).toEqual([
      { text: 'hello', type: 'text' },
    ])

    const whitespaceOnlyElement: MarkupSnapshotNode[] = [
      { text: 'hello', type: 'text' },
      {
        attributes: {},
        children: [{ text: '   ', type: 'text' }],
        tagName: 'span',
        type: 'element',
      },
    ]

    expect(trimTrailingWhitespace(whitespaceOnlyElement)).toEqual([
      { text: 'hello', type: 'text' },
    ])

    const { container } = renderMarkup(
      renderMarkupPrefix(createSnapshotFromHtml('hello   '), 8, <em>…</em>),
    )

    expect(container.textContent).toBe('hello   …')
  })
})

describe('getMarkupTruncation', () => {
  afterEach(() => {
    sinon.restore()
    document.body.innerHTML = ''
  })

  it('returns no truncation when there is no markup node', () => {
    const result = getMarkupTruncation({
      ellipsis: '…',
      ellipsisNode: null,
      fallbackDidTruncate: false,
      fallbackVisibleTextLines: [],
      lines: 1,
      node: null,
      rootNode: null,
      separator,
      trimWhitespace: false,
    })

    expect(result).toEqual({ didTruncate: false, result: null })
  })

  it('falls back to plain-text lines when single-line measurement is unavailable', () => {
    const { node, rootNode } = setupMeasurementSandbox({ zeroSingleLine: true })
    node.innerHTML = 'Hello <strong>world</strong> again'

    const result = getMarkupTruncation({
      ellipsis: <a href="/more">…</a>,
      ellipsisNode: null,
      fallbackDidTruncate: true,
      fallbackVisibleTextLines: ['Hello world'],
      lines: 1,
      node,
      rootNode,
      separator,
      trimWhitespace: false,
    })

    expect(result.didTruncate).toBe(true)

    const { container } = renderMarkup(result.result)
    expect(container.textContent).toBe('Hello world…')
    expect(container.querySelector('strong')).toHaveTextContent('world')
  })

  it('falls back safely when content measurement returns zero height', () => {
    const node = document.createElement('span')
    node.innerHTML = 'Hello <strong>world</strong>'
    document.body.appendChild(node)

    setupMeasurementSandbox({ zeroFullContent: true })

    const result = getMarkupTruncation({
      ellipsis: '…',
      ellipsisNode: null,
      fallbackDidTruncate: false,
      fallbackVisibleTextLines: [],
      lines: 1,
      node,
      rootNode: null,
      separator,
      trimWhitespace: false,
    })

    expect(result).toEqual({ didTruncate: false, result: null })
  })

  it('keeps the original markup when the content already fits', () => {
    const { node, rootNode } = setupMeasurementSandbox({ parentWidth: 300 })
    node.innerHTML = 'Hello <strong>world</strong>'

    const result = getMarkupTruncation({
      ellipsis: '…',
      ellipsisNode: null,
      fallbackDidTruncate: true,
      fallbackVisibleTextLines: ['ignored'],
      lines: 2,
      node,
      rootNode,
      separator,
      trimWhitespace: false,
    })

    expect(result).toEqual({ didTruncate: false, result: null })
  })

  it('returns no truncation when the snapshot contains no visible text', () => {
    const { node, rootNode } = setupMeasurementSandbox()
    node.innerHTML = '<span></span><!-- ignored -->'

    const result = getMarkupTruncation({
      ellipsis: '…',
      ellipsisNode: null,
      fallbackDidTruncate: true,
      fallbackVisibleTextLines: ['ignored'],
      lines: 1,
      node,
      rootNode,
      separator,
      trimWhitespace: false,
    })

    expect(result).toEqual({ didTruncate: false, result: null })
  })

  it('truncates rich content, clones the ellipsis markup, and trims break-only tails', () => {
    const { node, rootNode } = setupMeasurementSandbox({
      parentBorder: 1,
      parentPadding: 4,
      parentWidth: 90,
    })
    node.innerHTML = 'Hello<br /><br /><strong>world</strong> again'

    const ellipsisNode = document.createElement('span')
    ellipsisNode.innerHTML = '<a href="/more">…</a>'

    const result = getMarkupTruncation({
      ellipsis: <a href="/more">…</a>,
      ellipsisNode,
      fallbackDidTruncate: true,
      fallbackVisibleTextLines: ['fallback'],
      lines: 1,
      node,
      rootNode,
      separator,
      trimWhitespace: true,
    })

    expect(result.didTruncate).toBe(true)

    const { container } = renderMarkup(result.result)
    expect(container.querySelector('a[href="/more"]')).toBeInTheDocument()
    expect(container.textContent).toBe('Hello…')
    expect(container.querySelectorAll('br')).toHaveLength(0)
  })

  it('removes whitespace-only trailing text before appending the ellipsis', () => {
    const { node, rootNode } = setupMeasurementSandbox({ parentWidth: 30 })
    node.append('Hi   there')

    const result = getMarkupTruncation({
      ellipsis: '…',
      ellipsisNode: null,
      fallbackDidTruncate: true,
      fallbackVisibleTextLines: ['fallback'],
      lines: 1,
      node,
      rootNode,
      separator,
      trimWhitespace: true,
    })

    expect(result.didTruncate).toBe(true)

    const { container } = renderMarkup(result.result)
    expect(container.textContent).toBe('Hi…')
  })

  it('removes whitespace-only trailing elements before appending the ellipsis', () => {
    const { node, rootNode } = setupMeasurementSandbox({ parentWidth: 30 })
    node.append('Hi')

    const trailingWhitespace = document.createElement('span')
    trailingWhitespace.append('   ')
    node.append(trailingWhitespace)
    node.append('there')

    const result = getMarkupTruncation({
      ellipsis: '…',
      ellipsisNode: null,
      fallbackDidTruncate: true,
      fallbackVisibleTextLines: ['fallback'],
      lines: 1,
      node,
      rootNode,
      separator,
      trimWhitespace: true,
    })

    expect(result.didTruncate).toBe(true)

    const { container } = renderMarkup(result.result)
    expect(container.textContent).toBe('Hi…')
    expect(container.querySelector('span')).toBeNull()
  })

  it('removes emptied child elements and unsupported nodes while truncating', () => {
    const { node, rootNode } = setupMeasurementSandbox({ parentWidth: 30 })
    node.append('H')

    const emptyTail = document.createElement('span')
    emptyTail.append(document.createComment('drop me'))
    node.append(emptyTail)
    node.append('i123')

    const result = getMarkupTruncation({
      ellipsis: '…',
      ellipsisNode: null,
      fallbackDidTruncate: true,
      fallbackVisibleTextLines: ['fallback'],
      lines: 1,
      node,
      rootNode,
      separator,
      trimWhitespace: false,
    })

    expect(result.didTruncate).toBe(true)

    const { container } = renderMarkup(result.result)
    expect(container.textContent).toBe('Hi1…')
    expect(container.querySelector('span')).toBeNull()
  })
})
