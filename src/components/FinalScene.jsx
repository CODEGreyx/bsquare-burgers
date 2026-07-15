import React from 'react'
import gsap from 'gsap'
import { useScrollTimeline, primeDraw } from '../hooks/useScrollTimeline'
import { stills } from '../data/assets'
import { sound } from '../lib/sound'
import './FinalScene.css'

const SLICES = 6

/**
 * Scene 5 — the residence deconstructs into architectural planes, the
 * planes flatten into a drawn grid, the grid resolves into the
 * NØRTHLINE mark, and the mark hands over to CODEGREY.DEV.
 */
export default function FinalScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      const slices = root.querySelectorAll('.fin-slice')
      const mono = root.querySelector('.fin-mark')
      primeDraw(mono, 'path, line, polyline')

      /* --- the residence returns, assembled --- */
      tl.fromTo(
        '.fin-stage',
        { opacity: 0 },
        { opacity: 1, duration: 0.06 },
        0
      )

      /* --- it separates into planes --- */
      slices.forEach((s, i) => {
        const dir = i % 2 === 0 ? -1 : 1
        tl.to(
          s,
          {
            yPercent: dir * (7 + i * 3.2),
            scaleX: 0.94,
            duration: 0.2,
            ease: 'power1.inOut',
          },
          0.14 + i * 0.012
        )
      })
      tl.to(
        '.fin-slice-img',
        { filter: 'grayscale(0.75) brightness(0.5)', duration: 0.22 },
        0.16
      )

      /* --- planes flatten into a drawn grid --- */
      slices.forEach((s, i) => {
        tl.to(
          s,
          {
            yPercent: 0,
            scaleX: 0.012,
            duration: 0.18,
            ease: 'power2.inOut',
          },
          0.36 + i * 0.015
        )
      })
      tl.to('.fin-slice-tint', { opacity: 1, duration: 0.12 }, 0.42)

      /* --- the grid becomes the mark --- */
      tl.to(
        slices,
        { opacity: 0, duration: 0.1, stagger: 0.008 },
        0.56
      )
      tl.to(
        mono.querySelectorAll('path, line, polyline'),
        { strokeDashoffset: 0, duration: 0.14, stagger: 0.03 },
        0.56
      )
      tl.fromTo(
        '.fin-mark-caption',
        { opacity: 0 },
        { opacity: 1, duration: 0.05 },
        0.66
      )

      /* --- hand over to the studio --- */
      tl.to(
        '.fin-mark-wrap',
        { scale: 0.62, yPercent: -160, duration: 0.12, ease: 'power2.inOut' },
        0.74
      )
      tl.to('.fin-mark-caption', { opacity: 0, duration: 0.04 }, 0.74)
      tl.call(() => sound.brandTone(), null, 0.78)
      tl.fromTo(
        '.fin-by',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.06 },
        0.78
      )
      tl.fromTo(
        '.fin-studio',
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.09, ease: 'power2.out' },
        0.81
      )
      tl.fromTo(
        '.fin-tagline',
        { opacity: 0 },
        { opacity: 1, duration: 0.06 },
        0.87
      )
      tl.fromTo(
        '.fin-footer',
        { opacity: 0 },
        { opacity: 1, duration: 0.05 },
        0.9
      )
      /* --- hold the final composition for the reel --- */
      tl.to({}, { duration: 0.1 })
    },
    { pinDistance: '+=340%' }
  )

  return (
    <section id="scene-final" className="scene" ref={ref}>
      <div className="fin-stage scene-fill">
        {Array.from({ length: SLICES }, (_, i) => (
          <div className="fin-slice" key={i}>
            <div
              className="fin-slice-img"
              style={{
                backgroundImage: `url(${stills.residenceComplete})`,
                backgroundPosition: `${(i / (SLICES - 1)) * 100}% 50%`,
                backgroundSize: `${SLICES * 100}% 100%`,
              }}
            />
            <div className="fin-slice-tint" />
          </div>
        ))}
      </div>

      <div className="fin-center scene-fill">
        <div className="fin-mark-wrap">
          <svg
            className="fin-mark"
            viewBox="0 0 120 100"
            fill="none"
            aria-hidden="true"
          >
            <path d="M20 78 V22" stroke="var(--ivory)" strokeWidth="3" />
            <path d="M20 22 L74 78" stroke="var(--ivory)" strokeWidth="3" />
            <path d="M74 78 V22" stroke="var(--ivory)" strokeWidth="3" />
            <line x1="6" y1="88" x2="114" y2="88" stroke="var(--ivory)" strokeWidth="1.5" opacity="0.6" />
          </svg>
          <span className="t-label fin-mark-caption">Nørthline Residences</span>
        </div>

        <div className="fin-brand">
          <span className="t-label fin-by">A concept experience by</span>
          <span className="t-display fin-studio">CODEGREY.DEV</span>
          <span className="t-tech fin-tagline">
            Digital experiences for ambitious brands.
          </span>
        </div>
      </div>

      <div className="t-tech fin-footer">
        NØRTHLINE is a fictional brand created for this concept · no real
        property is represented
      </div>
    </section>
  )
}
