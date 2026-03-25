import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// ── FEATURES ─────────────────────────────────────
export function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const features = [
    { icon: '🎯', title: 'Real-Time Detection', desc: 'Sub-200ms inference on live CCTV streams. Frame-level accuracy.' },
    { icon: '📊', title: 'Risk Scoring', desc: 'Dynamic risk score per worker. Pattern-based, not binary.' },
    { icon: '🗺', title: 'Zone-Based Alerts', desc: 'Different PPE rules enforced per physical zone automatically.' },
    { icon: '⏱', title: 'Temporal Tracking', desc: 'Behavioural patterns over time — not just single-frame analysis.' },
    { icon: '💡', title: 'Lighting Adaptive', desc: 'Reliable inference in dark, dim, or overexposed environments.' },
    { icon: '🔒', title: 'Privacy First', desc: 'Zero facial recognition. Workers are anonymous. Always.' },
    { icon: '⚡', title: 'Edge Deployable', desc: 'Runs on-device. No cloud dependency for core detection.' },
    { icon: '🔔', title: 'Multi-Channel Alerts', desc: 'Dashboard, SMS, alarm, and webhook integrations built-in.' },
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

// ── ANALYTICS ─────────────────────────────────────
export function AnalyticsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const complianceData = [82, 88, 76, 91, 87, 94, 89, 96, 92, 97, 93, 98]
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

  const violations = [
    { id: 'W-02', time: '14:32:11', type: 'Missing Helmet', sev: 'HIGH' },
    { id: 'W-07', time: '14:28:44', type: 'No Safety Vest', sev: 'CRITICAL' },
    { id: 'W-11', time: '14:21:05', type: 'Missing Helmet', sev: 'HIGH' },
    { id: 'W-04', time: '14:15:30', type: 'No Gloves', sev: 'MED' },
    { id: 'W-09', time: '14:08:17', type: 'Missing Helmet', sev: 'HIGH' },
  ]

  return (
    <section className="section analytics-section" ref={ref}>
      <div className="analytics-layout">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: 48 }}
        >
          <div className="section-label">Analytics</div>
          <h2 className="section-title-xl">Compliance<br />at a <em>glance</em></h2>
        </motion.div>

        <div className="kpi-row">
          {[
            { v: '94.2', suf: '%', label: 'Compliance Rate', delta: '↑ +2.1% this month' },
            { v: '47', suf: '', label: 'Active Workers', delta: '● Live count' },
            { v: '3', suf: '', label: 'Violations Today', delta: '↓ 40% vs yesterday' },
            { v: '1.8', suf: 'min', label: 'Avg Response', delta: '↓ 12% improvement' },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              className="kpi-card"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 + 0.2 }}
            >
              <div className="kpi-value">
                {k.v}<span>{k.suf}</span>
              </div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-delta">{k.delta}</div>
            </motion.div>
          ))}
        </div>

        <div className="chart-log-grid">
          <motion.div
            className="glass-panel"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="panel-title">Compliance Rate — 2025</div>
            <div className="chart-bars">
              {complianceData.map((v, i) => (
                <div key={i} className="chart-bar-wrap">
                  <motion.div
                    className="chart-bar"
                    initial={{ height: 0 }}
                    animate={inView ? { height: `${v}%` } : {}}
                    transition={{ delay: i * 0.04 + 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      background: v >= 90
                        ? 'linear-gradient(to top, #00C48C, rgba(0,196,140,0.5))'
                        : v >= 80
                        ? 'linear-gradient(to top, #1A56FF, rgba(26,86,255,0.5))'
                        : 'linear-gradient(to top, #FF6B1A, rgba(255,107,26,0.5))',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', marginTop: 8 }}>
              {months.map((m, i) => (
                <span key={i} className="chart-month" style={{ flex: 1, textAlign: 'center' }}>{m}</span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="glass-panel"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="panel-title">Recent Violations</div>
            {violations.map((v, i) => (
              <div key={i} className="violation-row">
                <span className="v-id">{v.id}</span>
                <span className="v-time">{v.time}</span>
                <span className="v-type">{v.type}</span>
                <span className={`severity-badge sev-${v.sev.toLowerCase()}`}>{v.sev}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────
export function CTASection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

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
          <button className="btn-primary" onClick={() => window.location.href = '/dashboard'}>
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
        SAFEGUARD<span style={{ color: '#FF6B1A' }}>AI</span>
      </div>
      <div className="footer-copy">© 2025 SafeGuardAI · Real-Time PPE Compliance Monitoring System</div>
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