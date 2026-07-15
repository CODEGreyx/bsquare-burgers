import React from 'react'
import gsap from 'gsap'
import { useScrollTimeline, primeDraw } from '../hooks/useScrollTimeline'
import { stills } from '../data/assets'
import { sound } from '../lib/sound'
import './FinalScene.css'

/**
 * The ending — the finished residence holds, quietly darkens to black,
 * the NØRTHLINE mark draws itself, and the mark hands over to the
 * CODEGREY.DEV identity. No movement beyond the drawing of the mark.
 */
export default function FinalScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      const mono = root.querySelector('.fin-mark')
      primeDraw(mono, 'path, line, polyline')

      /* --- the finished residence, held, then dimmed to black --- */
      tl.fromTo('.fin-stage', { opacity: 1 }, { opacity: 1, duration: 0.12 }, 0)
      tl.to('.fin-veil', { opacity: 1, duration: 0.14, ease: 'power1.in' }, 0.16)
      tl.to('.fin-stage', { scale: 1.04, duration: 0.5, ease: 'none' }, 0)

      /* --- the mark draws itself out of the dark --- */
      tl.to(
        mono.querySelectorAll('path, line, polyline'),
        { strokeDashoffset: 0, duration: 0.16, stagger: 0.03 },
        0.34
      )
      tl.fromTo(
        '.fin-mark-caption',
        { opacity: 0 },
        { opacity: 1, duration: 0.06 },
        0.46
      )

      /* --- hand over to the studio --- */
      tl.to(
        '.fin-mark-wrap',
        { scale: 0.62, yPercent: -160, duration: 0.12, ease: 'power2.inOut' },
        0.6
      )
      tl.to('.fin-mark-caption', { opacity: 0, duration: 0.04 }, 0.6)
      tl.call(() => sound.brandTone(), null, 0.64)
      tl.fromTo(
        '.fin-by',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.07 },
        0.64
      )
      tl.fromTo(
        '.fin-studio',
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' },
        0.68
      )
      tl.fromTo(
        '.fin-tagline',
        { opacity: 0 },
        { opacity: 1, duration: 0.07 },
        0.76
      )
      tl.fromTo(
        '.fin-footer',
        { opacity: 0 },
        { opacity: 1, duration: 0.06 },
        0.8
      )
      /* --- hold the final composition for the reel --- */
      tl.to({}, { duration: 0.14 })
    },
    { pinDistance: '+=340%' }
  )

  return (
    <section id="scene-final" className="scene" ref={ref}>
      <img className="img-cover fin-stage" src={stills.residenceComplete} alt="" aria-hidden="true" />
      <div className="fin-veil scene-fill" />

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
