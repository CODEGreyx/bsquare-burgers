import React, { useLayoutEffect } from 'react'
import gsap from 'gsap'
import ElevationSVG from './svg/ElevationSVG'
import { useScrollTimeline, primeDraw } from '../hooks/useScrollTimeline'
import { stills, videos } from '../data/assets'
import { sound } from '../lib/sound'
import './BuildScene.css'

const TITLE = 'NØRTHLINE'
const hasVideo = !!videos.buildTimelapse

/* ------------------------------------------------------------------ *
 * The house is assembled from PIECES of the real photographs, each
 * clipped to a region of the actual architecture (viewport-space
 * insets: [top, right, bottom, left] in %). Every full-bleed copy of
 * the same photo aligns pixel-perfectly, so the pieces join without
 * seams — the joints fall on the building's own edges, like real
 * construction joints.
 * ------------------------------------------------------------------ */

/* raw concrete frame — erected bottom-up, in construction order */
const STRUCT_PIECES = [
  { name: 'site', clip: [76, 0, 0, 0] }, //     the prepared ground
  { name: 'tower', clip: [24, 72, 20, 0] }, //  left travertine tower
  { name: 'ground-floor', clip: [50, 14, 20, 26] }, // columns + slab
  { name: 'cantilever', clip: [6, 2, 42, 28] }, // the upper volume
  { name: 'frame-full', clip: [0, 0, 0, 0] }, // closes every gap
]

/* envelope — cladding and window frames hung top-down, volume by volume */
const ENV_PIECES = [
  { name: 'tower-clad', clip: [24, 72, 20, 0] },
  { name: 'mid-glazing', clip: [27, 44, 18, 24] },
  { name: 'cantilever-clad', clip: [6, 2, 42, 28] },
  { name: 'envelope-full', clip: [0, 0, 0, 0] },
]

/* the finished house's warm light, window by window (soft masks) */
const LIGHTS = [
  { name: 'ground', mask: 'radial-gradient(ellipse 26% 20% at 57% 67%, black 52%, transparent 100%)' },
  { name: 'upper', mask: 'radial-gradient(ellipse 22% 19% at 77% 28%, black 52%, transparent 100%)' },
  { name: 'fins', mask: 'radial-gradient(ellipse 16% 23% at 15% 50%, black 50%, transparent 100%)' },
]

const STAGES = ['01 — Survey', '02 — Structure', '03 — Envelope', '04 — Light']

const inset = (t, r, b, l) => `inset(${t}% ${r}% ${b}% ${l}%)`
/* collapsed start states: structure rises (top edge starts at the
   piece's bottom), envelope hangs (bottom edge starts at the top) */
const riseFrom = ([t, r, b, l]) => inset(100 - b, r, b, l)
const riseTo = ([t, r, b, l]) => inset(t, r, b, l)
const hangFrom = ([t, r, b, l]) => inset(t, r, 100 - t, l)

/**
 * THE BUILD — one locked camera. The same view fills in, stage by stage,
 * as the user scrolls: darkness → survey lines → structural wireframe →
 * the concrete frame erected piece by piece → the envelope hung panel by
 * panel → glass, warm light, completion. Nothing pans, nothing
 * crossfades; every piece arrives inside its own bounds.
 */
export default function BuildScene() {
  const ref = useScrollTimeline(
    (tl, root) => {
      /* ---- VIDEO PATH: scrub a real construction clip to scroll ---- */
      if (hasVideo) {
        const video = root.querySelector('.build-video')
        video.pause()
        const proxy = { t: 0 }
        const scrub = () => {
          if (video.duration) video.currentTime = proxy.t * video.duration
        }
        tl.to(proxy, { t: 1, duration: 1, ease: 'none', onUpdate: scrub }, 0)
        tl.to('.build-title', { yPercent: -12, autoAlpha: 0, duration: 0.06 }, 0.03)
        tl.to('.build-hint', { autoAlpha: 0, duration: 0.03 }, 0.03)
        tl.fromTo('.build-word-form', { yPercent: 24, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.06 }, 0.32)
        tl.to('.build-word-form', { yPercent: -20, autoAlpha: 0, duration: 0.06 }, 0.44)
        tl.call(() => sound.swell(), null, 0.72)
        tl.fromTo('.build-word-presence', { yPercent: 22, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.07 }, 0.82)
        tl.fromTo('.build-caption', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.05 }, 0.9)
        tl.to({}, { duration: 0.08 })
        return
      }

      /* ---- CODE PATH: piece-by-piece assembly from the stills ---- */
      const elev = root.querySelector('.build-elev')
      primeDraw(elev, 'line, path, polygon, polyline, circle, rect')
      gsap.set(elev.querySelectorAll('text'), { opacity: 0 })

      const structEls = root.querySelectorAll('[data-piece="struct"]')
      const envEls = root.querySelectorAll('[data-piece="env"]')
      structEls.forEach((el, i) =>
        gsap.set(el, { clipPath: riseFrom(STRUCT_PIECES[i].clip), autoAlpha: 1 })
      )
      envEls.forEach((el, i) =>
        gsap.set(el, { clipPath: hangFrom(ENV_PIECES[i].clip), autoAlpha: 1 })
      )
      gsap.set(root.querySelectorAll('.build-light'), { autoAlpha: 0 })
      gsap.set('.build-complete', { '--bw': '0%', '--bh': '0%', autoAlpha: 0 })
      gsap.set('.build-stagetag', { autoAlpha: 0 })

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
      const draw = (els, pos, dur = 0.1, stagger = 0.008) =>
        tl.to(els, { strokeDashoffset: 0, duration: dur, stagger }, pos)

      /* editorial stage tag, bottom-left, swaps per phase */
      const tags = root.querySelectorAll('.build-stagetag')
      const stage = (i, at) => {
        if (i > 0) tl.to(tags[i - 1], { autoAlpha: 0, y: -8, duration: 0.03 }, at)
        tl.fromTo(tags[i], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.04 }, at + 0.01)
      }

      /* the title steps aside as the drawing begins */
      tl.to('.build-title', { yPercent: -12, autoAlpha: 0, duration: 0.05 }, 0.02)
      tl.to('.build-hint', { autoAlpha: 0, duration: 0.03 }, 0.02)

      /* ---------- 1 · SURVEY: the drawing lays itself out ---------- */
      stage(0, 0.04)
      draw(strokesOf('grid'), 0.04, 0.05, 0.004)
      tl.to(textsOf('grid'), { opacity: 1, duration: 0.03 }, 0.08)
      draw(strokesOf('ground'), 0.07, 0.06, 0.015)
      draw(strokesOf('dims'), 0.1, 0.06, 0.008)
      tl.to(textsOf('dims'), { opacity: 1, duration: 0.04 }, 0.14)

      /* ---------- 2 · WIREFRAME: the structure is drawn ---------- */
      stage(1, 0.16)
      strokesOf('columns').forEach((col, i) => {
        tl.to(col, { strokeDashoffset: 0, duration: 0.035, ease: 'power2.out' }, 0.15 + i * 0.016)
        tl.call(() => sound.impact(0.6), null, 0.165 + i * 0.016)
      })
      draw(strokesOf('slabs'), 0.22, 0.06, 0.015)
      draw(strokesOf('volume-left'), 0.26, 0.05)
      draw(strokesOf('volume-upper'), 0.28, 0.06, 0.01)
      draw(strokesOf('glazing'), 0.31, 0.06, 0.004)
      tl.fromTo(
        strokesOf('fins'),
        { scaleY: 0, transformOrigin: '50% 100%' },
        { scaleY: 1, duration: 0.04, stagger: 0.003 },
        0.33
      )
      tl.to(strokesOf('fins'), { strokeDashoffset: 0, duration: 0.001 }, 0.33)
      draw(strokesOf('landscape'), 0.35, 0.05)

      /* ---------- 3 · THE FRAME IS ERECTED, piece by piece ---------- */
      STRUCT_PIECES.forEach((p, i) => {
        const at = 0.4 + i * 0.045
        tl.to(
          structEls[i],
          { clipPath: riseTo(p.clip), duration: 0.055, ease: 'power2.out' },
          at
        )
        tl.call(() => sound.impact(0.9 + i * 0.1), null, at + 0.045)
      })
      /* survey annotations retire once the mass is real */
      tl.to(
        [...strokesOf('grid'), ...textsOf('grid'), ...strokesOf('dims'), ...textsOf('dims')],
        { opacity: 0, duration: 0.06 },
        0.46
      )
      tl.fromTo('.build-word-form', { yPercent: 24, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.05 }, 0.52)
      tl.to('.build-word-form', { yPercent: -20, autoAlpha: 0, duration: 0.05 }, 0.62)

      /* ---------- 4 · THE ENVELOPE IS HUNG, panel by panel ---------- */
      stage(2, 0.6)
      ENV_PIECES.forEach((p, i) => {
        const at = 0.62 + i * 0.042
        tl.to(
          envEls[i],
          { clipPath: riseTo(p.clip), duration: 0.05, ease: 'power2.inOut' },
          at
        )
        tl.call(() => sound.impact(0.7), null, at + 0.04)
      })
      /* the wireframe has served its purpose */
      tl.to(elev, { autoAlpha: 0, duration: 0.1 }, 0.64)

      /* ---------- 5 · LIGHT: the house wakes up ---------- */
      stage(3, 0.78)
      root.querySelectorAll('.build-light').forEach((el, i) => {
        tl.to(el, { autoAlpha: 1, duration: 0.04, ease: 'power1.out' }, 0.78 + i * 0.035)
        tl.call(() => sound.impact(0.5), null, 0.79 + i * 0.035)
      })
      tl.fromTo('.build-bloom', { opacity: 0 }, { opacity: 0.32, duration: 0.08 }, 0.8)
      /* completion blooms out of the living room's own light */
      tl.set('.build-complete', { autoAlpha: 1 }, 0.86)
      tl.to(
        '.build-complete',
        { '--bw': '260%', '--bh': '230%', duration: 0.1, ease: 'power2.inOut' },
        0.87
      )
      tl.call(() => sound.swell(), null, 0.89)
      tl.to('.build-bloom', { opacity: 0.1, duration: 0.08 }, 0.94)
      tl.to(tags[3], { autoAlpha: 0, y: -8, duration: 0.03 }, 0.93)

      /* ---------- the finished residence, named, held ---------- */
      tl.fromTo('.build-word-presence', { yPercent: 22, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.06 }, 0.93)
      tl.fromTo(
        '.build-caption',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.04 },
        0.97
      )
      tl.to({}, { duration: 0.06 })
    },
    { pinDistance: '+=640%' }
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
      {hasVideo ? (
        <video
          className="img-cover build-video"
          src={videos.buildTimelapse}
          muted
          playsInline
          preload="auto"
          aria-label="The NØRTHLINE residence under construction at dusk"
        />
      ) : (
        <>
          {/* structural frame, assembled from pieces of the real photo */}
          {STRUCT_PIECES.map((p) => (
            <img
              key={p.name}
              data-piece="struct"
              className="img-cover build-piece build-piece-struct"
              src={stills.residenceStructure}
              alt=""
              aria-hidden="true"
            />
          ))}

          {/* envelope, hung panel by panel */}
          {ENV_PIECES.map((p) => (
            <img
              key={p.name}
              data-piece="env"
              className="img-cover build-piece build-piece-env"
              src={stills.residenceConstruction}
              alt=""
              aria-hidden="true"
            />
          ))}

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
        </>
      )}

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

      {/* editorial stage tags, bottom-left */}
      <div className="build-stages" aria-hidden="true">
        {STAGES.map((s) => (
          <span key={s} className="t-tech build-stagetag">
            {s}
          </span>
        ))}
      </div>

      <div className="build-caption">
        <span className="t-tech">Residence 01</span>
        <span className="t-tech build-caption-dim">
          Berlin Grunewald · completed
        </span>
      </div>
    </section>
  )
}
