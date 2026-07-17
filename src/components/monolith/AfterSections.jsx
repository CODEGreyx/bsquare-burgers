import React, { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FRAMES } from '../../data/sequence'
import './AfterSections.css'

gsap.registerPlugin(ScrollTrigger)

/* material details are cropped windows of the supplied sequence frames —
   no invented photography */
const MATERIALS = [
  {
    n: '01',
    name: 'RAW CONCRETE',
    note: 'The slab poured in one day.',
    src: FRAMES[2].src,
    pos: '50% 68%',
    size: '640%',
  },
  {
    n: '02',
    name: 'STRUCTURAL TIMBER',
    note: 'Every rafter placed by hand.',
    src: FRAMES[3].src,
    pos: '50% 10%',
    size: '600%',
  },
  {
    n: '03',
    name: 'NATURAL STONE',
    note: 'Split-face cladding, laid dry.',
    src: FRAMES[7].src,
    pos: '44% 42%',
    size: '700%',
  },
  {
    n: '04',
    name: 'GLASS + LIGHT',
    note: 'Floor to ceiling, warm at dusk.',
    src: FRAMES[7].src,
    pos: '63% 38%',
    size: '640%',
  },
]

function useReveal(ref) {
  useLayoutEffect(() => {
    const root = ref.current
    const ctx = gsap.context(() => {
      root.querySelectorAll('[data-reveal]').forEach((el) => {
        const lines = el.querySelectorAll('.rvl > *')
        const targets = lines.length ? lines : [el]
        gsap.fromTo(
          targets,
          lines.length ? { yPercent: 112 } : { autoAlpha: 0, y: 24 },
          {
            yPercent: 0,
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          }
        )
      })
    }, root)
    return () => ctx.revert()
  }, [ref])
}

export default function AfterSections() {
  const ref = useRef(null)
  const [sent, setSent] = useState(false)
  useReveal(ref)

  return (
    <div ref={ref}>
      {/* ---------- ARCHITECTURE ---------- */}
      <section id="architecture" className="arch">
        <span className="arch-index t-tech">II — ARCHITECTURE</span>
        <h2 className="arch-statement" data-reveal>
          <span className="rvl"><span>A HOUSE IS NOT BUILT.</span></span>
          <span className="rvl"><span>IT IS COMPOSED —</span></span>
          <span className="rvl"><span>OF LAND, LIGHT AND TIME.</span></span>
        </h2>
        <p className="arch-support" data-reveal>
          Three levels held in a single concrete gesture above the water.
          Every opening is placed for one view, once.
        </p>
        <div className="arch-rule" aria-hidden="true" />
      </section>

      {/* ---------- MATERIALS ---------- */}
      <section id="materials" className="mat">
        <span className="arch-index t-tech">III — MATERIAL</span>
        <div className="mat-grid">
          {MATERIALS.map((m) => (
            <article className="mat-cell" key={m.n} data-reveal>
              <div
                className="mat-crop"
                style={{
                  backgroundImage: `url(${m.src})`,
                  backgroundPosition: m.pos,
                  backgroundSize: m.size,
                }}
                aria-hidden="true"
              />
              <div className="mat-meta">
                <span className="mat-n t-tech">{m.n}</span>
                <h3 className="mat-name">{m.name}</h3>
                <p className="mat-note">{m.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- ENQUIRY ---------- */}
      <section id="enquire" className="enq">
        <span className="arch-index t-tech">IV — ENQUIRY</span>
        <h2 className="enq-title" data-reveal>
          <span className="rvl"><span>PRIVATE VIEWINGS</span></span>
          <span className="rvl"><span>BEGIN 2027.</span></span>
        </h2>

        {sent ? (
          <p className="enq-sent t-tech">ENQUIRY RECEIVED — WE WILL BE IN TOUCH.</p>
        ) : (
          <form
            className="enq-form"
            data-reveal
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
          >
            <label className="enq-field">
              <span className="t-tech">NAME</span>
              <input type="text" name="name" autoComplete="name" required />
            </label>
            <label className="enq-field">
              <span className="t-tech">EMAIL</span>
              <input type="email" name="email" autoComplete="email" required />
            </label>
            <label className="enq-field enq-field-wide">
              <span className="t-tech">MESSAGE</span>
              <textarea name="message" rows="3" required />
            </label>
            <button className="enq-submit" type="submit">
              SUBMIT ENQUIRY
            </button>
          </form>
        )}

        <footer className="enq-footer">
          <span className="t-tech">MONOLITH — PRIVATE RESIDENCE</span>
          <span className="t-tech">A CONCEPT EXPERIENCE BY CODEGREY.DEV</span>
          <span className="t-tech enq-disclaimer">
            MONOLITH IS A FICTIONAL BRAND CREATED FOR THIS CONCEPT · NO REAL
            PROPERTY IS REPRESENTED
          </span>
        </footer>
      </section>
    </div>
  )
}
