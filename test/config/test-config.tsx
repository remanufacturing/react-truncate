import React from 'react'
import sinon from 'sinon'
import { screen, within } from '@testing-library/react'

/**
 * Test configuration from the original repository
 */

const characterWidth = 6 // px
const measureWidth = (text: string) => text.length * characterWidth

// Mock out a box that's 16 characters wide
export const numCharacters = 16
export const width = numCharacters * characterWidth

// Default ellipsis
export const ellipsis = '…'

// Default Separator for innerText
export const separator = ' '

// Default expand text for ShowMore.tsx
export const expandText = ellipsis + ' Expand'
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
  } catch (e) {
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

export const StringTextComponent: React.FC = () => (
  <>
    Water is an inorganic compound with the chemical formula H2O. It is a
    transparent, tasteless, odorless, and nearly colorless chemical substance.
    It is the main constituent of Earth's hydrosphere and the fluids of all
    known living organisms (in which it acts as a solvent). It is vital for all
    known forms of life, despite not providing food energy or organic
    micronutrients.
  </>
)

export const RichTextComponent: React.FC = () => (
  <>
    <p>
      <b>Water</b> is an
      <a
        href="https://en.wikipedia.org/wiki/Inorganic_compound"
        title="Inorganic compound"
      >
        inorganic compound
      </a>
      with the
      <a
        href="https://en.wikipedia.org/wiki/Chemical_formula"
        title="Chemical formula"
      >
        chemical formula
      </a>
      <span>
        H<sub>2</sub>O
      </span>
      . It is a transparent, tasteless, odorless, and
      <a
        href="https://en.wikipedia.org/wiki/Color_of_water"
        title="Color of water"
      >
        nearly colorless
      </a>
      <a
        href="https://en.wikipedia.org/wiki/Chemical_substance"
        title="Chemical substance"
      >
        chemical substance
      </a>
      . It is the main constituent of
      <a href="https://en.wikipedia.org/wiki/Earth" title="Earth">
        Earth
      </a>
      's
      <a href="https://en.wikipedia.org/wiki/Hydrosphere" title="Hydrosphere">
        hydrosphere
      </a>
      and the
      <a href="https://en.wikipedia.org/wiki/Fluid" title="Fluid">
        fluids
      </a>{' '}
      of all known living organisms (in which it acts as a
      <a href="https://en.wikipedia.org/wiki/Solvent" title="Solvent">
        solvent
      </a>
      ). It is vital for all known forms of
      <a href="https://en.wikipedia.org/wiki/Life" title="Life">
        life
      </a>
      , despite not providing
      <a href="https://en.wikipedia.org/wiki/Food_energy" title="Food energy">
        food energy
      </a>
      or organic
      <a
        href="https://en.wikipedia.org/wiki/Micronutrient"
        title="Micronutrient"
      >
        micronutrients
      </a>
      .
    </p>
  </>
)
