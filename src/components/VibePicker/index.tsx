import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence } from 'framer-motion'
import { ElementPicker, FloatTips, PickerHighlight } from 'react-vite-dev-element-pick'
import type { ElementInfo, PickerStatus } from 'react-vite-dev-element-pick'
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

/**
 * Generic layout containers that are valid hover targets, but may need a
 * delayed takeover when the cursor briefly passes through a child-to-child gap.
 */
const GENERIC_CONTAINER_TAGS = new Set([
  'div',
  'section',
  'main',
  'article',
  'nav',
  'header',
  'footer',
  'aside',
])

/** Delay before a larger ancestor container can take over the hover state. */
const ANCESTOR_TAKEOVER_DELAY_MS = 200

/** Extra hover tolerance around the stable target while crossing a small gap. */
const GAP_TOLERANCE_PX = 12

/** Minimum area growth to consider a parent "meaningfully larger". */
const AREA_GROWTH_RATIO = 1.25

/** Minimum width or height growth to consider a parent materially larger. */
const MIN_SIZE_GROWTH_PX = 16

/**
 * Reads the normalized lowercase tag name from an element info snapshot.
 *
 * @param info - Element info snapshot
 * @returns Lowercase tag name
 */
function getTagName(info: ElementInfo): string {
  return info.attributes.tagName ?? info.element.tagName.toLowerCase()
}

/**
 * Checks whether a point falls inside an element rect expanded by a tolerance.
 *
 * @param point      - Pointer position in viewport space
 * @param rect       - Bounding rect of the reference element
 * @param tolerance  - Extra pixels to grow the rect on every side
 * @returns `true` when the point is within the expanded rect
 */
function isPointWithinExpandedRect(
  point: { x: number; y: number },
  rect: ElementInfo['rect'],
  tolerance: number
): boolean {
  return (
    point.x >= rect.left - tolerance &&
    point.x <= rect.right + tolerance &&
    point.y >= rect.top - tolerance &&
    point.y <= rect.bottom + tolerance
  )
}

/**
 * Determines whether a candidate ancestor is meaningfully larger than the
 * current stable element, which helps distinguish real parent containers from
 * near-equal wrappers.
 *
 * @param candidateRect - Bounding rect of the candidate parent
 * @param currentRect   - Bounding rect of the current stable target
 * @returns `true` when the candidate should be treated as a larger ancestor
 */
function isMeaningfullyLarger(
  candidateRect: ElementInfo['rect'],
  currentRect: ElementInfo['rect']
): boolean {
  const candidateArea = candidateRect.width * candidateRect.height
  const currentArea = currentRect.width * currentRect.height
  const widthGrowth = candidateRect.width - currentRect.width
  const heightGrowth = candidateRect.height - currentRect.height

  return (
    candidateArea >= currentArea * AREA_GROWTH_RATIO &&
    (widthGrowth >= MIN_SIZE_GROWTH_PX || heightGrowth >= MIN_SIZE_GROWTH_PX)
  )
}

/**
 * Returns `true` when the new hover target should be treated as a delayed
 * ancestor takeover instead of an immediate hover switch.
 *
 * @param candidate   - New hover candidate emitted by the base picker
 * @param current     - Currently visible stable hover target
 * @param cursorPos   - Live pointer position
 * @returns `true` when ancestor takeover should be delayed
 */
function shouldDelayAncestorTakeover(
  candidate: ElementInfo,
  current: ElementInfo | null,
  cursorPos: { x: number; y: number }
): boolean {
  if (!current) return false
  if (candidate.element === current.element) return false
  if (!candidate.element.contains(current.element)) return false
  if (!GENERIC_CONTAINER_TAGS.has(getTagName(candidate))) return false
  if (!isMeaningfullyLarger(candidate.rect, current.rect)) return false

  return isPointWithinExpandedRect(cursorPos, current.rect, GAP_TOLERANCE_PX)
}

// ---------------------------------------------------------------------------
// VibePicker
// ---------------------------------------------------------------------------

/**
 * Main element-picker orchestrator for the Vibe Coding demo.
 *
 * Wraps the website content with the base `ElementPicker` library and renders
 * three layers of picking UI via a single `document.body` portal:
 *
 * 1. **`PickerHighlight`** — official reference highlight box. Visible in both
 *    hover and selected states. Uses a stable `key` so hover → selected does
 *    NOT trigger a remount (avoids spring restart).
 *
 * 2. **`FloatTips`** — official reference hover label that follows the cursor.
 *    Visible only while hovering (hidden after click).
 *
 * 3. **`VibeInputPanel`** — floating edit panel that appears after a click.
 *    Positioned below (or above) the selected element's bounding rect.
 *
 * **State flow:**
 * ```
 * inactive                  → nothing rendered
 * active + hovering         → Highlight(hover) + CursorLabel
 * active + clicked          → Highlight(selected) + InputPanel (selection locked)
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

  /** Currently visible hover target after gap-stabilization is applied */
  const [stableHoveredInfo, setStableHoveredInfo] = useState<ElementInfo | null>(null)
  /** Pending larger ancestor that may take over after a short delay */
  const [pendingAncestorInfo, setPendingAncestorInfo] = useState<ElementInfo | null>(null)
  /** Last clicked element — drives the selected highlight + input panel */
  const [clickedInfo, setClickedInfo] = useState<ElementInfo | null>(null)
  /** Live cursor position for the label tooltip */
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  /** Controlled textarea value for the input panel */
  const [message, setMessage] = useState('')

  /** Mutable mirror of the stable hover target for event callbacks */
  const stableHoveredInfoRef = useRef<ElementInfo | null>(null)
  /** Mutable mirror of the pending ancestor candidate */
  const pendingAncestorInfoRef = useRef<ElementInfo | null>(null)
  /** Mutable mirror of the selected element lock */
  const clickedInfoRef = useRef<ElementInfo | null>(null)
  /** Mutable pointer position used by hover/click decisions */
  const cursorPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  /** Active delay timer for deferred ancestor takeover */
  const ancestorTakeoverTimerRef = useRef<number | null>(null)

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

  // ── Stable state helpers ───────────────────────────────────────────────────

  /**
   * Updates the stable hover target and its synchronous ref mirror.
   *
   * @param info - Hover target to display, or `null` to clear
   */
  const commitStableHover = useCallback((info: ElementInfo | null) => {
    stableHoveredInfoRef.current = info
    setStableHoveredInfo(info)
  }, [])

  /**
   * Updates the pending ancestor candidate and its synchronous ref mirror.
   *
   * @param info - Ancestor candidate awaiting takeover, or `null` to clear
   */
  const commitPendingAncestor = useCallback((info: ElementInfo | null) => {
    pendingAncestorInfoRef.current = info
    setPendingAncestorInfo(info)
  }, [])

  /**
   * Cancels any pending delayed ancestor takeover and clears the candidate.
   */
  const clearPendingAncestorTakeover = useCallback(() => {
    if (ancestorTakeoverTimerRef.current !== null) {
      window.clearTimeout(ancestorTakeoverTimerRef.current)
      ancestorTakeoverTimerRef.current = null
    }
    commitPendingAncestor(null)
  }, [commitPendingAncestor])

  // ── Cursor tracking (independent of element-diff listener) ────────────────

  useEffect(() => {
    if (status === 'inactive') return

    const handleMouseMove = (e: MouseEvent) => {
      const nextCursorPos = { x: e.clientX, y: e.clientY }
      cursorPosRef.current = nextCursorPos
      setCursorPos(nextCursorPos)
    }

    // Capture phase keeps the pointer ref current before the base picker reacts.
    document.addEventListener('mousemove', handleMouseMove, true)
    return () => document.removeEventListener('mousemove', handleMouseMove, true)
  }, [status])

  // ── Pending takeover lifecycle ─────────────────────────────────────────────

  useEffect(() => {
    if (status === 'inactive') {
      clearPendingAncestorTakeover()
      commitStableHover(null)
    }

    return () => {
      clearPendingAncestorTakeover()
    }
  }, [status, clearPendingAncestorTakeover, commitStableHover])

  useEffect(() => {
    clickedInfoRef.current = clickedInfo
  }, [clickedInfo])

  // ── Scroll lock while the input panel is open ─────────────────────────────

  useEffect(() => {
    if (status !== 'active' || clickedInfo === null) return

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [status, clickedInfo])

  // ── Empty-panel click-away close ───────────────────────────────────────────

  useEffect(() => {
    if (status !== 'active') return
    if (clickedInfo === null) return
    if (message.trim().length > 0) return

    const handleClickAway = (e: MouseEvent) => {
      const target = e.target
      if (!(target instanceof HTMLElement)) return
      if (target.closest('[data-picker-ui]')) return

      // Treat outside clicks as dismiss-only actions while the prompt is empty.
      e.preventDefault()
      e.stopPropagation()

      clearPendingAncestorTakeover()
      clickedInfoRef.current = null
      setClickedInfo(null)
      commitStableHover(null)
      setMessage('')
    }

    document.addEventListener('click', handleClickAway, true)
    return () => document.removeEventListener('click', handleClickAway, true)
  }, [status, clickedInfo, message, clearPendingAncestorTakeover, commitStableHover])

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
    if (clickedInfoRef.current) return

    const currentStable = stableHoveredInfoRef.current
    const currentCursorPos = cursorPosRef.current

    if (currentStable && info.element === currentStable.element) {
      clearPendingAncestorTakeover()
      return
    }

    if (shouldDelayAncestorTakeover(info, currentStable, currentCursorPos)) {
      if (pendingAncestorInfoRef.current?.element === info.element) return

      clearPendingAncestorTakeover()
      commitPendingAncestor(info)

      ancestorTakeoverTimerRef.current = window.setTimeout(() => {
        ancestorTakeoverTimerRef.current = null
        commitStableHover(info)
        commitPendingAncestor(null)
      }, ANCESTOR_TAKEOVER_DELAY_MS)

      return
    }

    clearPendingAncestorTakeover()
    commitStableHover(info)
  }, [clearPendingAncestorTakeover, commitPendingAncestor, commitStableHover])

  const handleChange = useCallback((info: ElementInfo | null) => {
    if (clickedInfoRef.current) return
    if (info !== null) return

    clearPendingAncestorTakeover()
    commitStableHover(null)
  }, [clearPendingAncestorTakeover, commitStableHover])

  const handleClick = useCallback((info: ElementInfo) => {
    if (clickedInfoRef.current) return

    const currentStable = stableHoveredInfoRef.current
    const pendingAncestor = pendingAncestorInfoRef.current
    const currentCursorPos = cursorPosRef.current

    const shouldPreferStableHover =
      pendingAncestor !== null &&
      currentStable !== null &&
      pendingAncestor.element === info.element &&
      isPointWithinExpandedRect(currentCursorPos, currentStable.rect, GAP_TOLERANCE_PX)

    const selectedInfo = shouldPreferStableHover ? currentStable : info

    clearPendingAncestorTakeover()
    clickedInfoRef.current = selectedInfo

    console.log('[vibe-picker] element clicked:', selectedInfo.selector, selectedInfo)
    setClickedInfo(selectedInfo)
    commitStableHover(null)
    setMessage('') // reset textarea for the new selection
  }, [clearPendingAncestorTakeover, commitStableHover])

  // ── Input panel callbacks ──────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    if (!clickedInfo || !message.trim()) return
    console.log('[vibe-picker] send:', {
      selector: clickedInfo.selector,
      element: clickedInfo.attributes,
      message: message.trim(),
    })
    clearPendingAncestorTakeover()
    clickedInfoRef.current = null
    setClickedInfo(null)
    commitStableHover(null)
    setMessage('')
  }, [clickedInfo, message, clearPendingAncestorTakeover, commitStableHover])

  const handleClose = useCallback(() => {
    clearPendingAncestorTakeover()
    clickedInfoRef.current = null
    setClickedInfo(null)
    commitStableHover(null)
    setMessage('')
  }, [clearPendingAncestorTakeover, commitStableHover])

  // ── Derived display state ──────────────────────────────────────────────────

  // Hover visuals track the stable preview target until a click locks selection.
  const activeInfo = clickedInfo ?? stableHoveredInfo
  const hasHoverPreview = stableHoveredInfo !== null || pendingAncestorInfo !== null

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
             * PickerHighlight — stable key so hover→selected state change
             * does NOT unmount/remount (avoids spring restart).
             * Only exits when both hoveredInfo AND clickedInfo are null.
             */}
            <AnimatePresence>
              {activeInfo && (
                <PickerHighlight
                  key="vibe-highlight"
                  rect={activeInfo.rect}
                  isSelected={clickedInfo !== null}
                />
              )}
            </AnimatePresence>

            {/* FloatTips — only visible while hovering */}
            <AnimatePresence>
              {hasHoverPreview && stableHoveredInfo && !clickedInfo && (
                <FloatTips
                  key="vibe-cursor-label"
                  cursorPos={cursorPos}
                  info={stableHoveredInfo}
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
