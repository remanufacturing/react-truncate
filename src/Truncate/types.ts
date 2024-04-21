import type React from 'react'

type DetailedHTMLProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>

export interface TruncateProps extends DetailedHTMLProps {
  /**
   * The raw text content to be truncated, rich text supported
   */
  children: React.ReactNode

  /**
   * Symbols for ellipsis parts
   *
   * @default '...'
   */
  ellipsis?: React.ReactNode

  /**
   * Specifies how many lines of text should be preserved
   * until it gets truncated.
   *
   * 1. If not an safe integer, it will default to `0`
   * 2. If less than `0` , it will default to `0`
   * 3. If the value is `0` , it means not truncated
   *
   * @description Option conflict considerations:
   *  When the `middle` option is enabled, this option will always be `1`
   *
   * @since v0.4.0 add safe and positive integer check
   *
   * @default 1
   */
  lines?: number

  /**
   * If `true` , whitespace will be removed from before the ellipsis
   * e.g. `words ...` will become `words...` instead
   *
   * @default false
   */
  trimWhitespace?: boolean

  /**
   * Specify the width of the outer element,
   *
   * If specified, the calculation of the content
   * will be based on this number.
   *
   * If not specified, it will be obtained based on
   * the component's `parentElement.getBoundingClientRect().width`
   */
  width?: number

  /**
   * The separator for word segmentation
   *
   * By default, text is assumed to use whitespace
   * as a word segmentation convention (e.g. English),
   *
   * However, it may not be suitable for all languages.
   * Different languages can specify other symbols
   * according to usage habits.
   *
   * For example, when it comes to Chinese content,
   * you can pass in an empty string to get better calculation results.
   *
   * @since v0.2.0
   *
   * @default ' '
   */
  separator?: string

  /**
   * Whether to truncate in the middle
   *
   * @description Option conflict considerations:
   *  When this option is enabled, the `lines` option will always be `1`
   *
   * @since v0.3.0
   *
   * @default false
   */
  middle?: boolean

  /**
   * Number of characters to keep from the end of the text
   *
   * Always rounded down via `Math.floor`,
   * and always treated as a position relative to the end,
   * regardless of positive or negative
   *
   * @description Option take effect considerations:
   *  This option will only take effect, when the `middle` option is enabled
   *
   * @since v0.3.0
   *
   * @default 5
   */
  end?: number

  /**
   * Callback function when truncation behavior is triggered
   *
   * @param didTruncate - Whether truncation occurs
   */
  onTruncate?: (didTruncate: boolean) => void
}
