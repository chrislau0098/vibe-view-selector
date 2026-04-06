import { motion } from 'framer-motion'
import type { ElementInfo } from 'react-vite-dev-element-pick'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VibeCursorLabelProps {
  /** Current mouse cursor coordinates in viewport space */
  cursorPos: { x: number; y: number }
  /** Info about the currently hovered element */
  info: ElementInfo
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the display string for the cursor label.
 *
 * Format: `tag.firstClass "text content up to 40 chars..."`
 *
 * @param info - Element info snapshot
 * @returns Formatted label string
 *
 * @example
 * // → 'h1.hero-title "The AI shopping agent that boosts..."'
 * // → 'div.feature-card'
 * // → 'button'
 */
function formatLabel(info: ElementInfo): string {
  const tag = info.attributes.tagName ?? info.element.tagName.toLowerCase()

  // Take the first meaningful class name (skip empty strings)
  const firstClass = (info.attributes.class ?? '')
    .split(/\s+/)
    .find((c) => c.length > 0)

  const classPart = firstClass ? `.${firstClass}` : ''

  // Get trimmed text content (only if the element contains visible text)
  const rawText = info.element.textContent?.trim().replace(/\s+/g, ' ') ?? ''
  const textPart = rawText
    ? ` "${rawText.length > 40 ? rawText.slice(0, 40) + '...' : rawText}"`
    : ''

  return `${tag}${classPart}${textPart}`
}

/**
 * Computes the fixed position for the label so it:
 *  - Sits 16px to the right and below the cursor by default
 *  - Flips left when too close to the right viewport edge
 *  - Flips up when too close to the bottom viewport edge
 *
 * @param cursorX   - Cursor clientX
 * @param cursorY   - Cursor clientY
 * @param labelW    - Estimated label width
 * @param labelH    - Estimated label height
 * @returns CSS `top` and `left` values in pixels
 */
function computePosition(
  cursorX: number,
  cursorY: number,
  labelW: number,
  labelH: number
): { top: number; left: number } {
  const OFFSET = 16
  const MARGIN = 8

  let left = cursorX + OFFSET
  let top = cursorY + OFFSET

  if (left + labelW > window.innerWidth - MARGIN) {
    left = cursorX - labelW - OFFSET
  }
  if (top + labelH > window.innerHeight - MARGIN) {
    top = cursorY - labelH - OFFSET
  }

  return { top: Math.max(MARGIN, top), left: Math.max(MARGIN, left) }
}

// ---------------------------------------------------------------------------
// VibeCursorLabel
// ---------------------------------------------------------------------------

// Estimated dimensions used for edge-flip calculations.
// The actual rendered size may vary, but these are close enough for the
// viewport-boundary logic to feel correct in practice.
const LABEL_W = 240
const LABEL_H = 26

/**
 * A tooltip that freely follows the mouse cursor and shows the HTML tag,
 * primary class, and text content of the currently hovered element.
 *
 * **Visual:** Solid `#1456F0` pill with white monospace text — matches the
 * reference design where the label chip is the same blue as the selection border.
 *
 * **Position:** Rendered at cursor + 16px offset; flips horizontally /
 * vertically when approaching viewport edges. Position is set directly on
 * `style` (no animation) to eliminate tracking lag. Only mount/unmount is
 * animated.
 *
 * **Portal:** Parent (`VibePicker`) renders this into `document.body`.
 *
 * @param props.cursorPos - Live cursor coordinates
 * @param props.info      - Hovered element info
 */
export function VibeCursorLabel({ cursorPos, info }: VibeCursorLabelProps) {
  const { top, left } = computePosition(cursorPos.x, cursorPos.y, LABEL_W, LABEL_H)
  const label = formatLabel(info)

  return (
    <motion.div
      aria-hidden
      // Mount / unmount animation only — position follows cursor directly via style
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.08, ease: 'easeOut' }}
      style={{
        // Position: direct style, no motion interpolation (zero lag on cursor)
        position: 'fixed',
        top,
        left,
        zIndex: 2147483647,
        pointerEvents: 'none',
        // Sizing
        maxWidth: LABEL_W,
        height: LABEL_H,
        // Visual
        background: '#1456F0',
        borderRadius: 4,
        padding: '0 8px',
        // Text
        display: 'flex',
        alignItems: 'center',
        fontFamily: '"Geist Mono", "SF Mono", "Fira Mono", monospace',
        fontSize: 12,
        fontWeight: 500,
        color: '#ffffff',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        // Depth
        boxShadow: '0 2px 8px rgba(20, 86, 240, 0.40)',
        // Transform origin for scale animation
        transformOrigin: 'top left',
      }}
    >
      {label}
    </motion.div>
  )
}
