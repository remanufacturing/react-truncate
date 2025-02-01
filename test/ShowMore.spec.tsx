import React from 'react'
import ReactIs from 'react-is'
import { render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { expandText, testMessage } from './config/test-config'
import { ShowMore } from '../src'

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
})
