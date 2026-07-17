import React, { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { useScrollTimeline } from '../../hooks/useScrollTimeline'
import { FRAMES } from '../../data/sequence'
import { getLenis } from '../../lib/lenis'
import './SequenceScene.css'

/* transition start positions on the 0→1 pinned timeline (7 blends) */
const T = [0.1, 0.27, 0.4, 0.55, 0.68, 0.8, 0.905]
const TDUR = 0.08

/**
 * THE SEQUENCE — one locked frame, eight construction stages of the same
 * villa, blended by a soft boundary that climbs the image as you scroll.
 * Scroll down: the residence assembles. Scroll up: it dissolves.
 * Nothing autoplays; the scrollbar is the timeline.
 */
export default function SequenceScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      const layers = root.querySelectorAll('.seq-layer')
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

      /* GSAP owns every initial state */
      layers.forEach((el) =>
        gsap.set(el, { '--p': '-18%', autoAlpha: 0, visibility: 'hidden' })
      )
      gsap.set(scan, { autoAlpha: 0 })
      gsap.set(tags, { autoAlpha: 0 })
      gsap.set(tags[0], { autoAlpha: 1 })
      Object.values(groups).forEach((g) => {
        if (g !== groups.g1) gsap.set(g.querySelectorAll('.stx-line > *'), { yPercent: 112 })
      })

      /* slow global settle — subtle depth without breaking alignment */
      tl.fromTo('.seq-stack', { scale: 1.09 }, { scale: 1.045, duration: 1, ease: 'none' }, 0)

      /* vertical progress rail, right edge */
      tl.fromTo(railFill, { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'none' }, 0)

      /* one construction blend: the next stage climbs up through a soft
         travelling boundary while a hairline "survey" scanline tracks it */
      const blend = (i, at) => {
        const layer = layers[i - 1] // layer k reveals frame k+1
        tl.set(layer, { autoAlpha: 1, visibility: 'visible' }, at)
        tl.fromTo(
          layer,
          { '--p': '-18%' },
          { '--p': '120%', duration: TDUR, ease: 'none' },
          at
        )
        /* incoming stage settles by a breath as it lands */
        tl.fromTo(
          layer.querySelector('img'),
          { scale: 1.014 },
          { scale: 1, duration: TDUR * 1.4, ease: 'none' },
          at
        )
        /* scanline sweeps with the boundary */
        tl.fromTo(scan, { y: '4vh' }, { y: '-104vh', duration: TDUR, ease: 'none' }, at)
        tl.fromTo(scan, { autoAlpha: 0 }, { autoAlpha: 1, duration: TDUR * 0.2 }, at)
        tl.to(scan, { autoAlpha: 0, duration: TDUR * 0.25 }, at + TDUR * 0.75)
        /* phase tag swap */
        tl.to(tags[i - 1], { autoAlpha: 0, y: -6, duration: 0.018 }, at + TDUR * 0.55)
        tl.fromTo(
          tags[i],
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.022 },
          at + TDUR * 0.62
        )
      }
      T.forEach((at, k) => blend(k + 1, at))

      /* ---- typography: masked line reveals, in and out ---- */
      const linesOf = (g) => g.querySelectorAll('.stx-line > *')
      const show = (g, at, dur = 0.035) => {
        tl.set(g, { autoAlpha: 1 }, at)
        tl.fromTo(
          linesOf(g),
          { yPercent: 112 },
          { yPercent: 0, duration: dur, stagger: 0.012, ease: 'power1.out' },
          at
        )
      }
      const hide = (g, at, dur = 0.03) => {
        tl.to(
          linesOf(g),
          { yPercent: -112, duration: dur, stagger: 0.008, ease: 'power1.in' },
          at
        )
        tl.set(g, { autoAlpha: 0 }, at + dur + 0.02)
      }

      /* G1 opening title is revealed by the entrance animation; the
         timeline only takes it away as the record begins */
      hide(groups.g1, 0.04)
      tl.to('.seq-hint', { autoAlpha: 0, duration: 0.025 }, 0.03)

      show(groups.g2, 0.2)
      hide(groups.g2, 0.315)

      show(groups.g3, 0.44)
      hide(groups.g3, 0.62)

      show(groups.g4, 0.725)
      hide(groups.g4, 0.855)

      show(groups.g5, 0.868)
      hide(groups.g5, 0.937)

      show(groups.g6, 0.968, 0.028)
      tl.fromTo(
        '.seq-credit',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.02 },
        0.985
      )
      /* phase tag steps aside for the closing title */
      tl.to([tags[7], railFill.parentNode], { autoAlpha: 0, duration: 0.02 }, 0.965)
      tl.to({}, { duration: 0.015 })
    },
    { pinDistance: '+=650%', scrub: 0.9 }
  )

  /* entrance: first frame settles, opening title rises — after preload */
  useLayoutEffect(() => {
    const root = ref.current
    const onLoaded = () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const g1 = root.querySelector('.stx-1')
      const lines = g1.querySelectorAll('.stx-line > *')
      if (reduced) {
        gsap.set(lines, { yPercent: 0 })
        gsap.set('.seq-hint', { opacity: 1 })
        return
      }
      gsap.fromTo(
        root.querySelector('.seq-frame-first img'),
        { scale: 1.045 },
        { scale: 1, duration: 2.6, ease: 'power2.out' }
      )
      gsap.fromTo(
        lines,
        { yPercent: 112 },
        { yPercent: 0, duration: 1.15, stagger: 0.14, ease: 'power3.out', delay: 0.25 }
      )
      gsap.fromTo(
        '.seq-hint',
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 1.6 }
      )
    }
    window.addEventListener('monolith:loaded', onLoaded)
    return () => window.removeEventListener('monolith:loaded', onLoaded)
  }, [ref])

  return (
    <section id="sequence" className="scene seq" ref={ref}>
      <div className="seq-stack scene-fill">
        {/* base: empty land */}
        <div className="seq-frame seq-frame-first scene-fill">
          <img className="seq-img" src={FRAMES[0].src} alt="A cleared plot above the sea at dusk" />
        </div>
        {/* stages 2–8, revealed bottom-to-top */}
        {FRAMES.slice(1).map((f) => (
          <div className="seq-layer scene-fill" key={f.file}>
            <img className="seq-img" src={f.src} alt="" aria-hidden="true" />
          </div>
        ))}
      </div>

      {/* survey scanline that rides each blend */}
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
      <div className="stx stx-1">
        <div className="stx-line"><span className="stx-mark">MONOLITH</span></div>
        <div className="stx-line"><span className="stx-descriptor">PRIVATE RESIDENCE</span></div>
        <div className="stx-gap" />
        <div className="stx-line"><span className="stx-state">ARCHITECTURE BEGINS</span></div>
        <div className="stx-line"><span className="stx-state">WITH THE LAND.</span></div>
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
        <div className="stx-line"><span className="stx-state">BETWEEN</span></div>
        <div className="stx-line"><span className="stx-state">LAND AND WATER.</span></div>
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

      <div className="seq-hint t-tech" aria-hidden="true">
        <span>SCROLL</span>
        <span className="seq-hint-line" />
      </div>
    </section>
  )
}
