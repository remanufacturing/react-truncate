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
   * Symbols for omitted parts
   *
   * @default '...'
   */
  ellipsis?: React.ReactNode

  /**
   * Limit the number of lines that will be truncated
   * when content overflows
   *
   * @description Option conflict considerations:
   *  When the `middle` option is enabled,
   *  this option will always be `1`
   *
   * @default 1
   */
  lines?: number

  /**
   * Remove space characters from the end of a string
   */
  trimWhitespace?: boolean

  /**
   * Specify the width of the outer element
   */
  width?: number

  /**
   * The separator used for word segmentation.
   *
   * By default, the text is considered to use spaces as
   * the word segmentation habit (e.g. English).
   *
   * Different language habits can specify other symbols,
   * such as passing in an empty string (e.g. Chinese)
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
   *  When this option is enabled,
   *  the `lines` option will always be `1`
   *
   * @since v0.3.0
   *
   * @default false
   */
  middle?: boolean

  /**
   * The number of characters from the end of the text to preserve
   *
   * @description Option take effect considerations:
   *  This option will only take effect
   *  when the `middle` option is enabled
   *
   * @since v0.3.0
   *
   * @default 5
   */
  end?: number

  /**
   * The callback function when the truncate behavior is triggered
   *
   * @param didTruncate - Whether truncate occurred
   *
   */
  onTruncate?: (didTruncate: boolean) => void
}
