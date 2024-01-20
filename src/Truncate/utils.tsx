import React from 'react'

export const getEllipsisWidth = (node?: HTMLSpanElement | null) => {
  return node?.offsetWidth
}

export const trimRight = (textVal: string) => {
  return textVal.replace(/\s+$/, '')
}

export const renderLine = (
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
