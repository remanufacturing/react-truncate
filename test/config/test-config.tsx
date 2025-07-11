import { screen, within } from '@testing-library/react'
import sinon from 'sinon'

/**
 * Test configuration from the original repository
 */

export const characterWidth = 6 // px
export const measureWidth = (text: string) => text.length * characterWidth

// Mock out a box that's 16 characters wide
export const numCharacters = 16
export const width = numCharacters * characterWidth

// Default ellipsis
export const ellipsis = '…'

// Default Separator for innerText
export const separator = ' '

// Default expand text for ShowMore.tsx
export const expandText = `${ellipsis} Expand`
export const collapseText = ' Collapse'

// In the test file, a root box will be unified as the test container
export const getRootElement = () => {
  const root = screen.getByRole('root')

  try {
    // Called before getting the result,
    // to avoid getting the text of the invisible ellipsis node,
    // see `ellipsisRef` in Truncate.tsx
    const ellipsisNode = within(root).getByTestId('truncate-ellipsis')
    ellipsisNode?.remove()
  } catch {
    // No-op
    // When rerender, maybe exception is thrown
    // But this is expected and does not need to be handled
  }

  return root
}

// Replace `<br />` tags with `\n` line breaks
const getCustomInnerText = (element: HTMLElement): string => {
  let text = ''

  for (const node of element.childNodes) {
    if (node instanceof HTMLBRElement) {
      text += '\n'
      continue
    }

    if (node.nodeType === Node.TEXT_NODE) {
      text += node.nodeValue
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      text += getCustomInnerText(node as HTMLElement)
    }
  }

  // Trim right
  return text.replace(/\s+$/, '')
}

export const getRootInnerText = () => {
  const root = getRootElement()
  return getCustomInnerText(root)
}

export const getMultiLineText = (lines: string[], ellipsisText = ellipsis) => {
  return lines.join('\n') + ellipsisText
}

// Get the more button for ShowMore.tsx
export const getMoreButton = () => {
  const root = getRootElement()
  return within(root).getByTestId('more-button')
}

// Get the less button for ShowMore.tsx
export const getLessButton = () => {
  const root = getRootElement()
  return within(root).getByTestId('less-button')
}

/**
 * Make up for the lack of APIs in the test environment
 */

export const mockWindowApis = () => {
  const stubs: Partial<
    Record<
      'getBoundingClientRect' | 'getContext' | 'offsetWidth',
      sinon.SinonStub
    >
  > = {}

  beforeAll(() => {
    stubs.getBoundingClientRect = sinon
      .stub(global.window.HTMLDivElement.prototype, 'getBoundingClientRect')
      .callsFake(() => {
        const rect = new DOMRect()
        rect.width = width
        return rect
      })

    stubs.getContext = sinon
      .stub(global.window.HTMLCanvasElement.prototype, 'getContext')
      .callsFake(() => {
        return {
          measureText: (text: string) => ({
            width: text.length * characterWidth,
          }),
        } as CanvasRenderingContext2D
      })

    stubs.offsetWidth = sinon
      .stub(HTMLSpanElement.prototype, 'offsetWidth')
      .get(function (this: HTMLSpanElement) {
        const text = this.textContent || ''
        return measureWidth(text)
      })
  })

  afterAll(() => {
    Object.values(stubs).forEach((stub) => stub?.restore())
  })
}

/**
 * Content used for testing
 */

export const testMessage = 'Some text inside of here'
