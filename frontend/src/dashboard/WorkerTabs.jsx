import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
  Area,
} from 'recharts'
import { COMPLIANCE_TREND } from '../lib/mockData'

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'rgba(8,8,8,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        padding: '10px 14px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      }}
    >
      {label ? <div style={{ color: 'rgba(240,237,232,0.5)', marginBottom: 6 }}>{label}</div> : null}
      {payload.map((point) => (
        <div key={point.name} style={{ color: point.color || '#F0EDE8' }}>
          {point.name}: <strong>{point.value}{point.name === 'rate' ? '%' : ''}</strong>
        </div>
      ))}
    </div>
  )
}

export function ViolationsTab({ violationData }) {
  const [filter, setFilter] = useState('all')
  const rows = violationData?.rows ?? []
  const hourlyTrend = violationData?.hourlyTrend ?? []
  const dailyTrend = violationData?.dailyTrend ?? []
  const breakdown = violationData?.breakdown ?? []
  const summary = violationData?.summary ?? {
    totalLogs: 0,
    uniqueViolations: 0,
    topViolation: 'None',
    topViolationCount: 0,
  }

  const helmetCount = useMemo(() => rows.filter((row) => /helmet/i.test(row.violation)).length, [rows])
  const vestCount = useMemo(() => rows.filter((row) => /vest/i.test(row.violation)).length, [rows])

  const filterOptions = useMemo(
    () => [
      { key: 'all', label: 'All' },
      { key: 'helmet', label: 'Helmet' },
      { key: 'vest', label: 'Vest' },
      ...breakdown.slice(0, 2).map((entry) => ({ key: entry.name, label: entry.name })),
    ],
    [breakdown]
  )

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filter === 'all') return true
      if (filter === 'helmet') return /helmet/i.test(row.violation)
      if (filter === 'vest') return /vest/i.test(row.violation)
      return row.violation === filter
    })
  }, [filter, rows])

  const peakHour = useMemo(() => {
    const best = hourlyTrend.reduce((currentBest, row) => {
      if (!currentBest || row.count > currentBest.count) return row
      return currentBest
    }, null)
    return best?.label ?? 'NA'
  }, [hourlyTrend])

  const safetyBreakdown = useMemo(() => {
    const unsafe = rows.length
    return [
      { name: 'Helmet', value: helmetCount, color: '#FFB703' },
      { name: 'Vest', value: vestCount, color: '#FF5A36' },
      { name: 'Unsafe', value: unsafe, color: '#FF2D55' },
    ]
  }, [helmetCount, rows.length, vestCount])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {violationData?.error ? (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgba(255,45,85,0.28)',
            background: 'rgba(255,45,85,0.08)',
            color: '#FF8AA1',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.04em',
          }}
        >
          Supabase logs could not be loaded: {violationData.error}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        <LogStat label="Total Logs" value={summary.totalLogs} color="#FF6B1A" />
        <LogStat label="Violation Types" value={summary.uniqueViolations} color="#FF2D55" />
        <LogStat label="Helmet Cases" value={helmetCount} color="#FFB703" />
        <LogStat label="Vest Cases" value={vestCount} color="#7C5CFF" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 20 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,232,0.5)', marginBottom: 18 }}>
            Daily Violation Trend
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: 'rgba(240,237,232,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: 'rgba(240,237,232,0.3)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="count" name="logs" stroke="#FF6B1A" strokeWidth={2.5} dot={{ r: 3, fill: '#FF6B1A' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 20 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,232,0.5)', marginBottom: 18 }}>
            Violation Mix Snapshot
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', alignItems: 'center', gap: 8 }}>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3} stroke="rgba(5,5,5,0.9)">
                    {breakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <LogStat label="Total Logs" value={summary.totalLogs} color="#FF6B1A" />
              <LogStat label="Top Violation" value={summary.topViolation} color="#FF5A36" mono />
              <LogStat label="Top Count" value={summary.topViolationCount} color="#FFB703" />
              <LogStat label="Peak Hour" value={peakHour} color="#7C5CFF" mono />
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 20 }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,232,0.5)', marginBottom: 18 }}>
          Hourly Log Distribution
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={hourlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: 'rgba(240,237,232,0.3)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: 'rgba(240,237,232,0.3)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="count" name="logs" stroke="#FF2D55" strokeWidth={3} dot={{ r: 4, fill: '#FF2D55' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 16 }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 4,
          }}
        >
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '0 20px',
          }}
        >
          {filterOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key)}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: filter === option.key ? '2px solid #FF6B1A' : '2px solid transparent',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: filter === option.key ? '#F0EDE8' : 'rgba(240,237,232,0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: -1,
              }}
            >
              {option.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(240,237,232,0.2)' }}>
            {filteredRows.length} records
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '90px 120px 100px 1fr',
            gap: 8,
            padding: '10px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(240,237,232,0.25)',
          }}
        >
          <span>Log ID</span>
          <span>Date</span>
          <span>Time</span>
          <span>Violation</span>
        </div>

          {filteredRows.map((row, index) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 120px 100px 1fr',
                gap: 8,
                padding: '12px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(240,237,232,0.4)' }}>{row.id}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(240,237,232,0.35)' }}>{row.date}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(240,237,232,0.3)' }}>{row.time}</span>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                  color: /helmet/i.test(row.violation) ? '#FFB703' : '#FF5A36',
                }}
              >
                {row.violation}
              </span>
            </motion.div>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 20 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,232,0.5)', marginBottom: 18 }}>
            Gear Split
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={safetyBreakdown} dataKey="value" nameKey="name" innerRadius={46} outerRadius={82} paddingAngle={3} stroke="rgba(5,5,5,0.9)">
                  {safetyBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {safetyBreakdown.map((entry) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color }} />
                <span style={{ flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: 'rgba(240,237,232,0.72)' }}>{entry.name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#F0EDE8' }}>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LogStat({ label, value, color, mono = false }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,237,232,0.3)', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontFamily: mono ? "'JetBrains Mono', monospace" : "'Bebas Neue', sans-serif", fontSize: mono ? 11 : 30, color }}>
        {value}
      </div>
    </div>
  )
}

export function AnalyticsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em', color: '#FF6B1A', marginBottom: 8 }}>
          ANALYTICS & TRENDS
        </div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: '0.04em', color: '#F0EDE8', lineHeight: 1 }}>
          FULL YEAR REPORT
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: 24 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,232,0.5)', marginBottom: 20 }}>
            Compliance vs Violations
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={COMPLIANCE_TREND} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: 'rgba(240,237,232,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: 'rgba(240,237,232,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: 'rgba(240,237,232,0.3)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="rate" name="rate" stroke="#1A56FF" strokeWidth={2} fill="rgba(26,86,255,0.08)" dot={false} />
              <Bar yAxisId="right" dataKey="violations" name="violations" fill="#FF2D55" fillOpacity={0.6} radius={[2, 2, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: 24 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,232,0.5)', marginBottom: 20 }}>
            Monthly Worker Count
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={COMPLIANCE_TREND} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: 'rgba(240,237,232,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: 'rgba(240,237,232,0.3)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="workers" name="workers" stroke="#FF6B1A" strokeWidth={2} dot={{ fill: '#FF6B1A', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Avg Compliance', value: '90.3%', note: 'Full year 2025', color: '#1A56FF' },
          { label: 'Total Violations', value: '257', note: '-18% vs 2024', color: '#FF2D55' },
          { label: 'Peak Workers', value: '53', note: 'December 2025', color: '#FF6B1A' },
          { label: 'Best Month', value: 'Dec', note: '98% compliance', color: '#00C48C' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.3 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderTop: `2px solid ${stat.color}`,
              padding: 20,
              borderRadius: 4,
            }}
          >
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: '0.02em', color: '#F0EDE8', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,237,232,0.4)', marginTop: 6 }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: stat.color, marginTop: 6 }}>
              {stat.note}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
