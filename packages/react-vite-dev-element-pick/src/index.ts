/**
 * react-vite-dev-element-pick
 *
 * A dev-only element inspection library for React + Vite projects.
 * Designed for iframe-based design tooling — hover elements to inspect,
 * click to select and communicate with the host page.
 *
 * @remarks
 * All dependencies are peer dependencies (react, react-dom).
 * Linked to the host project via tsconfig path alias during development.
 *
 * @packageDocumentation
 */

// Main component
export { ElementPicker } from './ElementPicker'

// Types — export everything consumers may need
export type {
  ElementInfo,
  ElementRect,
  ElementMargins,
  SourceLocation,
  PickerStatus,
  OverlayRenderProps,
  HighlightRenderProps,
  ElementPickerProps,
  ElementPickerHandle,
} from './types'

// Utility functions — exported for advanced consumers who want to build
// their own inspection logic using the same helpers
export { buildElementInfo } from './utils/element'
export { getCssSelector } from './utils/selector'
export { getSourceLocation } from './utils/fiber'
export { getElementAttributes, getElementMargins, toElementRect } from './utils/element'
