import { useEffect, useState } from 'react'
import { ShoppingCart, Zap, Shield, Star, ArrowRight } from 'lucide-react'
import { Toolbar } from '@/components/Toolbar'
import { VibePicker } from '@/components/VibePicker'
import type { PickerStatus } from 'react-vite-dev-element-pick'

type ThemeMode = 'light' | 'dark'

const NAV_ITEMS = ['Product Tour', 'Platform', 'Customers', 'About', 'Resources', 'Log In']
const FOOTER_ITEMS = ['Product', 'Pricing', 'About', 'Blog', 'Privacy']
const FEATURE_CARDS = [
  {
    icon: <ShoppingCart size={18} strokeWidth={2} />,
    title: 'Real-time guidance',
    description:
      'Understand shopper intent as it forms and surface the exact product they need before they ask.',
  },
  {
    icon: <Zap size={18} strokeWidth={2} />,
    title: 'Instant personalisation',
    description:
      'Every recommendation adapts to browsing history, cart contents, and live behaviour signals.',
  },
  {
    icon: <Shield size={18} strokeWidth={2} />,
    title: 'Always on brand',
    description:
      'Train Dialog on your catalogue, tone of voice, and rules. It never goes off-script.',
  },
]
const STATS = [
  { value: '10,000+', label: 'Shoppers guided daily' },
  { value: '94%', label: 'Satisfaction rate' },
  { value: '<2s', label: 'Average response time' },
]

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

/**
 * Demo application for the Vibe Coding element-picker interaction.
 *
 * Layout:
 * - `Toolbar` (fixed) — controls theme mode and edit mode
 * - `VibePicker` wrapper — provides element selection in edit mode
 * - Website content — a mock AI-generated landing page for "Dialog"
 */
export default function App() {
  const [isEditing, setIsEditing] = useState(false)
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark')
  const status: PickerStatus = isEditing ? 'active' : 'inactive'

  useEffect(() => {
    document.body.dataset.theme = themeMode
  }, [themeMode])

  return (
    <div className="app-shell">
      <Toolbar
        isEditing={isEditing}
        onToggle={() => setIsEditing((v) => !v)}
        themeMode={themeMode}
        onThemeToggle={() => setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))}
      />
      <VibePicker status={status}>
        <div className="marketing-canvas">
          <nav className="site-header">
            <div className="site-header__brand">
              <div className="site-header__brand-mark">
                <ShoppingCart size={14} strokeWidth={2.5} />
              </div>
              <span className="site-header__brand-name">Dialog</span>
            </div>

            <div className="site-header__nav">
              {NAV_ITEMS.map((item) => (
                <a key={item} href="#" className="site-header__link">
                  {item}
                </a>
              ))}
            </div>

            <button type="button" className="site-header__cta">
              Book a demo
            </button>
          </nav>

          <section className="hero">
            <div className="hero__eyebrow">
              <span className="hero__eyebrow-dot" />
              <span className="hero__eyebrow-text">AI-Powered Shopping</span>
            </div>

            <h1 className="hero__title">The AI shopping agent that boosts your sales</h1>

            <p className="hero__subtitle">
              Guide shoppers in real time, like you would in store. Understand intent, surface the
              right products, and convert at every step.
            </p>

            <div className="hero__actions">
              <div className="hero__form">
                <input
                  type="email"
                  placeholder="yourname@company.com"
                  className="hero__input"
                />
                <button type="button" className="hero__primary-action">
                  Book demo
                </button>
              </div>

              <button type="button" className="hero__secondary-action">
                See how it works <ArrowRight size={14} />
              </button>
            </div>

            <div className="hero__social-proof">
              <div className="hero__rating">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} size={14} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span className="hero__social-copy">4.9 / 5 · Trusted by 500+ ecommerce teams</span>
            </div>
          </section>

          <section className="feature-section">
            <div className="feature-section__inner">
              <div className="section-heading">
                <p className="section-heading__eyebrow">Features</p>
                <h2 className="section-heading__title">Built for the way you actually sell</h2>
              </div>

              <div className="feature-grid">
                {FEATURE_CARDS.map((card) => (
                  <article key={card.title} className="feature-card">
                    <div className="feature-card__icon">{card.icon}</div>
                    <h3 className="feature-card__title">{card.title}</h3>
                    <p className="feature-card__description">{card.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="stats-section">
            <div className="stats-section__inner">
              <div className="stats-grid">
                {STATS.map((stat) => (
                  <div key={stat.label} className="stats-grid__item">
                    <div className="stats-grid__value">{stat.value}</div>
                    <div className="stats-grid__label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="testimonial">
            <div className="testimonial__inner">
              <blockquote className="testimonial__quote">
                &quot;Dialog understands our customers better than most of our human agents. It
                &rsquo;s not just automation, it actually sells.&quot;
              </blockquote>
              <p className="testimonial__author">— Sarah Kim, Head of eCommerce · Finesse</p>
            </div>
          </section>

          <footer className="site-footer">
            <div className="site-footer__brand">
              <div className="site-footer__brand-mark">
                <ShoppingCart size={11} strokeWidth={2.5} />
              </div>
              <span className="site-footer__brand-name">Dialog</span>
            </div>

            <nav className="site-footer__nav">
              {FOOTER_ITEMS.map((item) => (
                <a key={item} href="#" className="site-footer__link">
                  {item}
                </a>
              ))}
            </nav>

            <p className="site-footer__copyright">© 2025 Dialog Inc.</p>
          </footer>
        </div>
      </VibePicker>
    </div>
  )
}
