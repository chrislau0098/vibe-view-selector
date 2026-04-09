import { motion } from 'framer-motion'
import { Pencil, Check, MoonStar, SunMedium } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ThemeMode = 'light' | 'dark'

interface ToolbarProps {
  /** Whether element picking is currently active */
  isEditing: boolean
  /** Callback to toggle editing mode on/off */
  onToggle: () => void
  /** Current body theme mode */
  themeMode: ThemeMode
  /** Callback to toggle light / dark mode */
  onThemeToggle: () => void
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
 * @param props.isEditing   - Current edit mode state
 * @param props.onToggle    - Toggle handler provided by the parent
 * @param props.themeMode   - Current theme mode for the demo body
 * @param props.onThemeToggle - Toggle handler for light / dark mode
 */
export function Toolbar({ isEditing, onToggle, themeMode, onThemeToggle }: ToolbarProps) {
  return (
    <div data-picker-ui className="picker-toolbar">
      <div className="picker-toolbar__brand">
        <span className="picker-toolbar__dot" />
        <span className="picker-toolbar__name">vibe</span>
      </div>

      <div className="picker-toolbar__actions">
        <MotionButton
          type="button"
          onClick={onThemeToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', damping: 20, stiffness: 400, mass: 0.3 }}
          variant="ghost"
          data-variant="secondary"
          className="picker-toolbar__toggle"
          aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
        >
          {themeMode === 'dark' ? (
            <>
              <SunMedium size={13} strokeWidth={2} />
              LM
            </>
          ) : (
            <>
              <MoonStar size={13} strokeWidth={2} />
              DM
            </>
          )}
        </MotionButton>

        <MotionButton
          type="button"
          onClick={onToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', damping: 20, stiffness: 400, mass: 0.3 }}
          variant="ghost"
          data-editing={isEditing}
          className="picker-toolbar__toggle"
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
    </div>
  )
}
