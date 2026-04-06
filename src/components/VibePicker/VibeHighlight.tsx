import { motion } from 'framer-motion'
import type { ElementRect } from 'react-vite-dev-element-pick'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VibeHighlightProps {
  /** Bounding rect of the target element (snapshot at inspection time) */
  rect: ElementRect
  /**
   * When `true`, renders the "selected" visual state (post-click glow).
   * When `false` (default), renders the hover state (plain outline).
   */
  isSelected?: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Core brand blue used for the picker UI */
const BLUE = '#1456F0'

/** Hover state styles */
const HOVER_STYLE = {
  border: `2px solid ${BLUE}`,
  background: 'rgba(20, 86, 240, 0.08)',
  boxShadow: 'none',
  borderRadius: 2,
} as const

/** Selected state styles — same border, lighter fill, outer glow */
const SELECTED_STYLE = {
  border: `2px solid ${BLUE}`,
  background: 'rgba(20, 86, 240, 0.06)',
  boxShadow: '0 0 0 4px rgba(20, 86, 240, 0.14)',
  borderRadius: 3,
} as const

// ---------------------------------------------------------------------------
// VibeHighlight
// ---------------------------------------------------------------------------

/**
 * Animated highlight box that traces the bounding rect of the picked element.
 *
 * Uses Framer Motion spring animation to smoothly interpolate `top`, `left`,
 * `width`, and `height` whenever the target element changes. The spring
 * parameters are tuned for a snappy but natural feel.
 *
 * **Portal:** This component does NOT create its own portal. The parent
 * (`VibePicker`) is responsible for rendering it into `document.body` via
 * `createPortal` so it sits above all page content.
 *
 * @param props.rect       - Bounding rect of the element to highlight
 * @param props.isSelected - Whether to show the selected (post-click) visual
 */
export function VibeHighlight({ rect, isSelected = false }: VibeHighlightProps) {
  const styles = isSelected ? SELECTED_STYLE : HOVER_STYLE

  return (
    <motion.div
      aria-hidden
      // Animate position + size with spring physics
      animate={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        opacity: 1,
      }}
      initial={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        opacity: 0,
      }}
      transition={{
        // Position + size: spring for smooth organic movement
        top: { type: 'spring', damping: 20, stiffness: 300, mass: 0.5 },
        left: { type: 'spring', damping: 20, stiffness: 300, mass: 0.5 },
        width: { type: 'spring', damping: 20, stiffness: 300, mass: 0.5 },
        height: { type: 'spring', damping: 20, stiffness: 300, mass: 0.5 },
        // Fade-in: quick tween on first mount
        opacity: { duration: 0.12, ease: 'easeOut' },
      }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 2147483646,
        boxSizing: 'border-box',
        // Apply the correct visual state styles
        ...styles,
        // Smooth style transitions (border, background, boxShadow)
        transition: 'border 120ms ease-out, background 120ms ease-out, box-shadow 150ms ease-out, border-radius 80ms ease-out',
      }}
    />
  )
}
