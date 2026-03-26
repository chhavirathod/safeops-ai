import { isSupabaseConfigured, supabase } from './supabase'

const DEFAULT_TABLE_NAME = import.meta.env.VITE_PPE_LOGS_TABLE || 'logs'

const MOCK_LOGS = [
  { id: 1, date: '2026-03-01', time: '08:00:00', violation: 'No Safety Vest' },
  { id: 2, date: '2026-03-01', time: '08:15:00', violation: 'Missing Helmet' },
  { id: 3, date: '2026-03-01', time: '08:30:00', violation: 'Missing Helmet' },
  { id: 4, date: '2026-03-01', time: '08:45:00', violation: 'Missing Helmet' },
  { id: 5, date: '2026-03-01', time: '09:00:00', violation: 'No Safety Vest' },
  { id: 6, date: '2026-03-01', time: '09:15:00', violation: 'No Safety Vest' },
  { id: 7, date: '2026-03-01', time: '09:30:00', violation: 'Missing Helmet' },
  { id: 8, date: '2026-03-01', time: '09:45:00', violation: 'No Safety Vest' },
  { id: 9, date: '2026-03-01', time: '10:00:00', violation: 'Missing Helmet' },
]

function normalizeViolationLabel(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : 'Unknown Violation'
}

function parseDateTime(row) {
  if (row.date && row.time) {
    return new Date(`${row.date}T${row.time}`)
  }

  if (row.created_at) {
    return new Date(row.created_at)
  }

  return null
}

function formatDate(dateValue) {
  if (!dateValue || Number.isNaN(dateValue.getTime())) return 'Unknown'
  return dateValue.toLocaleDateString('en-CA')
}

function formatTime(dateValue) {
  if (!dateValue || Number.isNaN(dateValue.getTime())) return 'Unknown'
  return dateValue.toLocaleTimeString('en-GB', { hour12: false })
}

function normalizeLog(row, index) {
  const timestamp = parseDateTime(row)
  const violation = normalizeViolationLabel(row.violation)

  return {
    id: row.ID ?? row.id ?? index + 1,
    date: row.date ?? formatDate(timestamp),
    time: row.time ?? formatTime(timestamp),
    violation,
    timestamp,
  }
}

function buildHourlyTrend(rows) {
  const buckets = new Map()

  rows.forEach((row) => {
    const hour = row.time === 'Unknown' ? 'Unknown' : row.time.slice(0, 2) + ':00'
    buckets.set(hour, (buckets.get(hour) ?? 0) + 1)
  })

  return Array.from(buckets.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }))
}

function buildDailyTrend(rows) {
  const buckets = new Map()

  rows.forEach((row) => {
    const key = row.date ?? 'Unknown'
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  })

  return Array.from(buckets.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }))
}

function buildViolationBreakdown(rows) {
  const buckets = new Map()

  rows.forEach((row) => {
    buckets.set(row.violation, (buckets.get(row.violation) ?? 0) + 1)
  })

  const palette = ['#FF5A36', '#FFB703', '#7C5CFF', '#00C48C', '#1A56FF']

  return Array.from(buckets.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([name, value], index) => ({
      name,
      value,
      color: palette[index % palette.length],
    }))
}

function buildSummary(rows, breakdown) {
  return {
    totalLogs: rows.length,
    uniqueViolations: breakdown.length,
    topViolation: breakdown[0]?.name ?? 'None',
    topViolationCount: breakdown[0]?.value ?? 0,
  }
}

function buildViolationDashboard(rows, source, tableName) {
  const normalized = rows.map(normalizeLog).sort((left, right) => {
    if (!left.timestamp && !right.timestamp) return 0
    if (!left.timestamp) return 1
    if (!right.timestamp) return -1
    return right.timestamp - left.timestamp
  })

  const breakdown = buildViolationBreakdown(normalized)

  return {
    source,
    tableName,
    error: null,
    rows: normalized,
    breakdown,
    hourlyTrend: buildHourlyTrend(normalized),
    dailyTrend: buildDailyTrend(normalized),
    summary: buildSummary(normalized, breakdown),
  }
}

export async function fetchViolationDashboard() {
  if (!isSupabaseConfigured || !supabase) {
    return buildViolationDashboard(MOCK_LOGS, 'mock', 'mock')
  }

  const { data, error } = await supabase
    .from(DEFAULT_TABLE_NAME)
    .select('*')
    .order('ID', { ascending: false })
    .limit(500)

  if (!error) {
    return buildViolationDashboard(Array.isArray(data) ? data : [], 'supabase', DEFAULT_TABLE_NAME)
  }

  return {
    ...buildViolationDashboard([], 'supabase-error', DEFAULT_TABLE_NAME),
    error: error.message || 'Could not load Supabase logs',
  }
}
