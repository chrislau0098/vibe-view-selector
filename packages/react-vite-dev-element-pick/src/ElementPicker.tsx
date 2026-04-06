import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from 'react'
import { createPortal } from 'react-dom'
import type {
  ElementInfo,
  ElementPickerHandle,
  ElementPickerProps,
  PickerStatus,
} from './types'
import { buildElementInfo } from './utils/element'
import { DefaultHighlight } from './components/DefaultHighlight'
import { DefaultOverlay } from './components/DefaultOverlay'

/**
 * `<ElementPicker>` — wraps your app and enables interactive element inspection.
 *
 * When `status="active"`, hovering any DOM element shows a highlight box and
 * an info overlay with selector, attributes, and React source location.
 * Clicking an element fires `onClick` and hides the overlay (highlight stays).
 *
 * Use `ref` to access the {@link ElementPickerHandle} for imperative control.
 *
 * @example
 * ```tsx
 * const pickerRef = useRef<ElementPickerHandle>(null)
 *
 * <ElementPicker
 *   ref={pickerRef}
 *   status={isActive ? 'active' : 'inactive'}
 *   onClick={(info) => {
 *     console.log('picked', info)
 *     pickerRef.current?.hideOverlay()
 *   }}
 * >
 *   <App />
 * </ElementPicker>
 * ```
 */
export const ElementPicker = forwardRef<ElementPickerHandle, ElementPickerProps>(
  function ElementPicker(
    {
      status = 'inactive',
      onClick,
      onHover,
      onChange,
      overlay,
      highlight,
      overlayClassName,
      highlightClassName,
      exclude = [],
      resolveElement,
      children,
    },
    ref
  ) {
    const [hoveredInfo, setHoveredInfo] = useState<ElementInfo | null>(null)
    const [clickedInfo, setClickedInfo] = useState<ElementInfo | null>(null)
    const [overlayVisible, setOverlayVisible] = useState(true)
    const [highlightVisible, setHighlightVisible] = useState(true)

    // Keep mutable refs to avoid stale closures in event listeners
    const statusRef = useRef<PickerStatus>(status)
    const hoveredInfoRef = useRef<ElementInfo | null>(null)
    const excludeRef = useRef<string[]>(exclude)

    useEffect(() => { statusRef.current = status }, [status])
    useEffect(() => { excludeRef.current = exclude }, [exclude])
    useEffect(() => { hoveredInfoRef.current = hoveredInfo }, [hoveredInfo])

    // Reset state when picker becomes inactive
    useEffect(() => {
      if (status === 'inactive') {
        setHoveredInfo(null)
        setClickedInfo(null)
        setOverlayVisible(true)
        setHighlightVisible(true)
        onChange?.(null)
      }
    // onChange intentionally omitted — we only want to run on status change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status])

    // ── Imperative handle ──────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      hideOverlay: () => setOverlayVisible(false),
      showOverlay: () => setOverlayVisible(true),
      hideHighlight: () => setHighlightVisible(false),
      showHighlight: () => setHighlightVisible(true),
      clear: () => {
        setHoveredInfo(null)
        setClickedInfo(null)
        setOverlayVisible(true)
        setHighlightVisible(true)
      },
      getCurrentInfo: () => hoveredInfoRef.current,
    }))

    // ── isExcluded helper ──────────────────────────────────────────────────
    const isExcluded = useCallback((el: HTMLElement): boolean => {
      return excludeRef.current.some((sel) => {
        try { return el.closest(sel) !== null }
        catch { return false }
      })
    }, [])

    // ── Event listeners ────────────────────────────────────────────────────
    useEffect(() => {
      if (status === 'inactive') return

      const handleMouseMove = (e: MouseEvent) => {
        const raw = e.target as HTMLElement
        if (!raw || !(raw instanceof HTMLElement)) return
        const el = resolveElement ? resolveElement(raw) : raw
        if (isExcluded(el)) {
          if (hoveredInfoRef.current !== null) {
            setHoveredInfo(null)
            onChange?.(null)
          }
          return
        }

        // Only update state when the resolved element actually changes
        if (hoveredInfoRef.current?.element === el) return

        const info = buildElementInfo(el)
        setHoveredInfo(info)
        setClickedInfo(null)
        setOverlayVisible(true)
        setHighlightVisible(true)
        onHover?.(info)
        onChange?.(info)

        console.log('[react-vite-dev-element-pick] hover:', info.selector, info)
      }

      const handleMouseLeave = () => {
        setHoveredInfo(null)
        onChange?.(null)
      }

      const handleClick = (e: MouseEvent) => {
        const raw = e.target as HTMLElement
        if (!raw || !(raw instanceof HTMLElement)) return
        const el = resolveElement ? resolveElement(raw) : raw
        if (isExcluded(el)) return

        e.preventDefault()
        e.stopPropagation()

        const info = buildElementInfo(el)
        setClickedInfo(info)
        setHoveredInfo(null)
        setOverlayVisible(false) // hide overlay on click; highlight stays
        setHighlightVisible(true)
        onClick?.(info)

        console.log('[react-vite-dev-element-pick] click:', info.selector, info)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseleave', handleMouseLeave)
      document.addEventListener('click', handleClick, true)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseleave', handleMouseLeave)
        document.removeEventListener('click', handleClick, true)
      }
    }, [status, isExcluded, resolveElement, onClick, onHover, onChange])

    // ── Determine what to render ───────────────────────────────────────────
    // The "active" info: prefer hover, fall back to last-clicked
    const activeInfo = hoveredInfo ?? clickedInfo
    const showHighlight = status === 'active' && highlightVisible && activeInfo !== null
    const showOverlay = status === 'active' && overlayVisible && hoveredInfo !== null

    // ── Render ─────────────────────────────────────────────────────────────
    return (
      <>
        {children}

        {showHighlight &&
          createPortal(
            highlight
              ? highlight({ element: activeInfo!.element, rect: activeInfo!.rect, info: activeInfo! })
              : <DefaultHighlight rect={activeInfo!.rect} className={highlightClassName} />,
            document.body
          )}

        {showOverlay &&
          createPortal(
            overlay
              ? overlay({ info: hoveredInfo! })
              : <DefaultOverlay info={hoveredInfo!} className={overlayClassName} />,
            document.body
          )}
      </>
    )
  }
)
