export type MarkupSnapshotNode =
  | {
      text: string
      type: 'text'
    }
  | {
      type: 'line-break'
    }
  | {
      attributes: Record<string, string>
      children: MarkupSnapshotNode[]
      tagName: string
      type: 'element'
    }

const normalizeText = (text: string, separator: string) => {
  return text.replace(/\r\n|\r|\n/g, separator)
}

const getAttributes = (element: Element) => {
  return Array.from(element.attributes).reduce<Record<string, string>>(
    (result, attribute) => {
      result[attribute.name] = attribute.value
      return result
    },
    {},
  )
}

export const createMarkupSnapshot = (
  node: Node | null,
  separator: string,
): MarkupSnapshotNode[] => {
  if (!node) return []

  return Array.from(node.childNodes).flatMap<MarkupSnapshotNode>(
    (childNode) => {
      if (childNode instanceof HTMLBRElement) {
        return [{ type: 'line-break' }]
      }

      if (childNode.nodeType === Node.TEXT_NODE) {
        const text = normalizeText(childNode.textContent || '', separator)
        return text ? [{ type: 'text', text }] : []
      }

      if (childNode.nodeType === Node.ELEMENT_NODE) {
        const element = childNode as Element
        return [
          {
            type: 'element',
            tagName: element.tagName.toLowerCase(),
            attributes: getAttributes(element),
            children: createMarkupSnapshot(element, separator),
          },
        ]
      }

      return []
    },
  )
}
