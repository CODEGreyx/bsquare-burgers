import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Creates a pinned, scrubbed GSAP timeline bound to a scene section.
 *
 * @param {(tl: gsap.core.Timeline, root: HTMLElement) => void} build
 *   Receives a fresh timeline (scrubbed 0→1 across the pin distance) and
 *   the section element. Query children with `root.querySelector`.
 * @param {{ pinDistance?: string, scrub?: number, deps?: any[] }} options
 */
export function useScrollTimeline(build, options = {}) {
  const sectionRef = useRef(null)
  const { pinDistance = '+=300%', scrub = 1.1 } = options

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: pinDistance,
          pin: true,
          scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      build(tl, section)
    }, section)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options.deps ?? [])

  return sectionRef
}

/** Prepare every path/line/etc in a group for a draw-on animation. */
export function primeDraw(rootEl, selector) {
  const els = rootEl.querySelectorAll(selector)
  els.forEach((el) => {
    const len =
      typeof el.getTotalLength === 'function' ? el.getTotalLength() : 0
    if (len > 0) {
      el.style.strokeDasharray = `${len}`
      el.style.strokeDashoffset = `${len}`
    }
  })
  return els
}

export { gsap, ScrollTrigger }
