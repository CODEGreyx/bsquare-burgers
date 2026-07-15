import React from 'react'
import gsap from 'gsap'
import FloorPlanSVG from './svg/FloorPlanSVG'
import ElevationSVG from './svg/ElevationSVG'
import { useScrollTimeline, primeDraw } from '../hooks/useScrollTimeline'
import { stills } from '../data/assets'
import { sound } from '../lib/sound'
import './ConstructionScene.css'

/**
 * Scene 2 — the reel moment. The flat plan tilts into a ground plane,
 * columns rise out of it, slabs settle, the cantilever locks in, glazing
 * frames arrive — and the drawn skeleton resolves into the real
 * structural photograph rising from the ground.
 */
export default function ConstructionScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      const elev = root.querySelector('.con-elev')
      const plan = root.querySelector('.con-plan')

      /* prime every elevation stroke for draw-on */
      primeDraw(elev, 'line, path, polygon, polyline, circle, rect')
      gsap.set(elev.querySelectorAll('text'), { opacity: 0 })

      const layer = (name) => elev.querySelectorAll(`[data-layer="${name}"]`)
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

      /* --- the plan becomes the ground --- */
      tl.fromTo(
        plan,
        { rotateX: 0, scale: 1.03, yPercent: 0, opacity: 1 },
        {
          rotateX: 62,
          scale: 1.35,
          yPercent: 26,
          duration: 0.2,
          ease: 'power1.inOut',
        },
        0.02
      )
      tl.to(plan, { opacity: 0.3, duration: 0.14 }, 0.1)
      tl.to(plan, { opacity: 0, duration: 0.14 }, 0.36)

      /* --- survey grid --- */
      tl.to(
        strokesOf('grid'),
        { strokeDashoffset: 0, duration: 0.1, stagger: 0.006 },
        0.12
      )
      tl.to(textsOf('grid'), { opacity: 1, duration: 0.04 }, 0.2)
      tl.to(
        strokesOf('ground'),
        { strokeDashoffset: 0, duration: 0.12, stagger: 0.02 },
        0.16
      )

      /* --- columns rise from the slab --- */
      const columns = strokesOf('columns')
      gsap.set(columns, { strokeDashoffset: (i, el) => el.style.strokeDasharray })
      columns.forEach((col, i) => {
        tl.to(
          col,
          { strokeDashoffset: 0, duration: 0.05, ease: 'power2.out' },
          0.24 + i * 0.035
        )
        tl.call(() => sound.impact(0.7), null, 0.28 + i * 0.035)
      })

      /* --- slabs settle into place --- */
      const slabGroups = ['ground', 'level1', 'roof-right', 'roof-left']
      slabGroups.forEach((s, i) => {
        const g = elev.querySelector(`[data-slab="${s}"]`)
        if (!g) return
        const lines = g.querySelectorAll('line')
        const at = 0.38 + i * 0.05
        tl.fromTo(
          g,
          { y: -16 },
          { y: 0, duration: 0.05, ease: 'power3.out' },
          at
        )
        tl.to(lines, { strokeDashoffset: 0, duration: 0.06, stagger: 0.01 }, at)
        tl.call(() => sound.impact(1), null, at + 0.04)
      })

      /* --- volumes assemble --- */
      tl.to(
        strokesOf('volume-left'),
        { strokeDashoffset: 0, duration: 0.1, stagger: 0.02 },
        0.5
      )
      tl.to(
        strokesOf('volume-upper'),
        { strokeDashoffset: 0, duration: 0.12, stagger: 0.015 },
        0.56
      )
      tl.call(() => sound.impact(1.2), null, 0.62)

      /* --- glazing frames slide in, fins attach --- */
      tl.to(
        strokesOf('glazing'),
        { strokeDashoffset: 0, duration: 0.12, stagger: 0.006 },
        0.64
      )
      const fins = strokesOf('fins')
      tl.fromTo(
        fins,
        { scaleY: 0, transformOrigin: '50% 100%' },
        { scaleY: 1, duration: 0.08, stagger: 0.005 },
        0.72
      )
      tl.to(fins, { strokeDashoffset: 0, duration: 0.001 }, 0.72)
      tl.to(
        strokesOf('landscape'),
        { strokeDashoffset: 0, duration: 0.1, stagger: 0.008 },
        0.76
      )

      /* --- dimensions flash up, then step back --- */
      tl.to(
        strokesOf('dims'),
        { strokeDashoffset: 0, duration: 0.08, stagger: 0.01 },
        0.7
      )
      tl.to(textsOf('dims'), { opacity: 1, duration: 0.05 }, 0.74)
      tl.to([...strokesOf('dims'), ...textsOf('dims')], { opacity: 0, duration: 0.08 }, 0.88)
      tl.to([...strokesOf('grid'), ...textsOf('grid')], { opacity: 0, duration: 0.08 }, 0.84)

      /* --- the drawing becomes real: structure rises out of the ground --- */
      tl.fromTo(
        '.con-photo',
        { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.05 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          duration: 0.2,
          ease: 'power1.inOut',
        },
        0.8
      )
      tl.call(() => sound.impact(1.4), null, 0.9)
      tl.to(elev, { opacity: 0.42, duration: 0.12 }, 0.86)
      tl.fromTo(
        '.con-caption',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.06 },
        0.9
      )
    },
    { pinDistance: '+=420%' }
  )

  return (
    <section id="scene-construction" className="scene" ref={ref}>
      <div className="con-persp scene-fill">
        <div className="con-plan">
          <FloorPlanSVG className="con-plan-svg" />
        </div>
      </div>

      <img
        className="img-cover con-photo"
        src={stills.residenceStructure}
        alt="Structural concrete skeleton of the NØRTHLINE residence at dusk"
        loading="eager"
      />

      <div className="con-elev scene-fill">
        <ElevationSVG className="con-elev-svg" />
      </div>

      <div className="con-caption">
        <span className="t-tech">02 — Structure</span>
        <span className="t-tech con-caption-dim">
          Cast in place · 480 T concrete · 36 T steel
        </span>
      </div>
    </section>
  )
}
