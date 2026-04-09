import type React from 'react'

// ---------------------------------------------------------------------------
// Core data types
// ---------------------------------------------------------------------------

/**
 * Bounding rectangle of the inspected element (snapshot at inspection time).
 * Mirrors the DOMRect structure but as a plain object for serialization.
 */
export interface ElementRect {
  top: number
  left: number
  width: number
  height: number
  bottom: number
  right: number
  /** X coordinate — same as `left` */
  x: number
  /** Y coordinate — same as `top` */
  y: number
}

/**
 * Computed CSS margin values (in pixels) for the inspected element.
 * Useful for the host page to decide where to position overlay panels.
 */
export interface ElementMargins {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * React Fiber debug source information, available in development builds.
 * Populated from `_debugSource` on the React Fiber tree.
 */
export interface SourceLocation {
  /** Absolute file path of the source file */
  fileName: string
  /** 1-based line number */
  lineNumber: number
  /** 0-based column number */
  columnNumber: number
}

/**
 * Complete information about an inspected DOM element.
 * Passed to all event callbacks and overlay/highlight render props.
 */
export interface ElementInfo {
  /** The raw DOM element */
  element: HTMLElement
  /**
   * CSS selector string describing the element's location in the DOM.
   * Example: `section > div.feature-card:nth-of-type(2)`
   */
  selector: string
  /**
   * Key HTML attributes of the element.
   * Always includes `tagName`. Adds `id`, `className`, `type`, `role`,
   * `href`, `src`, `alt`, `name` and any `data-*` / `aria-*` attributes
   * when present.
   */
  attributes: Record<string, string>
  /**
   * React source file location, or `null` when unavailable
   * (non-React elements, production builds, etc.).
   */
  sourceLocation: SourceLocation | null
  /** Snapshot of the element's bounding rect at inspection time */
  rect: ElementRect
  /** Computed CSS margins at inspection time */
  margins: ElementMargins
}

// ---------------------------------------------------------------------------
// Picker status
// ---------------------------------------------------------------------------

/**
 * Controls whether element picking is enabled.
 * - `'active'`   — hover + click events are live; highlight and overlay are shown.
 * - `'inactive'` — all picking is disabled; highlight and overlay are hidden.
 */
export type PickerStatus = 'active' | 'inactive'

// ---------------------------------------------------------------------------
// Render prop shapes
// ---------------------------------------------------------------------------

/**
 * Props passed to a custom overlay render function.
 * @see ElementPickerProps.overlay
 */
export interface OverlayRenderProps {
  /** Full information about the currently hovered element */
  info: ElementInfo
}

/**
 * Props passed to a custom highlight render function.
 * @see ElementPickerProps.highlight
 */
export interface HighlightRenderProps {
  /** The DOM element being highlighted */
  element: HTMLElement
  /** Snapshot bounding rect for positioning */
  rect: ElementRect
  /** Full element info */
  info: ElementInfo
}

/**
 * Props for the official `FloatTips` reference component.
 *
 * This type is public so host teams can inspect or mirror the same contract
 * when copying the reference implementation into their own codebase.
 *
 * @example
 * ```tsx
 * <FloatTips cursorPos={{ x: 120, y: 96 }} info={info} />
 * ```
 */
export interface FloatTipsProps {
  /** Current mouse cursor coordinates in viewport space */
  cursorPos: { x: number; y: number }
  /** Info about the currently hovered element */
  info: ElementInfo
}

/**
 * Props for the official `PickerHighlight` reference component.
 *
 * This type is public so host teams can inspect or mirror the same contract
 * when copying the reference implementation into their own codebase.
 *
 * @example
 * ```tsx
 * <PickerHighlight rect={info.rect} isSelected={false} />
 * ```
 */
export interface PickerHighlightProps {
  /** Bounding rect of the target element */
  rect: ElementRect
  /** Whether the highlight represents a locked/selected element */
  isSelected?: boolean
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

/**
 * Props for the `<ElementPicker>` component.
 *
 * @example
 * ```tsx
 * <ElementPicker
 *   status="active"
 *   onClick={(info) => console.log('picked', info)}
 *   overlayClassName="my-overlay"
 * >
 *   <App />
 * </ElementPicker>
 * ```
 */
export interface ElementPickerProps {
  /**
   * Master switch controlling whether picking is enabled.
   * Set to `'inactive'` to hide all UI and stop event listeners.
   * @default 'inactive'
   */
  status?: PickerStatus

  /**
   * Called when the user **clicks** an element while the picker is active.
   * After a click the overlay auto-hides but the highlight remains visible
   * until status changes or another hover begins.
   *
   * @param info - Full element information
   */
  onClick?: (info: ElementInfo) => void

  /**
   * Called each time the user **hovers** over a new element.
   * Fires on every mousemove target change.
   *
   * @param info - Full element information
   */
  onHover?: (info: ElementInfo) => void

  /**
   * Called when the hovered element changes — including when it becomes
   * `null` (cursor leaves the document or picker becomes inactive).
   *
   * @param info - Element info, or `null` when no element is hovered
   */
  onChange?: (info: ElementInfo | null) => void

  /**
   * Replace the default overlay panel with a custom renderer.
   * Rendered into `document.body` via a portal.
   *
   * @param props - {@link OverlayRenderProps}
   * @returns React node to render as the overlay
   *
   * @example
   * ```tsx
   * overlay={({ info }) => (
   *   <div className="my-overlay">{info.selector}</div>
   * )}
   * ```
   */
  overlay?: (props: OverlayRenderProps) => React.ReactNode

  /**
   * Replace the default element highlight box with a custom renderer.
   * Rendered into `document.body` via a portal, positioned via `rect`.
   *
   * @param props - {@link HighlightRenderProps}
   * @returns React node to render as the highlight
   *
   * @example
   * ```tsx
   * highlight={({ rect }) => (
   *   <div style={{ position: 'fixed', top: rect.top, left: rect.left,
   *     width: rect.width, height: rect.height, outline: '2px solid red' }} />
   * )}
   * ```
   */
  highlight?: (props: HighlightRenderProps) => React.ReactNode

  /**
   * Additional CSS class name(s) applied to the **default** overlay panel.
   * Has no effect when a custom `overlay` render function is provided.
   */
  overlayClassName?: string

  /**
   * Additional CSS class name(s) applied to the **default** highlight box.
   * Has no effect when a custom `highlight` render function is provided.
   */
  highlightClassName?: string

  /**
   * CSS selector strings for elements that should be excluded from picking.
   * Elements matching any of these selectors (via `element.closest()`) will
   * be skipped — the picker will not highlight or report them.
   *
   * @example `exclude={['[data-picker-ui]', '#my-overlay']}`
   */
  exclude?: string[]

  /**
   * Optional element resolver applied to `e.target` **before** `buildElementInfo`.
   *
   * Use this to bubble inline or presentational elements (e.g. `<span>`, `<em>`)
   * up to the nearest meaningful ancestor, giving users a better selection
   * granularity without modifying the core picking logic.
   *
   * @param el - The raw DOM event target
   * @returns The resolved element to inspect (may be `el` itself)
   *
   * @example
   * ```tsx
   * resolveElement={(el) => {
   *   const INLINE = new Set(['SPAN','EM','STRONG','B','I','U','S','BR','SUB','SUP','ABBR'])
   *   let cur: HTMLElement | null = el
   *   while (cur && INLINE.has(cur.tagName)) cur = cur.parentElement
   *   return cur ?? el
   * }}
   * ```
   */
  resolveElement?: (el: HTMLElement) => HTMLElement

  /**
   * Content to wrap. The picker attaches event listeners to `document`,
   * so children do not need to be direct descendants.
   */
  children?: React.ReactNode
}

/**
 * Imperative handle exposed via `ref` on `<ElementPicker>`.
 * Lets the parent imperatively control highlight and overlay visibility.
 *
 * @example
 * ```tsx
 * const ref = useRef<ElementPickerHandle>(null)
 * // Hide overlay after an external panel opens
 * ref.current?.hideOverlay()
 * ```
 */
export interface ElementPickerHandle {
  /**
   * Hide the info overlay panel without clearing the highlight.
   * Useful when the host page renders its own panel after a click.
   */
  hideOverlay: () => void

  /**
   * Show the info overlay panel for the currently highlighted element.
   * No-op if no element is currently highlighted.
   */
  showOverlay: () => void

  /**
   * Hide the element highlight box.
   */
  hideHighlight: () => void

  /**
   * Show the element highlight box for the currently tracked element.
   * No-op if no element is currently tracked.
   */
  showHighlight: () => void

  /**
   * Clear all state: hide highlight, overlay, and forget the current element.
   */
  clear: () => void

  /**
   * Returns the `ElementInfo` for the currently highlighted element,
   * or `null` if nothing is highlighted.
   */
  getCurrentInfo: () => ElementInfo | null
}
