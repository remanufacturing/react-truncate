import React from 'react'
import ReactIs from 'react-is'
import sinon from 'sinon'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import {
  collapseText,
  expandText,
  getLessButton,
  getMoreButton,
  getMultiLineText,
  getRootElement,
  getRootInnerText,
  mockWindowApis,
  testMessage,
  width,
} from './config/test-config'
import {
  ShowMore,
  type ShowMoreToggleLinesFn,
  type ShowMoreProps,
  ShowMoreRef,
} from '@/ShowMore'

type BoxProps = Omit<ShowMoreProps, 'ref' | 'children'> &
  React.PropsWithChildren & {
    ref?: React.Ref<ShowMoreRef>
  }

// Rendering test in a container with a specified width
const Box: React.FC<BoxProps> = ({ children = null, ...props }) => (
  <div role="root" style={{ width: `${width}px` }}>
    <ShowMore {...props}>{children}</ShowMore>
  </div>
)

// Rendering test for no children
const Empty: React.FC<BoxProps> = (props) => (
  <ShowMore {...props}>{undefined}</ShowMore>
)

describe('<ShowMore />', () => {
  describe('should be a React component', () => {
    const element = <ShowMore>{testMessage}</ShowMore>

    it('should be a React functional component', () => {
      // Wrapped by React.forwardRef
      expect(typeof ShowMore).toBe('object')
      expect(ReactIs.isValidElementType(ShowMore)).toBeTruthy()
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
    it('should render initial static markup', async () => {
      const markup = renderToString(
        <ShowMore lines={3}>{testMessage}</ShowMore>,
      )

      expect(markup).toContain(testMessage)

      const parser = new DOMParser()
      const doc = parser.parseFromString(markup, 'text/html')
      const extractedText = doc.body.textContent?.trim() || ''

      // The ellipsis is added by the ShowMore component
      expect(extractedText).toBe(testMessage + expandText)
    })
  })

  describe('in a client environment', () => {
    mockWindowApis()

    describe(`with a box of ${width}px mocked out`, () => {
      it('should truncate text and show the expand button', async () => {
        render(
          <Box lines={2}>
            This text should stop at here and not contain the next lines
          </Box>,
        )

        await waitFor(() => {
          const result = getMultiLineText(
            ['This text should', 'stop at '],
            expandText,
          )
          expect(getRootInnerText()).toBe(result)
        })
      })

      describe('when toggle buttons clicked', () => {
        const message =
          'This text should stop at here and not contain the next lines'

        const handleExpand = async () => {
          // Check the initial state is truncated
          await waitFor(() => {
            const truncatedText = getMultiLineText(
              ['This text should', 'stop at '],
              expandText,
            )
            expect(getRootInnerText()).toBe(truncatedText)
          })

          // Check the expand button is in the document
          const moreButton = getMoreButton()
          expect(moreButton).toBeInTheDocument()

          // Click the expand button
          // the message will be expanded
          await userEvent.click(moreButton)

          await waitFor(() => {
            expect(screen.getByText(message)).toBeInTheDocument()
          })

          await waitFor(() => {
            expect(getRootInnerText()).toBe(message + collapseText)
          })
        }

        // Make each test start in the expanded state
        beforeEach(async () => {
          render(<Box lines={2}>{message}</Box>)
          await handleExpand()
        })

        it('should expand when the expand button is clicked', async () => {
          // Since beforeEach is already expanded, so directly check the expanded status here
          expect(screen.getByText(message)).toBeInTheDocument()
        })

        it('should collapse when the collapse button is clicked', async () => {
          const lessButton = getLessButton()
          expect(lessButton).toBeInTheDocument()

          await userEvent.click(lessButton)

          await waitFor(() => {
            const truncatedText = getMultiLineText(
              ['This text should', 'stop at '],
              expandText,
            )
            expect(getRootInnerText()).toBe(truncatedText)
          })
        })
      })
    })

    describe('Custom toggle buttons', () => {
      it('should render custom button label directly if it is a valid React element', () => {
        const label = <strong data-testid="custom-label">Custom label</strong>

        render(<Empty more={label} />)

        expect(screen.getByTestId('custom-label')).toBeInTheDocument()
      })

      it('should wrap label in a link if it is a string', () => {
        const label = 'Hello World'

        render(<Empty more={label} />)

        const moreButton = screen.getByTestId('more-button')
        expect(moreButton).toBeInTheDocument()
        expect(moreButton).toHaveTextContent(label)
        expect(moreButton.tagName).toBe('A')
      })

      describe('toggleLines', () => {
        const longText = 'This is a long text that should be truncated'

        const Button: React.FC<{
          testId: string
          label: string
          onClick: ShowMoreToggleLinesFn
        }> = ({ testId, label, onClick }) => (
          <button data-testid={testId} onClick={onClick}>
            {label}
          </button>
        )

        const TestComponent: React.FC = () => {
          const ref = React.useRef<ShowMoreRef>(null)

          const toggleLines: ShowMoreToggleLinesFn = (e) => {
            ref.current?.toggleLines(e)
          }

          return (
            <Box
              ref={ref}
              lines={1}
              more={
                <Button testId="more-btn" label="More" onClick={toggleLines} />
              }
              less={
                <Button testId="less-btn" label="Less" onClick={toggleLines} />
              }
            >
              {longText}
            </Box>
          )
        }

        it('should toggle ShowMore when clicking custom buttons', async () => {
          render(<TestComponent />)

          const root = getRootElement()
          const moreButton = within(root).getByTestId('more-btn')

          // Initial state: text should be truncated, "More" button visible
          expect(moreButton).toBeInTheDocument()
          expect(screen.getByText(/This is a lo/)).toBeInTheDocument()

          // Click the "More" button to expand
          await userEvent.click(moreButton)

          // After expansion: The full text should be visible,
          // and the "Less" button should be visible
          const lessButton = within(root).getByTestId('less-btn')
          expect(lessButton).toBeInTheDocument()
          expect(screen.getByText(longText)).toBeInTheDocument()

          // Click the "Less" button to collapse
          await userEvent.click(lessButton)

          // After collapse: the text should be truncated again
          // and the "More" button should be visible again
          // Re-query the "More" button after collapse
          await waitFor(() => {
            const moreButtonAfterCollapse = screen.getByTestId('more-btn')
            expect(moreButtonAfterCollapse).toBeInTheDocument()
          })
        })
      })
    })

    describe('onToggle', () => {
      let expanded = false

      const onToggle = (didExpand: boolean) => {
        expanded = didExpand
      }

      it('should trigger the callback when the component is toggled', async () => {
        render(
          <Box onToggle={onToggle}>
            This text should stop at here and not contain the next lines
          </Box>,
        )

        expect(expanded).toBe(false)

        const moreButton = getMoreButton()
        expect(moreButton).toBeInTheDocument()

        await userEvent.click(moreButton)

        expect(expanded).toBe(true)
      })
    })

    describe('onTruncate', () => {
      it('should trigger the callback when the component is truncated', async () => {
        const handleTruncate = sinon.spy()

        render(
          <Box lines={1} onTruncate={handleTruncate}>
            {testMessage}
          </Box>,
        )

        await waitFor(() => {
          expect(handleTruncate.calledOnce).toBeTruthy()
          expect(handleTruncate.lastCall.args[0]).toBeTruthy()
        })
      })
    })
  })
})
