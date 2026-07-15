import React from 'react'
import gsap from 'gsap'
import FloorPlanSVG from './svg/FloorPlanSVG'
import { useScrollTimeline, primeDraw } from '../hooks/useScrollTimeline'
import { stills, videos } from '../data/assets'
import './InteriorScene.css'

const LABELS = [
  { text: 'BRONZE + GLASS', x: '19%', y: '30%' },
  { text: 'BOARD-FORMED CONCRETE', x: '58%', y: '20%' },
  { text: 'TRAVERTINE', x: '84%', y: '44%' },
  { text: 'SMOKED OAK', x: '40%', y: '84%' },
]

const DETAILS = ['280 M²', 'PRIVATE TERRACE', 'PANORAMIC BERLIN VIEW', 'THREE BEDROOMS']

/**
 * Scene 4 — through the glass into the residence. The exterior zooms
 * toward the lit living space, the glazing becomes a doorway, and the
 * interior opens up: light moves across travertine, materials identify
 * themselves, the plan flashes over reality.
 */
export default function InteriorScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      const planOverlay = root.querySelector('.int-plan')
      primeDraw(planOverlay, 'line, path, polygon, polyline, circle, rect')
      gsap.set(planOverlay.querySelectorAll('text'), { opacity: 0 })
      gsap.set(planOverlay.querySelectorAll('[data-dot]'), { fillOpacity: 0 })

      /* nothing from later beats may leak into the approach */
      gsap.set('.int-room', { autoAlpha: 0 })
      gsap.set('.int-label', { autoAlpha: 0 })
      const planStrokes = []
      ;['footprint', 'walls', 'axes'].forEach((name) => {
        planOverlay
          .querySelectorAll(`[data-layer="${name}"]`)
          .forEach((g) =>
            planStrokes.push(...g.querySelectorAll('line, path, polygon, polyline, circle'))
          )
      })

      /* --- approach the glass --- */
      tl.fromTo(
        '.int-exterior',
        { scale: 1, transformOrigin: '60% 62%' },
        { scale: 2.7, duration: 0.24, ease: 'power1.in' },
        0
      )
      tl.fromTo(
        '.int-vignette',
        { opacity: 0 },
        { opacity: 1, duration: 0.18 },
        0.06
      )

      /* --- pass through the glazing into the double-height room --- */
      tl.set('.int-room', { autoAlpha: 1 }, 0.17)
      tl.fromTo(
        '.int-room',
        { clipPath: 'inset(34% 54% 30% 18%)', scale: 1.16 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1.14,
          duration: 0.2,
          ease: 'power2.in',
        },
        0.18
      )
      tl.set('.int-exterior', { opacity: 0 }, 0.38)
      tl.to('.int-vignette', { opacity: 0, duration: 0.1 }, 0.34)

      /* --- a slow cinematic drift across the room: glazing → living →
         dining. One continuous move over the whole scene (this wide image
         has the depth to carry it), so it reads as a filmed dolly. --- */
      tl.fromTo(
        '.int-room-media',
        { scale: 1.14, xPercent: 4, yPercent: 1 },
        { scale: 1.05, xPercent: -4, yPercent: 0, duration: 0.62, ease: 'none' },
        0.38
      )
      tl.to('.int-room', { scale: 1, duration: 0.2 }, 0.38)

      /* --- warm light moves across the stone --- */
      tl.fromTo(
        '.int-sweep',
        { xPercent: -70, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.1, ease: 'power1.in' },
        0.42
      )
      tl.to('.int-sweep', {
        xPercent: 160,
        opacity: 0,
        duration: 0.22,
        ease: 'power1.out',
      }, 0.52)

      /* --- materials identify themselves --- */
      root.querySelectorAll('.int-label').forEach((el, i) => {
        const at = 0.5 + i * 0.035
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
      tl.to('.int-label', { autoAlpha: 0, duration: 0.08, stagger: 0.01 }, 0.72)

      /* --- the plan flashes over reality --- */
      tl.fromTo(planOverlay, { opacity: 0 }, { opacity: 0.28, duration: 0.05 }, 0.62)
      tl.to(planStrokes, { strokeDashoffset: 0, duration: 0.12, stagger: 0.004 }, 0.62)
      tl.to(planOverlay, { opacity: 0, duration: 0.08 }, 0.76)

      /* --- the facts, quietly, over the settling room --- */
      root.querySelectorAll('.int-detail').forEach((el, i) => {
        tl.fromTo(
          el,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' },
          0.84 + i * 0.03
        )
      })
      tl.fromTo(
        '.int-detail-rule',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.12, stagger: 0.03 },
        0.84
      )
    },
    { pinDistance: '+=380%' }
  )

  return (
    <section id="scene-interior" className="scene" ref={ref}>
      {/* the exterior we arrive from */}
      <img
        className="img-cover int-exterior"
        src={stills.residenceComplete}
        alt=""
        aria-hidden="true"
      />
      <div className="int-vignette scene-fill" />

      {/* the room */}
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

      {/* material labels */}
      {LABELS.map((l) => (
        <div
          className="int-label"
          key={l.text}
          style={{ left: l.x, top: l.y }}
        >
          <span className="int-label-dot" />
          <span className="int-label-line" />
          <span className="t-tech int-label-text">{l.text}</span>
        </div>
      ))}

      {/* plan overlay */}
      <div className="int-plan scene-fill">
        <FloorPlanSVG className="int-plan-svg" />
      </div>

      {/* property details */}
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
