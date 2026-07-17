import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollTimeline, primeDraw } from '../../hooks/useScrollTimeline'
import { FX, LIB } from '../../data/frames'
import { getLenis } from '../../lib/lenis'
import './Scenes.css'

gsap.registerPlugin(ScrollTrigger)

/* ==================================================================
   SCENE 2 — architecture becomes typography.
   Monumental cropped letters sit BETWEEN two copies of the same
   frame: the sky copy behind the words, the building copy masked in
   front of them, moving at different scroll speeds.
   ================================================================== */
export function TypeScene() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const root = ref.current
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.ts-word',
        { yPercent: 26 },
        {
          yPercent: -14,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        }
      )
      gsap.fromTo(
        '.ts-front',
        { yPercent: 4 },
        {
          yPercent: -2,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        }
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="type" className="ts" ref={ref}>
      <img className="ts-back" src={FX.golden} alt="" aria-hidden="true" />
      <div className="ts-words" aria-hidden="true">
        <span className="ts-word">DESIGNED</span>
        <span className="ts-word">WITHOUT</span>
        <span className="ts-word">COMPROMISE</span>
      </div>
      <img className="ts-front" src={FX.golden} alt="The timber frame of Residence 01 at noon" />
      <div className="ts-label t-tech">
        <span>RESIDENCE 01</span>
        <span className="ts-label-dim">PRIVATE COLLECTION</span>
      </div>
    </section>
  )
}

/* ==================================================================
   SCENE 3 — pinned horizontal sequence: four full-height films-as-
   stills, each with one word, a project code and internal drift.
   ================================================================== */
const PANELS = [
  { src: LIB.seafrontPool, word: 'FORM', code: 'ML·26·01', n: '01' },
  { src: LIB.living, word: 'LIGHT', code: 'ML·26·02', n: '02' },
  { src: LIB.concrete, word: 'MATERIAL', code: 'ML·26·03', n: '03' },
  { src: FX.duskb, word: 'SILENCE', code: 'ML·26·04', n: '04' },
]

export function GalleryScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      const track = root.querySelector('.gl-track')
      const shift = () => -(track.scrollWidth - window.innerWidth)
      tl.to(track, { x: shift, duration: 1, ease: 'none' }, 0)
      /* counter-drift inside every panel: layered depth, no flat slide */
      root.querySelectorAll('.gl-img').forEach((img) => {
        tl.fromTo(img, { xPercent: -5 }, { xPercent: 5, duration: 1, ease: 'none' }, 0)
      })
      root.querySelectorAll('.gl-word').forEach((w) => {
        tl.fromTo(w, { xPercent: 12 }, { xPercent: -12, duration: 1, ease: 'none' }, 0)
      })
      tl.fromTo('.gl-progress-fill', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'none' }, 0)
    },
    { pinDistance: '+=150%', scrub: 0.9 }
  )

  return (
    <section id="gallery" className="gl scene" ref={ref}>
      <div className="gl-track">
        {PANELS.map((p) => (
          <article className="gl-panel" key={p.n}>
            <div className="gl-imgwrap">
              <img className="gl-img" src={p.src} alt="" aria-hidden="true" />
            </div>
            <span className="gl-word" aria-hidden="true">{p.word}</span>
            <div className="gl-meta t-tech">
              <span className="gl-n">{p.n}</span>
              <span>{p.word}</span>
              <span className="gl-code">{p.code}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="gl-progress" aria-hidden="true">
        <span className="gl-progress-fill" />
      </div>
      <span className="gl-tag t-tech">THE COLLECTION — FOUR STUDIES</span>
    </section>
  )
}

/* ==================================================================
   SCENE 4 — material study. The grey architectural frame becomes a
   layered composition of oversized crops with thin-line labels,
   drifting at different speeds under a travelling light.
   ================================================================== */
const SWATCHES = [
  { label: 'HONED LIMESTONE', src: LIB.concrete, pos: '40% 55%', size: '460%', cls: 'mt-a' },
  { label: 'SMOKED GLASS', src: FX.evening, pos: '62% 36%', size: '520%', cls: 'mt-b' },
  { label: 'WARM INTERIOR OAK', src: LIB.living2, pos: '55% 60%', size: '440%', cls: 'mt-c' },
  { label: 'NATURAL SHADOW', src: LIB.seafrontPool, pos: '24% 66%', size: '460%', cls: 'mt-d' },
]

export function MaterialScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      tl.fromTo('.mt-bg', { scale: 1.08 }, { scale: 1, duration: 1, ease: 'none' }, 0)
      tl.fromTo('.mt-a', { y: 60 }, { y: -70, duration: 1, ease: 'none' }, 0)
      tl.fromTo('.mt-b', { y: 110 }, { y: -40, duration: 1, ease: 'none' }, 0)
      tl.fromTo('.mt-c', { y: 30 }, { y: -110, duration: 1, ease: 'none' }, 0)
      tl.fromTo('.mt-d', { y: 140 }, { y: -20, duration: 1, ease: 'none' }, 0)
      tl.fromTo('.mt-light', { xPercent: -60 }, { xPercent: 60, duration: 1, ease: 'none' }, 0)
      const lines = root.querySelectorAll('.mt-statement .rvl > span')
      tl.fromTo(
        lines,
        { yPercent: 112 },
        { yPercent: 0, duration: 0.16, stagger: 0.05, ease: 'power1.out' },
        0.3
      )
      root.querySelectorAll('.mt-swatch').forEach((s, i) => {
        tl.fromTo(
          s.querySelector('.mt-tagline'),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.1, ease: 'power1.out' },
          0.12 + i * 0.08
        )
        tl.fromTo(
          s.querySelector('.mt-taglabel'),
          { autoAlpha: 0, x: -10 },
          { autoAlpha: 1, x: 0, duration: 0.08 },
          0.18 + i * 0.08
        )
      })
    },
    { pinDistance: '+=150%', scrub: 0.9 }
  )

  return (
    <section id="material" className="mt scene" ref={ref}>
      <img className="mt-bg" src={FX.frame2} alt="" aria-hidden="true" />
      <div className="mt-veil" aria-hidden="true" />
      <div className="mt-light" aria-hidden="true" />

      {SWATCHES.map((s) => (
        <figure className={`mt-swatch ${s.cls}`} key={s.label}>
          <div
            className="mt-crop"
            style={{ backgroundImage: `url(${s.src})`, backgroundPosition: s.pos, backgroundSize: s.size }}
          />
          <figcaption className="mt-tag t-tech">
            <span className="mt-tagline" />
            <span className="mt-taglabel">{s.label}</span>
          </figcaption>
        </figure>
      ))}

      <h2 className="mt-statement" aria-label="Material becomes atmosphere">
        <span className="rvl"><span>MATERIAL</span></span>
        <span className="rvl"><span>BECOMES</span></span>
        <span className="rvl"><span>ATMOSPHERE</span></span>
      </h2>
      <span className="mt-index t-tech">III — MATERIAL STUDY</span>
    </section>
  )
}

/* ==================================================================
   SCENE 5 — the private collection. One frame, one choreography:
   from an extreme architectural close-up to the complete residence.
   ================================================================== */
export function CollectionScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      tl.fromTo(
        '.cl-img',
        { scale: 2.7, transformOrigin: '62% 38%' },
        { scale: 1, duration: 1, ease: 'none' },
        0
      )
      const counter = root.querySelector('.cl-count')
      const proxy = { n: 1 }
      tl.to(
        proxy,
        {
          n: 4,
          duration: 0.9,
          ease: 'none',
          onUpdate: () => {
            counter.textContent = `0${Math.round(proxy.n)} / 04`
          },
        },
        0.05
      )
      tl.fromTo(
        root.querySelectorAll('.cl-title .rvl > span'),
        { yPercent: 112 },
        { yPercent: 0, duration: 0.12, stagger: 0.04, ease: 'power1.out' },
        0.06
      )
      tl.fromTo('.cl-sentence', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.55)
      root.querySelectorAll('.cl-edge span').forEach((s, i) => {
        tl.fromTo(s, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.15 + i * 0.09)
      })
    },
    { pinDistance: '+=170%', scrub: 0.9 }
  )

  return (
    <section id="collection" className="cl scene" ref={ref}>
      <img className="cl-img" src={FX.hero} alt="The completed residence at dusk" />
      <div className="cl-veil" aria-hidden="true" />

      <div className="cl-title">
        <span className="rvl"><span>THE PRIVATE</span></span>
        <span className="rvl"><span>COLLECTION</span></span>
      </div>
      <p className="cl-sentence">
        Residences shaped around privacy, proportion and permanence.
      </p>

      <div className="cl-edge cl-edge-left t-tech" aria-hidden="true">
        <span>ARCHITECTURE</span>
        <span>INTERIORS</span>
      </div>
      <div className="cl-edge cl-edge-right t-tech" aria-hidden="true">
        <span>LANDSCAPE</span>
        <span>PRIVATE ACCESS</span>
      </div>
      <span className="cl-count t-tech">01 / 04</span>
    </section>
  )
}

/* ==================================================================
   SCENE 6 — spatial blueprint. Authentic measurement lines, grids
   and annotations draw over the quietly visible structure.
   ================================================================== */
export function BlueprintScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      const svg = root.querySelector('.bp-svg')
      primeDraw(svg, 'line, path, rect, circle')
      gsap.set(svg.querySelectorAll('text'), { opacity: 0 })

      tl.fromTo('.bp-bg', { scale: 1.05 }, { scale: 1, duration: 1, ease: 'none' }, 0)
      tl.to(svg.querySelectorAll('.bp-grid line'), { strokeDashoffset: 0, duration: 0.3, stagger: 0.012 }, 0.02)
      tl.to(svg.querySelectorAll('.bp-dims line, .bp-dims path'), { strokeDashoffset: 0, duration: 0.28, stagger: 0.02 }, 0.22)
      tl.to(svg.querySelectorAll('.bp-plan rect, .bp-plan line'), { strokeDashoffset: 0, duration: 0.3, stagger: 0.018 }, 0.34)
      tl.to(svg.querySelectorAll('text'), { opacity: 0.85, duration: 0.14, stagger: 0.012 }, 0.48)
      tl.fromTo(
        root.querySelectorAll('.bp-statement .rvl > span'),
        { yPercent: 112 },
        { yPercent: 0, duration: 0.14, stagger: 0.05, ease: 'power1.out' },
        0.52
      )
      tl.to({}, { duration: 0.15 })
    },
    { pinDistance: '+=150%', scrub: 0.9 }
  )

  return (
    <section id="blueprint" className="bp scene" ref={ref}>
      <img className="bp-bg" src={FX.day} alt="" aria-hidden="true" />
      <div className="bp-veil" aria-hidden="true" />

      <svg className="bp-svg" viewBox="0 0 1440 900" fill="none" aria-hidden="true">
        <g className="bp-grid" stroke="rgba(240,235,225,0.14)" strokeWidth="1">
          {[180, 420, 720, 1020, 1260].map((x) => (
            <line key={`v${x}`} x1={x} y1="60" x2={x} y2="840" />
          ))}
          {[150, 450, 750].map((y) => (
            <line key={`h${y}`} x1="80" y1={y} x2="1360" y2={y} />
          ))}
        </g>
        <g className="bp-dims" stroke="rgba(240,235,225,0.55)" strokeWidth="1">
          <line x1="180" y1="110" x2="1020" y2="110" />
          <path d="M180 104 l0 12 M1020 104 l0 12 M600 104 l0 12" />
          <line x1="120" y1="150" x2="120" y2="750" />
          <path d="M114 150 l12 0 M114 450 l12 0 M114 750 l12 0" />
          <line x1="1320" y1="450" x2="1320" y2="840" />
          <path d="M1314 450 l12 0 M1314 840 l12 0" />
        </g>
        <g className="bp-plan" stroke="rgba(168,132,92,0.8)" strokeWidth="1.2">
          <rect x="420" y="450" width="600" height="300" />
          <line x1="720" y1="450" x2="720" y2="750" />
          <line x1="420" y1="600" x2="720" y2="600" />
          <rect x="470" y="500" width="90" height="60" />
        </g>
        <g
          fill="rgba(240,235,225,0.7)"
          fontFamily="Inter, sans-serif"
          fontSize="13"
          letterSpacing="2.5"
        >
          <text x="560" y="96">42.60 M</text>
          <text x="86" y="440" transform="rotate(-90 86 440)">18.20 M</text>
          <text x="1338" y="640" transform="rotate(90 1338 640)">LEVEL 00–02</text>
          <text x="430" y="438">SECTION A—A</text>
          <text x="730" y="778">GSF 1 280 M²</text>
          <text x="182" y="856">N 26°07′ — W 80°08′</text>
        </g>
      </svg>

      <h2 className="bp-statement" aria-label="Precision is the ultimate luxury">
        <span className="rvl"><span>PRECISION</span></span>
        <span className="rvl"><span>IS THE</span></span>
        <span className="rvl"><span>ULTIMATE LUXURY</span></span>
      </h2>
      <span className="bp-index t-tech">IV — TECHNICAL RECORD</span>
    </section>
  )
}

/* ==================================================================
   SCENE 7 — final statement. The strongest dusk frame, the closing
   line of a luxury commercial, one refined typographic interaction.
   ================================================================== */
export function FinalStatement() {
  const ref = useScrollTimeline(
    (tl, root) => {
      tl.fromTo('.fs-img', { scale: 1.12 }, { scale: 1, duration: 1, ease: 'none' }, 0)
      tl.fromTo(
        root.querySelectorAll('.fs-built .rvl > span'),
        { yPercent: 112 },
        { yPercent: 0, duration: 0.16, stagger: 0.06, ease: 'power1.out' },
        0.12
      )
      tl.fromTo('.fs-by', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.32)
      tl.fromTo('.fs-cta', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.42)

      /* the studio signature: the frame sinks to black, CODEGREY.DEV */
      tl.to('.fs-black', { autoAlpha: 1, duration: 0.14, ease: 'none' }, 0.56)
      tl.to(['.fs-center'], { autoAlpha: 0, duration: 0.1 }, 0.58)
      tl.fromTo(
        root.querySelectorAll('.fs-cg .rvl > span'),
        { yPercent: 112 },
        { yPercent: 0, duration: 0.1, stagger: 0.04, ease: 'power1.out' },
        0.72
      )
      tl.fromTo('.fs-cg-tag', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.84)
      tl.fromTo('.fs-foot', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.9)
      tl.to({}, { duration: 0.06 })
    },
    { pinDistance: '+=200%', scrub: 0.9 }
  )

  return (
    <section id="final" className="fs scene" ref={ref}>
      <img className="fs-img" src={FX.evening} alt="The residence at dusk, lit from within" />
      <div className="fs-veil" aria-hidden="true" />

      <div className="fs-center">
        <h2 className="fs-built" aria-label="Built for the few">
          <span className="rvl"><span>BUILT FOR</span></span>
          <span className="rvl"><span>THE FEW.</span></span>
        </h2>
        <div className="fs-by">
          <span className="t-tech fs-by-line">PRIVATE RESIDENCES</span>
          <span className="fs-brand">BY MONOLITH</span>
        </div>
        <a
          className="fs-cta"
          href="#gallery"
          onClick={(e) => {
            e.preventDefault()
            const lenis = getLenis()
            if (lenis) lenis.scrollTo('#gallery', { duration: 2.4 })
            else document.querySelector('#gallery')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          ENTER THE COLLECTION <span className="fs-arrow">→</span>
        </a>
      </div>

      <div className="fs-black" aria-hidden="true" />
      <div className="fs-cg">
        <div className="rvl"><span className="t-tech fs-cg-label">A CONCEPT EXPERIENCE BY</span></div>
        <div className="rvl"><span className="fs-cg-mark">CODEGREY.DEV</span></div>
        <span className="t-tech fs-cg-tag">DIGITAL EXPERIENCES FOR AMBITIOUS BRANDS.</span>
      </div>
      <div className="fs-foot t-tech">
        <span>MONOLITH — EST. 2026</span>
        <span className="fs-foot-dim">
          MONOLITH IS A FICTIONAL BRAND · NO REAL PROPERTY IS REPRESENTED
        </span>
      </div>
    </section>
  )
}
