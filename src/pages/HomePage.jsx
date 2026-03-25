import { useNavigate } from 'react-router-dom'

const features = [
  {
    icon: '♻️',
    title: 'AI-Powered Tracking',
    desc: 'Intelligent material lifecycle tracking from collection to dispatch.',
  },
  {
    icon: '📊',
    title: 'Real-Time Dashboards',
    desc: 'Live analytics and visual reporting for every stakeholder.',
  },
  {
    icon: '🔍',
    title: 'Smart Detection',
    desc: 'Computer vision and ML models for instant identification and compliance.',
  },
  {
    icon: '🔗',
    title: 'Full Traceability',
    desc: 'End-to-end chain of custody with source-traceable insights.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white font-['Syne',sans-serif] overflow-x-hidden">
      {/* Google Font Import via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        .mono { font-family: 'DM Mono', monospace; }
        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes pulse-ring { 0%{opacity:.6;transform:scale(1)} 100%{opacity:0;transform:scale(1.6)} }
        @keyframes fadein { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        .fadein { animation: fadein 0.8s ease forwards; }
        .fadein-delay-1 { animation: fadein 0.8s 0.15s ease both; }
        .fadein-delay-2 { animation: fadein 0.8s 0.3s ease both; }
        .fadein-delay-3 { animation: fadein 0.8s 0.45s ease both; }
        .float { animation: float 5s ease-in-out infinite; }
        .card-hover { transition: transform 0.25s, box-shadow 0.25s; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 0 40px #39ff1422; }
      `}</style>

      <div className="grain" />

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[#39ff14] text-2xl">⬡</span>
          <span className="text-lg font-bold tracking-widest uppercase text-white/90">CircleAI</span>
        </div>
        <div className="mono text-xs text-white/30 hidden md:block tracking-widest">
          INTELLIGENT CIRCULAR ECONOMY PLATFORM
        </div>
        <button
          onClick={() => navigate('/login')}
          className="mono text-xs border border-[#39ff14]/40 text-[#39ff14] px-5 py-2 rounded-full hover:bg-[#39ff14] hover:text-black transition-all duration-200 tracking-widest"
        >
          SIGN IN →
        </button>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#39ff14]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="mono text-xs tracking-[0.3em] text-[#39ff14]/70 mb-6 fadein">
          ◆ AI × SUSTAINABILITY × REAL-TIME INTELLIGENCE
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-none tracking-tight mb-6 fadein-delay-1">
          CLOSE THE
          <br />
          <span className="text-[#39ff14]">LOOP.</span>
        </h1>

        <p className="text-white/40 max-w-xl text-base md:text-lg leading-relaxed mono mb-10 fadein-delay-2">
          From plastic identification to PPE compliance — AI-driven systems
          that make industrial operations transparent, safe, and intelligent.
        </p>

        <div className="flex gap-4 fadein-delay-3">
          <button
            onClick={() => navigate('/login')}
            className="bg-[#39ff14] text-black font-bold px-8 py-3 rounded-full hover:scale-105 hover:shadow-[0_0_30px_#39ff1460] transition-all duration-200 tracking-wide text-sm"
          >
            GET STARTED
          </button>
          <button className="border border-white/15 text-white/60 px-8 py-3 rounded-full hover:border-white/30 hover:text-white transition-all duration-200 text-sm mono tracking-wide">
            LEARN MORE
          </button>
        </div>

        {/* Floating badge */}
        <div className="relative mt-16 float">
          <div className="absolute inset-0 rounded-2xl bg-[#39ff14]/20 blur-2xl" style={{animation:'pulse-ring 3s ease-out infinite'}} />
          <div className="relative bg-white/5 border border-white/10 rounded-2xl px-8 py-5 flex items-center gap-4 backdrop-blur-md">
            <span className="text-3xl">🤖</span>
            <div className="text-left">
              <div className="text-[#39ff14] font-bold text-sm tracking-wide">AI MODELS READY</div>
              <div className="mono text-white/30 text-xs">Plug in your ML pipeline instantly</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-6 pb-24 max-w-5xl mx-auto">
        <div className="mono text-xs text-white/25 tracking-widest text-center mb-10">
          ─── PLATFORM CAPABILITIES ───
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="card-hover bg-white/[0.03] border border-white/8 rounded-2xl p-6 flex flex-col gap-3"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold text-white text-sm tracking-wide">{f.title}</h3>
              <p className="mono text-white/35 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-6 flex items-center justify-between">
        <span className="mono text-white/20 text-xs">© 2026 CircleAI</span>
        <span className="mono text-[#39ff14]/30 text-xs tracking-widest">BUILT FOR HACKATHON</span>
      </footer>
    </div>
  )
}
