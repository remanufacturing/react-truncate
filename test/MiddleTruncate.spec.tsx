import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { renderToString } from 'react-dom/server'
import ReactIs from 'react-is'
import sinon from 'sinon'
import { MiddleTruncate, type MiddleTruncateProps } from '@/MiddleTruncate'
import {
  characterWidth,
  ellipsis,
  getRootInnerText,
  measureWidth,
  mockWindowApis,
  testMessage,
  width,
} from './config/test-config'

type BoxProps = Omit<MiddleTruncateProps, 'ref' | 'children'> &
  React.PropsWithChildren

// Rendering test in a container with a specified width
const Box: React.FC<BoxProps> = ({ children = null, ...props }) => (
  <div role="root" style={{ width: `${width}px` }}>
    <MiddleTruncate {...props}>{children}</MiddleTruncate>
  </div>
)

// Rendering test for no children
const Empty: React.FC<BoxProps> = (props) => (
  <MiddleTruncate {...props}>{undefined}</MiddleTruncate>
)

// To resolve coverage warnings,
// unexpected situations are tested in Truncate Props,
// so only expected behavior is handled here.
const getTruncatedResult = (end: number, message = testMessage) => {
  const endPos = Math.abs(end)
  const endWidth = endPos * characterWidth
  const ellipsisWidth = measureWidth(ellipsis)
  const remainingWidth = width - endWidth - ellipsisWidth
  const startCharters = remainingWidth > 0 ? remainingWidth / characterWidth : 0
  return message.slice(0, startCharters) + ellipsis + message.slice(-endPos)
}

// For more basic test cases, see `Truncate.spec.tsx`
describe('<MiddleTruncate />', () => {
  describe('should be a React component', () => {
    const element = <MiddleTruncate>{testMessage}</MiddleTruncate>

    it('should be a React functional component', () => {
      // Wrapped by React.forwardRef
      expect(typeof MiddleTruncate).toBe('object')
      expect(ReactIs.isValidElementType(MiddleTruncate)).toBeTruthy()
    })

    it('should return a valid React element', () => {
      expect(React.isValidElement(element)).toBeTruthy()
      expect(ReactIs.isElement(element)).toBeTruthy()
    })

    it('should render a div', () => {
      const { container } = render(element)
      expect(container.querySelector('div')).toBeInTheDocument()
    })
  })

  describe('in a server environment', () => {
    it('should render initial static markup', () => {
      const markup = renderToString(
        <MiddleTruncate>{testMessage}</MiddleTruncate>,
      )

      expect(markup).toContain(testMessage)

      const parser = new DOMParser()
      const doc = parser.parseFromString(markup, 'text/html')
      const extractedText = doc.body.textContent?.trim() || ''

      // The ellipsis is added by the ShowMore component
      expect(extractedText).toBe(testMessage + ellipsis)
    })
  })

  describe('in a client environment', () => {
    mockWindowApis()

    describe(`with a box of ${width}px mocked out`, () => {
      it('should truncate text and end at last 3 characters', async () => {
        render(<Box end={3}>{testMessage}</Box>)

        await waitFor(() => {
          const result = getTruncatedResult(3)
          expect(getRootInnerText()).toBe(result)
        })
      })

      it('should truncate text and end at last 3 characters when a negative number is passed', async () => {
        render(<Box end={-3}>{testMessage}</Box>)

        await waitFor(() => {
          const result = getTruncatedResult(-3)
          expect(getRootInnerText()).toBe(result)
        })
      })

      it('should truncate long text that is much longer than the container can display and end at last 3 characters', async () => {
        const message = Array(100).fill(testMessage).join('')
        render(<Box end={3}>{message}</Box>)

        await waitFor(() => {
          const result = getTruncatedResult(3, message)
          expect(getRootInnerText()).toBe(result)
        })
      })

      it('should truncate rich text and end at last 3 characters', async () => {
        render(
          <Box end={3}>
            <span>
              This text contains
              <br />
              <br />
              newlines
            </span>
          </Box>,
        )

        await waitFor(() => {
          const result = `This text co${ellipsis}nes`
          expect(getRootInnerText()).toBe(result)
        })
      })

      describe('onTruncate', () => {
        it('should call with true when text was truncated', async () => {
          const handleTruncate = sinon.spy()

          render(
            <Box onTruncate={handleTruncate}>
              Some text over here that got truncated
            </Box>,
          )

          await waitFor(() => {
            expect(handleTruncate.calledOnce).toBeTruthy()
            expect(handleTruncate.lastCall.args[0]).toBeTruthy()
          })
        })

        it('should recalculate when resizing the window', async () => {
          const handleTruncate = sinon.spy()

          render(<Empty onTruncate={handleTruncate} />)

          const numCalled = handleTruncate.callCount

          window.dispatchEvent(new Event('resize'))

          await waitFor(() => {
            expect(handleTruncate.callCount).toBe(numCalled + 1)
          })
        })
      })
    })
  })
})
