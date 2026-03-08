import React from 'react'
import { type MarkupSnapshotNode } from './snapshot'

const normalizeAttributeName = (name: string) => {
  if (name === 'class') return 'className'
  return name
}

const parseStyleAttribute = (styleText: string) => {
  return styleText
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((styles, declaration) => {
      const [rawProperty, ...rawValueParts] = declaration.split(':')
      const property = rawProperty?.trim()
      const value = rawValueParts.join(':').trim()

      if (!property || !value) return styles

      const reactProperty = property.replace(/-([a-z])/g, (_, char: string) => {
        return char.toUpperCase()
      })

      styles[reactProperty] = value
      return styles
    }, {})
}

const normalizeAttributes = (attributes: Record<string, string>) => {
  return Object.entries(attributes).reduce<Record<string, unknown>>(
    (result, [name, value]) => {
      const normalizedName = normalizeAttributeName(name)
      result[normalizedName] =
        normalizedName === 'style' ? parseStyleAttribute(value) : value
      return result
    },
    {},
  )
}

export const renderSnapshotNodes = (
  nodes: MarkupSnapshotNode[],
  keyPrefix = 'markup',
): React.ReactNode[] => {
  return nodes.reduce<React.ReactNode[]>((result, node, index) => {
    const key = `${keyPrefix}-${index}`

    if (node.type === 'text') {
      if (node.text) {
        result.push(node.text)
      }

      return result
    }

    if (node.type === 'line-break') {
      result.push(<br key={key} />)
      return result
    }

    const children = renderSnapshotNodes(node.children, `${key}-child`)

    if (children.length === 0) {
      return result
    }

    result.push(
      React.createElement(
        node.tagName,
        {
          key,
          ...normalizeAttributes(node.attributes),
        },
        ...children,
      ),
    )

    return result
  }, [])
}

interface SliceResult {
  remaining: number
  rest: MarkupSnapshotNode[]
  taken: MarkupSnapshotNode[]
}

const sliceSnapshotNode = (
  node: MarkupSnapshotNode,
  remaining: number,
): SliceResult => {
  if (remaining <= 0) {
    return {
      taken: [],
      rest: [node],
      remaining,
    }
  }

  if (node.type === 'text') {
    if (node.text.length <= remaining) {
      return {
        taken: [node],
        rest: [],
        remaining: remaining - node.text.length,
      }
    }

    return {
      taken: [{ ...node, text: node.text.slice(0, remaining) }],
      rest: [{ ...node, text: node.text.slice(remaining) }],
      remaining: 0,
    }
  }

  if (node.type === 'line-break') {
    if (remaining >= 1) {
      return {
        taken: [node],
        rest: [],
        remaining: remaining - 1,
      }
    }

    return {
      taken: [],
      rest: [node],
      remaining,
    }
  }

  const childResult = sliceSnapshotNodes(node.children, remaining)

  return {
    taken: childResult.taken.length
      ? [{ ...node, children: childResult.taken }]
      : [],
    rest: childResult.rest.length
      ? [{ ...node, children: childResult.rest }]
      : [],
    remaining: childResult.remaining,
  }
}

export const sliceSnapshotNodes = (
  nodes: MarkupSnapshotNode[],
  remaining: number,
): SliceResult => {
  const taken: MarkupSnapshotNode[] = []
  const rest: MarkupSnapshotNode[] = []

  let nextRemaining = remaining

  nodes.forEach((node) => {
    if (nextRemaining <= 0) {
      rest.push(node)
      return
    }

    const result = sliceSnapshotNode(node, nextRemaining)
    taken.push(...result.taken)
    rest.push(...result.rest)
    nextRemaining = result.remaining
  })

  return {
    taken,
    rest,
    remaining: nextRemaining,
  }
}

export const trimLeadingWhitespace = (
  nodes: MarkupSnapshotNode[],
): MarkupSnapshotNode[] => {
  if (nodes.length === 0) return nodes

  const [firstNode, ...restNodes] = nodes

  if (firstNode.type === 'text') {
    const trimmedText = firstNode.text.replace(/^\s+/, '')

    if (!trimmedText) {
      return trimLeadingWhitespace(restNodes)
    }

    return [{ ...firstNode, text: trimmedText }, ...restNodes]
  }

  if (firstNode.type === 'element') {
    const trimmedChildren = trimLeadingWhitespace(firstNode.children)

    if (trimmedChildren.length === 0) {
      return trimLeadingWhitespace(restNodes)
    }

    return [{ ...firstNode, children: trimmedChildren }, ...restNodes]
  }

  return nodes
}

export const trimTrailingWhitespace = (
  nodes: MarkupSnapshotNode[],
): MarkupSnapshotNode[] => {
  if (nodes.length === 0) return nodes

  const headNodes = nodes.slice(0, -1)
  const lastNode = nodes.at(-1)

  if (!lastNode) {
    return nodes
  }

  if (lastNode.type === 'line-break') {
    return trimTrailingWhitespace(headNodes)
  }

  if (lastNode.type === 'text') {
    const trimmedText = lastNode.text.replace(/\s+$/, '')

    if (!trimmedText) {
      return trimTrailingWhitespace(headNodes)
    }

    return [...headNodes, { ...lastNode, text: trimmedText }]
  }

  const trimmedChildren = trimTrailingWhitespace(lastNode.children)

  if (trimmedChildren.length === 0) {
    return trimTrailingWhitespace(headNodes)
  }

  return [...headNodes, { ...lastNode, children: trimmedChildren }]
}

export const getSnapshotTextLength = (nodes: MarkupSnapshotNode[]): number => {
  return nodes.reduce((total, node) => {
    if (node.type === 'text') {
      return total + node.text.length
    }

    if (node.type === 'line-break') {
      return total + 1
    }

    return total + getSnapshotTextLength(node.children)
  }, 0)
}

export const renderMarkupLines = (
  nodes: MarkupSnapshotNode[],
  visibleTextLines: string[],
  ellipsis: React.ReactNode,
) => {
  let remainingNodes = nodes

  return visibleTextLines.map((line, index) => {
    const result = sliceSnapshotNodes(remainingNodes, line.length)
    remainingNodes = trimLeadingWhitespace(result.rest)

    const renderedLine = renderSnapshotNodes(
      result.taken,
      `markup-line-${index}`,
    )

    if (index === visibleTextLines.length - 1) {
      return (
        <span key={`markup-line-${index}`}>
          {renderedLine}
          {ellipsis}
        </span>
      )
    }

    if (renderedLine.length === 0) {
      return <br key={`markup-line-${index}`} />
    }

    return (
      <React.Fragment key={`markup-line-${index}`}>
        {renderedLine}
        <br />
      </React.Fragment>
    )
  })
}

export const renderMarkupPrefix = (
  nodes: MarkupSnapshotNode[],
  visibleLength: number,
  ellipsis: React.ReactNode,
  trimWhitespace = false,
) => {
  const result = sliceSnapshotNodes(nodes, visibleLength)
  const visibleNodes = trimWhitespace
    ? trimTrailingWhitespace(result.taken)
    : result.taken

  return [
    ...renderSnapshotNodes(visibleNodes, 'markup-prefix'),
    <React.Fragment key="markup-ellipsis">{ellipsis}</React.Fragment>,
  ]
}
