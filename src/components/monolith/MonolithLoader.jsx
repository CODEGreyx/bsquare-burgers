import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { FRAMES } from '../../data/sequence'
import { getLenis } from '../../lib/lenis'
import './MonolithLoader.css'

/**
 * Minimal cinematic loader. Holds the experience until the construction
 * film has metadata and enough buffered data to scrub without stalling
 * (and the 8 stills are decoded for the fallback + material crops).
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

    let imgDone = 0
    let videoP = 0
    const paint = () => {
      const p = (imgDone / FRAMES.length) * 0.35 + videoP * 0.65
      gsap.to(fill, { scaleX: p, duration: 0.4, ease: 'power2.out', overwrite: true })
    }

    const images = Promise.all(
      FRAMES.map(
        (f) =>
          new Promise((resolve) => {
            const img = new Image()
            img.src = f.src
            const settle = () =>
              (img.decode ? img.decode() : Promise.resolve())
                .catch(() => {})
                .finally(() => {
                  imgDone += 1
                  paint()
                  resolve()
                })
            if (img.complete) settle()
            else {
              img.onload = settle
              img.onerror = () => {
                imgDone += 1
                paint()
                resolve()
              }
            }
          })
      )
    )

    /* the film is ready when it can play through, or when most of it is
       buffered; if it errors, the scene's frame fallback takes over */
    const video = document.querySelector('.seq-video')
    const film = new Promise((resolve) => {
      if (!video) return resolve()
      let settled = false
      const done = () => {
        if (!settled) {
          settled = true
          videoP = 1
          paint()
          resolve()
        }
      }
      const measure = () => {
        if (settled) return
        try {
          const dur = video.duration
          if (dur && video.buffered.length) {
            const end = video.buffered.end(video.buffered.length - 1)
            videoP = Math.min(end / dur, 1)
            paint()
            if (end >= dur * 0.92) return done()
          }
        } catch {
          /* buffered ranges can throw mid-load; ignore */
        }
        setTimeout(measure, 200)
      }
      video.addEventListener('canplaythrough', done, { once: true })
      video.addEventListener('error', done, { once: true })
      video.querySelector('source:last-of-type')?.addEventListener('error', done, { once: true })
      measure()
      setTimeout(done, 14000) /* never hold the door forever */
    })

    let tl
    Promise.all([images, film]).then(() => {
      tl = gsap.timeline({ delay: 0.3 })
      tl.to(fill, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, 0)
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
