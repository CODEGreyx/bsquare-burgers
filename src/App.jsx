import React, { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { setLenis } from './lib/lenis'

import MonolithLoader from './components/monolith/MonolithLoader'
import MonolithNav from './components/monolith/MonolithNav'
import HeroScene from './components/monolith/HeroScene'
import SequenceScene from './components/monolith/SequenceScene'
import {
  TypeScene,
  GalleryScene,
  MaterialScene,
  BlueprintScene,
  FinalStatement,
} from './components/monolith/Scenes'
import MonolithCursor from './components/monolith/MonolithCursor'

gsap.registerPlugin(ScrollTrigger)

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__ST = ScrollTrigger
}

export default function App() {
  /* Lenis ↔ GSAP clock. One smooth scroll driver for the whole film. */
  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const lenis = new Lenis({
      duration: 1.7,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      wheelMultiplier: 0.8,
      touchMultiplier: 1.4,
      smoothWheel: !prefersReduced,
    })
    setLenis(lenis)

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    /* re-measure pins once the frames are decoded and layout settles */
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('monolith:loaded', refresh)
    const settle = setTimeout(refresh, 300)

    return () => {
      clearTimeout(settle)
      window.removeEventListener('monolith:loaded', refresh)
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])

  return (
    <>
      <MonolithLoader />
      <MonolithNav />
      <main>
        <HeroScene />
        <SequenceScene />
        <TypeScene />
        <GalleryScene />
        <MaterialScene />
        <BlueprintScene />
        <FinalStatement />
      </main>
      <MonolithCursor />
      <div className="grade" aria-hidden="true" />
    </>
  )
}
