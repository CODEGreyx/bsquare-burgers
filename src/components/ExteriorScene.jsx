import React from 'react'
import gsap from 'gsap'
import ElevationSVG from './svg/ElevationSVG'
import { useScrollTimeline } from '../hooks/useScrollTimeline'
import { stills, videos } from '../data/assets'
import { sound } from '../lib/sound'
import './ExteriorScene.css'

const PANELS = 5

/* Window regions of the facade as soft-edged masks. Each "light" is a
   full-bleed copy of the completed photo masked to one glowing region —
   both photos share identical cover sizing, so the reveal is always
   pixel-aligned, and the feathered mask lets the light bloom into the
   dark construction photograph. */
const LIGHTS = [
  { name: 'ground', mask: 'radial-gradient(ellipse 26% 20% at 57% 67%, black 52%, transparent 100%)' },
  { name: 'upper', mask: 'radial-gradient(ellipse 22% 19% at 77% 28%, black 52%, transparent 100%)' },
  { name: 'fins', mask: 'radial-gradient(ellipse 16% 23% at 15% 50%, black 50%, transparent 100%)' },
]

/**
 * Scene 3 — FORM / PRESENCE.
 * Concrete panels pour down over the skeleton; then, room by room, the
 * lights of the finished residence come on inside the raw construction
 * photograph, and the completed house opens out of its own glass.
 */
export default function ExteriorScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      /* GSAP owns every initial transform (a CSS translate% would be kept
         as a fixed px offset underneath yPercent tweens). */
      gsap.set(root.querySelectorAll('.ext-curtain'), {
        yPercent: -101,
        autoAlpha: 1,
      })
      gsap.set(root.querySelectorAll('.ext-curtain-img'), { yPercent: 101 })

      /* start exactly where scene 2 ended: photo + wireframe, no grid */
      const elev = root.querySelector('.ext-elev')
      const hideNow = []
      ;['grid', 'dims'].forEach((name) =>
        elev
          .querySelectorAll(`[data-layer="${name}"]`)
          .forEach((g) => hideNow.push(g))
      )
      gsap.set(hideNow, { opacity: 0 })

      const word = (sel, inAt, outAt) => {
        tl.fromTo(
          sel,
          { yPercent: 30, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.08, ease: 'power2.out' },
          inAt
        )
        tl.to(
          sel,
          { yPercent: -26, autoAlpha: 0, duration: 0.07, ease: 'power2.in' },
          outAt
        )
      }

      /* --- concrete panels pour down: construction photo arrives --- */
      const curtains = root.querySelectorAll('.ext-curtain')
      curtains.forEach((c, i) => {
        const inner = c.querySelector('.ext-curtain-img')
        const at = 0.06 + i * 0.035
        tl.to(c, { yPercent: 0, duration: 0.16, ease: 'power2.inOut' }, at)
        tl.to(inner, { yPercent: 0, duration: 0.16, ease: 'power2.inOut' }, at)
        tl.call(() => sound.impact(0.8), null, at + 0.15)
      })
      word('.ext-word-form', 0.05, 0.34)
      tl.to('.ext-elev', { opacity: 0, duration: 0.14 }, 0.14)

      /* --- dusk settles over the raw construction --- */
      tl.to(
        '.ext-curtains',
        { filter: 'brightness(0.72)', duration: 0.12 },
        0.4
      )

      /* --- the lights come on, room by room --- */
      root.querySelectorAll('.ext-light').forEach((el, i) => {
        const at = 0.46 + i * 0.05
        tl.fromTo(
          el,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.06, ease: 'power1.out' },
          at
        )
        tl.call(() => sound.impact(0.5), null, at + 0.03)
      })
      tl.fromTo(
        '.ext-bloom',
        { opacity: 0 },
        { opacity: 0.3, duration: 0.1 },
        0.5
      )

      /* --- the completed residence blooms out of its own light --- */
      tl.set('.ext-complete', { autoAlpha: 1 }, 0.58)
      tl.fromTo(
        '.ext-complete',
        { '--bw': '0%', '--bh': '0%', scale: 1.06 },
        {
          '--bw': '260%',
          '--bh': '230%',
          scale: 1,
          duration: 0.24,
          ease: 'power2.inOut',
        },
        0.6
      )
      tl.call(() => sound.swell(), null, 0.66)
      tl.to('.ext-bloom', { opacity: 0.12, duration: 0.12 }, 0.74)
      tl.set(
        ['.ext-structure', '.ext-curtains', '.ext-light'],
        { autoAlpha: 0 },
        0.86
      )

      word('.ext-word-presence', 0.8, 0.94)
      tl.fromTo(
        '.ext-caption',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.05 },
        0.94
      )
    },
    { pinDistance: '+=380%' }
  )

  const completeSrc = stills.residenceComplete

  return (
    <section id="scene-exterior" className="scene" ref={ref}>
      {/* base: where scene 2 left off */}
      <img
        className="img-cover ext-structure"
        src={stills.residenceStructure}
        alt=""
        aria-hidden="true"
      />
      <div className="ext-elev scene-fill">
        <ElevationSVG className="ext-elev-svg" opacity={0.42} />
      </div>

      {/* concrete curtains carrying the mid-construction photograph */}
      <div className="ext-curtains scene-fill">
        {Array.from({ length: PANELS }, (_, i) => (
          <div className="ext-curtain" key={i}>
            <div
              className="ext-curtain-img"
              style={{
                backgroundImage: `url(${stills.residenceConstruction})`,
                backgroundPosition: `${(i / (PANELS - 1)) * 100}% 50%`,
                backgroundSize: `${PANELS * 100}% 100%`,
              }}
            />
          </div>
        ))}
      </div>

      {/* the lights of the finished house, window by window */}
      {LIGHTS.map((l) => (
        <img
          key={l.name}
          className="img-cover ext-light"
          style={{ WebkitMaskImage: l.mask, maskImage: l.mask }}
          src={completeSrc}
          alt=""
          aria-hidden="true"
        />
      ))}
      <div className="ext-bloom scene-fill" />

      {/* the completed residence */}
      {videos.exteriorApproach ? (
        <video
          className="img-cover ext-complete"
          src={videos.exteriorApproach}
          muted
          loop
          playsInline
          autoPlay
        />
      ) : (
        <img
          className="img-cover ext-complete"
          src={completeSrc}
          alt="Completed NØRTHLINE residence at dusk, interior lights glowing"
        />
      )}

      {/* the words */}
      <div className="ext-words scene-fill" aria-hidden="true">
        <span className="t-display ext-word ext-word-form">FORM</span>
        <span className="t-display ext-word ext-word-presence">PRESENCE</span>
      </div>

      <div className="ext-caption">
        <span className="t-tech">03 — Residence 01</span>
        <span className="t-tech ext-caption-dim">Berlin Grunewald · completed</span>
      </div>
    </section>
  )
}
