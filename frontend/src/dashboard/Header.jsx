import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/AuthContext'

const TAB_LABELS = {
  violations: 'Incident Logs',
  analytics: 'Analytics & Trends',
  zones: 'Alert Area Intelligence',
}

export default function DashboardHeader({ activeTab, detections, alarmData, violationData }) {
  const { user } = useAuth()
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const violations = detections?.persons?.filter((person) => person.violations.length > 0).length || 0
  const total = detections?.persons?.length || 0
  const compliance = total > 0 ? Math.round(((total - violations) / total) * 100) : 100
  const summary = alarmData?.summary ?? {
    fireCount: 0,
    fallCount: 0,
    affectedLocations: 0,
    hotspot: 'No hotspot',
    hotspotCount: 0,
  }
  const violationSummary = violationData?.summary ?? {
    totalLogs: 0,
    uniqueViolations: 0,
    topViolation: 'None',
    topViolationCount: 0,
  }

  const isAlarmTab = activeTab === 'zones'
  const isViolationTab = activeTab === 'violations'

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        height: isAlarmTab ? 72 : 60,
        background: 'rgba(8,8,8,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        gap: 24,
        flexShrink: 0,
        backdropFilter: isAlarmTab ? 'blur(14px)' : 'blur(10px)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#F0EDE8',
          }}
        >
          {TAB_LABELS[activeTab]}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.15em',
            color: 'rgba(240,237,232,0.25)',
            marginTop: 1,
          }}
        >
          {dateStr}
        </div>
      </div>

      {isAlarmTab ? (
        <>
          <MetricChip color="#FF5A36" label={`${summary.fireCount} FIRE ALERTS`} />
          <MetricChip color="#FFB703" label={`${summary.fallCount} FALL ALERTS`} />
          <MetricChip color="#7C5CFF" label={`${summary.affectedLocations} AREAS TRACKED`} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '7px 14px',
              minWidth: 220,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  color: 'rgba(240,237,232,0.28)',
                  textTransform: 'uppercase',
                }}
              >
                Hotspot
              </div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#F0EDE8',
                }}
              >
                {summary.hotspot}
              </div>
            </div>
            <div
              style={{
                marginLeft: 'auto',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                letterSpacing: '0.04em',
                color: '#FF6B1A',
              }}
            >
              {summary.hotspotCount}
            </div>
          </div>
        </>
      ) : isViolationTab ? (
        <>
          <MetricChip color="#FF6B1A" label={`${violationSummary.totalLogs} LOG ENTRIES`} />
          <MetricChip color="#FF2D55" label={`${violationSummary.uniqueViolations} VIOLATION TYPES`} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '7px 14px',
              minWidth: 240,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  color: 'rgba(240,237,232,0.28)',
                  textTransform: 'uppercase',
                }}
              >
                Top Violation
              </div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#F0EDE8',
                }}
              >
                {violationSummary.topViolation}
              </div>
            </div>
            <div
              style={{
                marginLeft: 'auto',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                letterSpacing: '0.04em',
                color: '#FF6B1A',
              }}
            >
              {violationSummary.topViolationCount}
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background:
                compliance >= 90
                  ? 'rgba(0,196,140,0.1)'
                  : compliance >= 75
                    ? 'rgba(255,184,0,0.1)'
                    : 'rgba(255,45,85,0.1)',
              border: `1px solid ${
                compliance >= 90
                  ? 'rgba(0,196,140,0.3)'
                  : compliance >= 75
                    ? 'rgba(255,184,0,0.3)'
                    : 'rgba(255,45,85,0.3)'
              }`,
              borderRadius: 6,
              padding: '6px 14px',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: compliance >= 90 ? '#00C48C' : compliance >= 75 ? '#FFB800' : '#FF2D55',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: compliance >= 90 ? '#00C48C' : compliance >= 75 ? '#FFB800' : '#FF2D55',
                letterSpacing: '0.1em',
              }}
            >
              {compliance}% COMPLIANT
            </span>
          </div>

          {violations > 0 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,45,85,0.12)',
                border: '1px solid rgba(255,45,85,0.35)',
                borderRadius: 6,
                padding: '6px 14px',
              }}
            >
              <span style={{ fontSize: 10 }}>⚠</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: '#FF2D55',
                  letterSpacing: '0.1em',
                }}
              >
                {violations} ACTIVE VIOLATION{violations > 1 ? 'S' : ''}
              </span>
            </motion.div>
          )}
        </>
      )}

      <LiveClock />

      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.12em',
          color: 'rgba(240,237,232,0.3)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          paddingLeft: 20,
        }}
      >
        {user?.user_metadata?.full_name?.split(' ')[0]?.toUpperCase() ||
          user?.email?.split('@')[0]?.toUpperCase() ||
          'SUPERVISOR'}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </motion.header>
  )
}

function MetricChip({ color, label }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: `${color}14`,
        border: `1px solid ${color}40`,
        borderRadius: 6,
        padding: '6px 14px',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 18px ${color}`,
          animation: 'pulse 1.5s infinite',
        }}
      />
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color,
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </span>
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13,
        letterSpacing: '0.1em',
        color: '#F0EDE8',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '4px 12px',
        borderRadius: 5,
      }}
    >
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
    </div>
  )
}
