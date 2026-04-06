import { motion } from 'framer-motion'
import { Pencil, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToolbarProps {
  /** Whether element picking is currently active */
  isEditing: boolean
  /** Callback to toggle editing mode on/off */
  onToggle: () => void
}

// ---------------------------------------------------------------------------
// MotionButton — wraps Shadcn Button with Framer Motion micro-interactions
// ---------------------------------------------------------------------------

const MotionButton = motion.create(Button)

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

/**
 * Fixed top toolbar that controls entry/exit of element-editing mode.
 *
 * The root element carries `data-picker-ui` so the element picker excludes it
 * from selection. All interactive elements live inside a single fixed bar with
 * backdrop blur for depth.
 *
 * @param props.isEditing - Current edit mode state
 * @param props.onToggle  - Toggle handler provided by the parent
 */
export function Toolbar({ isEditing, onToggle }: ToolbarProps) {
  return (
    <div
      data-picker-ui
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        background: 'rgba(15, 16, 17, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        boxSizing: 'border-box',
        fontFamily: '"Geist Variable", -apple-system, system-ui, sans-serif',
      }}
    >
      {/* ── Brand mark ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#1456F0',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#f7f8f8',
            letterSpacing: '-0.01em',
          }}
        >
          vibe
        </span>
      </div>

      {/* ── Edit / Done toggle ── */}
      <MotionButton
        onClick={onToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', damping: 20, stiffness: 400, mass: 0.3 }}
        style={{
          height: 32,
          padding: '0 14px',
          fontSize: 13,
          fontWeight: 500,
          borderRadius: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          border: '1px solid',
          transition: 'background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
          ...(isEditing
            ? {
                background: '#1456F0',
                borderColor: '#1456F0',
                color: '#ffffff',
              }
            : {
                background: 'transparent',
                borderColor: 'rgba(255,255,255,0.14)',
                color: '#a1a1aa',
              }),
        }}
      >
        {isEditing ? (
          <>
            <Check size={13} strokeWidth={2.5} />
            Done
          </>
        ) : (
          <>
            <Pencil size={13} strokeWidth={2} />
            Edit
          </>
        )}
      </MotionButton>
    </div>
  )
}
