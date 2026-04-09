import React from 'react'
import type { ElementInfo } from '../types'

interface DefaultOverlayProps {
  info: ElementInfo
  className?: string
}

/**
 * Default information overlay panel.
 * Shows selector, attributes, source location, and rect dimensions.
 * Positioned at the bottom-left of the viewport, above the highlight.
 *
 * @internal
 */
export const DefaultOverlay: React.FC<DefaultOverlayProps> = ({ info, className }) => {
  const { selector, attributes, sourceLocation, rect } = info

  return (
    <div className={className ? `picker-overlay ${className}` : 'picker-overlay'} aria-hidden>
      <div className="picker-overlay__section">
        <Label>Selector</Label>
        <code className="picker-overlay__code picker-overlay__code--selector">{selector}</code>
      </div>

      {sourceLocation && (
        <div className="picker-overlay__section">
          <Label>Source</Label>
          <code className="picker-overlay__code picker-overlay__code--source">
            {formatPath(sourceLocation.fileName)}:{sourceLocation.lineNumber}
            {sourceLocation.columnNumber > 0 ? `:${sourceLocation.columnNumber}` : ''}
          </code>
        </div>
      )}

      <div className="picker-overlay__section">
        <Label>Attributes</Label>
        <div className="picker-overlay__chips">
          {Object.entries(attributes)
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <span key={k} className="picker-overlay__chip">
                <span className="picker-overlay__chip-key">{k}</span>
                <span className="picker-overlay__chip-separator">=</span>
                <span className="picker-overlay__chip-value">"{v}"</span>
              </span>
            ))}
        </div>
      </div>

      <div className="picker-overlay__section">
        <Label>Rect</Label>
        <div className="picker-overlay__rect">
          {Math.round(rect.width)}×{Math.round(rect.height)} @ ({Math.round(rect.left)}, {Math.round(rect.top)})
        </div>
      </div>
    </div>
  )
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="picker-overlay__label">{children}</div>
)

/** Shorten absolute file paths to just the last 3 segments */
function formatPath(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/')
  return parts.slice(-3).join('/')
}
