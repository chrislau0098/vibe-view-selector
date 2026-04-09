import { motion } from 'framer-motion'
import type { PickerHighlightProps } from '../types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Core blue used by the official reference picker UI. */
const BLUE = '#1456F0'

/** Hover state styles for the official reference highlight. */
const HOVER_STYLE = {
  border: `1px solid ${BLUE}`,
  background: 'rgba(20, 86, 240, 0.08)',
  boxShadow: 'none',
  borderRadius: 4,
} as const

/** Selected state styles for the official reference highlight. */
const SELECTED_STYLE = {
  border: `1px solid ${BLUE}`,
  background: 'rgba(20, 86, 240, 0.08)',
  boxShadow: 'none',
  borderRadius: 4,
} as const

// ---------------------------------------------------------------------------
// PickerHighlight
// ---------------------------------------------------------------------------

/**
 * `PickerHighlight` is the official reference highlight box for host reuse.
 * It traces the target element rect with the same visual language used in the
 * demo: blue outline, light blue fill, and smooth Motion-based transitions.
 *
 * This component is intended to be inspected, reused, or copied into a host
 * integration that wants the same picker highlight treatment.
 *
 * @param props.rect       Bounding rect of the element being highlighted
 * @param props.isSelected Whether the highlight represents a locked selection
 * @returns React node rendering the official picker highlight UI
 *
 * @example
 * ```tsx
 * <PickerHighlight rect={info.rect} isSelected={true} />
 * ```
 */
export function PickerHighlight({
  rect,
  isSelected = false,
}: PickerHighlightProps) {
  const styles = isSelected ? SELECTED_STYLE : HOVER_STYLE

  return (
    <motion.div
      aria-hidden
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
        top: { type: 'spring', visualDuration: 0.18, bounce: 0 },
        left: { type: 'spring', visualDuration: 0.18, bounce: 0 },
        width: { type: 'spring', visualDuration: 0.22, bounce: 0 },
        height: { type: 'spring', visualDuration: 0.22, bounce: 0 },
        opacity: { type: 'tween', duration: 0.1, ease: 'linear' },
      }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 2147483646,
        boxSizing: 'border-box',
        ...styles,
        transition: 'border 140ms ease-out, background 220ms ease-out',
      }}
    />
  )
}
