import { type TruncateProps } from '../Truncate'
import type React from 'react'

export interface ShowMoreProps
  extends Omit<
    TruncateProps,
    'width' | 'middle' | 'end' | 'ellipsis' | 'onToggle'
  > {
  /**
   * Expansion state when initialized
   *
   * @since V0.5.0
   * @default false
   */
  defaultExpanded?: boolean

  /**
   * Controlled property
   *
   * The expanded state is controlled by the parent component
   *
   * @since V0.5.0
   * @default undefined
   */
  expanded?: boolean

  /**
   * The label to display in the anchor element to show more
   *
   * If a valid React element is passed in, the built-in anchor element will not
   * be rendered, and the React element will be rendered directly. (checked by
   * `React.isValidElement` ).
   *
   * @since V0.4.0 supported React element
   */
  more?: React.ReactNode

  /**
   * The label to display in the anchor element to show less
   *
   * If a valid React element is passed in, the built-in anchor element will not
   * be rendered, and the React element will be rendered directly. (checked by
   * `React.isValidElement` ).
   *
   * @since V0.4.0 supported React element
   */
  less?: React.ReactNode

  /**
   * Class name(s) to add to the anchor elements, only valid for built-in anchor
   * element,
   */
  anchorClass?: string

  /**
   * This callback function will be triggered when the component toggles the
   * expanded/collapsed state.
   *
   * @since V0.4.0
   * @param expanded - Current expand status
   */
  onToggle?: (expanded: boolean) => void
}

/**
 * If use custom React elements, You can use the `toggleLines` method to toggle
 * between expand and collapse. This is the type of this method.
 *
 * @since V0.4.0
 */
export type ShowMoreToggleLinesFn = (
  e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
) => void

/**
 * If use custom React elements for the `more` / `less` props, you can bind the
 * Ref value to the `<ShowMore />` component and receive the `toggleLines`
 * method through ref.
 *
 * @since V0.4.0
 */
export type ShowMoreRef = {
  toggleLines: ShowMoreToggleLinesFn
}
