import React, { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useScrollTimeline } from '../../hooks/useScrollTimeline'
import { FRAMES, STAGE_AT } from '../../data/sequence'
import { getLenis } from '../../lib/lenis'
import './SequenceScene.css'

const STAGE_COUNT = 8

/**
 * THE SEQUENCE — a construction film scrubbed by scroll. ScrollTrigger
 * computes a target video time; a requestAnimationFrame loop eases
 * currentTime toward it. Scroll down: the house builds. Scroll up: it
 * deconstructs. Stop: the film freezes on the exact frame. The video
 * never plays on its own. If the film cannot load, the scene falls
 * back to the 8-frame mask-blend system — never a broken viewport.
 */
export default function SequenceScene() {
  const [mode, setMode] = useState('video')
  const scrubRef = useRef({ target: 0 })

  const ref = useScrollTimeline(
    (tl, root) => {
      const scan = root.querySelector('.seq-scan')
      const tags = root.querySelectorAll('.seq-phase span')
      const railFill = root.querySelector('.seq-rail-fill')
      const groups = {
        g1: root.querySelector('.stx-1'),
        g2: root.querySelector('.stx-2'),
        g3: root.querySelector('.stx-3'),
        g4: root.querySelector('.stx-4'),
        g5: root.querySelector('.stx-5'),
        g6: root.querySelector('.stx-6'),
      }

      gsap.set(scan, { autoAlpha: 0 })
      gsap.set(tags, { autoAlpha: 0 })
      gsap.set(tags[0], { autoAlpha: 1 })
      Object.values(groups).forEach((g) => {
        if (g !== groups.g1) gsap.set(g.querySelectorAll('.stx-line > *'), { yPercent: 112 })
      })

      /* ONE locked camera: the image never moves, scales or drifts —
         only the construction inside the frame changes */
      tl.fromTo(railFill, { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'none' }, 0)

      if (mode === 'video') {
        /* ScrollTrigger's scrubbed proxy IS the film's target playhead;
           the rAF loop (separate effect) chases it frame-accurately */
        const proxy = { t: 0 }
        tl.to(
          proxy,
          {
            t: 1,
            duration: 1,
            ease: 'none',
            onUpdate: () => {
              scrubRef.current.target = proxy.t
            },
          },
          0
        )
      } else {
        /* fallback: 8-frame mask blends at the film's stage anchors */
        const MW = 0.06
        const layers = root.querySelectorAll('.seq-layer')
        layers.forEach((el) =>
          gsap.set(el, { '--p': '-18%', autoAlpha: 0, visibility: 'hidden' })
        )
        layers.forEach((layer, k) => {
          const at = STAGE_AT[k + 1] - MW
          tl.set(layer, { autoAlpha: 1, visibility: 'visible' }, at)
          tl.fromTo(layer, { '--p': '-18%' }, { '--p': '120%', duration: MW, ease: 'none' }, at)
          tl.fromTo(scan, { y: '4vh' }, { y: '-104vh', duration: MW, ease: 'none' }, at)
          tl.fromTo(scan, { autoAlpha: 0 }, { autoAlpha: 1, duration: MW * 0.2 }, at)
          tl.to(scan, { autoAlpha: 0, duration: MW * 0.25 }, at + MW * 0.75)
        })
      }

      /* phase tags swap at each stage anchor */
      for (let k = 0; k < STAGE_COUNT - 1; k++) {
        const at = STAGE_AT[k + 1] - 0.01
        tl.to(tags[k], { autoAlpha: 0, y: -6, duration: 0.014 }, at)
        tl.fromTo(
          tags[k + 1],
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.018 },
          at + 0.006
        )
      }

      /* ---- narrative typography, synced to the film's stages ---- */
      const linesOf = (g) => g.querySelectorAll('.stx-line > *')
      const show = (g, at, dur = 0.03) => {
        tl.set(g, { autoAlpha: 1 }, at)
        tl.fromTo(
          linesOf(g),
          { yPercent: 112 },
          { yPercent: 0, duration: dur, stagger: 0.01, ease: 'power1.out' },
          at
        )
      }
      const hide = (g, at, dur = 0.025) => {
        tl.to(
          linesOf(g),
          { yPercent: -112, duration: dur, stagger: 0.007, ease: 'power1.in' },
          at
        )
        tl.set(g, { autoAlpha: 0 }, at + dur + 0.02)
      }

      tl.to('.seq-titleveil', { autoAlpha: 0, duration: 0.05, ease: 'none' }, 0.015)
      tl.to('.stx-split-l', { xPercent: -16, duration: 0.05, ease: 'power1.in' }, 0.028)
      tl.to('.stx-split-r', { xPercent: 16, duration: 0.05, ease: 'power1.in' }, 0.028)
      hide(groups.g1, 0.032) /* earthworks begin */
      tl.to('.seq-est', { autoAlpha: 0, duration: 0.02 }, 0.03)
      tl.to('.seq-hint', { autoAlpha: 0, duration: 0.02 }, 0.026)

      show(groups.g2, 0.14) /* the slab is poured */
      hide(groups.g2, 0.215)

      show(groups.g3, 0.3) /* the timber frame rises */
      hide(groups.g3, 0.455)

      show(groups.g4, 0.53) /* sheathing, windows, materials */
      hide(groups.g4, 0.655)

      show(groups.g5, 0.71) /* landscaping, complete in daylight */
      hide(groups.g5, 0.79)

      show(groups.g6, 0.87, 0.026) /* dusk — the residence, lit */
      tl.fromTo('.seq-credit', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.018 }, 0.92)
      tl.to([tags[7], railFill.parentNode], { autoAlpha: 0, duration: 0.018 }, 0.94)
      tl.to({}, { duration: 0.01 })
    },
    { pinDistance: '+=600%', scrub: 0.7, deps: [mode] }
  )

  /* ---- the rAF playhead: eases currentTime toward the scroll target,
     freezes exactly when scrolling stops, never autoplays ---- */
  useLayoutEffect(() => {
    if (mode !== 'video') return undefined
    const video = ref.current.querySelector('.seq-video')
    video.pause()
    let current = 0
    const tick = () => {
      const dur = video.duration
      if (!dur) return
      const target = scrubRef.current.target * dur
      const d = target - current
      if (Math.abs(d) < 0.001) return
      /* smooth chase; snap when close so a stopped scroll lands on the
         exact frame instead of oscillating */
      current = Math.abs(d) < 1 / 30 ? target : current + d * 0.22
      if (video.readyState >= 2) video.currentTime = current
    }
    gsap.ticker.add(tick)

    /* if the film can't be decoded/fetched, fall back to frame blends */
    const fail = () => setMode('images')
    video.addEventListener('error', fail)
    const sources = video.querySelectorAll('source')
    const last = sources[sources.length - 1]
    last?.addEventListener('error', fail)
    const guard = setTimeout(() => {
      if (video.readyState === 0) fail()
    }, 15000)

    return () => {
      gsap.ticker.remove(tick)
      clearTimeout(guard)
      video.removeEventListener('error', fail)
      last?.removeEventListener('error', fail)
    }
  }, [mode, ref])

  /* entrance: opening title rises once the loader clears */
  useLayoutEffect(() => {
    const root = ref.current
    const onLoaded = () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const lines = root.querySelectorAll('.stx-1 .stx-line > *')
      if (reduced) {
        gsap.set(lines, { yPercent: 0 })
        gsap.set('.seq-hint', { opacity: 1 })
        return
      }
      gsap.fromTo(
        lines,
        { yPercent: 112 },
        { yPercent: 0, duration: 1.15, stagger: 0.14, ease: 'power3.out', delay: 0.25 }
      )
      gsap.fromTo('.seq-hint', { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.6 })
    }
    window.addEventListener('monolith:loaded', onLoaded)
    return () => window.removeEventListener('monolith:loaded', onLoaded)
  }, [ref])

  return (
    <section id="sequence" className="scene seq" ref={ref}>
      <div className="seq-stack scene-fill">
        {/* the film — scrubbed by scroll, never autoplaying */}
        <video
          className="seq-video"
          muted
          playsInline
          preload="auto"
          poster={FRAMES[0].src}
          aria-label="The MONOLITH residence, built by your scroll"
          style={mode === 'images' ? { display: 'none' } : undefined}
        >
          <source src="/house-build.mp4" type="video/mp4" />
          <source src="/house-build.webm" type="video/webm" />
        </video>

        {mode === 'images' && (
          <>
            <div className="seq-frame scene-fill">
              <img className="seq-img" src={FRAMES[0].src} alt="" aria-hidden="true" />
            </div>
            {FRAMES.slice(1).map((f) => (
              <div className="seq-layer scene-fill" key={f.file}>
                <img className="seq-img" src={f.src} alt="" aria-hidden="true" />
              </div>
            ))}
          </>
        )}
      </div>

      {/* survey scanline (fallback blends only) */}
      <div className="seq-scan" aria-hidden="true">
        <span className="seq-scan-tick" />
      </div>

      {/* technical chrome */}
      <div className="seq-phase t-tech" aria-hidden="true">
        {FRAMES.map((f, i) => (
          <span key={f.file}>{`0${i + 1} — ${f.phase}`}</span>
        ))}
      </div>
      <div className="seq-rail" aria-hidden="true">
        <span className="seq-rail-fill" />
      </div>

      {/* ---- narrative typography ---- */}
      <div className="seq-titleveil" aria-hidden="true" />
      <div className="stx stx-1">
        <div className="stx-line"><span className="stx-mark">MONOLITH</span></div>
        <div className="stx-line"><span className="stx-descriptor">PRIVATE RESIDENCE</span></div>
        <div className="stx-gap" />
        <div className="stx-line"><span className="stx-state stx-split-l">PROPERTY</span></div>
        <div className="stx-line"><span className="stx-state stx-split-r">BEYOND SCALE.</span></div>
      </div>

      <div className="stx stx-2 stx-low-left">
        <div className="stx-line"><span className="stx-state-sm">BELOW EVERY LANDMARK</span></div>
        <div className="stx-line"><span className="stx-state-sm">LIES AN UNSEEN FOUNDATION.</span></div>
      </div>

      <div className="stx stx-3 stx-left">
        <div className="stx-line"><span className="stx-state">FORM</span></div>
        <div className="stx-line"><span className="stx-state">WITHOUT COMPROMISE.</span></div>
        <div className="stx-gap" />
        <div className="stx-line"><span className="stx-fact">1,280 M²</span></div>
        <div className="stx-line"><span className="stx-fact">3 LEVELS</span></div>
        <div className="stx-line"><span className="stx-fact">1 PRIVATE RESIDENCE</span></div>
      </div>

      <div className="stx stx-4 stx-right">
        <div className="stx-line"><span className="stx-state">LIGHT BECOMES</span></div>
        <div className="stx-line"><span className="stx-state">MATERIAL.</span></div>
        <div className="stx-gap" />
        <div className="stx-line"><span className="stx-fact">RAW CONCRETE</span></div>
        <div className="stx-line"><span className="stx-fact">NATURAL STONE</span></div>
        <div className="stx-line"><span className="stx-fact">FLOOR-TO-CEILING GLASS</span></div>
      </div>

      <div className="stx stx-5 stx-low-left">
        <div className="stx-line"><span className="stx-state">THE LAND</span></div>
        <div className="stx-line"><span className="stx-state">RETURNS AROUND IT.</span></div>
      </div>

      <div className="stx stx-6">
        <div className="stx-line"><span className="stx-mark">MONOLITH</span></div>
        <div className="stx-line"><span className="stx-descriptor">PRIVATE VIEWINGS — 2027</span></div>
        <div className="stx-gap" />
        <div className="stx-line">
          <a
            className="stx-cta"
            href="#architecture"
            onClick={(e) => {
              e.preventDefault()
              const lenis = getLenis()
              if (lenis) lenis.scrollTo('#architecture', { duration: 2.2 })
              else document.querySelector('#architecture')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            EXPLORE THE RESIDENCE
          </a>
        </div>
      </div>

      <span className="seq-credit t-tech">CODEGREY.DEV</span>

      <div className="seq-est t-tech" aria-hidden="true">
        <span>PRIVATE RESIDENCES</span>
        <span className="seq-est-dim">EST. 2026</span>
      </div>

      <div className="seq-hint t-tech" aria-hidden="true">
        <span>SCROLL TO ENTER</span>
        <span className="seq-hint-line" />
      </div>
    </section>
  )
}
