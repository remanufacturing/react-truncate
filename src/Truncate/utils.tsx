import React from 'react'

export const getEllipsisWidth = (node?: HTMLSpanElement | null) => {
  return node?.offsetWidth
}

export const trimRight = (textVal: string) => {
  return textVal.replace(/\s+$/, '')
}

export const renderLine = (
  line: string | React.JSX.Element,
  i: number,
  arr: (string | React.JSX.Element)[],
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

// Shim innerText to consistently break lines at <br/> but not at \n
export const innerText = (node: HTMLSpanElement | null, separator: string) => {
  const div = document.createElement('div')
  const contentKey =
    'innerText' in window.HTMLElement.prototype ? 'innerText' : 'textContent'

  div.innerHTML = node?.innerHTML.replace(/\r\n|\r|\n/g, separator) || ''

  let newText = div[contentKey]

  const test = document.createElement('div')
  test.innerHTML = 'foo<br/>bar'

  if (test[contentKey]?.replace(/\r\n|\r/g, '\n') !== 'foo\nbar') {
    div.innerHTML = div.innerHTML.replace(/<br.*?[/]?>/gi, '\n')
    newText = div[contentKey]
  }

  return newText || ''
}

interface GetResultOptions {
  end: number
  lastLineText: string
  fullText: string
  targetWidth: number
  ellipsisWidth: number
  measureWidth: (textVal: string) => number
}

export const getMiddleTruncateFragments = ({
  end,
  lastLineText,
  fullText,
  targetWidth,
  ellipsisWidth,
  measureWidth,
}: GetResultOptions) => {
  const length = lastLineText.length
  const absEnd = Math.abs(end)
  const startSliceIndex = absEnd > length ? 0 : length - absEnd
  let startFragment = lastLineText.slice(0, startSliceIndex)

  const endSliceIndex = startSliceIndex === 0 ? -length : end
  const endFragment = fullText.slice(endSliceIndex)

  let fullWidth =
    measureWidth(startFragment) + measureWidth(endFragment) + ellipsisWidth

  while (fullWidth > targetWidth) {
    startFragment = startFragment.slice(0, startFragment.length - 1)
    fullWidth =
      measureWidth(startFragment) + measureWidth(endFragment) + ellipsisWidth
  }

  return {
    startFragment,
    endFragment,
  }
}
