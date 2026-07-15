import React, { useLayoutEffect } from 'react'
import gsap from 'gsap'
import FloorPlanSVG from './svg/FloorPlanSVG'
import { useScrollTimeline, primeDraw } from '../hooks/useScrollTimeline'
import './BlueprintScene.css'

const TITLE = 'NØRTHLINE'

/**
 * Scene 1 — darkness, the name, then the residence footprint draws
 * itself into a complete architectural sheet as the user scrolls.
 */
export default function BlueprintScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      const plan = root.querySelector('.bp-plan')
      const drawn = primeDraw(
        plan,
        'line, path, polygon, polyline, circle, rect'
      )
      gsap.set(drawn, { opacity: 1 })
      gsap.set(plan.querySelectorAll('text'), { opacity: 0 })
      gsap.set(plan.querySelectorAll('[data-dot]'), { fillOpacity: 0 })
      gsap.set(plan, { opacity: 1 })

      const layer = (name) => plan.querySelectorAll(`[data-layer="${name}"]`)
      const strokesOf = (name) => {
        const els = []
        layer(name).forEach((g) =>
          els.push(
            ...g.querySelectorAll('line, path, polygon, polyline, circle, rect')
          )
        )
        return els
      }
      const textsOf = (name) => {
        const els = []
        layer(name).forEach((g) => els.push(...g.querySelectorAll('text')))
        return els
      }
      const draw = (els, pos, dur = 0.14, stagger = 0.012) =>
        tl.to(els, { strokeDashoffset: 0, duration: dur, stagger }, pos)
      const write = (els, pos, dur = 0.05) =>
        tl.to(els, { opacity: 1, duration: dur, stagger: 0.01 }, pos)

      // title yields to the drawing
      tl.to('.bp-title', { yPercent: -18, autoAlpha: 0, duration: 0.1 }, 0)
      tl.to('.bp-hint', { autoAlpha: 0, duration: 0.03 }, 0)

      // a single point of origin
      tl.fromTo(
        '.bp-plan',
        { scale: 1.06 },
        { scale: 1, duration: 0.9, ease: 'power1.out' },
        0.05
      )
      draw(strokesOf('origin'), 0.04, 0.05, 0.02)
      tl.to(
        plan.querySelectorAll('[data-layer="origin"] [data-dot]'),
        { fillOpacity: 1, duration: 0.03 },
        0.03
      )

      // measurement axes reach out
      draw(strokesOf('axes'), 0.1, 0.16, 0.014)
      write(textsOf('axes'), 0.2)

      // the footprint
      draw(strokesOf('footprint'), 0.26, 0.16, 0)

      // walls, openings, fixtures
      draw(strokesOf('walls'), 0.38, 0.14, 0.018)
      draw(strokesOf('openings'), 0.48, 0.12, 0.01)
      draw(strokesOf('fixtures'), 0.55, 0.1, 0.02)
      draw(strokesOf('landscape'), 0.6, 0.12, 0.015)
      tl.to(
        plan.querySelectorAll('[data-layer="landscape"] [data-dot]'),
        { fillOpacity: 1, duration: 0.04 },
        0.68
      )

      // language of the sheet
      write(textsOf('labels'), 0.68, 0.08)
      draw(strokesOf('dims'), 0.74, 0.12, 0.015)
      write(textsOf('dims'), 0.8)
      draw(strokesOf('titleblock'), 0.85, 0.08, 0.02)
      write(textsOf('titleblock'), 0.89)

      // the sheet asserts itself
      tl.to('.bp-plan', { scale: 1.03, duration: 0.12 }, 0.88)
    },
    { pinDistance: '+=280%' }
  )

  /* intro reveal after the loader line completes */
  useLayoutEffect(() => {
    const onLoaded = () => {
      gsap.fromTo(
        '.bp-char',
        { yPercent: 108 },
        {
          yPercent: 0,
          duration: 1.1,
          stagger: 0.05,
          ease: 'power3.out',
        }
      )
      gsap.fromTo(
        '.bp-sub, .bp-hint',
        { opacity: 0 },
        { opacity: 1, duration: 1.0, delay: 0.7, stagger: 0.2 }
      )
    }
    window.addEventListener('northline:loaded', onLoaded)
    return () => window.removeEventListener('northline:loaded', onLoaded)
  }, [])

  return (
    <section id="scene-blueprint" className="scene" ref={ref}>
      <div className="bp-plan scene-fill">
        <FloorPlanSVG className="bp-svg" />
      </div>

      <div className="bp-title">
        <h1 className="t-display bp-name" aria-label={TITLE}>
          {TITLE.split('').map((c, i) => (
            <span className="bp-charmask" key={i}>
              <span className="bp-char">{c}</span>
            </span>
          ))}
        </h1>
        <p className="t-label bp-sub">Private Residences — Berlin</p>
      </div>

      <div className="bp-hint t-tech">
        <span>Scroll to begin construction</span>
        <span className="bp-hintline" />
      </div>
    </section>
  )
}
