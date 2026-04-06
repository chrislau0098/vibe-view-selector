/**
 * Generates a CSS selector string that uniquely identifies a DOM element
 * within the document. Prefers ID-based selectors for brevity; falls back
 * to tag + class + nth-of-type chains walking up the DOM tree.
 *
 * @param el - The DOM element to generate a selector for
 * @param maxDepth - Maximum number of ancestor levels to include (default: 4)
 * @returns A CSS selector string
 *
 * @example
 * getCssSelector(document.querySelector('#submit'))
 * // → 'button#submit'
 *
 * getCssSelector(document.querySelector('.card .title'))
 * // → 'div.feature-card:nth-of-type(2) > h3.title'
 */
export function getCssSelector(el: HTMLElement, maxDepth = 4): string {
  const parts: string[] = []
  let current: Element | null = el
  let depth = 0

  while (current && current !== document.documentElement && depth < maxDepth) {
    const tag = current.tagName.toLowerCase()
    const id = current.id ? `#${CSS.escape(current.id)}` : ''

    // If the element has an ID, use it and stop — IDs should be unique
    if (id) {
      parts.unshift(`${tag}${id}`)
      break
    }

    // Collect up to 3 class names
    const classes = Array.from(current.classList)
      .slice(0, 3)
      .map((c) => `.${CSS.escape(c)}`)
      .join('')

    // Determine nth-of-type index among siblings with the same tag
    const parent: HTMLElement | null = current.parentElement
    if (parent) {
      const currentTag = current.tagName
      const siblings = Array.from(parent.children).filter(
        (s) => s.tagName === currentTag
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(current as Element) + 1
        parts.unshift(`${tag}${classes}:nth-of-type(${index})`)
      } else {
        parts.unshift(`${tag}${classes}`)
      }
    } else {
      parts.unshift(`${tag}${classes}`)
    }

    current = parent
    depth++
  }

  return parts.join(' > ') || el.tagName.toLowerCase()
}
