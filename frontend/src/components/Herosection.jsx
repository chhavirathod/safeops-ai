import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import HeroCanvas from './Herocanvas'

const ALERT_ROUTE = '/three.js'
const VIDEO_PATH = '/demo-video-new.mp4'

console.log('Video Path:', VIDEO_PATH, 'Full URL:', window.location.origin + VIDEO_PATH)

export default function HeroSection() {
  const sectionRef = useRef(null)
  const scrollYRef = useRef(0)
  const navigate = useNavigate()
  const [showVideoModal, setShowVideoModal] = useState(false)

  const { scrollY } = useScroll()

  const handleWatchDemo = () => {
    setShowVideoModal(true)
    console.log('Video modal opened, video path:', VIDEO_PATH)
    
    // Test video loading and try to auto-play
    setTimeout(() => {
      const video = document.querySelector('video')
      if (video) {
        console.log('Video element found:', video)
        console.log('Video src:', video.src)
        console.log('Video readyState:', video.readyState)
        console.log('Video networkState:', video.networkState)
        
        // Try to auto-play
        video.play().then(() => {
          console.log('Video started playing successfully')
        }).catch(err => {
          console.log('Auto-play was prevented:', err)
        })
      }
    }, 500)
  }

  const handleCloseVideo = () => {
    setShowVideoModal(false)
  }

  useEffect(() => {
    return scrollY.onChange(v => { scrollYRef.current = v })
  }, [scrollY])

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showVideoModal) {
        handleCloseVideo()
      }
    }

    if (showVideoModal) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [showVideoModal])

  return (
    <section className="hero-section" ref={sectionRef}>
      {/* Full-screen canvas */}
      <div className="hero-canvas-wrap">
        <HeroCanvas scrollY={scrollYRef} />
      </div>

      {/* Center content */}
      <div className="hero-content">
        <motion.div
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          AI-Powered Safety Intelligence
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hero-title-line1">REAL-TIME</span>
          <span className="hero-title-line2">PPE Compliance</span>
          <span className="hero-title-line3">Zero Blind Spots</span>
        </motion.div>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          Industrial safety monitoring powered by computer vision.
          Detect violations the instant they happen — not after.
        </motion.p>

        <motion.div
          className="hero-cta-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
        >
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Enter Dashboard
          </button>
          <button className="btn-ghost" onClick={() => navigate(ALERT_ROUTE)}>
            Alert
          </button>
          <button className="btn-ghost" onClick={handleWatchDemo}>
            Watch Demo ▶
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-hint">
        <div className="scroll-wheel">
          <div className="scroll-wheel-dot" />
        </div>
        <span>Scroll to explore</span>
      </div>

      {/* Stats strip at very bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          gap: 0,
          zIndex: 10,
        }}
      >
        {[
          ['99.2%', 'Detection Accuracy'],
          ['<200ms', 'Alert Latency'],
          ['24/7', 'Continuous Monitoring'],
          ['0', 'Facial Recognition'],
        ].map(([val, label], i) => (
          <div key={label} style={{
            padding: '20px 48px',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 28,
              letterSpacing: '0.04em',
              color: '#F0EDE8',
              lineHeight: 1,
            }}>{val}</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(240,237,232,0.3)',
              marginTop: 6,
            }}>{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Video Modal */}
      {showVideoModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={handleCloseVideo}
        >
          <div 
            style={{
              position: 'relative',
              width: '95vw',
              height: '95vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseVideo}
              style={{
                position: 'absolute',
                top: -40,
                right: 0,
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              ✕
            </button>
            <video
              autoPlay
              controls
              muted
              crossOrigin="anonymous"
              preload="auto"
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '95vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                backgroundColor: '#000',
              }}
              onLoadStart={() => console.log('Video load started')}
              onLoadedData={() => console.log('Video data loaded')}
              onCanPlay={() => console.log('Video can play')}
              onError={(e) => console.error('Video error:', e)}
              onLoadedMetadata={() => console.log('Video metadata loaded')}
            >
              <source src={VIDEO_PATH} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </section>
  )
}
