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
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 2147483647,
        background: 'rgba(15, 16, 17, 0.97)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 10,
        padding: '12px 14px',
        minWidth: 260,
        maxWidth: 420,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        pointerEvents: 'none',
        fontFamily: '"Geist Variable", -apple-system, system-ui, sans-serif',
        fontSize: 12,
        lineHeight: 1.5,
        color: '#f7f8f8',
      }}
      className={className}
      aria-hidden
    >
      {/* Selector */}
      <div style={{ marginBottom: 8 }}>
        <Label>Selector</Label>
        <code
          style={{
            display: 'block',
            color: '#5e6ad2',
            wordBreak: 'break-all',
            fontFamily: '"Geist Mono", "SF Mono", monospace',
            fontSize: 11,
          }}
        >
          {selector}
        </code>
      </div>

      {/* Source location */}
      {sourceLocation && (
        <div style={{ marginBottom: 8 }}>
          <Label>Source</Label>
          <code
            style={{
              display: 'block',
              color: '#a1a1aa',
              wordBreak: 'break-all',
              fontFamily: '"Geist Mono", "SF Mono", monospace',
              fontSize: 11,
            }}
          >
            {formatPath(sourceLocation.fileName)}:{sourceLocation.lineNumber}
            {sourceLocation.columnNumber > 0 ? `:${sourceLocation.columnNumber}` : ''}
          </code>
        </div>
      )}

      {/* Attributes */}
      <div style={{ marginBottom: 8 }}>
        <Label>Attributes</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {Object.entries(attributes)
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <span
                key={k}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  fontSize: 11,
                  fontFamily: '"Geist Mono", monospace',
                }}
              >
                <span style={{ color: '#62666d' }}>{k}</span>
                <span style={{ color: '#f7f8f8' }}>=</span>
                <span style={{ color: '#a1a1aa', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  "{v}"
                </span>
              </span>
            ))}
        </div>
      </div>

      {/* Rect */}
      <div>
        <Label>Rect</Label>
        <div style={{ color: '#62666d', fontFamily: '"Geist Mono", monospace', fontSize: 11, marginTop: 2 }}>
          {Math.round(rect.width)}×{Math.round(rect.height)} @ ({Math.round(rect.left)}, {Math.round(rect.top)})
        </div>
      </div>
    </div>
  )
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.06em',
      color: '#62666d',
      textTransform: 'uppercase',
      marginBottom: 2,
    }}
  >
    {children}
  </div>
)

/** Shorten absolute file paths to just the last 3 segments */
function formatPath(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/')
  return parts.slice(-3).join('/')
}
