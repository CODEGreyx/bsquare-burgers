import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { FRAMES } from '../../data/sequence'
import { getLenis } from '../../lib/lenis'
import './MonolithLoader.css'

/**
 * Minimal cinematic loader. Preloads and decodes all 8 sequence frames
 * before the experience is scrollable — no visible asset loading, ever.
 * Dispatches `monolith:loaded` when the curtain lifts.
 */
export default function MonolithLoader() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const root = ref.current
    const fill = root.querySelector('.ldr-fill')
    const lenis = getLenis()
    lenis?.stop()
    window.scrollTo(0, 0)

    let done = 0
    const step = () => {
      done += 1
      gsap.to(fill, {
        scaleX: done / FRAMES.length,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    const jobs = FRAMES.map(
      (f) =>
        new Promise((resolve) => {
          const img = new Image()
          img.src = f.src
          const settle = () =>
            (img.decode ? img.decode() : Promise.resolve())
              .catch(() => {})
              .finally(() => {
                step()
                resolve()
              })
          if (img.complete) settle()
          else {
            img.onload = settle
            img.onerror = () => {
              step()
              resolve()
            }
          }
        })
    )

    let tl
    Promise.all(jobs).then(() => {
      tl = gsap.timeline({ delay: 0.35 })
      tl.to(root.querySelector('.ldr-mark'), {
        letterSpacing: '0.62em',
        opacity: 0,
        duration: 0.9,
        ease: 'power2.inOut',
      })
      tl.to(root.querySelector('.ldr-line'), { opacity: 0, duration: 0.4 }, '<0.2')
      tl.to(root, {
        autoAlpha: 0,
        duration: 1.0,
        ease: 'power2.inOut',
        onStart: () => {
          getLenis()?.start()
          window.dispatchEvent(new Event('monolith:loaded'))
        },
      })
    })

    return () => tl?.kill()
  }, [])

  return (
    <div className="ldr" ref={ref} aria-hidden="true">
      <span className="ldr-mark">MONOLITH</span>
      <span className="ldr-line">
        <span className="ldr-fill" />
      </span>
      <span className="ldr-sub t-tech">PRIVATE RESIDENCE</span>
    </div>
  )
}
