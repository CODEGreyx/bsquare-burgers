import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '../lib/lenis'
import './Navigation.css'

const ITEMS = [
  { label: 'Residence', target: '#scene-build' },
  { label: 'Interior', target: '#scene-interior' },
  { label: 'CODEGREY.DEV', target: '#scene-final' },
]

/**
 * A whisper of a header. It dissolves the moment the build begins and
 * only returns with the final brand hold.
 */
export default function Navigation() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    const show = (v) =>
      gsap.to(el, {
        autoAlpha: v ? 1 : 0,
        duration: 0.6,
        overwrite: 'auto',
      })

    const st = ScrollTrigger.create({
      trigger: '#scene-build',
      start: 'top top',
      onEnter: () => show(false),
      onLeaveBack: () => show(true),
    })

    gsap.fromTo(
      el,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 1, delay: 0.4 }
    )

    return () => st.kill()
  }, [])

  const go = (e, target) => {
    e.preventDefault()
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(target === '#scene-build' ? 0 : target, { duration: 2.2 })
    else document.querySelector(target)?.scrollIntoView()
  }

  return (
    <nav className="nav hide-when-filming" ref={ref}>
      <a
        className="nav-mark t-tech"
        href="#scene-build"
        onClick={(e) => go(e, '#scene-build')}
      >
        NØRTHLINE
      </a>
      <div className="nav-items">
        {ITEMS.map((item) => (
          <a
            key={item.label}
            className="t-tech nav-link"
            href={item.target}
            onClick={(e) => go(e, item.target)}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
