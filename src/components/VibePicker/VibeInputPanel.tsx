import { useRef, useEffect, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
 *  - Prefers appearing **below** the selected element (8px gap)
 *  - Falls back to **above** when there is less than 200px of space below
 *  - Horizontally left-aligned to the element, clamped to viewport margins
 *
 * @param rect      - Bounding rect of the selected element
 * @returns CSS `top` and `left` values in pixels
 */
function computePanelPosition(rect: ElementInfo['rect']): { top: number; left: number } {
  const PANEL_MIN_W = 340
  const GAP = 8
  const PANEL_ESTIMATED_H = 168
  const MARGIN = 16

  const spaceBelow = window.innerHeight - rect.bottom
  const top =
    spaceBelow >= 200
      ? rect.bottom + GAP
      : rect.top - PANEL_ESTIMATED_H - GAP

  const left = Math.max(
    MARGIN,
    Math.min(rect.left, window.innerWidth - PANEL_MIN_W - MARGIN)
  )

  return { top: Math.max(MARGIN, top), left }
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
 * 1. Header row — element badge (tag.class) + close (X) button
 * 2. Textarea — free-form edit description, auto-focused on mount
 * 3. Footer row — Send button (disabled when empty; Ctrl/Cmd+Enter shortcut)
 *
 * **Positioning:** Computed from the element's bounding rect at mount time.
 * Prefers below the element; flips above if space is insufficient.
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
  const { top, left } = computePanelPosition(info.rect)
  const badgeLabel = buildBadgeLabel(info)
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
        minWidth: 340,
        maxWidth: 480,
        zIndex: 2147483647,
        // Light surface — matches the light-mode website content
        background: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.10)',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.07)',
        padding: '14px 16px',
        fontFamily: '"Geist Variable", -apple-system, system-ui, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header: element badge + close ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <Badge
          style={{
            fontFamily: '"Geist Mono", "SF Mono", monospace',
            fontSize: 11,
            fontWeight: 500,
            color: '#1456F0',
            background: 'rgba(20, 86, 240, 0.08)',
            border: '1px solid rgba(20, 86, 240, 0.22)',
            borderRadius: 4,
            padding: '2px 8px',
            letterSpacing: '0.01em',
          }}
        >
          {badgeLabel}
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          style={{
            width: 24,
            height: 24,
            color: '#9ca3af',
            flexShrink: 0,
          }}
          className="hover:text-gray-700 hover:bg-gray-100"
        >
          <X size={14} strokeWidth={2} />
        </Button>
      </div>

      {/* ── Textarea ── */}
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="描述你想修改的内容..."
        className="focus-visible:ring-[#1456F0] focus-visible:ring-offset-0"
        style={{
          minHeight: 72,
          resize: 'none',
          fontSize: 13,
          lineHeight: 1.55,
          color: '#111827',
          background: 'rgba(0, 0, 0, 0.025)',
          border: '1px solid rgba(0, 0, 0, 0.09)',
          borderRadius: 6,
          padding: '10px 12px',
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: '"Geist Variable", -apple-system, system-ui, sans-serif',
        }}
      />

      {/* ── Footer: send button + hint ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 10,
        }}
      >
        {/* Keyboard shortcut hint */}
        <span style={{ fontSize: 11, color: '#9ca3af' }}>
          ⌘↵ to send
        </span>

        <Button
          onClick={onSend}
          disabled={!canSend}
          style={{
            height: 32,
            padding: '0 14px',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: canSend ? '#1456F0' : undefined,
            color: canSend ? '#ffffff' : undefined,
            cursor: canSend ? 'pointer' : 'not-allowed',
          }}
        >
          <Send size={13} strokeWidth={2} />
          Send
        </Button>
      </div>
    </motion.div>
  )
}
