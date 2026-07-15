import React from 'react'
import gsap from 'gsap'
import ElevationSVG from './svg/ElevationSVG'
import MaterialSwatch, { MATERIAL_KEYS, materialLabel } from './svg/MaterialSwatch'
import { useScrollTimeline } from '../hooks/useScrollTimeline'
import { stills, videos } from '../data/assets'
import { sound } from '../lib/sound'
import './ExteriorScene.css'

const PANELS = 5

/**
 * Scene 3 — FORM / MATERIAL / PRESENCE.
 * Concrete panels pour down over the skeleton, four full-height material
 * surfaces rise, then part to reveal the completed residence with its
 * lights on.
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
      gsap.set(root.querySelectorAll('.ext-mat'), {
        yPercent: 102,
        autoAlpha: 1,
      })

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
      word('.ext-word-form', 0.05, 0.3)
      tl.to('.ext-elev', { opacity: 0, duration: 0.14 }, 0.14)

      /* --- material panels rise --- */
      const mats = root.querySelectorAll('.ext-mat')
      mats.forEach((m, i) => {
        tl.to(
          m,
          { yPercent: 0, duration: 0.13, ease: 'power2.out' },
          0.34 + i * 0.04
        )
        tl.call(() => sound.impact(0.6), null, 0.36 + i * 0.04)
      })
      word('.ext-word-material', 0.44, 0.62)
      tl.fromTo(
        '.ext-mat-label',
        { opacity: 0 },
        { opacity: 1, duration: 0.06, stagger: 0.02 },
        0.5
      )

      /* switch the base underneath while it is fully covered */
      tl.set('.ext-complete', { opacity: 1 }, 0.6)
      tl.set(['.ext-structure', '.ext-curtains'], { opacity: 0 }, 0.605)

      /* --- panels part: the residence, lights on --- */
      mats.forEach((m, i) => {
        tl.to(
          m,
          { yPercent: -103, duration: 0.14, ease: 'power2.inOut' },
          0.64 + (mats.length - 1 - i) * 0.035
        )
      })
      tl.call(() => sound.swell(), null, 0.68)
      tl.fromTo(
        '.ext-bloom',
        { opacity: 0 },
        { opacity: 0.4, duration: 0.1 },
        0.68
      )
      tl.to('.ext-bloom', { opacity: 0.12, duration: 0.14 }, 0.8)
      tl.fromTo(
        '.ext-complete',
        { scale: 1.07 },
        { scale: 1, duration: 0.32, ease: 'power1.out' },
        0.64
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

      {/* the completed residence waits underneath */}
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
          src={stills.residenceComplete}
          alt="Completed NØRTHLINE residence at dusk, interior lights glowing"
        />
      )}
      <div className="ext-bloom scene-fill" />

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

      {/* material planes */}
      <div className="ext-mats scene-fill">
        {MATERIAL_KEYS.map((kind) => (
          <div className="ext-mat" key={kind}>
            <MaterialSwatch kind={kind} />
            <span className="t-tech ext-mat-label">{materialLabel(kind)}</span>
          </div>
        ))}
      </div>

      {/* the three words */}
      <div className="ext-words scene-fill" aria-hidden="true">
        <span className="t-display ext-word ext-word-form">FORM</span>
        <span className="t-display ext-word ext-word-material">MATERIAL</span>
        <span className="t-display ext-word ext-word-presence">PRESENCE</span>
      </div>

      <div className="ext-caption">
        <span className="t-tech">03 — Residence 01</span>
        <span className="t-tech ext-caption-dim">Berlin Grunewald · completed</span>
      </div>
    </section>
  )
}
