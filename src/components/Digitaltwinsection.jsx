import { useRef, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

function TwinCanvas({ scrollPct }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const scrollRef = useRef(0)

  useEffect(() => {
    if (scrollPct) {
      return scrollPct.onChange(v => { scrollRef.current = v })
    }
  }, [scrollPct])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const workers = [
      { x: 0.18, y: 0.55, dx: 0.0003, compliant: true, id: 'W-01' },
      { x: 0.42, y: 0.62, dx: -0.00035, compliant: false, id: 'W-02' },
      { x: 0.6, y: 0.52, dx: 0.00028, compliant: true, id: 'W-03' },
      { x: 0.78, y: 0.6, dx: -0.00022, compliant: true, id: 'W-04' },
      { x: 0.32, y: 0.7, dx: 0.00032, compliant: true, id: 'W-05' },
    ]

    const zones = [
      { x: 0.04, y: 0.3, w: 0.38, h: 0.52, label: 'WORK ZONE A', color: [26, 86, 255] },
      { x: 0.44, y: 0.24, w: 0.22, h: 0.3, label: 'EATING AREA', color: [0, 196, 140] },
      { x: 0.68, y: 0.3, w: 0.3, h: 0.52, label: '⚠ HAZARD ZONE', color: [255, 45, 85] },
    ]

    const draw = (ts) => {
      const t = ts / 1000
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      // Deep space black
      ctx.fillStyle = '#02030a'
      ctx.fillRect(0, 0, W, H)

      // Starfield
      ctx.save()
      for (let i = 0; i < 80; i++) {
        const sx = ((Math.sin(i * 127.3) * 0.5 + 0.5) * W)
        const sy = ((Math.cos(i * 234.7) * 0.5 + 0.5) * H * 0.4)
        const sa = 0.1 + 0.1 * Math.sin(t * 0.5 + i)
        ctx.fillStyle = `rgba(200,220,255,${sa})`
        ctx.fillRect(sx, sy, 0.8, 0.8)
      }
      ctx.restore()

      // Perspective grid (floor)
      const horizon = H * 0.42
      ctx.save()
      ctx.strokeStyle = 'rgba(26,86,255,0.08)'
      ctx.lineWidth = 1
      for (let i = 0; i <= 24; i++) {
        const x = i * W / 24
        ctx.beginPath()
        ctx.moveTo(W / 2 + (x - W / 2) * 0.25, horizon)
        ctx.lineTo(x, H + 20)
        ctx.stroke()
      }
      for (let j = 0; j <= 14; j++) {
        const p = Math.pow(j / 14, 1.5)
        const y = horizon + (H - horizon) * p
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
      ctx.restore()

      // Zones
      zones.forEach(z => {
        const [r, g, b] = z.color
        const pulse = 0.03 + 0.015 * Math.sin(t * 1.5)
        ctx.save()
        ctx.fillStyle = `rgba(${r},${g},${b},${pulse})`
        ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 5])
        ctx.fillRect(z.x * W, z.y * H, z.w * W, z.h * H)
        ctx.strokeRect(z.x * W, z.y * H, z.w * W, z.h * H)
        ctx.setLineDash([])

        ctx.fillStyle = `rgba(${r},${g},${b},0.7)`
        ctx.font = `bold 10px 'JetBrains Mono', monospace`
        ctx.fillText(z.label, z.x * W + 8, z.y * H + 16)
        ctx.restore()
      })

      // Move & draw workers
      workers.forEach((w, i) => {
        w.x += w.dx
        if (w.x < 0.04 || w.x > 0.93) w.dx *= -1

        const wx = w.x * W, wy = w.y * H
        const [r, g, b] = w.compliant ? [0, 196, 140] : [255, 45, 85]

        // Ping rings
        const pingT = (t * 1.2 + i * 0.4) % 1
        ctx.save()
        ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - pingT) * 0.4})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(wx, wy, pingT * 28, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        // Glow dot
        ctx.save()
        const dotGlow = ctx.createRadialGradient(wx, wy, 0, wx, wy, 12)
        dotGlow.addColorStop(0, `rgba(${r},${g},${b},0.8)`)
        dotGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = dotGlow
        ctx.beginPath(); ctx.arc(wx, wy, 12, 0, Math.PI * 2); ctx.fill()

        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.shadowColor = `rgb(${r},${g},${b})`
        ctx.shadowBlur = 8
        ctx.beginPath(); ctx.arc(wx, wy, 4, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
        ctx.restore()

        // ID label
        ctx.save()
        ctx.fillStyle = `rgba(${r},${g},${b},0.15)`
        ctx.strokeStyle = `rgba(${r},${g},${b},0.4)`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(wx - 18, wy - 26, 36, 14, 2)
        ctx.fill(); ctx.stroke()
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.font = 'bold 8px JetBrains Mono, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(w.id, wx, wy - 15)
        ctx.textAlign = 'left'
        ctx.restore()
      })

      // Camera node
      const camX = W * 0.5, camY = H * 0.08
      const camAngle = t * 0.4
      ctx.save()
      const camGrad = ctx.createRadialGradient(camX, camY, 0, camX, camY, W * 0.45)
      camGrad.addColorStop(0, 'rgba(26,86,255,0.05)')
      camGrad.addColorStop(0.4, 'rgba(26,86,255,0.02)')
      camGrad.addColorStop(1, 'transparent')
      // FOV cone
      ctx.fillStyle = camGrad
      ctx.beginPath()
      ctx.moveTo(camX, camY)
      ctx.arc(camX, camY, W * 0.45, camAngle - 0.6, camAngle + 0.6)
      ctx.closePath()
      ctx.fill()
      // Camera dot
      ctx.fillStyle = 'rgba(26,86,255,0.9)'
      ctx.shadowColor = '#1A56FF'; ctx.shadowBlur = 12
      ctx.beginPath(); ctx.arc(camX, camY, 5, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0
      ctx.restore()

      // Minimap
      const mp = { x: W - 130, y: H - 90, w: 118, h: 76 }
      ctx.save()
      ctx.fillStyle = 'rgba(0,0,0,0.75)'
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(mp.x, mp.y, mp.w, mp.h, 4)
      ctx.fill(); ctx.stroke()

      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '8px JetBrains Mono, monospace'
      ctx.fillText('MINIMAP', mp.x + 6, mp.y + 12)

      workers.forEach(w => {
        const [r, g, b] = w.compliant ? [0, 196, 140] : [255, 45, 85]
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.beginPath()
        ctx.arc(mp.x + 4 + w.x * (mp.w - 8), mp.y + 20 + (w.y - 0.3) * (mp.h - 24), 3, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.restore()

      // Status bar
      ctx.save()
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, W, 32)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, 32); ctx.lineTo(W, 32); ctx.stroke()

      ctx.fillStyle = 'rgba(26,86,255,0.7)'
      ctx.font = '9px JetBrains Mono, monospace'
      const violations = workers.filter(w => !w.compliant).length
      ctx.fillText(`DIGITAL TWIN ACTIVE  ·  ${workers.length} WORKERS  ·  ${violations} VIOLATION${violations !== 1 ? 'S' : ''}  ·  UPTIME: ${Math.floor(t / 3600).toString().padStart(2,'0')}:${Math.floor((t % 3600) / 60).toString().padStart(2,'0')}:${Math.floor(t % 60).toString().padStart(2,'0')}`, 14, 20)
      ctx.restore()

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

export default function DigitalTwinSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])

  return (
    <section className="section twin-section" ref={ref} id="platform">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ textAlign: 'center', marginBottom: 60 }}
      >
        <div className="section-label" style={{ justifyContent: 'center' }}>Digital Twin</div>
        <h2 className="section-title-xl">
          A Live <em>3D Safety</em><br />Digital Twin
        </h2>
        <p className="section-body" style={{ margin: '20px auto 0', textAlign: 'center' }}>
          Every worker, every zone, every hazard — visualised in real-time as a navigable live environment.
        </p>
      </motion.div>

      <motion.div
        className="twin-canvas-full"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          boxShadow: '0 0 120px rgba(26,86,255,0.08), 0 40px 100px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <TwinCanvas scrollPct={scrollYProgress} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          background: 'rgba(255,255,255,0.05)',
          marginTop: 1,
          border: '1px solid rgba(255,255,255,0.05)',
          borderTop: 'none',
        }}
      >
        {[
          { color: '#1A56FF', label: 'Work Zone A', desc: '3 workers active', status: 'Monitored' },
          { color: '#00C48C', label: 'Eating Area', desc: 'Off shift — 0 workers', status: 'Clear' },
          { color: '#FF2D55', label: 'Hazard Zone', desc: '1 violation active', status: 'Alert' },
        ].map(z => (
          <div key={z.label} style={{
            background: '#0c0c0c',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: z.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: '0.06em', color: '#F0EDE8' }}>{z.label}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(240,237,232,0.3)', marginTop: 3 }}>{z.desc}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: z.color }}>{z.status}</div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}