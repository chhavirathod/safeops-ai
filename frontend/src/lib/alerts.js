import { isSupabaseConfigured, supabase } from './supabase'

const FIRE_COLOR = '#FF5A36'
const FALL_COLOR = '#FFB703'
const BOTH_COLOR = '#7C5CFF'
const UNKNOWN_COLOR = '#4D5B6A'

const MOCK_ALARMS = [
  { id: 'a1', location: 'Receiving Bay', is_fire: true, is_fall: false, created_at: hoursAgo(2) },
  { id: 'a2', location: 'Packing Line', is_fire: false, is_fall: true, created_at: hoursAgo(3) },
  { id: 'a3', location: 'Cold Storage', is_fire: true, is_fall: false, created_at: hoursAgo(5) },
  { id: 'a4', location: 'Cold Storage', is_fire: false, is_fall: true, created_at: hoursAgo(8) },
  { id: 'a5', location: 'Dispatch Gate', is_fire: false, is_fall: true, created_at: hoursAgo(12) },
  { id: 'a6', location: 'Receiving Bay', is_fire: true, is_fall: false, created_at: hoursAgo(20) },
  { id: 'a7', location: 'Packing Line', is_fire: true, is_fall: false, created_at: hoursAgo(26) },
  { id: 'a8', location: 'Maintenance', is_fire: false, is_fall: true, created_at: hoursAgo(28) },
  { id: 'a9', location: 'Maintenance', is_fire: false, is_fall: true, created_at: hoursAgo(34) },
  { id: 'a10', location: 'Dispatch Gate', is_fire: true, is_fall: false, created_at: hoursAgo(38) },
  { id: 'a11', location: 'Quality Lab', is_fire: true, is_fall: true, created_at: hoursAgo(44) },
  { id: 'a12', location: 'Receiving Bay', is_fire: false, is_fall: true, created_at: hoursAgo(50) },
  { id: 'a13', location: 'Quality Lab', is_fire: true, is_fall: false, created_at: hoursAgo(56) },
  { id: 'a14', location: 'Packing Line', is_fire: false, is_fall: true, created_at: hoursAgo(62) },
  { id: 'a15', location: 'Cold Storage', is_fire: true, is_fall: false, created_at: hoursAgo(70) },
]

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function startOfDay(date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function formatDay(date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
}

function formatHour(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
  }).format(date)
}

function titleCaseLocation(value) {
  if (!value || typeof value !== 'string') return 'Unknown Area'
  return value
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getIncidentType(row) {
  if (row.is_fire && row.is_fall) return 'Fire + Fall'
  if (row.is_fire) return 'Fire'
  if (row.is_fall) return 'Fall'
  return 'Unknown'
}

function getIncidentColor(type) {
  if (type === 'Fire') return FIRE_COLOR
  if (type === 'Fall') return FALL_COLOR
  if (type === 'Fire + Fall') return BOTH_COLOR
  return UNKNOWN_COLOR
}

function normalizeAlarm(row, index) {
  const createdAt = row.created_at ? new Date(row.created_at) : null
  const type = getIncidentType(row)
  const location = titleCaseLocation(row.location)
  const severity =
    type === 'Fire + Fall' ? 'Critical' : type === 'Fire' ? 'High' : type === 'Fall' ? 'Elevated' : 'Info'

  return {
    id: row.id ?? `alarm-${index + 1}`,
    location,
    isFire: Boolean(row.is_fire),
    isFall: Boolean(row.is_fall),
    type,
    color: getIncidentColor(type),
    severity,
    createdAt,
    createdAtLabel: createdAt
      ? createdAt.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Timestamp unavailable',
  }
}

function buildTrendData(events) {
  const withTimestamps = events.filter((event) => event.createdAt)
  if (withTimestamps.length === 0) {
    return []
  }

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = startOfDay(new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000))
    return {
      key: date.toISOString(),
      label: formatDay(date),
      incidents: 0,
      fire: 0,
      fall: 0,
    }
  })

  const lookup = new Map(days.map((day) => [day.key, day]))

  withTimestamps.forEach((event) => {
    const key = startOfDay(event.createdAt).toISOString()
    const bucket = lookup.get(key)
    if (!bucket) return
    bucket.incidents += 1
    if (event.isFire) bucket.fire += 1
    if (event.isFall) bucket.fall += 1
  })

  return days
}

function buildHourlyData(events) {
  const withTimestamps = events.filter((event) => event.createdAt)
  if (withTimestamps.length === 0) {
    return []
  }

  const hours = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(Date.now() - (5 - index) * 4 * 60 * 60 * 1000)
    start.setMinutes(0, 0, 0)
    return {
      start,
      label: formatHour(start),
      alerts: 0,
    }
  })

  hours.forEach((bucket, index) => {
    const bucketEnd =
      index === hours.length - 1 ? new Date() : new Date(bucket.start.getTime() + 4 * 60 * 60 * 1000)
    withTimestamps.forEach((event) => {
      if (event.createdAt >= bucket.start && event.createdAt < bucketEnd) {
        bucket.alerts += 1
      }
    })
  })

  return hours.map(({ label, alerts }) => ({ label, alerts }))
}

function buildLocationData(events) {
  const byLocation = new Map()

  events.forEach((event) => {
    const entry = byLocation.get(event.location) ?? {
      location: event.location,
      total: 0,
      fire: 0,
      fall: 0,
      mixed: 0,
      latestAt: null,
    }

    entry.total += 1
    if (event.isFire) entry.fire += 1
    if (event.isFall) entry.fall += 1
    if (event.isFire && event.isFall) entry.mixed += 1
    if (!entry.latestAt || (event.createdAt && event.createdAt > entry.latestAt)) {
      entry.latestAt = event.createdAt
    }
    byLocation.set(event.location, entry)
  })

  return Array.from(byLocation.values())
    .sort((left, right) => right.total - left.total)
    .map((entry, index, list) => ({
      ...entry,
      rank: index + 1,
      share: list.length ? Math.round((entry.total / events.length) * 100) : 0,
      severityScore: entry.fire * 3 + entry.fall * 2,
      latestLabel: entry.latestAt
        ? entry.latestAt.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'No timestamp',
    }))
}

function buildTypeBreakdown(events) {
  const totals = {
    Fire: 0,
    Fall: 0,
    'Fire + Fall': 0,
    Unknown: 0,
  }

  events.forEach((event) => {
    totals[event.type] += 1
  })

  return Object.entries(totals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: getIncidentColor(name),
    }))
}

function buildSummary(events, locations) {
  const fireCount = events.filter((event) => event.isFire).length
  const fallCount = events.filter((event) => event.isFall).length
  const hotspot = locations[0]?.location ?? 'No hotspot'

  return {
    totalIncidents: events.length,
    fireCount,
    fallCount,
    affectedLocations: locations.length,
    hotspot,
    hotspotCount: locations[0]?.total ?? 0,
    mixedCount: events.filter((event) => event.isFire && event.isFall).length,
  }
}

function buildAlarmDashboard(events, source) {
  const normalized = events.map(normalizeAlarm).sort((left, right) => {
    if (!left.createdAt && !right.createdAt) return 0
    if (!left.createdAt) return 1
    if (!right.createdAt) return -1
    return right.createdAt - left.createdAt
  })

  const locations = buildLocationData(normalized)
  const summary = buildSummary(normalized, locations)

  return {
    source,
    events: normalized,
    summary,
    locationData: locations,
    typeBreakdown: buildTypeBreakdown(normalized),
    dailyTrend: buildTrendData(normalized),
    recentWindow: buildHourlyData(normalized),
    recentEvents: normalized.slice(0, 8),
    tableRows: normalized.slice(0, 18),
  }
}

export async function fetchAlarmDashboard() {
  if (!isSupabaseConfigured || !supabase) {
    return buildAlarmDashboard(MOCK_ALARMS, 'mock')
  }

  const { data, error } = await supabase.from('alarms').select('*').limit(500)

  if (error) {
    console.error('Supabase alarms query failed:', error)
    return buildAlarmDashboard(MOCK_ALARMS, 'mock')
  }

  return buildAlarmDashboard(Array.isArray(data) ? data : [], 'supabase')
}

