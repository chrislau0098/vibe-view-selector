import type { ElementInfo, ElementMargins, ElementRect } from '../types'
import { getCssSelector } from './selector'
import { getSourceLocation } from './fiber'

/**
 * Converts a DOMRect to a plain-object ElementRect for serialization.
 *
 * @param domRect - The DOMRect from `getBoundingClientRect()`
 * @returns Plain object copy of the rect
 */
export function toElementRect(domRect: DOMRect): ElementRect {
  return {
    top: domRect.top,
    left: domRect.left,
    width: domRect.width,
    height: domRect.height,
    bottom: domRect.bottom,
    right: domRect.right,
    x: domRect.x,
    y: domRect.y,
  }
}

/**
 * Reads computed CSS margin values for an element.
 *
 * @param el - The target DOM element
 * @returns Margin values in pixels (parsed from `getComputedStyle`)
 */
export function getElementMargins(el: HTMLElement): ElementMargins {
  const style = window.getComputedStyle(el)
  return {
    top: parseFloat(style.marginTop) || 0,
    right: parseFloat(style.marginRight) || 0,
    bottom: parseFloat(style.marginBottom) || 0,
    left: parseFloat(style.marginLeft) || 0,
  }
}

/**
 * Extracts key attributes from a DOM element.
 *
 * Always includes `tagName`. Collects `id`, `className`, `type`, `role`,
 * `href`, `src`, `alt`, `name`, `value`, and all `data-*` / `aria-*`
 * attributes when present on the element.
 *
 * @param el - The target DOM element
 * @returns Record of attribute name → value
 */
export function getElementAttributes(el: HTMLElement): Record<string, string> {
  const attrs: Record<string, string> = {
    tagName: el.tagName.toLowerCase(),
  }

  const interesting = new Set([
    'id',
    'class',
    'type',
    'role',
    'href',
    'src',
    'alt',
    'name',
    'value',
    'placeholder',
    'for',
    'data-testid',
  ])

  Array.from(el.attributes).forEach((attr) => {
    if (
      interesting.has(attr.name) ||
      attr.name.startsWith('data-') ||
      attr.name.startsWith('aria-')
    ) {
      attrs[attr.name] = attr.value
    }
  })

  return attrs
}

/**
 * Builds a complete {@link ElementInfo} snapshot for a DOM element.
 * Combines selector, attributes, source location, rect, and margins.
 *
 * @param el - The DOM element to inspect
 * @returns Complete element info snapshot
 */
export function buildElementInfo(el: HTMLElement): ElementInfo {
  return {
    element: el,
    selector: getCssSelector(el),
    attributes: getElementAttributes(el),
    sourceLocation: getSourceLocation(el),
    rect: toElementRect(el.getBoundingClientRect()),
    margins: getElementMargins(el),
  }
}
