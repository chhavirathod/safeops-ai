import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// ── FEATURES ─────────────────────────────────────
export function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const features = [
    { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="11" stroke="white" strokeWidth="2"/><circle cx="14" cy="14" r="3" fill="white"/><line x1="14" y1="5" x2="14" y2="3" stroke="white" strokeWidth="2"/></svg>, title: 'Real-Time Detection', desc: 'Sub-200ms inference on live CCTV streams. Frame-level accuracy.' },
    { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="12" width="4" height="12" stroke="white" strokeWidth="2"/><rect x="12" y="6" width="4" height="18" stroke="white" strokeWidth="2"/><rect x="20" y="9" width="4" height="15" stroke="white" strokeWidth="2"/></svg>, title: 'Risk Scoring', desc: 'Dynamic risk score per worker. Pattern-based, not binary.' },
    { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4C19.523 4 24 8.477 24 14C24 19.523 19.523 24 14 24C8.477 24 4 19.523 4 14C4 8.477 8.477 4 14 4Z" stroke="white" strokeWidth="2"/><circle cx="14" cy="14" r="3" fill="white"/></svg>, title: 'Zone-Based Alerts', desc: 'Different PPE rules enforced per physical zone automatically.' },
    { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="10" stroke="white" strokeWidth="2"/><line x1="14" y1="14" x2="14" y2="8" stroke="white" strokeWidth="2"/><line x1="14" y1="14" x2="18" y2="14" stroke="white" strokeWidth="2"/></svg>, title: 'Temporal Tracking', desc: 'Behavioural patterns over time — not just single-frame analysis.' },
    { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4C14 4 8 10 8 16C8 20.418 10.686 24 14 24C17.314 24 20 20.418 20 16C20 10 14 4 14 4Z" stroke="white" strokeWidth="2"/><circle cx="14" cy="16" r="2" fill="white"/></svg>, title: 'Lighting Adaptive', desc: 'Reliable inference in dark, dim, or overexposed environments.' },
    { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="6" y="12" width="16" height="10" rx="2" stroke="white" strokeWidth="2"/><path d="M10 12V8C10 6.895 10.895 6 12 6H16C17.105 6 18 6.895 18 8V12" stroke="white" strokeWidth="2"/></svg>, title: 'Privacy First', desc: 'Zero facial recognition. Workers are anonymous. Always.' },
    { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 2L24 8V14C24 20.627 14 26 14 26C14 26 4 20.627 4 14V8L14 2Z" stroke="white" strokeWidth="2" fill="none"/></svg>, title: 'Edge Deployable', desc: 'Runs on-device. No cloud dependency for core detection.' },
    { icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4C14 4 9 6 9 12C9 16 12 20 14 24C16 20 19 16 19 12C19 6 14 4 14 4Z" stroke="white" strokeWidth="2"/><circle cx="14" cy="12" r="2" fill="white"/></svg>, title: 'Multi-Channel Alerts', desc: 'Dashboard, SMS, alarm, and webhook integrations built-in.' },
  ]

  return (
    <section className="section features-section" ref={ref} id="analytics">
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 0 }}
        >
          <div>
            <div className="section-label">Capabilities</div>
            <h2 className="section-title-xl">Built for<br />the <em>real world</em></h2>
          </div>
          <p className="section-body" style={{ maxWidth: 340, textAlign: 'right' }}>
            Seven layers of industrial intelligence. Engineered for reliability, not demos.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-cell"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07 + 0.2, duration: 0.5 }}
            >
              <span className="feature-icon">{f.icon}</span>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-accent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────
export function CTASection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const navigate = useNavigate()

  return (
    <section className="cta-section" ref={ref}>
      {/* Ambient light */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 800, height: 400,
        background: 'radial-gradient(ellipse, rgba(255,107,26,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <div className="cta-title">
          SAFER SITES<br />START WITH<br /><em>Smarter Systems</em>
        </div>
        <div className="cta-sub">Deploy in hours. Monitor forever.</div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.7 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 48 }}
        >
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
          <button className="btn-ghost">
            Request a Demo
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ── FOOTER ───────────────────────────────────────
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ marginRight: 8 }}>
          <path d="M10 1L18 5.5V14.5L10 19L2 14.5V5.5L10 1Z" stroke="#FF6B1A" strokeWidth="1.5" fill="none"/>
          <circle cx="10" cy="10" r="3" fill="#FF6B1A"/>
        </svg>
        SAFEOPS<span style={{ color: '#FF6B1A' }}>AI</span>
      </div>
      <div className="footer-copy">© 2025 SafeOpsAI · Real-Time PPE Compliance Monitoring System</div>
      <div style={{ display: 'flex', gap: 24 }}>
        {['Privacy', 'Terms', 'Contact'].map(l => (
          <span key={l} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'rgba(240,237,232,0.25)',
            cursor: 'pointer',
          }}>{l}</span>
        ))}
      </div>
    </footer>
  )
}
