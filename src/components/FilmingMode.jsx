import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FilmingContext } from '../hooks/useFilmingMode'
import { getLenis } from '../lib/lenis'
import './FilmingMode.css'

/**
 * Filming Mode — everything needed to point an iPhone at a MacBook.
 *
 *   F      toggle Filming Mode (fullscreen, cursor auto-hide, chrome off)
 *   R      reset the experience to the very top
 *   Space  freeze / release the scroll clock
 *   M      sound (handled by SoundControl)
 *
 * The provider owns the body classes; scenes stay untouched.
 */
export default function FilmingMode({ children }) {
  const [filming, setFilming] = useState(false)
  const [paused, setPaused] = useState(false)
  const idleTimer = useRef(null)

  const toggleFilming = useCallback(() => {
    setFilming((prev) => {
      const next = !prev
      document.body.classList.toggle('filming', next)
      if (next) {
        document.documentElement.requestFullscreen?.().catch(() => {})
      } else if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {})
      }
      return next
    })
  }, [])

  const togglePaused = useCallback(() => {
    setPaused((prev) => {
      const next = !prev
      document.body.classList.toggle('paused', next)
      const lenis = getLenis()
      if (lenis) (next ? lenis.stop : lenis.start).call(lenis)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
    ScrollTrigger.refresh()
  }, [])

  /* the help chip retires once the user starts the experience */
  useEffect(() => {
    const onScroll = () => {
      document.body.classList.toggle('scrolled', window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* keyboard */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'f' || e.key === 'F') toggleFilming()
      else if (e.key === 'r' || e.key === 'R') reset()
      else if (e.code === 'Space') {
        e.preventDefault()
        togglePaused()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleFilming, togglePaused, reset])

  /* cursor auto-hide while filming */
  useEffect(() => {
    if (!filming) {
      document.body.classList.remove('cursor-idle')
      return undefined
    }
    const arm = () => {
      document.body.classList.remove('cursor-idle')
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        document.body.classList.add('cursor-idle')
      }, 2200)
    }
    arm()
    window.addEventListener('mousemove', arm)
    return () => {
      clearTimeout(idleTimer.current)
      window.removeEventListener('mousemove', arm)
    }
  }, [filming])

  const value = useMemo(
    () => ({ filming, paused, toggleFilming, togglePaused, reset }),
    [filming, paused, toggleFilming, togglePaused, reset]
  )

  return (
    <FilmingContext.Provider value={value}>
      {children}

      {/* discreet activator */}
      <button
        className={`filmctl ${filming ? 'is-on' : ''}`}
        onClick={toggleFilming}
        aria-label="Toggle Filming Mode (F)"
        title="Filming Mode (F)"
      >
        <span className="filmctl-dot" />
        <span className="t-tech filmctl-label">
          {filming ? 'Filming' : 'Film'}
        </span>
      </button>

      {/* shortcut help, development only, retires on first scroll */}
      {import.meta.env.DEV && !filming && (
        <div className="filmhelp t-tech hide-when-filming">
          F film · R reset · M sound · SPACE hold
        </div>
      )}

      {paused && <div className="filmpause t-tech">HOLD</div>}
    </FilmingContext.Provider>
  )
}
