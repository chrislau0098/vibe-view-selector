import { useRef, useEffect, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { MousePointer2, SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ElementInfo } from 'react-vite-dev-element-pick'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VibeInputPanelProps {
  /** Full info about the element the user clicked */
  info: ElementInfo
  /** Controlled message text */
  message: string
  /** Called on every keystroke */
  onMessageChange: (value: string) => void
  /** Called when the user confirms the edit (send button or Ctrl/Cmd+Enter) */
  onSend: () => void
  /** Called when the user dismisses the panel without sending */
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Computes the fixed position for the input panel:
 *  - Prefers appearing from the **bottom-right corner** of the selected element
 *  - Clamps horizontally / vertically to keep the panel inside the viewport
 *  - For oversized selections, anchors from the visible bottom-right edge
 *
 * @param rect      - Bounding rect of the selected element
 * @returns CSS `top`, `left`, and `width` values in pixels
 */
function computePanelPosition(rect: ElementInfo['rect']): { top: number; left: number; width: number } {
  const PANEL_TARGET_W = 340
  const GAP = 10
  const PANEL_ESTIMATED_H = 168
  const MARGIN = 16

  const width = Math.min(PANEL_TARGET_W, window.innerWidth - MARGIN * 2)
  const visibleTop = Math.max(MARGIN, rect.top)
  const visibleBottom = Math.min(window.innerHeight - MARGIN, rect.bottom)
  const visibleRight = Math.min(window.innerWidth - MARGIN, rect.right)

  const preferredLeft = visibleRight - width
  const preferredTop = visibleBottom + GAP

  const left = Math.max(
    MARGIN,
    Math.min(preferredLeft, window.innerWidth - width - MARGIN)
  )

  const top = Math.max(
    MARGIN,
    Math.min(preferredTop, window.innerHeight - PANEL_ESTIMATED_H - MARGIN)
  )

  // If the selected element is mostly below the viewport fold, bias upward so
  // the panel still feels attached to the visible bottom-right of the target.
  if (rect.bottom > window.innerHeight - MARGIN && visibleTop < visibleBottom) {
    return {
      top: Math.max(MARGIN, visibleBottom - PANEL_ESTIMATED_H),
      left,
      width,
    }
  }

  return { top, left, width }
}

/**
 * Builds the element badge label: `tag.firstClass`
 *
 * @param info - Element info snapshot
 * @returns Short label string, e.g. `"section.hero-section"`
 */
function buildBadgeLabel(info: ElementInfo): string {
  const tag = info.attributes.tagName ?? info.element.tagName.toLowerCase()
  const firstClass = (info.attributes.class ?? '')
    .split(/\s+/)
    .find((c) => c.length > 0)
  return firstClass ? `${tag}.${firstClass}` : tag
}

// ---------------------------------------------------------------------------
// VibeInputPanel
// ---------------------------------------------------------------------------

/**
 * Floating input panel that appears after the user clicks an element in pick mode.
 *
 * **Layout (top → bottom):**
 * 1. Light tag chip — selected element label
 * 2. One-piece input row — textarea + circular send button
 *
 * **Positioning:** Computed from the element's bounding rect at mount time.
 * Anchors to the selected element's bottom-right corner, then clamps into the
 * viewport so the panel remains visible.
 *
 * **Portal:** Parent (`VibePicker`) renders this into `document.body`.
 *
 * @param props.info            - Clicked element info
 * @param props.message         - Controlled textarea value
 * @param props.onMessageChange - Textarea onChange handler
 * @param props.onSend          - Called on send confirmation
 * @param props.onClose         - Called on dismiss
 */
export function VibeInputPanel({
  info,
  message,
  onMessageChange,
  onSend,
  onClose,
}: VibeInputPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { top, left, width } = computePanelPosition(info.rect)
  const tagLabel = buildBadgeLabel(info)
  const canSend = message.trim().length > 0

  // Auto-focus the textarea when the panel mounts
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [])

  /** Ctrl/Cmd + Enter submits; all other keys are handled natively */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <motion.div
      data-picker-ui
      aria-label="Edit element"
      // Slide up + fade in on mount; slide down + fade out on unmount
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ type: 'spring', damping: 22, stiffness: 320, mass: 0.4 }}
      style={{
        position: 'fixed',
        top,
        left,
        width,
        zIndex: 2147483647,
        background: '#ffffff',
        border: '0.5px solid #d0d3d6',
        borderRadius: 16,
        boxShadow: '0 2px 4px rgba(31, 35, 41, 0.02), 0 4px 8px rgba(31, 35, 41, 0.02), 0 4px 16px rgba(31, 35, 41, 0.03)',
        paddingTop: 12,
        fontFamily: '"Geist Variable", -apple-system, system-ui, sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ── Tag chip ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 12,
          paddingBottom: 8,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#f8f9fa',
            border: '1px solid #dee0e3',
            borderRadius: 6,
            padding: '2px 6px',
            minHeight: 20,
            boxSizing: 'border-box',
          }}
        >
          <MousePointer2
            size={12}
            strokeWidth={1.8}
            color="#2b2f36"
            style={{ flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 12,
              lineHeight: '20px',
              color: '#1f2329',
              fontWeight: 400,
              whiteSpace: 'nowrap',
            }}
          >
            {tagLabel}
          </span>
        </div>
      </div>

      {/* ── Input row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 12px 12px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'stretch',
            alignSelf: 'stretch',
          }}
        >
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请描述希望修改的内容"
            rows={1}
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{
              minHeight: 28,
              maxHeight: 120,
              resize: 'none',
              border: 'none',
              background: 'transparent',
              padding: 0,
              fontSize: 14,
              lineHeight: '22px',
              color: '#1f2329',
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: '"PingFang SC", "Geist Variable", -apple-system, system-ui, sans-serif',
              overflow: 'auto',
            }}
          />
        </div>

        <Button
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send edit request"
          style={{
            width: 28,
            height: 28,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 7px 8px 9px',
            background: canSend ? '#1456F0' : 'rgba(31, 35, 41, 0.15)',
            color: '#ffffff',
            cursor: canSend ? 'pointer' : 'not-allowed',
            flexShrink: 0,
          }}
        >
          <SendHorizontal size={13} strokeWidth={2.2} />
        </Button>
      </div>
    </motion.div>
  )
}
