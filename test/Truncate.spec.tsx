import { act, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import ReactIs from 'react-is'
import sinon from 'sinon'
import { Truncate, type TruncateProps } from '@/Truncate'
import {
  getEllipsisWidth,
  getMiddleTruncateFragments,
  innerText,
  trimRight,
} from '@/Truncate/utils'
import {
  ellipsis,
  getMultiLineText,
  getRootInnerText,
  measureWidth,
  mockWindowApis,
  numCharacters,
  separator,
  testMessage,
  width,
} from './config/test-config'

type BoxProps = Omit<TruncateProps, 'ref' | 'children'> &
  React.PropsWithChildren

// Rendering test in a container with a specified width
const Box: React.FC<BoxProps> = ({ children = null, ...props }) => (
  <div role="root" style={{ width: `${width}px` }}>
    <Truncate {...props}>{children}</Truncate>
  </div>
)

// Rendering test for no children
const Empty: React.FC<BoxProps> = (props) => (
  <Truncate {...props}>{undefined}</Truncate>
)

describe('<Truncate />', () => {
  describe('should be a React component', () => {
    const element = <Truncate>{testMessage}</Truncate>

    it('should be a React functional component', () => {
      expect(typeof Truncate).toBe('function')
      expect(ReactIs.isValidElementType(Truncate)).toBeTruthy()
    })

    it('should return a valid React element', () => {
      expect(React.isValidElement(element)).toBeTruthy()
      expect(ReactIs.isElement(element)).toBeTruthy()
    })

    it('should render a span', () => {
      const { container } = render(element)
      expect(container.querySelector('span')).toBeInTheDocument()
    })
  })

  describe('in a server environment', () => {
    it('should render initial static markup', () => {
      const markup = renderToString(<Truncate>{testMessage}</Truncate>)
      expect(markup).toContain(testMessage)

      const parser = new DOMParser()
      const doc = parser.parseFromString(markup, 'text/html')
      const extractedText = doc.body.textContent?.trim() || ''

      // The ellipsis is added by the Truncate component
      expect(extractedText).toBe(testMessage + ellipsis)
    })
  })

  describe('in a client environment', () => {
    mockWindowApis()

    describe(`with a box of ${width}px mocked out`, () => {
      it('should truncate text', async () => {
        render(
          <Box lines={2}>
            This text should stop after here and not contain the next lines
          </Box>,
        )

        await waitFor(() => {
          const result = getMultiLineText([
            'This text should',
            'stop after here',
          ])
          expect(getRootInnerText()).toBe(result)
        })
      })

      it('should preserve newlines', async () => {
        render(
          <Box lines={4}>
            This text contains
            <br />
            <br />
            newlines
          </Box>,
        )

        await waitFor(() => {
          const result = getMultiLineText(
            ['This text', 'contains', '', 'newlines'],
            '',
          )
          expect(getRootInnerText()).toBe(result)
        })
      })

      it("should not add empty lines when text doesn't fill all lines", async () => {
        render(<Box lines={4}>Some short text over here</Box>)

        await waitFor(() => {
          const result = getMultiLineText(['Some short text', 'over here'], '')
          expect(getRootInnerText()).toBe(result)
        })
      })

      it('should not truncate at all if specified in lines prop', async () => {
        const message = 'Preserve this text as it was!'
        const Content: React.FC = () => <span>{message}</span>

        render(
          <Box lines={0}>
            <Content />
          </Box>,
        )

        await waitFor(() => {
          const target = screen.getByText(message)
          expect(target).toBeInTheDocument()
        })
      })

      it('should end truncating when a single word is bigger than its line', async () => {
        render(
          <Box lines={2}>
            Thereisasuperlongwordinthefirstline so that the next lines
            won&apos;t be visible
          </Box>,
        )

        await waitFor(() => {
          const result = `Thereisasuperlo${ellipsis}`
          expect(getRootInnerText()).toBe(result)
        })
      })

      it('should be able to use a react component as ellipsis', async () => {
        const ellipsisText = '… read more'

        render(
          <Box lines={2} ellipsis={<a href="#">{ellipsisText}</a>}>
            I&apos;m curious what the next lines of text will say!
          </Box>,
        )

        await waitFor(() => {
          const result = getMultiLineText(
            [`I'm curious what`, 'the n'],
            ellipsisText,
          )
          expect(getRootInnerText()).toBe(result)
        })
      })

      it('should update content when new children are passed in', async () => {
        const { rerender } = render(<Box lines={1}>Some old content here</Box>)

        await waitFor(() => {
          const result = `Some old conten${ellipsis}`
          expect(getRootInnerText()).toBe(result)
        })

        rerender(<Box lines={1}>Some new content here</Box>)

        await waitFor(() => {
          const result = `Some new conten${ellipsis}`
          expect(getRootInnerText()).toBe(result)
        })
      })

      it('should render without an error when the last line is exactly as wide as the container', () => {
        expect(() => {
          render(
            <Box lines={2}>{new Array(numCharacters).fill('a').join('')}</Box>,
          )
        }).not.toThrow()
      })

      describe('with trimWhitespace', () => {
        it('should remove whitespace from before the ellipsis', async () => {
          render(
            <Box lines={4} trimWhitespace>
              This text contains
              <br />
              <br />
              newlines
            </Box>,
          )

          await waitFor(() => {
            const result = getMultiLineText(
              ['This text', 'contains', '', 'newlines'],
              '',
            )
            expect(getRootInnerText()).toBe(result)
          })
        })

        it('should render empty text without an error', () => {
          expect(() => {
            render(<Box lines={1} trimWhitespace></Box>)
          }).not.toThrow()
        })

        it('should truncate whitespace only text without an error', async () => {
          render(
            <Box lines={1} trimWhitespace>
              <br />
              <br />
              <br />
              <br />
              <br />
            </Box>,
          )

          await waitFor(() => {
            expect(getRootInnerText()).toBe(ellipsis)
          })
        })

        it('should remove whitespace only lines when trimWhitespace is true', async () => {
          render(
            <Box lines={3} trimWhitespace>
              <br />
              <br />
              <br />
            </Box>,
          )

          await waitFor(() => {
            expect(getRootInnerText()).toBe(ellipsis)
          })
        })

        it('should trim previous lines when encountering empty lines', async () => {
          render(
            <Box lines={3} trimWhitespace>
              First Line
              <br />
              <br />
              <br />
              <br />
              Second Line
              <br />
              <br />
              Third Line
            </Box>,
          )

          await waitFor(() => {
            const result = `First Line${ellipsis}`
            expect(getRootInnerText()).toBe(result)
          })
        })
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

      describe('should call with false when text was not truncated because', () => {
        it('was disabled with lines prop', async () => {
          const handleTruncate = sinon.spy()

          render(
            <Box lines={0} onTruncate={handleTruncate}>
              Some text over here that is not truncated
            </Box>,
          )

          await waitFor(() => {
            expect(handleTruncate.lastCall.args[0]).toBeFalsy()
          })
        })

        it('has shorter text than lines allow', async () => {
          const handleTruncate = sinon.spy()

          render(
            <Truncate lines={3} onTruncate={handleTruncate}>
              Some text over here that is not truncated
            </Truncate>,
          )

          await waitFor(() => {
            expect(handleTruncate.lastCall.args[0]).toBeFalsy()
          })
        })
      })

      it('should invoke asynchronously', async () => {
        const nextFrame = () =>
          new Promise((resolve) => requestAnimationFrame(resolve))

        const handleTruncate = sinon.spy()

        render(<Box onTruncate={handleTruncate} />)

        expect(handleTruncate.called).toBeFalsy()

        await nextFrame()

        await waitFor(() => {
          expect(handleTruncate.called).toBeTruthy()
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

      it('should recalculate when the width property changes', async () => {
        const handleTruncate = sinon.spy()

        const { rerender } = render(
          <Empty width={100} onTruncate={handleTruncate} />,
        )

        const numCalled = handleTruncate.callCount

        rerender(<Empty width={200} onTruncate={handleTruncate} />)

        await waitFor(() => {
          expect(handleTruncate.callCount).toBe(numCalled + 1)
        })
      })
    })

    it('should clean up all event listeners on window when unmounting', () => {
      const stubs: Partial<
        Record<'addEventListener' | 'removeEventListener', sinon.SinonStub>
      > = {}

      const events = new Set<{
        name: string
        handler: EventListenerOrEventListenerObject
      }>()

      stubs.addEventListener = sinon
        .stub(window, 'addEventListener')
        .callsFake((name, handler) => {
          events.add({ name, handler })
        })

      stubs.removeEventListener = sinon
        .stub(window, 'removeEventListener')
        .callsFake((name, handler) => {
          for (const event of events) {
            if (event.name === name && event.handler === handler) {
              events.delete(event)
            }
          }
        })

      try {
        const container = document.createElement('div')
        const root = createRoot(container)

        // https://react.dev/reference/react/act
        act(() => root.render(<Empty />))
        act(() => root.unmount())

        expect(events.size).toBe(0)
      } finally {
        Object.values(stubs).forEach((stub) => stub?.restore())
      }
    })

    describe('innerText', () => {
      describe('browser implements \\n for <br/>', () => {
        it('should have newlines only at <br/>', () => {
          const node = document.createElement('div')
          node.innerHTML = 'foo<br/>bar\nbaz'
          expect(innerText(node, separator)).toBe('foo\nbar baz')
        })
      })

      describe('browser implements "" for <br/>', () => {
        it('should have newlines only at <br/>', () => {
          const innerTextStub = sinon.stub(
            global.window.HTMLElement.prototype,
            'innerText',
          )

          innerTextStub.get(function (this: HTMLElement) {
            let text = ''

            for (const node of this.childNodes) {
              if (node instanceof global.window.HTMLBRElement) {
                text += ''
                continue
              }

              if (node instanceof global.window.Comment) {
                continue
              }

              const { nodeValue } = node

              if (nodeValue !== undefined) {
                text += nodeValue
              }
            }

            return text
          })

          try {
            const node = document.createElement('div')
            node.innerHTML = 'foo<br/>bar\nbaz'
            expect(innerText(node, separator)).toBe('foo\nbar baz')
          } finally {
            innerTextStub.restore()
          }
        })
      })

      describe('when innerText is not available', () => {
        it('should fallback to textContent when innerText is not available', () => {
          const span = document.createElement('span')
          span.innerHTML = 'Test'

          const originalInnerText = Object.getOwnPropertyDescriptor(
            window.HTMLElement.prototype,
            'innerText',
          )

          try {
            // eslint-disable-next-line no-console
            console.log(
              'before delete check',
              'innerText' in window.HTMLElement.prototype,
            ) // true

            // @ts-expect-error Need to force test this case
            delete window.HTMLElement.prototype.innerText

            // eslint-disable-next-line no-console
            console.log(
              'after delete check',
              'innerText' in window.HTMLElement.prototype,
            ) // false

            const result = innerText(span, separator)
            expect(result).toBe('Test')
          } finally {
            // Restore the original innerText property
            if (originalInnerText) {
              Object.defineProperty(
                window.HTMLElement.prototype,
                'innerText',
                originalInnerText,
              )
            }

            // eslint-disable-next-line no-console
            console.log(
              'finally check',
              'innerText' in window.HTMLElement.prototype,
            ) // false
          }
        })
      })
    })

    describe('ellipsisWidth', () => {
      it('should equal node.offsetWidth', () => {
        const offsetWidth = () => 123

        const node = {} as HTMLSpanElement

        Object.defineProperty(node, 'offsetWidth', {
          get: offsetWidth,
        })

        expect(getEllipsisWidth(node)).toBe(123)
      })

      // When getLines is called, if no ellipsis element is found,
      // ellipsisWidth will be set to 0
      it('should use 0 as ellipsisWidth when getEllipsisWidth returns undefined in component', async () => {
        const TextBox = () => {
          React.useEffect(() => {
            const ellipsisRef = screen.getByTestId('truncate-ellipsis')
            if (ellipsisRef) {
              // eslint-disable-next-line no-console
              console.log('ellipsisRef is exist.')

              // Force overwrite offsetWidth and make it return undefined
              Object.defineProperty(ellipsisRef, 'offsetWidth', {
                get: () => undefined,
              })
            }
          }, [])

          return <Box lines={1}>{testMessage}</Box>
        }

        render(<TextBox />)

        await waitFor(() => {
          const result = testMessage.slice(0, numCharacters) + ellipsis
          expect(getRootInnerText()).toBe(result)
        })
      })
    })

    describe('trimRight', () => {
      it('should remove whitespace from the end of text', () => {
        expect(trimRight('some spaces here  ')).toBe('some spaces here')
        expect(trimRight('some other whitespace here  \r\n')).toBe(
          'some other whitespace here',
        )
        expect(trimRight('\n  ')).toBe('')
      })

      it('should leave other text unchanged', () => {
        expect(trimRight('  whitespace on the left')).toBe(
          '  whitespace on the left',
        )
        expect(trimRight(' just a \n lot of text really')).toBe(
          ' just a \n lot of text really',
        )
      })
    })

    describe('getMiddleTruncateFragments', () => {
      const targetWidth = width
      const ellipsisWidth = measureWidth(ellipsis)

      it('should return correct fragments when text fits within target width', () => {
        const options = {
          end: -5,
          lastLineText: 'This is a long text',
          fullText: 'This is a long text',
          targetWidth,
          ellipsisWidth,
          measureWidth,
        }

        const result = getMiddleTruncateFragments(options)

        expect(result).toEqual({
          startFragment: 'This is a ',
          endFragment: ' text',
        })
      })

      it('should truncate startFragment when text exceeds target width', () => {
        const options = {
          end: -5,
          lastLineText:
            'This is a very long text that exceeds the target width',
          fullText: 'This is a very long text that exceeds the target width',
          targetWidth,
          ellipsisWidth,
          measureWidth,
        }

        const result = getMiddleTruncateFragments(options)

        expect(result).toEqual({
          startFragment: 'This is a ',
          endFragment: 'width',
        })
      })

      it('should return correct fragments when lastLineText is empty', () => {
        const options = {
          end: -5,
          lastLineText: '',
          fullText: 'This is a long text',
          targetWidth: 200,
          ellipsisWidth,
          measureWidth,
        }

        const result = getMiddleTruncateFragments(options)

        expect(result).toEqual({
          startFragment: '',
          endFragment: 'This is a long text',
        })
      })

      it('should handle cases where end is greater than lastLineText length', () => {
        const options = {
          end: -20,
          lastLineText: 'This is a long text',
          fullText: 'This is a long text',
          targetWidth: 200,
          ellipsisWidth,
          measureWidth,
        }

        const result = getMiddleTruncateFragments(options)

        expect(result).toEqual({
          startFragment: '',
          endFragment: 'This is a long text',
        })
      })
    })

    describe('Testing side effects of other props values', () => {
      // More lines of test cases in `./ShowMore.spec.tsx`
      describe('lines', () => {
        it('should get 0 when get an invalid line number', async () => {
          render(<Box lines={0}>{testMessage}</Box>)
          await waitFor(() => {
            expect(getRootInnerText()).toBe(testMessage)
          })
        })

        it('should get 0 when lines is a negative number', async () => {
          render(<Box lines={-1}>{testMessage}</Box>)
          await waitFor(() => {
            expect(getRootInnerText()).toBe(testMessage)
          })
        })

        it('should get 0 when lines is NaN', async () => {
          render(<Box lines={NaN}>{testMessage}</Box>)
          await waitFor(() => {
            expect(getRootInnerText()).toBe(testMessage)
          })
        })

        it('should get 0 when lines is Infinity', async () => {
          render(<Box lines={Infinity}>{testMessage}</Box>)
          await waitFor(() => {
            expect(getRootInnerText()).toBe(testMessage)
          })
        })
      })

      // More lines of test cases in `./MiddleTruncate.spec.tsx`
      describe('end', () => {
        const resultMessage = testMessage.slice(0, 15) + ellipsis

        it('should return 0 when end is 0', async () => {
          render(
            <Box middle end={0}>
              {testMessage}
            </Box>,
          )
          await waitFor(() => {
            expect(getRootInnerText()).toBe(resultMessage)
          })
        })

        it('should return 0 when end is NaN', async () => {
          render(
            <Box middle end={NaN}>
              {testMessage}
            </Box>,
          )
          await waitFor(() => {
            expect(getRootInnerText()).toBe(resultMessage)
          })
        })

        it('should return 0 when end is Infinity', async () => {
          render(
            <Box middle end={Infinity}>
              {testMessage}
            </Box>,
          )
          await waitFor(() => {
            expect(getRootInnerText()).toBe(resultMessage)
          })
        })

        it('should return 0 when end is -Infinity', async () => {
          render(
            <Box middle end={-Infinity}>
              {testMessage}
            </Box>,
          )
          await waitFor(() => {
            expect(getRootInnerText()).toBe(resultMessage)
          })
        })

        it('should return 0 when end is a string', async () => {
          render(
            <Box middle end={'string' as unknown as number}>
              {testMessage}
            </Box>,
          )
          await waitFor(() => {
            expect(getRootInnerText()).toBe(resultMessage)
          })
        })
      })
    })
  })
})
