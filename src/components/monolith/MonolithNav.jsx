import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '../../lib/lenis'
import './MonolithNav.css'

gsap.registerPlugin(ScrollTrigger)

const go = (target) => (e) => {
  e.preventDefault()
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(target, { duration: 2.2 })
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
}

/**
 * Minimal fixed navigation. Hidden while the opening title owns the
 * frame; slides in once the construction record begins.
 */
export default function MonolithNav() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    gsap.set(el, { autoAlpha: 0, y: -14 })
    const show = gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      paused: true,
    })
    const st = ScrollTrigger.create({
      start: () => window.innerHeight * 0.55,
      onEnter: () => show.play(),
      onLeaveBack: () => show.reverse(),
    })
    return () => {
      st.kill()
      show.kill()
    }
  }, [])

  return (
    <header className="mnav" ref={ref}>
      <a className="mnav-mark" href="#top" onClick={go(0)}>
        MONOLITH
      </a>
      <nav className="mnav-links">
        <a href="#top" onClick={go(0)}>
          Residence
        </a>
        <a href="#architecture" onClick={go('#architecture')}>
          Architecture
        </a>
        <a href="#enquire" onClick={go('#enquire')}>
          Enquire
        </a>
      </nav>
    </header>
  )
}
