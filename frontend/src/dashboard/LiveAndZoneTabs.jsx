import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        background: 'rgba(8,8,8,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '10px 14px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      }}
    >
      {label ? <div style={{ color: 'rgba(240,237,232,0.5)', marginBottom: 6 }}>{label}</div> : null}
      {payload.map((item) => (
        <div key={item.name} style={{ color: item.color || '#F0EDE8' }}>
          {item.name}: <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  )
}

function Panel({ title, eyebrow, children, minHeight }) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: 18,
        minHeight,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {eyebrow ? (
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(240,237,232,0.28)',
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: 15,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#F0EDE8',
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

export function AreaInsightsTab({ alarmData }) {
  const rooms = alarmData?.locationData ?? []
  const typeBreakdown = alarmData?.typeBreakdown ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: 18,
        }}
      >
        <Panel title="Room Frequency Matrix" eyebrow="Hotspots" minHeight={360}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rooms} barCategoryGap={18}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="location" tick={{ fill: 'rgba(240,237,232,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(240,237,232,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="fire" name="Fire" fill="#FF5A36" radius={[5, 5, 0, 0]} />
              <Bar dataKey="fall" name="Fall" fill="#FFB703" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Alert Type Split" eyebrow="Composition" minHeight={360}>
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={3}
                  stroke="rgba(5,5,5,0.9)"
                >
                  {typeBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {typeBreakdown.map((entry) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: entry.color,
                    boxShadow: `0 0 16px ${entry.color}`,
                  }}
                />
                <span style={{ flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: 'rgba(240,237,232,0.72)' }}>
                  {entry.name}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#F0EDE8' }}>{entry.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}
      >
        {rooms.map((room, index) => (
          <motion.div
            key={room.location}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              borderRadius: 10,
              padding: 18,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
              border: '1px solid rgba(255,255,255,0.07)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  room.fire > room.fall
                    ? 'radial-gradient(circle at top right, rgba(255,90,54,0.18), transparent 40%)'
                    : 'radial-gradient(circle at top right, rgba(255,183,3,0.18), transparent 40%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, letterSpacing: '0.05em', color: '#F0EDE8' }}>
                    {room.location}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(240,237,232,0.25)',
                    }}
                  >
                    Rank #{room.rank}
                  </div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: '#FF6B1A' }}>{room.total}</div>
              </div>

              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
                <div
                  style={{
                    width: `${Math.min(room.share, 100)}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #FF5A36 0%, #FFB703 100%)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                <StatLine label="Fire" value={room.fire} color="#FF5A36" />
                <StatLine label="Fall" value={room.fall} color="#FFB703" />
                <StatLine label="Share" value={`${room.share}%`} color="#7C5CFF" />
                <StatLine label="Latest" value={room.latestLabel} color="#00C48C" mono />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function StatLine({ label, value, color, mono = false }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(240,237,232,0.3)',
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: mono ? "'JetBrains Mono', monospace" : "'Barlow Condensed', sans-serif",
          fontSize: mono ? 10 : 18,
          fontWeight: mono ? 400 : 600,
          color,
        }}
      >
        {value}
      </div>
    </div>
  )
}
