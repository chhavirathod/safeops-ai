import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// ─── Swap these nav items based on which PS you get ────────────────────────────
// ML PS 1 (Traceability):    Overview, Material Flow, Reports, Settings
// ML PS 2 (Restaurant):      Overview, Social Feed, Strategy, Alerts
// AI PS 1 (Plastic ID):      Overview, Upload Image, Classifications, Reports
// AI PS 2 (PPE Compliance):  Overview, Live Feed, Violations, Reports
const NAV_ITEMS = [
  { icon: '⬡', label: 'Overview', id: 'overview' },
  { icon: '◈', label: 'Module 1', id: 'module1' },   // ← rename per PS
  { icon: '◉', label: 'Module 2', id: 'module2' },   // ← rename per PS
  { icon: '◫', label: 'Reports', id: 'reports' },
  { icon: '◌', label: 'Settings', id: 'settings' },
]

// ─── Stat cards - swap values from your ML/AI model output ────────────────────
const STAT_CARDS = [
  { label: 'Total Processed', value: '—', unit: 'units', color: '#39ff14' },
  { label: 'Accuracy', value: '—', unit: '%', color: '#00e5ff' },
  { label: 'Alerts Today', value: '—', unit: 'flagged', color: '#ff6b35' },
  { label: 'Compliance', value: '—', unit: 'score', color: '#a78bfa' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) navigate('/login')
      else setUser(data.user)
    })
  }, [navigate])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white flex font-['Syne',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        .mono { font-family: 'DM Mono', monospace; }
        .nav-item { transition: background 0.15s, color 0.15s; }
        .nav-item:hover { background: rgba(57,255,20,0.06); }
        .nav-item.active { background: rgba(57,255,20,0.1); color: #39ff14; border-left: 2px solid #39ff14; }
        @keyframes fadein { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fadein { animation: fadein 0.5s ease forwards; }
        .card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); }
        .placeholder-block {
          background: repeating-linear-gradient(
            45deg, rgba(57,255,20,0.02), rgba(57,255,20,0.02) 10px, transparent 10px, transparent 20px
          );
          border: 1px dashed rgba(57,255,20,0.15);
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className="w-60 min-h-screen bg-white/[0.02] border-r border-white/5 flex flex-col py-6 px-3 fixed left-0 top-0 bottom-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 mb-10">
          <span className="text-[#39ff14] text-xl">⬡</span>
          <span className="font-bold tracking-widest text-white/80 uppercase text-xs">CircleAI</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full text-sm mono tracking-wide border-l-2 border-transparent ${
                activeTab === item.id ? 'active' : 'text-white/40'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/5 pt-4 px-2">
          <div className="flex items-center gap-3 mb-3">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full" alt="avatar" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#39ff14]/20 flex items-center justify-center text-[#39ff14] text-xs font-bold">
                {user?.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-white/70 text-xs font-semibold truncate">
                {user?.user_metadata?.full_name || 'User'}
              </div>
              <div className="mono text-white/25 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mono text-xs text-white/25 hover:text-red-400 transition-colors w-full text-left px-1"
          >
            ← Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="ml-60 flex-1 p-8 fadein">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="mono text-xs text-white/25 tracking-widest mb-1">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {activeTab === 'overview' ? 'Operations Overview' : NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
          </div>
          {/* ← Hook: Replace with live model status badge */}
          <div className="flex items-center gap-2 bg-[#39ff14]/10 border border-[#39ff14]/20 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" />
            <span className="mono text-[#39ff14] text-xs tracking-wide">MODEL ONLINE</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="card rounded-2xl p-5">
              <div className="mono text-white/25 text-xs tracking-widest mb-2">{s.label.toUpperCase()}</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
                <span className="mono text-white/25 text-xs mb-1">{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-3 gap-4">
          {/* Big content area - swap with your chart/feed/camera */}
          <div className="col-span-2 card rounded-2xl p-6 min-h-80">
            <div className="mono text-white/25 text-xs tracking-widest mb-4">
              ─── MAIN VISUALIZATION / AI OUTPUT ───
            </div>
            <div className="placeholder-block rounded-xl h-64 flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">🤖</span>
              <span className="mono text-white/30 text-sm text-center px-8">
                {/* Swap hint per PS */}
                Plug in your AI/ML model output here.<br />
                Chart · Camera Feed · Detection Results · Trend Graph
              </span>
            </div>
          </div>

          {/* Right panel - swap with alerts/confidence scores */}
          <div className="card rounded-2xl p-6">
            <div className="mono text-white/25 text-xs tracking-widest mb-4">
              ─── ALERTS / INSIGHTS ───
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="placeholder-block rounded-xl p-4">
                  <div className="w-20 h-2 bg-white/10 rounded mb-2" />
                  <div className="w-32 h-2 bg-white/5 rounded" />
                </div>
              ))}
              <p className="mono text-white/20 text-xs text-center pt-2">
                Feed from model output
              </p>
            </div>
          </div>

          {/* Bottom row - secondary panels */}
          <div className="card rounded-2xl p-6">
            <div className="mono text-white/25 text-xs tracking-widest mb-3">
              ─── TABLE / LOG ───
            </div>
            <div className="placeholder-block rounded-xl h-32 flex items-center justify-center">
              <span className="mono text-white/20 text-xs">Data Table</span>
            </div>
          </div>

          <div className="card rounded-2xl p-6">
            <div className="mono text-white/25 text-xs tracking-widest mb-3">
              ─── METRICS / GAUGE ───
            </div>
            <div className="placeholder-block rounded-xl h-32 flex items-center justify-center">
              <span className="mono text-white/20 text-xs">Gauge / Donut Chart</span>
            </div>
          </div>

          <div className="card rounded-2xl p-6">
            <div className="mono text-white/25 text-xs tracking-widest mb-3">
              ─── QUICK ACTIONS ───
            </div>
            <div className="space-y-2">
              {['Upload Data', 'Run Model', 'Export Report'].map((a) => (
                <button key={a} className="w-full text-left mono text-xs text-white/40 hover:text-[#39ff14] hover:bg-[#39ff14]/5 px-3 py-2 rounded-lg transition-all border border-white/5">
                  → {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
