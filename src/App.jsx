import React, { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { setLenis, getLenis } from './lib/lenis'

import Loader from './components/Loader'
import Navigation from './components/Navigation'
import FilmingMode from './components/FilmingMode'
import SoundControl from './components/SoundControl'
import BlueprintScene from './components/BlueprintScene'
import ConstructionScene from './components/ConstructionScene'
import ExteriorScene from './components/ExteriorScene'
import InteriorScene from './components/InteriorScene'
import FinalScene from './components/FinalScene'

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

    /* re-measure pins once layout and the opening image are settled —
       triggers created before the pins (nav) need this to re-anchor */
    const refresh = () => ScrollTrigger.refresh()
    const hero = new Image()
    hero.src = '/assets/exterior/residence-complete.webp'
    if (hero.complete) refresh()
    else hero.onload = refresh
    window.addEventListener('northline:loaded', refresh)
    const settle = setTimeout(refresh, 300)

    return () => {
      clearTimeout(settle)
      window.removeEventListener('northline:loaded', refresh)
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])

  return (
    <FilmingMode>
      <Loader />
      <Navigation />
      <main>
        <BlueprintScene />
        <ConstructionScene />
        <ExteriorScene />
        <InteriorScene />
        <FinalScene />
      </main>
      <SoundControl />
      <div className="grade" aria-hidden="true" />
    </FilmingMode>
  )
}
