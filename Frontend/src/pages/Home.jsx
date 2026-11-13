import { useNavigate } from "react-router-dom";
import { useMemo } from "react"
import "./Home.scss"
import { useEffect, useRef } from "react"

const Home = () => {
    const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    const ctx = canvas.getContext("2d")
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const RADIUS = 130   // how far from the pointer particles get pushed
    const PUSH = 6       // push strength
    const mouse = { x: -9999, y: -9999 }
    let particles = []
    let w = 0
    let h = 0
    let raf

    const create = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2.2,
      speed: 0.15 + Math.random() * 0.35,
      alpha: 0.4 + Math.random() * 0.4,
      dx: 0, // displacement caused by the pointer
      dy: 0,
    })

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      w = parent.offsetWidth
      h = parent.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // about 30 particles on a laptop screen, fewer on phones
      const count = Math.min(80, Math.max(120, Math.round((w * h) / 50000)))
      particles = Array.from({ length: count }, create)
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        if (!reduceMotion) {
          // drift upward, wrap to the bottom
          p.y -= p.speed
          if (p.y < -10) {
            p.y = h + 10
            p.x = Math.random() * w
          }

          // push away from the pointer
          const px = p.x + p.dx
          const py = p.y + p.dy
          const distX = px - mouse.x
          const distY = py - mouse.y
          const dist = Math.hypot(distX, distY)

          if (dist < RADIUS && dist > 0) {
            const force = (1 - dist / RADIUS) * PUSH
            p.dx += (distX / dist) * force
            p.dy += (distY / dist) * force
          }

          // ease back to the normal path
          p.dx *= 0.94
          p.dy *= 0.94
        }

        ctx.beginPath()
        ctx.arc(p.x + p.dx, p.y + p.dy, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    const setPointer = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = clientX - rect.left
      mouse.y = clientY - rect.top
    }
    const onMouseMove = (e) => setPointer(e.clientX, e.clientY)
    const onTouchMove = (e) => setPointer(e.touches[0].clientX, e.touches[0].clientY)
    const clearPointer = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    resize()
    draw()

    const observer = new ResizeObserver(resize)
    observer.observe(parent)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchend", clearPointer)
    document.addEventListener("mouseleave", clearPointer)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", clearPointer)
      document.removeEventListener("mouseleave", clearPointer)
    }
  }, [])
  const navigate = useNavigate();
  return (
    <main>
      <canvas ref={canvasRef} className="particles" aria-hidden="true" />
      <section className="page">
        <div className="app-name">
          <img src="/play.png" alt="Moodify logo" />
          <h1>Moodify</h1>
        </div>

        <div className="tag">
          <p className="p1">Discover music based on your current mood</p>
          <p className="p2">Personalize songs for your current mood</p>
        </div>

        <div className="button">
          <button onClick={() => navigate("/face-expressions")}>Track Your Mood</button>
        </div>
      </section>

      <footer className="last">
        <img src="/play.png" alt="" />
        <h3>© 2026 Moodify</h3>
      </footer>
    </main>
  )
}

export default Home