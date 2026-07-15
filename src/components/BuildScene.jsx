import React, { useLayoutEffect } from 'react'
import gsap from 'gsap'
import ElevationSVG from './svg/ElevationSVG'
import { useScrollTimeline, primeDraw } from '../hooks/useScrollTimeline'
import { stills } from '../data/assets'
import { sound } from '../lib/sound'
import './BuildScene.css'

const TITLE = 'NØRTHLINE'

/* Window regions of the facade as soft-edged masks — the finished house's
   warm light appearing, window by window, over the raw construction. */
const LIGHTS = [
  { name: 'ground', mask: 'radial-gradient(ellipse 26% 20% at 57% 67%, black 52%, transparent 100%)' },
  { name: 'upper', mask: 'radial-gradient(ellipse 22% 19% at 77% 28%, black 52%, transparent 100%)' },
  { name: 'fins', mask: 'radial-gradient(ellipse 16% 23% at 15% 50%, black 50%, transparent 100%)' },
]

/**
 * THE BUILD — one locked camera. The same view fills in, stage by stage,
 * as the user scrolls: darkness → blueprint lines → structural wireframe
 * → the concrete frame rises from the ground → walls & window frames →
 * glass, warm light and landscape. Nothing pans, nothing crossfades;
 * every stage is *built up* over the one before it with directional
 * reveals, exactly like a house going up on its plot.
 */
export default function BuildScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      const elev = root.querySelector('.build-elev')
      primeDraw(elev, 'line, path, polygon, polyline, circle, rect')
      gsap.set(elev.querySelectorAll('text'), { opacity: 0 })

      /* photos start hidden; each is revealed by a bottom-up clip wipe, so
         the house rises from the ground. Layers stack, so the top one
         always covers the ones below — no gaps possible. */
      gsap.set('.build-structure', { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 1 })
      gsap.set('.build-construction', { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 1 })
      gsap.set('.build-complete', { clipPath: 'inset(100% 0% 0% 0%)', autoAlpha: 1 })
      gsap.set(root.querySelectorAll('.build-light'), { autoAlpha: 0 })

      const layer = (name) => elev.querySelectorAll(`[data-layer="${name}"]`)
      const strokesOf = (name) => {
        const els = []
        layer(name).forEach((g) =>
          els.push(...g.querySelectorAll('line, path, polygon, polyline, circle, rect'))
        )
        return els
      }
      const textsOf = (name) => {
        const els = []
        layer(name).forEach((g) => els.push(...g.querySelectorAll('text')))
        return els
      }
      const draw = (els, pos, dur = 0.12, stagger = 0.01) =>
        tl.to(els, { strokeDashoffset: 0, duration: dur, stagger }, pos)

      /* the title steps aside as the drawing begins */
      tl.to('.build-title', { yPercent: -12, autoAlpha: 0, duration: 0.06 }, 0.02)
      tl.to('.build-hint', { autoAlpha: 0, duration: 0.03 }, 0.02)

      /* ---------- 1 · BLUEPRINT: the drawing lays itself out ---------- */
      draw(strokesOf('grid'), 0.05, 0.06, 0.005)
      tl.to(textsOf('grid'), { opacity: 1, duration: 0.04 }, 0.1)
      draw(strokesOf('ground'), 0.09, 0.07, 0.02)
      draw(strokesOf('dims'), 0.12, 0.07, 0.01)
      tl.to(textsOf('dims'), { opacity: 1, duration: 0.05 }, 0.16)

      /* ---------- 2 · WIREFRAME: the structure is drawn ---------- */
      strokesOf('columns').forEach((col, i) => {
        tl.to(col, { strokeDashoffset: 0, duration: 0.04, ease: 'power2.out' }, 0.16 + i * 0.02)
        tl.call(() => sound.impact(0.6), null, 0.18 + i * 0.02)
      })
      draw(strokesOf('slabs'), 0.24, 0.08, 0.02)
      draw(strokesOf('volume-left'), 0.28, 0.06)
      draw(strokesOf('volume-upper'), 0.3, 0.08, 0.012)
      draw(strokesOf('glazing'), 0.34, 0.08, 0.005)
      tl.fromTo(
        strokesOf('fins'),
        { scaleY: 0, transformOrigin: '50% 100%' },
        { scaleY: 1, duration: 0.05, stagger: 0.004 },
        0.36
      )
      tl.to(strokesOf('fins'), { strokeDashoffset: 0, duration: 0.001 }, 0.36)
      draw(strokesOf('landscape'), 0.37, 0.06)

      /* ---------- 3 · FRAME RISES: concrete erected from the ground ---------- */
      tl.to(
        '.build-structure',
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.16, ease: 'power1.inOut' },
        0.42
      )
      tl.call(() => sound.impact(1.3), null, 0.5)
      /* survey annotations retire once the mass is real */
      tl.to(
        [...strokesOf('grid'), ...textsOf('grid'), ...strokesOf('dims'), ...textsOf('dims')],
        { opacity: 0, duration: 0.08 },
        0.5
      )

      /* ---------- 4 · WALLS & FRAMES: the finish pass builds up ---------- */
      tl.to(
        '.build-construction',
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.14, ease: 'power1.inOut' },
        0.56
      )
      tl.call(() => sound.impact(1), null, 0.62)
      /* the wireframe has served its purpose */
      tl.to(elev, { autoAlpha: 0, duration: 0.12 }, 0.56)
      tl.to('.build-word-form', { autoAlpha: 1, yPercent: 0, duration: 0.06 }, 0.5)
      tl.fromTo('.build-word-form', { yPercent: 24 }, { yPercent: 0, duration: 0.06 }, 0.5)
      tl.to('.build-word-form', { autoAlpha: 0, yPercent: -20, duration: 0.06 }, 0.62)

      /* ---------- 5 · GLASS, LIGHT & LANDSCAPE ---------- */
      root.querySelectorAll('.build-light').forEach((el, i) => {
        tl.to(el, { autoAlpha: 1, duration: 0.05, ease: 'power1.out' }, 0.64 + i * 0.04)
        tl.call(() => sound.impact(0.5), null, 0.66 + i * 0.04)
      })
      tl.fromTo('.build-bloom', { opacity: 0 }, { opacity: 0.32, duration: 0.1 }, 0.66)
      /* the completed residence rises fully into place, glazed and lit —
         it sits on top, so once revealed it covers everything cleanly */
      tl.to(
        '.build-complete',
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.16, ease: 'power1.inOut' },
        0.72
      )
      tl.set('.build-complete', { clipPath: 'inset(0% 0% 0% 0%)' }, 0.9)
      tl.call(() => sound.swell(), null, 0.76)
      tl.to('.build-bloom', { opacity: 0.12, duration: 0.14 }, 0.82)

      /* ---------- the finished residence, named, held ---------- */
      tl.fromTo('.build-word-presence', { yPercent: 22, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.07 }, 0.84)
      tl.fromTo(
        '.build-caption',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.05 },
        0.92
      )
      tl.to({}, { duration: 0.08 })
    },
    { pinDistance: '+=560%' }
  )

  /* title rises after the loader line finishes */
  useLayoutEffect(() => {
    const onLoaded = () => {
      gsap.fromTo(
        '.build-char',
        { yPercent: 110 },
        { yPercent: 0, duration: 1.1, stagger: 0.05, ease: 'power3.out' }
      )
      gsap.fromTo(
        '.build-sub, .build-hint',
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 0.7, stagger: 0.2 }
      )
    }
    window.addEventListener('northline:loaded', onLoaded)
    return () => window.removeEventListener('northline:loaded', onLoaded)
  }, [])

  return (
    <section id="scene-build" className="scene" ref={ref}>
      {/* the one locked frame — every layer shares the hero framing */}
      <img className="img-cover build-structure" src={stills.residenceStructure} alt="" aria-hidden="true" />
      <img className="img-cover build-construction" src={stills.residenceConstruction} alt="" aria-hidden="true" />

      {LIGHTS.map((l) => (
        <img
          key={l.name}
          className="img-cover build-light"
          style={{ WebkitMaskImage: l.mask, maskImage: l.mask }}
          src={stills.residenceComplete}
          alt=""
          aria-hidden="true"
        />
      ))}
      <div className="build-bloom scene-fill" />
      <img
        className="img-cover build-complete"
        src={stills.residenceComplete}
        alt="The completed NØRTHLINE residence at dusk"
      />

      <div className="build-elev scene-fill">
        <ElevationSVG className="build-elev-svg" />
      </div>

      {/* opening title, in the same frame */}
      <div className="build-title">
        <h1 className="t-display build-name" aria-label={TITLE}>
          {TITLE.split('').map((c, i) => (
            <span className="build-charmask" key={i}>
              <span className="build-char">{c}</span>
            </span>
          ))}
        </h1>
        <p className="t-label build-sub">Private Residences — Berlin</p>
      </div>

      <div className="build-words scene-fill" aria-hidden="true">
        <span className="t-display build-word build-word-form">FORM</span>
        <span className="t-display build-word build-word-presence">PRESENCE</span>
      </div>

      <div className="build-hint t-tech">
        <span>Scroll to build the residence</span>
        <span className="build-hintline" />
      </div>

      <div className="build-caption">
        <span className="t-tech">01 — Residence 01</span>
        <span className="t-tech build-caption-dim">Berlin Grunewald · completed</span>
      </div>
    </section>
  )
}
