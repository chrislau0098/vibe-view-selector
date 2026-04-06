import { useState } from 'react'
import { ShoppingCart, Zap, Shield, Star, ArrowRight } from 'lucide-react'
import { Toolbar } from '@/components/Toolbar'
import { VibePicker } from '@/components/VibePicker'
import type { PickerStatus } from 'react-vite-dev-element-pick'

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

/**
 * Demo application for the Vibe Coding element-picker interaction.
 *
 * Layout:
 * - `Toolbar` (fixed, dark) — controls edit mode on/off
 * - `VibePicker` wrapper — provides element selection in edit mode
 * - Website content (light mode) — a mock AI-generated landing page for "Dialog"
 *
 * The website content is light-mode to match the reference design where the AI
 * generates a standard white-background landing page that the user then edits.
 */
export default function App() {
  const [isEditing, setIsEditing] = useState(false)
  const status: PickerStatus = isEditing ? 'active' : 'inactive'

  return (
    <div
      style={{
        background: '#f0f0ee',
        minHeight: '100vh',
        fontFamily: '"Geist Variable", -apple-system, "SF Pro Display", system-ui, sans-serif',
      }}
    >
      {/* ── Fixed toolbar (dark chrome) ── */}
      <Toolbar isEditing={isEditing} onToggle={() => setIsEditing((v) => !v)} />

      {/* ── VibePicker wraps the entire website canvas ── */}
      <VibePicker status={status}>

        {/* ── Website content (light mode) ── */}
        <div
          className="website-canvas"
          style={{
            paddingTop: 48,
            background: '#ffffff',
            minHeight: 'calc(100vh - 48px)',
            color: '#111827',
          }}
        >

          {/* ════════════════════════════════════════
              NAVBAR
          ════════════════════════════════════════ */}
          <nav
            className="site-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 40px',
              height: 60,
              borderBottom: '1px solid rgba(0,0,0,0.07)',
              position: 'sticky',
              top: 48,
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100,
            }}
          >
            {/* Brand */}
            <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: '#1456F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingCart size={14} color="#fff" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>
                Dialog
              </span>
            </div>

            {/* Nav links */}
            <div className="nav-links" style={{ display: 'flex', gap: 32 }}>
              {['Product Tour', 'Platform', 'Customers', 'About', 'Resources', 'Log In'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="nav-link"
                  style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none', fontWeight: 400 }}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA */}
            <button
              className="nav-cta"
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: '#1456F0',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Book a demo
            </button>
          </nav>

          {/* ════════════════════════════════════════
              HERO
          ════════════════════════════════════════ */}
          <section
            className="hero-section"
            style={{
              maxWidth: 960,
              margin: '0 auto',
              padding: '80px 40px 64px',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {/* Eyebrow badge */}
            <div
              className="hero-eyebrow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 100,
                background: 'rgba(20, 86, 240, 0.08)',
                border: '1px solid rgba(20, 86, 240, 0.18)',
                width: 'fit-content',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#1456F0',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#1456F0', letterSpacing: '0.04em' }}>
                AI-POWERED SHOPPING
              </span>
            </div>

            {/* Headline */}
            <h1
              className="hero-title"
              style={{
                fontSize: 'clamp(40px, 5vw, 62px)',
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: '-1.5px',
                color: '#0a0a0a',
                margin: 0,
                maxWidth: 680,
              }}
            >
              The AI shopping agent that boosts your sales
            </h1>

            {/* Subtitle */}
            <p
              className="hero-subtitle"
              style={{
                fontSize: 18,
                color: '#6b7280',
                lineHeight: 1.65,
                margin: 0,
                maxWidth: 520,
              }}
            >
              Guide shoppers in real time, like you would in store. Understand
              intent, surface the right products, and convert at every step.
            </p>

            {/* CTA row */}
            <div className="hero-cta" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <div
                className="email-input-group"
                style={{
                  display: 'flex',
                  gap: 0,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.12)',
                }}
              >
                <input
                  type="email"
                  placeholder="yourname@company.com"
                  className="email-input"
                  style={{
                    padding: '11px 16px',
                    fontSize: 14,
                    border: 'none',
                    outline: 'none',
                    width: 220,
                    color: '#111827',
                    background: '#fafaf8',
                  }}
                />
                <button
                  className="cta-primary"
                  style={{
                    padding: '11px 20px',
                    background: '#f97316',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Book demo
                </button>
              </div>

              <button
                className="cta-secondary"
                style={{
                  padding: '11px 18px',
                  background: 'transparent',
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 500,
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                See how it works <ArrowRight size={14} />
              </button>
            </div>

            {/* Social proof */}
            <div
              className="social-proof"
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}
            >
              <div className="star-rating" style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span style={{ fontSize: 13, color: '#9ca3af' }}>
                4.9 / 5 · Trusted by 500+ ecommerce teams
              </span>
            </div>
          </section>

          {/* ════════════════════════════════════════
              FEATURES
          ════════════════════════════════════════ */}
          <section
            className="features-section"
            style={{
              background: '#fafaf8',
              padding: '72px 40px',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              <div style={{ marginBottom: 48, maxWidth: 560 }}>
                <p
                  className="section-eyebrow"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#1456F0',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 10,
                    margin: '0 0 10px',
                  }}
                >
                  Features
                </p>
                <h2
                  className="section-title"
                  style={{
                    fontSize: 32,
                    fontWeight: 600,
                    letterSpacing: '-0.5px',
                    color: '#0a0a0a',
                    margin: 0,
                  }}
                >
                  Built for the way you actually sell
                </h2>
              </div>

              <div
                className="features-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}
              >
                {[
                  {
                    icon: <ShoppingCart size={18} color="#1456F0" strokeWidth={2} />,
                    title: 'Real-time guidance',
                    description:
                      'Understand shopper intent as it forms and surface the exact product they need — before they ask.',
                  },
                  {
                    icon: <Zap size={18} color="#1456F0" strokeWidth={2} />,
                    title: 'Instant personalisation',
                    description:
                      'Every recommendation adapts to browsing history, cart contents, and live behaviour signals.',
                  },
                  {
                    icon: <Shield size={18} color="#1456F0" strokeWidth={2} />,
                    title: 'Always on brand',
                    description:
                      'Train Dialog on your catalogue, tone of voice, and rules. It never goes off-script.',
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="feature-card"
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 12,
                      padding: '28px 24px',
                    }}
                  >
                    <div
                      className="feature-icon"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(20, 86, 240, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      {card.icon}
                    </div>
                    <h3
                      className="feature-title"
                      style={{ fontSize: 16, fontWeight: 600, color: '#0a0a0a', margin: '0 0 8px' }}
                    >
                      {card.title}
                    </h3>
                    <p
                      className="feature-description"
                      style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}
                    >
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              STATS
          ════════════════════════════════════════ */}
          <section
            className="stats-section"
            style={{ padding: '64px 40px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div
              style={{
                maxWidth: 960,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 40,
              }}
            >
              {[
                { value: '10,000+', label: 'Shoppers guided daily' },
                { value: '94%', label: 'Satisfaction rate' },
                { value: '<2s', label: 'Average response time' },
              ].map((stat) => (
                <div key={stat.label} className="stat-item" style={{ textAlign: 'center' }}>
                  <div
                    className="stat-value"
                    style={{
                      fontSize: 40,
                      fontWeight: 600,
                      color: '#0a0a0a',
                      letterSpacing: '-1px',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="stat-label" style={{ fontSize: 14, color: '#9ca3af', marginTop: 8 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ════════════════════════════════════════
              TESTIMONIAL
          ════════════════════════════════════════ */}
          <section
            className="testimonial-section"
            style={{
              padding: '72px 40px',
              background: '#fafaf8',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              textAlign: 'center',
            }}
          >
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
              <blockquote
                className="testimonial-quote"
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: '#111827',
                  lineHeight: 1.55,
                  margin: '0 0 24px',
                }}
              >
                "Dialog understands our customers better than most of our human agents.
                It's not just automation — it actually sells."
              </blockquote>
              <p className="testimonial-author" style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                — Sarah Kim, Head of eCommerce · Finesse
              </p>
            </div>
          </section>

          {/* ════════════════════════════════════════
              FOOTER
          ════════════════════════════════════════ */}
          <footer
            className="site-footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '32px 40px',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  background: '#1456F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingCart size={11} color="#fff" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Dialog</span>
            </div>

            <nav className="footer-nav" style={{ display: 'flex', gap: 24 }}>
              {['Product', 'Pricing', 'About', 'Blog', 'Privacy'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="footer-link"
                  style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none' }}
                >
                  {item}
                </a>
              ))}
            </nav>

            <p style={{ fontSize: 12, color: '#d1d5db', margin: 0 }}>© 2025 Dialog Inc.</p>
          </footer>

        </div>
        {/* end website-canvas */}

      </VibePicker>
    </div>
  )
}
