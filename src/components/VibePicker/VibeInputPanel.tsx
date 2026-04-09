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

    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
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
      }}
      className="vibe-input-panel"
    >
      <div className="vibe-input-panel__tag">
        <div className="vibe-input-panel__tag-badge">
          <MousePointer2
            size={12}
            strokeWidth={1.8}
            style={{ flexShrink: 0 }}
          />
          <span className="vibe-input-panel__tag-text">{tagLabel}</span>
        </div>
      </div>

      <div className="vibe-input-panel__body">
        <div className="vibe-input-panel__field">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请描述希望修改的内容"
            rows={1}
            className="vibe-input-panel__textarea focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <Button
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send edit request"
          type="button"
          variant="ghost"
          data-can-send={canSend}
          className="vibe-input-panel__send"
        >
          <SendHorizontal size={13} strokeWidth={2.2} />
        </Button>
      </div>
    </motion.div>
  )
}
