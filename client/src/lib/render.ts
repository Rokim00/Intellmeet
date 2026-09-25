import type * as React from "react"

/**
 * Props every `render` element is expected to support. Components in `components/ui`
 * clone the element passed through `render` and merge class names, children and
 * event handlers onto it, so the contract has to be explicit instead of `any`.
 */
export type RenderableElementProps = {
  className?: string
  children?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLElement>
  onMouseEnter?: React.MouseEventHandler<HTMLElement>
  onMouseLeave?: React.MouseEventHandler<HTMLElement>
  onFocus?: React.FocusEventHandler<HTMLElement>
  onBlur?: React.FocusEventHandler<HTMLElement>
  [dataAttribute: `data-${string}`]: unknown
  [ariaAttribute: `aria-${string}`]: unknown
}

export type RenderableElement = React.ReactElement<RenderableElementProps>
