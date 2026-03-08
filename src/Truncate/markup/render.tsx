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

const renderSnapshotNodes = (
  nodes: MarkupSnapshotNode[],
  keyPrefix = 'markup',
): React.ReactNode[] => {
  return nodes.flatMap((node, index) => {
    const key = `${keyPrefix}-${index}`

    if (node.type === 'text') {
      return node.text ? [node.text] : []
    }

    if (node.type === 'line-break') {
      return [<br key={key} />]
    }

    const children = renderSnapshotNodes(node.children, `${key}-child`)

    if (children.length === 0) {
      return []
    }

    return [
      React.createElement(
        node.tagName,
        {
          key,
          ...normalizeAttributes(node.attributes),
        },
        ...children,
      ),
    ]
  })
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

  const taken = childResult.taken.length
    ? [{ ...node, children: childResult.taken }]
    : []
  const rest = childResult.rest.length
    ? [{ ...node, children: childResult.rest }]
    : []

  return {
    taken,
    rest,
    remaining: childResult.remaining,
  }
}

const sliceSnapshotNodes = (
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

const trimLeadingWhitespace = (
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

export const renderMarkupPrefix = (
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
