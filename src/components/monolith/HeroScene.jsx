import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { LIB } from '../../data/frames'
import './HeroScene.css'

/**
 * SCENE 1 — desire. The finished residence at dusk, edge to edge.
 * One serif wordmark, one whisper of a label, nothing else.
 */
export default function HeroScene() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const root = ref.current
    const onLoaded = () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const lines = root.querySelectorAll('.hero-line > *')
      if (reduced) {
        gsap.set(lines, { yPercent: 0 })
        gsap.set('.hero-hint, .hero-code', { opacity: 1 })
        return
      }
      gsap.fromTo(
        root.querySelector('.hero-img'),
        { scale: 1.06 },
        { scale: 1, duration: 3.2, ease: 'power2.out' }
      )
      gsap.fromTo(
        lines,
        { yPercent: 112 },
        { yPercent: 0, duration: 1.2, stagger: 0.16, ease: 'power3.out', delay: 0.2 }
      )
      gsap.fromTo(
        root.querySelector('.hero-rule'),
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, ease: 'power2.inOut', delay: 0.9 }
      )
      gsap.fromTo(
        '.hero-hint, .hero-code',
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 1.7, stagger: 0.2 }
      )
    }
    window.addEventListener('monolith:loaded', onLoaded)
    return () => window.removeEventListener('monolith:loaded', onLoaded)
  }, [])

  return (
    <section id="hero" className="scene hero" ref={ref}>
      <img className="hero-img" src={LIB.seafront} alt="A MONOLITH residence above the sea at dusk" />
      <div className="hero-grad" aria-hidden="true" />

      <div className="hero-center">
        <div className="hero-line"><span className="t-tech hero-label">PRIVATE RESIDENCES — EST. 2026</span></div>
        <div className="hero-line"><h1 className="hero-mark">MONOLITH</h1></div>
        <span className="hero-rule" aria-hidden="true" />
      </div>

      <div className="hero-hint t-tech" aria-hidden="true">
        <span>SCROLL</span>
        <span className="hero-hint-line" />
      </div>
      <span className="hero-code t-tech">01 — THE RESIDENCE</span>
    </section>
  )
}
