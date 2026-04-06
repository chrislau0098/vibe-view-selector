import type { SourceLocation } from '../types'

/**
 * Traverses the React Fiber tree upward from a DOM element to find
 * `_debugSource` metadata, which Vite+React injects in development builds.
 *
 * Returns `null` in production builds or for non-React elements.
 *
 * @param el - The DOM element to look up
 * @returns Source location info, or `null` if unavailable
 *
 * @remarks
 * React attaches the Fiber node to DOM elements via a property whose key
 * starts with `__reactFiber$`. This is an internal React implementation
 * detail and may change across major React versions.
 */
export function getSourceLocation(el: HTMLElement): SourceLocation | null {
  try {
    // Find the React Fiber key attached to this DOM node
    const fiberKey = Object.keys(el).find((k) => k.startsWith('__reactFiber$'))
    if (!fiberKey) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fiber: any = (el as any)[fiberKey]

    // Walk up the fiber tree looking for _debugSource
    while (fiber) {
      if (fiber._debugSource) {
        return {
          fileName: fiber._debugSource.fileName as string,
          lineNumber: fiber._debugSource.lineNumber as number,
          columnNumber: fiber._debugSource.columnNumber as number,
        }
      }
      fiber = fiber.return
    }
  } catch {
    // Silently ignore — fiber access can fail in edge cases
  }

  return null
}
