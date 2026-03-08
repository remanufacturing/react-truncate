import React from 'react'
import {
  getEllipsisWidth,
  getMiddleTruncateFragments,
  innerText,
  trimRight,
} from '../shared/utils'

export interface PlainTextTruncationOptions {
  ellipsis: React.ReactNode
  ellipsisRef: HTMLSpanElement | null
  end: number
  lines: number
  measureWidth: (textVal: string) => number
  middleTruncate: boolean
  separator: string
  targetWidth: number
  textRef: HTMLSpanElement | null
  trimWhitespace: boolean
}

export interface PlainTextTruncationResult {
  didTruncate: boolean
  resultLines: Array<string | React.JSX.Element>
  visibleText: string
  visibleTextLines: string[]
}

export const getPlainTextTruncation = ({
  ellipsis,
  ellipsisRef,
  end,
  lines,
  measureWidth,
  middleTruncate,
  separator,
  targetWidth,
  textRef,
  trimWhitespace,
}: PlainTextTruncationOptions): PlainTextTruncationResult => {
  const resultLines: Array<string | React.JSX.Element> = []
  const visibleTextLines: string[] = []
  const fullText = innerText(textRef, separator)
  const textLines = fullText.split('\n').map((line) => line.split(separator))
  const ellipsisWidth = getEllipsisWidth(ellipsisRef) || 0

  let didTruncate = true

  for (let line = 1; line <= lines; line++) {
    const textWords = textLines[0]

    if (textWords.length === 0) {
      resultLines.push()
      visibleTextLines.push('')
      textLines.shift()
      line--
      continue
    }

    let resultLine: string | React.JSX.Element = textWords.join(separator) || ''
    let visibleLine = typeof resultLine === 'string' ? resultLine : ''

    if (measureWidth(visibleLine) <= targetWidth) {
      if (textLines.length === 1) {
        didTruncate = false
        resultLines.push(resultLine)
        visibleTextLines.push(visibleLine)
        break
      }
    }

    if (line === lines) {
      const textRest = textWords.join(separator)

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

        while (!lastLineText.length && resultLines.length) {
          const prevLine = resultLines.pop()
          visibleTextLines.pop()

          if (prevLine && typeof prevLine === 'string') {
            lastLineText = trimRight(prevLine)
          }
        }
      }

      if (middleTruncate && end !== 0) {
        const { startFragment, endFragment } = getMiddleTruncateFragments({
          end,
          lastLineText,
          fullText,
          targetWidth,
          ellipsisWidth,
          measureWidth,
        })

        visibleLine = `${startFragment}${endFragment}`
        resultLine = (
          <span>
            {startFragment}
            {ellipsis}
            {endFragment}
          </span>
        )
      } else {
        visibleLine = lastLineText
        resultLine = (
          <span>
            {lastLineText}
            {ellipsis}
          </span>
        )
      }
    } else {
      let lower = 0
      let upper = textWords.length - 1

      while (lower <= upper) {
        const middle = Math.floor((lower + upper) / 2)
        const testLine = textWords.slice(0, middle + 1).join(separator)

        if (measureWidth(testLine) <= targetWidth) {
          lower = middle + 1
        } else {
          upper = middle - 1
        }
      }

      if (lower === 0) {
        line = lines - 1
        continue
      }

      visibleLine = textWords.slice(0, lower).join(separator)
      resultLine = visibleLine
      textLines[0].splice(0, lower)
    }

    resultLines.push(resultLine)
    visibleTextLines.push(visibleLine)
  }

  return {
    didTruncate,
    resultLines,
    visibleText: visibleTextLines.join('\n'),
    visibleTextLines,
  }
}
