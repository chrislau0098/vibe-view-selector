import React from 'react'
import type { ElementRect } from '../types'

interface DefaultHighlightProps {
  rect: ElementRect
  className?: string
}

/**
 * Default element highlight box.
 * Renders a fixed-position overlay that traces the element's bounding rect.
 * Styled to be visually unobtrusive but clearly visible.
 *
 * @internal
 */
export const DefaultHighlight: React.FC<DefaultHighlightProps> = ({ rect, className }) => {
  return (
    <div
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }}
      className={className ? `picker-highlight ${className}` : 'picker-highlight'}
      aria-hidden
    />
  )
}
