import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence } from 'framer-motion'
import { ElementPicker } from 'react-vite-dev-element-pick'
import type { ElementInfo, PickerStatus } from 'react-vite-dev-element-pick'
import { VibeHighlight } from './VibeHighlight'
import { VibeCursorLabel } from './VibeCursorLabel'
import { VibeInputPanel } from './VibeInputPanel'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VibePickerProps {
  /**
   * Master switch controlling whether element picking is enabled.
   * Controlled by the parent (Toolbar toggle).
   */
  status: PickerStatus
  /** The website content to wrap */
  children: React.ReactNode
}

// ---------------------------------------------------------------------------
// Inline element tags that should be bubbled up to a meaningful ancestor
// ---------------------------------------------------------------------------

const INLINE_TAGS = new Set([
  'SPAN', 'EM', 'STRONG', 'B', 'I', 'U', 'S',
  'BR', 'SUB', 'SUP', 'ABBR', 'CITE', 'CODE', 'KBD', 'MARK',
  'SMALL', 'TIME', 'VAR',
])

// ---------------------------------------------------------------------------
// VibePicker
// ---------------------------------------------------------------------------

/**
 * Main element-picker orchestrator for the Vibe Coding demo.
 *
 * Wraps the website content with the base `ElementPicker` library and renders
 * three layers of picking UI via a single `document.body` portal:
 *
 * 1. **`VibeHighlight`** — blue spring-animated bounding box. Visible in both
 *    hover and selected states. Uses a stable `key` so hover → selected does
 *    NOT trigger a remount (avoids spring restart).
 *
 * 2. **`VibeCursorLabel`** — blue chip tooltip that follows the mouse cursor.
 *    Visible only while hovering (hidden after click).
 *
 * 3. **`VibeInputPanel`** — floating edit panel that appears after a click.
 *    Positioned below (or above) the selected element's bounding rect.
 *
 * **State flow:**
 * ```
 * inactive                  → nothing rendered
 * active + hovering         → Highlight(hover) + CursorLabel
 * active + clicked          → Highlight(selected) + InputPanel
 * ```
 *
 * **resolveElement:** Bubbles inline text elements (span, em, strong, …) up to
 * the nearest block-level or semantic ancestor, improving selection granularity
 * without modifying the core library logic.
 *
 * @param props.status   - Controlled by parent Toolbar
 * @param props.children - Website content to make pickable
 */
export function VibePicker({ status, children }: VibePickerProps) {
  // ── State ──────────────────────────────────────────────────────────────────

  /** Currently hovered element (cleared on click or status=inactive) */
  const [hoveredInfo, setHoveredInfo] = useState<ElementInfo | null>(null)
  /** Last clicked element — drives the selected highlight + input panel */
  const [clickedInfo, setClickedInfo] = useState<ElementInfo | null>(null)
  /** Live cursor position for the label tooltip */
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  /** Controlled textarea value for the input panel */
  const [message, setMessage] = useState('')

  // ── resolveElement ─────────────────────────────────────────────────────────

  /**
   * Bubbles inline/presentational elements to the nearest meaningful ancestor.
   * Called by ElementPicker before building ElementInfo.
   *
   * @param el - The raw event target
   * @returns The resolved element (may be el itself)
   */
  const resolveElement = useCallback((el: HTMLElement): HTMLElement => {
    let current: HTMLElement | null = el
    while (current && INLINE_TAGS.has(current.tagName)) {
      current = current.parentElement
    }
    return current ?? el
  }, [])

  // ── Cursor tracking (independent of element-diff listener) ────────────────

  useEffect(() => {
    if (status === 'inactive') return

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [status])

  // ── Crosshair cursor while in pick (hover) mode ───────────────────────────

  useEffect(() => {
    // Show crosshair only in active hover mode (not when panel is open)
    const shouldShowCrosshair = status === 'active' && clickedInfo === null
    document.body.style.cursor = shouldShowCrosshair ? 'crosshair' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [status, clickedInfo])

  // ── ElementPicker callbacks ────────────────────────────────────────────────

  const handleHover = useCallback((info: ElementInfo) => {
    setHoveredInfo(info)
    setClickedInfo(null) // clear previous selection when hovering resumes
  }, [])

  const handleChange = useCallback((info: ElementInfo | null) => {
    if (info === null) setHoveredInfo(null)
  }, [])

  const handleClick = useCallback((info: ElementInfo) => {
    console.log('[vibe-picker] element clicked:', info.selector, info)
    setClickedInfo(info)
    setHoveredInfo(null)
    setMessage('') // reset textarea for the new selection
  }, [])

  // ── Input panel callbacks ──────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    if (!clickedInfo || !message.trim()) return
    console.log('[vibe-picker] send:', {
      selector: clickedInfo.selector,
      element: clickedInfo.attributes,
      message: message.trim(),
    })
    setClickedInfo(null)
    setHoveredInfo(null)
    setMessage('')
  }, [clickedInfo, message])

  const handleClose = useCallback(() => {
    setClickedInfo(null)
    setHoveredInfo(null)
    setMessage('')
  }, [])

  // ── Derived display state ──────────────────────────────────────────────────

  // The highlight tracks whichever element is active (hover takes priority)
  const activeInfo = hoveredInfo ?? clickedInfo

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/*
       * Base library — suppress default highlight/overlay completely.
       * VibePicker manages all visual layers via its own portal below.
       */}
      <ElementPicker
        status={status}
        onHover={handleHover}
        onChange={handleChange}
        onClick={handleClick}
        resolveElement={resolveElement}
        highlight={() => null}
        overlay={() => null}
        exclude={['[data-picker-ui]']}
      >
        {children}
      </ElementPicker>

      {/* ── Custom portal layers ── */}
      {status === 'active' &&
        createPortal(
          <>
            {/*
             * VibeHighlight — stable key so hover→selected state change
             * does NOT unmount/remount (avoids spring restart).
             * Only exits when both hoveredInfo AND clickedInfo are null.
             */}
            <AnimatePresence>
              {activeInfo && (
                <VibeHighlight
                  key="vibe-highlight"
                  rect={activeInfo.rect}
                  isSelected={clickedInfo !== null}
                />
              )}
            </AnimatePresence>

            {/* VibeCursorLabel — only visible while hovering */}
            <AnimatePresence>
              {hoveredInfo && !clickedInfo && (
                <VibeCursorLabel
                  key="vibe-cursor-label"
                  cursorPos={cursorPos}
                  info={hoveredInfo}
                />
              )}
            </AnimatePresence>

            {/* VibeInputPanel — only visible after a click */}
            <AnimatePresence>
              {clickedInfo && (
                <VibeInputPanel
                  key="vibe-input-panel"
                  info={clickedInfo}
                  message={message}
                  onMessageChange={setMessage}
                  onSend={handleSend}
                  onClose={handleClose}
                />
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </>
  )
}
