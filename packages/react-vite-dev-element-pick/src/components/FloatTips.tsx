import { motion } from 'framer-motion'
import type { ElementInfo, FloatTipsProps } from '../types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LabelParts {
  tagLabel: string
  textLabel: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Max width used by the official reference float-tips component. */
const LABEL_W = 320

/** Estimated single-line label height used for viewport edge flipping. */
const LABEL_H = 34

/** Cursor offset so the label does not occlude the pointer hotspot. */
const CURSOR_OFFSET = 16

/** Viewport margin used when clamping or flipping the label. */
const VIEWPORT_MARGIN = 8

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the display payload shown in the official reference float-tips UI.
 *
 * @param info Hovered element info snapshot
 * @returns Formatted tag/class label and optional text preview
 *
 * @example
 * ```ts
 * const parts = formatLabel(info)
 * // { tagLabel: 'h1.hero-title', textLabel: 'Hello world' }
 * ```
 */
function formatLabel(info: ElementInfo): LabelParts {
  const tag = info.attributes.tagName ?? info.element.tagName.toLowerCase()
  const firstClass = (info.attributes.class ?? '')
    .split(/\s+/)
    .find((c) => c.length > 0)
  const classPart = firstClass ? `.${firstClass}` : ''
  const rawText = info.element.textContent?.trim().replace(/\s+/g, ' ') ?? ''

  return {
    tagLabel: `${tag}${classPart}`,
    textLabel: rawText,
  }
}

/**
 * Computes the fixed position for the float-tips label so it follows the
 * cursor while staying inside the viewport.
 *
 * @param cursorX Pointer X position in viewport space
 * @param cursorY Pointer Y position in viewport space
 * @param labelW  Estimated label width
 * @param labelH  Estimated label height
 * @returns Top/left coordinates for the floating label
 *
 * @example
 * ```ts
 * const pos = computePosition(100, 200, 320, 34)
 * ```
 */
function computePosition(
  cursorX: number,
  cursorY: number,
  labelW: number,
  labelH: number
): { top: number; left: number } {
  let left = cursorX + CURSOR_OFFSET
  let top = cursorY + CURSOR_OFFSET

  if (left + labelW > window.innerWidth - VIEWPORT_MARGIN) {
    left = cursorX - labelW - CURSOR_OFFSET
  }
  if (top + labelH > window.innerHeight - VIEWPORT_MARGIN) {
    top = cursorY - labelH - CURSOR_OFFSET
  }

  return {
    top: Math.max(VIEWPORT_MARGIN, top),
    left: Math.max(VIEWPORT_MARGIN, left),
  }
}

// ---------------------------------------------------------------------------
// FloatTips
// ---------------------------------------------------------------------------

/**
 * `FloatTips` is the official reference hover label for host reuse.
 * It renders the same white floating card used in the demo, including tag
 * formatting, quoted text preview, ellipsis behavior, and viewport-aware
 * cursor-follow positioning.
 *
 * This component is intended to be inspected, reused, or copied into a host
 * integration that wants the same picker hover label treatment.
 *
 * @param props.cursorPos Live pointer coordinates
 * @param props.info      Hovered element info snapshot
 * @returns React node rendering the official float-tips UI
 *
 * @example
 * ```tsx
 * <FloatTips cursorPos={{ x: 200, y: 120 }} info={info} />
 * ```
 */
export function FloatTips({ cursorPos, info }: FloatTipsProps) {
  const { top, left } = computePosition(cursorPos.x, cursorPos.y, LABEL_W, LABEL_H)
  const { tagLabel, textLabel } = formatLabel(info)

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.08, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top,
        left,
        zIndex: 2147483647,
        pointerEvents: 'none',
        maxWidth: LABEL_W,
        minHeight: LABEL_H,
        background: 'rgba(255,255,255,0.96)',
        borderRadius: 10,
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        fontFamily: '"Geist Variable", -apple-system, system-ui, sans-serif',
        fontSize: 14,
        fontWeight: 500,
        color: '#1f2329',
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px -4px rgba(31, 35, 41, 0.02), 0 4px 8px rgba(31, 35, 41, 0.02), 0 4px 16px 4px rgba(31, 35, 41, 0.03)',
        transformOrigin: 'top left',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          minWidth: 0,
          lineHeight: '22px',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            flexShrink: 0,
            color: '#1f2329',
            fontWeight: 500,
          }}
        >
          {tagLabel}
        </span>

        {textLabel ? (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              minWidth: 0,
              color: '#646a73',
              fontWeight: 400,
            }}
          >
            <span style={{ flexShrink: 0 }}>"</span>
            <span
              style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {textLabel}
            </span>
            <span style={{ flexShrink: 0 }}>"</span>
          </span>
        ) : null}
      </div>
    </motion.div>
  )
}
