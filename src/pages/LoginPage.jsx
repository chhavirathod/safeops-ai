import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center font-['Syne',sans-serif] px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        .mono { font-family: 'DM Mono', monospace; }
        @keyframes fadein { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fadein { animation: fadein 0.6s ease forwards; }
        .glow-btn:hover { box-shadow: 0 0 40px rgba(57,255,20,0.25); }
        .spinner { border: 2px solid #39ff1430; border-top-color: #39ff14; border-radius: 50%; width: 16px; height: 16px; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .bg-grid {
          background-image: linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Grid background */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      {/* Glow center */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#39ff14]/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md fadein">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="mono text-white/25 text-xs tracking-widest mb-8 flex items-center gap-2 hover:text-white/50 transition-colors"
        >
          ← BACK TO HOME
        </button>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 backdrop-blur-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-[#39ff14] text-2xl">⬡</span>
            <span className="font-bold tracking-widest text-white/80 uppercase text-sm">CircleAI</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-1 leading-tight">
            Welcome<br />
            <span className="text-[#39ff14]">back.</span>
          </h2>
          <p className="mono text-white/30 text-xs mt-3 mb-8 leading-relaxed">
            Sign in to access your intelligent operations dashboard.
          </p>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="glow-btn w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-2xl hover:bg-[#f0f0f0] transition-all duration-200 text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="spinner" style={{ borderColor: '#00000030', borderTopColor: '#000' }} />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                {/* Google SVG icon */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 mono text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="mono text-white/20 text-xs">OR</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Email (placeholder for future) */}
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 mono focus:outline-none focus:border-[#39ff14]/40 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 mono focus:outline-none focus:border-[#39ff14]/40 transition-colors"
            />
            <button className="w-full bg-[#39ff14]/10 border border-[#39ff14]/20 text-[#39ff14] py-3 rounded-xl text-sm font-bold hover:bg-[#39ff14]/20 transition-all duration-200 tracking-wide">
              SIGN IN WITH EMAIL
            </button>
          </div>

          <p className="mono text-white/20 text-xs text-center mt-6">
            No account?{' '}
            <span className="text-[#39ff14]/60 cursor-pointer hover:text-[#39ff14] transition-colors">
              Request access →
            </span>
          </p>
        </div>

        <p className="mono text-white/15 text-xs text-center mt-6">
          Secured by Supabase Auth · Google OAuth 2.0
        </p>
      </div>
    </div>
  )
}
