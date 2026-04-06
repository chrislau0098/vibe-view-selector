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
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        pointerEvents: 'none',
        zIndex: 2147483646,
        boxSizing: 'border-box',
        outline: '2px solid #5e6ad2',
        outlineOffset: 1,
        background: 'rgba(94, 106, 210, 0.08)',
        borderRadius: 2,
        transition: 'top 60ms ease-out, left 60ms ease-out, width 60ms ease-out, height 60ms ease-out',
      }}
      className={className}
      aria-hidden
    />
  )
}
