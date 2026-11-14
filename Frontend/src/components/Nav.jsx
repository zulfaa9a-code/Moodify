import { useEffect, useRef, useState } from "react"
import "./Nav.scss"

const API = "http://localhost:3000"

const Nav = () => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [message, setMessage] = useState("")
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  // search 400ms after the user stops typing
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setMessage("")
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/songs/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        if (cancelled) return

        if (!res.ok) {
          setMessage(data.error || "Search failed")
          return
        }
        setResults(data)
        setMessage(data.length ? "" : `No songs found for "${q}"`)
      } catch {
        if (!cancelled) setMessage("Could not reach the server.")
      }
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  // close the dropdown on outside click or Escape
  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const showPanel = open && (results.length > 0 || message)

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-logo">
          <img src="/play.png" alt="Moodify logo" />
          <span>Moodify</span>
        </div>

        <div className="nav-search" ref={boxRef}>
          <input
            type="search"
            placeholder="Search song or artist"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
          />

          {showPanel && (
            <div className="nav-results">
              {message && <p className="nav-msg">{message}</p>}

              {results.map((s) => (
                <div className="nav-song" key={s.trackId}>
                  <img src={s.cover} alt={s.title} />
                  <div className="info">
                    <h3>{s.title}</h3>
                    <p>{s.artist}</p>
                  </div>
                  <audio controls src={s.previewUrl} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Nav