import React from 'react'
import gsap from 'gsap'
import { useScrollTimeline } from '../hooks/useScrollTimeline'
import { stills, videos } from '../data/assets'
import { sound } from '../lib/sound'
import './InteriorScene.css'

const LABELS = [
  { text: 'BRONZE + GLASS', x: '19%', y: '30%' },
  { text: 'BOARD-FORMED CONCRETE', x: '58%', y: '20%' },
  { text: 'TRAVERTINE', x: '84%', y: '44%' },
  { text: 'SMOKED OAK', x: '40%', y: '84%' },
]

const DETAILS = ['280 M²', 'PRIVATE TERRACE', 'PANORAMIC BERLIN VIEW', 'THREE BEDROOMS']

/**
 * The interior — held still. The room is revealed once by a single
 * architectural wipe, then it does not move: only light, the material
 * labels and the property facts resolve over the static image, so the
 * space can be read (and filmed) calmly.
 */
export default function InteriorScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      gsap.set('.int-label', { autoAlpha: 0 })

      /* the room is simply present — a clean cut in from the exterior, held
         completely still. Only light and type move over it. */
      tl.call(() => sound.impact(0.6), null, 0.04)

      /* --- one slow pass of warm light, the only movement --- */
      tl.fromTo(
        '.int-sweep',
        { xPercent: -70, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.12, ease: 'power1.in' },
        0.24
      )
      tl.to('.int-sweep', { xPercent: 160, opacity: 0, duration: 0.26, ease: 'power1.out' }, 0.36)

      /* --- materials identify themselves, then step back --- */
      root.querySelectorAll('.int-label').forEach((el, i) => {
        const at = 0.3 + i * 0.04
        tl.set(el, { autoAlpha: 1 }, at)
        tl.fromTo(
          el.querySelector('.int-label-line'),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.05, ease: 'power2.out' },
          at
        )
        tl.fromTo(
          el.querySelector('.int-label-text'),
          { opacity: 0, x: -6 },
          { opacity: 1, x: 0, duration: 0.05 },
          at + 0.03
        )
      })
      tl.to('.int-label', { autoAlpha: 0, duration: 0.08, stagger: 0.01 }, 0.6)

      /* --- the facts, quietly, over the still room --- */
      root.querySelectorAll('.int-detail').forEach((el, i) => {
        tl.fromTo(
          el,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.07, ease: 'power2.out' },
          0.66 + i * 0.04
        )
      })
      tl.fromTo('.int-detail-rule', { scaleX: 0 }, { scaleX: 1, duration: 0.12, stagger: 0.03 }, 0.66)
      tl.to({}, { duration: 0.1 })
    },
    { pinDistance: '+=320%' }
  )

  return (
    <section id="scene-interior" className="scene" ref={ref}>
      <div className="int-room scene-fill">
        {videos.interiorLight ? (
          <video
            className="img-cover int-room-media"
            src={videos.interiorLight}
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <img
            className="img-cover int-room-media"
            src={stills.interiorLiving}
            alt="Living space of the NØRTHLINE residence — travertine, smoked oak, bronze and glass"
          />
        )}
        <div className="int-sweep" />
      </div>

      {LABELS.map((l) => (
        <div className="int-label" key={l.text} style={{ left: l.x, top: l.y }}>
          <span className="int-label-dot" />
          <span className="int-label-line" />
          <span className="t-tech int-label-text">{l.text}</span>
        </div>
      ))}

      <div className="int-details">
        {DETAILS.map((d, i) => (
          <React.Fragment key={d}>
            {i > 0 && <span className="int-detail-rule" />}
            <span className={`int-detail ${i === 0 ? 't-display int-detail-big' : 't-label'}`}>
              {d}
            </span>
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}
