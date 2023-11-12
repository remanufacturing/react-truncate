import React, { useCallback, useEffect, useRef, useState } from 'react'

type DetailedHTMLProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>

export interface TruncateProps extends DetailedHTMLProps {
  children: React.ReactNode
  ellipsis: React.ReactNode
  lines: number
  trimWhitespace?: boolean
  width?: number
  onTruncate?: (didTruncate: boolean) => void
}

export const Truncate: React.FC<TruncateProps> = ({
  children,
  ellipsis,
  lines = 1,
  trimWhitespace = false,
  width = 0,
  onTruncate,
  ...spanProps
}) => {
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>()
  const [renderTextRef, setRenderTextRef] = useState<
    (string | JSX.Element)[] | React.ReactNode
  >()
  const [targetWidth, setTargetWidth] = useState<number>(0)
  const [animationFrame, setAnimationFrame] = useState<number>(0)

  const targetRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const ellipsisRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (textRef && textRef.current && textRef.current.parentNode) {
      textRef.current.parentNode.removeChild(textRef.current)
    }
  }, [targetWidth])

  const calcTWidth = useCallback((): number | undefined => {
    // Calculation is no longer relevant, since node has been removed
    if (!targetRef.current?.parentElement) {
      return
    }

    const newTargetWidth =
      width ||
      // Floor the result to deal with browser subpixel precision
      Math.floor(targetRef.current.parentElement.getBoundingClientRect().width)

    // Delay calculation until parent node is inserted to the document
    // Mounting order in React is ChildComponent, ParentComponent
    if (!newTargetWidth) {
      return window.requestAnimationFrame(() => calcTWidth(/* callback */))
    }

    const style = window.getComputedStyle(targetRef.current)

    const font = [
      style.fontWeight,
      style.fontStyle,
      style.fontSize,
      style.fontFamily,
    ].join(' ')

    if (canvasContext) canvasContext.font = font

    setTargetWidth(newTargetWidth)
  }, [canvasContext, width])

  useEffect(() => {
    const canvas = document.createElement('canvas')
    setCanvasContext(canvas.getContext('2d'))
  }, [])

  useEffect(() => {
    calcTWidth()
    window.addEventListener('resize', calcTWidth)

    return () => {
      window.removeEventListener('resize', calcTWidth)

      window.cancelAnimationFrame(animationFrame)
    }
  }, [calcTWidth, animationFrame])

  // Shim innerText to consistently break lines at <br/> but not at \n
  const innerText = (node: HTMLSpanElement | null) => {
    const div = document.createElement('div')
    const contentKey =
      'innerText' in window.HTMLElement.prototype ? 'innerText' : 'textContent'

    div.innerHTML = node?.innerHTML.replace(/\r\n|\r|\n/g, ' ') || ''

    let newText = div[contentKey]

    const test = document.createElement('div')
    test.innerHTML = 'foo<br/>bar'

    if (test[contentKey]?.replace(/\r\n|\r/g, '\n') !== 'foo\nbar') {
      div.innerHTML = div.innerHTML.replace(/<br.*?[/]?>/gi, '\n')
      newText = div[contentKey]
    }

    return newText || ''
  }

  const truncate = useCallback(
    (didTruncate: boolean) => {
      if (typeof onTruncate === 'function') {
        setAnimationFrame(
          window.requestAnimationFrame(() => {
            onTruncate(didTruncate)
          }),
        )
      }
    },
    [onTruncate],
  )

  const measureWidth = useCallback(
    (textVal: string) => {
      return canvasContext?.measureText(textVal).width || 0
    },
    [canvasContext],
  )

  const getEllipsisWidth = (node?: HTMLSpanElement | null) => {
    return node?.offsetWidth
  }

  const trimRight = (textVal: string) => {
    return textVal.replace(/\s+$/, '')
  }

  const getLines = useCallback(() => {
    const resultLines: Array<string | JSX.Element> = []
    const textLine = innerText(textRef.current)
    const textLines = textLine.split('\n').map((line) => line.split(' '))
    const ellipsisWidth = getEllipsisWidth(ellipsisRef.current) || 0

    let didTruncate = true

    for (let line = 1; line <= lines; line++) {
      const textWords = textLines[0]

      // Handle newline
      if (textWords.length === 0) {
        resultLines.push()
        textLines.shift()
        line--
        continue
      }

      let resultLine: string | JSX.Element = textWords.join(' ') || ''
      if (measureWidth(resultLine) <= targetWidth) {
        if (textLines.length === 1) {
          // Line is end of text and fits without truncating
          didTruncate = false

          resultLines.push(resultLine)
          break
        }
      }

      if (line === lines) {
        // Binary search determining the longest possible line inluding truncate string
        const textRest = textWords.join(' ')

        let lower = 0
        let upper = textRest.length - 1

        while (lower <= upper) {
          const middle = Math.floor((lower + upper) / 2)

          const testLine = textRest.slice(0, middle + 1)

          if (measureWidth(testLine) + ellipsisWidth <= targetWidth) {
            lower = middle + 1
          } else {
            upper = middle - 1
          }
        }

        let lastLineText = textRest.slice(0, lower)

        if (trimWhitespace) {
          lastLineText = trimRight(lastLineText)

          // Remove blank lines from the end of text
          while (!lastLineText.length && resultLines.length) {
            const prevLine = resultLines.pop()

            if (prevLine && typeof prevLine === 'string')
              lastLineText = trimRight(prevLine)
          }
        }

        resultLine = (
          <span>
            {lastLineText}
            {ellipsis}
          </span>
        )
      } else {
        // Binary search determining when the line breaks
        let lower = 0
        let upper = textWords.length - 1

        while (lower <= upper) {
          const middle = Math.floor((lower + upper) / 2)

          const testLine = textWords.slice(0, middle + 1).join(' ')

          if (measureWidth(testLine) <= targetWidth) {
            lower = middle + 1
          } else {
            upper = middle - 1
          }
        }

        // The first word of this line is too long to fit it
        if (lower === 0) {
          // Jump to processing of last line
          line = lines - 1
          continue
        }

        resultLine = textWords.slice(0, lower).join(' ')
        textLines[0].splice(0, lower)
      }

      resultLines.push(resultLine)
    }

    truncate(didTruncate)

    return resultLines
  }, [ellipsis, lines, measureWidth, truncate, targetWidth, trimWhitespace])

  const renderLine = (
    line: string | JSX.Element,
    i: number,
    arr: (string | JSX.Element)[],
  ) => {
    if (i === arr.length - 1) {
      return <span key={i}>{line}</span>
    } else {
      const br = <br key={`${i}br`} />

      if (line) {
        return [<span key={i}>{line}</span>, br]
      } else {
        return br
      }
    }
  }

  useEffect(() => {
    const mounted = !!(targetRef.current && targetWidth)

    if (typeof window !== 'undefined' && mounted) {
      if (lines > 0) {
        setRenderTextRef(getLines().map(renderLine))
      } else {
        setRenderTextRef(children)

        truncate(false)
      }
    }
  }, [children, lines, targetWidth, getLines, truncate])

  return (
    <span {...spanProps} ref={targetRef}>
      <span>{renderTextRef}</span>
      <span ref={textRef}>{children}</span>
      <span
        ref={ellipsisRef}
        style={{ position: 'fixed', visibility: 'hidden', top: 0, left: 0 }}
      >
        {ellipsis}
      </span>
    </span>
  )
}
