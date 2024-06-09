import React, { useMemo } from 'react'
import clsx from 'clsx'
import { getTranslation, type Languages, type TranslationKey } from '@/i18n'
import {
  RichText,
  ChineseRichText,
  ChineseStringText,
  StringText,
  ShorterStringText,
  ShorterChineseStringText,
} from './Data'

export const DEFAULT_WIDTH_VALUE = 100
export const DEFAULT_LINES_VALUE = 3
export const DEFAULT_HTML_VALUE = true
export const DEFAULT_CUSTOM_VALUE = false
export const DEFAULT_END_VALUE = 5

const ExampleContainer = React.forwardRef<
  HTMLDivElement,
  {
    style?: React.CSSProperties
    children: React.ReactNode
  }
>(({ style, children, ...rests }, ref) => {
  return (
    <div
      ref={ref}
      className="w-full box-border p-3 bg-[var(--sl-color-gray-6)] my-6"
      style={{
        border:
          '1px solid color-mix(in srgb, var(--sl-color-gray-5), transparent 25%)',
        ...style,
      }}
      {...rests}
    >
      {children}
    </div>
  )
})

ExampleContainer.displayName = 'ExampleContainer'

interface ExampleFormLabelProps {
  lang: Languages
  labelKey: TranslationKey
}

const ExampleFormLabel: React.FC<ExampleFormLabelProps> = ({
  lang,
  labelKey,
}) => {
  const titleCls = clsx('flex flex-shrink-0', lang === 'zh' ? 'w-24' : 'w-34')
  return <span className={titleCls}>{getTranslation(lang, labelKey)}</span>
}

const ExampleFormItem: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return <div className="flex items-center gap-3 my-6">{children}</div>
}

const inputCls = 'w-100 max-w-3/4 cursor-pointer'

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

type SharedItemProps = Omit<
  InputProps,
  'type' | 'className' | 'onChange' | 'lang'
> &
  ExampleFormLabelProps

interface FormRangeProps extends SharedItemProps {
  onChange: (v: number) => void
  percentable?: boolean
}

const FormRange: React.FC<FormRangeProps> = ({
  lang,
  labelKey,
  value,
  onChange,
  percentable = true,
  ...rests
}) => {
  const label = useMemo(() => {
    const suffix = percentable ? '%' : ''
    return `${value}${suffix}`
  }, [percentable, value])

  return (
    <ExampleFormItem>
      <ExampleFormLabel lang={lang} labelKey={labelKey} />

      <input
        className={inputCls}
        type="range"
        onChange={(e) => onChange(+e.target.value)}
        {...rests}
      />

      <span>{label}</span>
    </ExampleFormItem>
  )
}

interface FormSwitchProps extends Omit<SharedItemProps, 'value'> {
  checked: boolean
  onChange: (v: boolean) => void
}

const FormSwitch: React.FC<FormSwitchProps> = ({
  lang,
  labelKey,
  checked,
  onChange,
  ...rests
}) => {
  return (
    <ExampleFormItem>
      <ExampleFormLabel lang={lang} labelKey={labelKey} />

      <label className="switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          {...rests}
        />
        <span className="slider round"></span>
      </label>
    </ExampleFormItem>
  )
}

const CurrentContent: React.FC<{
  isZh: boolean
  html?: boolean
  shorter?: boolean
}> = ({ isZh, html = false, shorter = false }) => {
  if (isZh) {
    if (shorter) return <ShorterChineseStringText />
    return html ? <ChineseRichText /> : <ChineseStringText />
  }

  if (shorter) return <ShorterStringText />
  return html ? <RichText /> : <StringText />
}

// Abbreviation of `ExampleWidgets`
export class EW {
  // Layout
  static Container = ExampleContainer

  // Content
  static Content = CurrentContent

  // Form
  static Range = FormRange
  static Switch = FormSwitch
}
