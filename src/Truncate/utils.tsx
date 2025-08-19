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
  let endFragment = fullText.slice(endSliceIndex)

  const getFragmentsTotalWidth = (startFrag: string, endFrag: string) => {
    return Math.floor(
      measureWidth(startFrag) + measureWidth(endFrag) + ellipsisWidth,
    )
  }

  let fullWidth = getFragmentsTotalWidth(startFragment, endFragment)

  // Enhanced expansion strategy - try to expand before truncating
  // If current width is less than target width, attempt to expand fragments
  if (fullWidth < targetWidth) {
    // Try to expand startFragment to utilize available space
    // Only expand if startSliceIndex > 0 (i.e., when end is not greater than text length)
    while (
      startSliceIndex > 0 &&
      startSliceIndex + startFragment.length < length &&
      fullWidth < targetWidth
    ) {
      const nextChar = lastLineText[startSliceIndex + startFragment.length]
      const testStartFragment = startFragment + nextChar
      const testWidth = getFragmentsTotalWidth(testStartFragment, endFragment)

      if (testWidth <= targetWidth) {
        startFragment = testStartFragment
        fullWidth = testWidth
      } else {
        break
      }
    }

    // If there's still space available, try to expand endFragment
    while (endFragment.length < fullText.length && fullWidth < targetWidth) {
      const nextChar = fullText[fullText.length - endFragment.length - 1]
      const testEndFragment = nextChar + endFragment
      const testWidth = getFragmentsTotalWidth(startFragment, testEndFragment)

      if (testWidth <= targetWidth) {
        endFragment = testEndFragment
        fullWidth = testWidth
      } else {
        break
      }
    }
  }

  // Now using a smarter balancing strategy
  // Core algorithm: balance truncation based on actual text width ratios
  while (
    fullWidth > targetWidth &&
    (startFragment.length > 0 || endFragment.length > 0)
  ) {
    const startWidth = measureWidth(startFragment)
    const endWidth = measureWidth(endFragment)
    const totalTextWidth = startWidth + endWidth

    // Calculate the proportion each fragment should retain
    // This ensures visual balance rather than character count balance
    const startRatio = startWidth / totalTextWidth
    const endRatio = endWidth / totalTextWidth

    // Decide which fragment to truncate based on proportional analysis
    if (startFragment.length > 0 && endFragment.length > 0) {
      // When both fragments exist, truncate based on width ratio
      if (startRatio >= endRatio) {
        startFragment = startFragment.slice(0, startFragment.length - 1)
      } else {
        endFragment = endFragment.slice(1)
      }
    } else if (startFragment.length > 0) {
      startFragment = startFragment.slice(0, startFragment.length - 1)
    } else if (endFragment.length > 0) {
      endFragment = endFragment.slice(1)
    } else {
      break
    }

    fullWidth = getFragmentsTotalWidth(startFragment, endFragment)
  }

  // Final fine-tuning - maximize space utilization while maintaining balance
  // This step ensures to use every available pixel efficiently
  if (fullWidth < targetWidth) {
    const remainingWidth = targetWidth - fullWidth

    // Try to add characters to both ends while maintaining visual balance
    // Only add to startFragment if startSliceIndex > 0
    const startChar =
      startSliceIndex > 0 ? lastLineText[startFragment.length] : null
    const endChar = fullText[fullText.length - endFragment.length - 1]

    if (startChar && measureWidth(startChar) <= remainingWidth) {
      startFragment += startChar
    } else if (endChar && measureWidth(endChar) <= remainingWidth) {
      endFragment = endChar + endFragment
    }
  }

  return {
    startFragment,
    endFragment,
  }
}
