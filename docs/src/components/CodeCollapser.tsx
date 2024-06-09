import React, { useMemo, useState } from 'react'
import { getTranslation, type Languages } from '@/i18n'

export const CodeCollapser: React.FC<{
  open?: boolean
  lang: Languages
  children: React.ReactNode
}> = ({ lang, open: defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen)

  const onToggle = (e: React.SyntheticEvent<HTMLDetailsElement, Event>) => {
    const target = e.target as HTMLDetailsElement
    setOpen(target.open)
  }

  const summary = useMemo(() => {
    const action = getTranslation(
      lang,
      open ? 'collapser.collapse' : 'collapser.expand',
    )
    const separator = getTranslation(lang, 'separator')
    const name = getTranslation(lang, 'collapser.name')
    return `${action}${separator}${name}`
  }, [lang, open])

  return (
    <details className="w-full my-6" open={open} onToggle={onToggle}>
      <summary>{summary}</summary>

      {children}
    </details>
  )
}
