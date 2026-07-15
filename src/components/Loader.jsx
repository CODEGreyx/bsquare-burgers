import React, { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { getLenis } from '../lib/lenis'
import './Loader.css'

/**
 * Opening sequence: darkness, one thin architectural line that measures
 * itself across the screen, end ticks, then it releases the title
 * underneath (BlueprintScene listens for `northline:loaded`).
 */
export default function Loader() {
  const ref = useRef(null)
  const [gone, setGone] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    getLenis()?.stop()
    window.scrollTo(0, 0)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          window.dispatchEvent(new CustomEvent('northline:loaded'))
          getLenis()?.start()
          gsap.to(el, {
            autoAlpha: 0,
            duration: 0.9,
            delay: 0.15,
            ease: 'power1.out',
            onComplete: () => setGone(true),
          })
        },
      })

      tl.fromTo('.loader-line', { scaleX: 0 }, { scaleX: 1, duration: 1.5 })
        .fromTo(
          '.loader-tick',
          { scaleY: 0 },
          { scaleY: 1, duration: 0.45, stagger: 0.08, ease: 'power2.out' },
          '-=0.25'
        )
        .fromTo(
          '.loader-meta',
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          '-=0.3'
        )
        .to({}, { duration: 0.35 })
    }, el)

    return () => ctx.revert()
  }, [])

  if (gone) return null

  return (
    <div className="loader" ref={ref} aria-hidden="true">
      <div className="loader-center">
        <div className="loader-line" />
        <span className="loader-tick loader-tick-l" />
        <span className="loader-tick loader-tick-r" />
        <div className="loader-meta t-tech">BLN · 52.4862° N — 13.2777° E</div>
      </div>
    </div>
  )
}
