import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getMarkupTruncation } from './engines/markup'
import { getPlainTextTruncation } from './engines/plain-text'
import { renderLine } from './shared/utils'
import { type TruncateProps } from './types'

export const Truncate: React.FC<TruncateProps> = ({
  children,
  ellipsis = '…',
  lines: initialLines = 1,
  trimWhitespace = false,
  width = 0,
  separator = ' ',
  middle: middleTruncate = false,
  end: initialEnd = 5,
  preserveMarkup = false,
  onTruncate,
  ...spanProps
}) => {
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>()
  const [renderTextRef, setRenderTextRef] = useState<
    (string | React.JSX.Element)[] | React.ReactNode
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
    if (!targetRef.current?.parentElement) {
      return
    }

    const newTargetWidth =
      width ||
      Math.floor(targetRef.current.parentElement.getBoundingClientRect().width)

    if (!newTargetWidth) {
      return window.requestAnimationFrame(() => calcTWidth())
    }

    const style = window.getComputedStyle(targetRef.current)

    const font = [
      style.fontWeight,
      style.fontStyle,
      style.fontSize,
      style.fontFamily,
    ].join(' ')

    if (canvasContext) {
      canvasContext.font = font
      canvasContext.letterSpacing = style.letterSpacing
    }

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
    (textVal: string) => canvasContext?.measureText(textVal).width || 0,
    [canvasContext],
  )

  const defaultLines = useMemo(() => {
    if (!Number.isSafeInteger(initialLines) || initialLines < 0) return 0
    return initialLines
  }, [initialLines])

  const lines = useMemo(
    () => (middleTruncate ? 1 : defaultLines),
    [defaultLines, middleTruncate],
  )

  const end = useMemo(() => {
    const absVal = Math.abs(initialEnd)
    const val = Number.isFinite(absVal) ? Math.floor(absVal) : 0
    return val > 0 ? -val : val
  }, [initialEnd])

  useEffect(() => {
    const mounted = !!(targetRef.current && targetWidth)

    if (typeof window === 'undefined' || !mounted) {
      return
    }

    if (lines <= 0) {
      setRenderTextRef(children)
      truncate(false)
      return
    }

    const plainTextResult = getPlainTextTruncation({
      ellipsis,
      ellipsisRef: ellipsisRef.current,
      end,
      lines,
      measureWidth,
      middleTruncate,
      separator,
      targetWidth,
      textRef: textRef.current,
      trimWhitespace,
    })

    if (preserveMarkup && !middleTruncate) {
      const markupResult = getMarkupTruncation({
        fallbackDidTruncate: plainTextResult.didTruncate,
        fallbackVisibleTextLines: plainTextResult.visibleTextLines,
        ellipsis,
        ellipsisNode: ellipsisRef.current,
        lines,
        node: textRef.current,
        rootNode: targetRef.current,
        separator,
        trimWhitespace,
      })

      setRenderTextRef(
        markupResult.didTruncate ? markupResult.result : children,
      )
      truncate(markupResult.didTruncate)
      return
    }

    setRenderTextRef(plainTextResult.resultLines.map(renderLine))
    truncate(plainTextResult.didTruncate)
  }, [
    children,
    ellipsis,
    end,
    lines,
    measureWidth,
    middleTruncate,
    preserveMarkup,
    separator,
    targetWidth,
    trimWhitespace,
    truncate,
  ])

  return (
    <span {...spanProps} ref={targetRef} data-testid="truncate-root">
      <span>{renderTextRef}</span>
      <span ref={textRef}>{children}</span>
      <span
        ref={ellipsisRef}
        style={{ position: 'fixed', visibility: 'hidden', top: 0, left: 0 }}
        data-testid="truncate-ellipsis"
      >
        {ellipsis}
      </span>
    </span>
  )
}
