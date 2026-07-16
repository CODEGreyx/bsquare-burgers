import React, { useLayoutEffect } from 'react'
import gsap from 'gsap'
import ElevationSVG from './svg/ElevationSVG'
import { useScrollTimeline, primeDraw } from '../hooks/useScrollTimeline'
import { stills, videos } from '../data/assets'
import { sound } from '../lib/sound'
import './BuildScene.css'

const TITLE = 'NØRTHLINE'
const hasVideo = !!videos.buildTimelapse

/* the finished house's warm light, window by window (soft masks) */
const LIGHTS = [
  { name: 'ground', mask: 'radial-gradient(ellipse 26% 20% at 57% 67%, black 52%, transparent 100%)' },
  { name: 'upper', mask: 'radial-gradient(ellipse 22% 19% at 77% 28%, black 52%, transparent 100%)' },
  { name: 'fins', mask: 'radial-gradient(ellipse 16% 23% at 15% 50%, black 50%, transparent 100%)' },
]

const STAGES = ['01 — Survey', '02 — Structure', '03 — Envelope', '04 — Light']

/**
 * THE BUILD — one locked camera, one continuous shot, scrubbed by
 * scroll like a video's playhead. There are no cuts and no steps:
 * the blueprint resolves into concrete through a soft boundary that
 * travels up the frame, the envelope sweeps across it, and the finished
 * light blooms out of the living room — every millimetre of scroll
 * produces a proportional, reversible change, exactly like dragging
 * through a construction timelapse.
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
        tl.call(() => sound.swell(), null, 0.72)
        tl.fromTo('.build-word-presence', { yPercent: 22, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.07 }, 0.82)
        tl.fromTo('.build-caption', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.05 }, 0.9)
        tl.to({}, { duration: 0.08 })
        return
      }

      /* ---- CODE PATH: one continuous scroll-scrubbed transformation ---- */
      const elev = root.querySelector('.build-elev')
      primeDraw(elev, 'line, path, polygon, polyline, circle, rect')
      gsap.set(elev.querySelectorAll('text'), { opacity: 0 })

      /* soft travelling boundaries — GSAP owns the CSS vars */
      gsap.set('.build-structure', { '--wp': '-24%', autoAlpha: 1 })
      gsap.set('.build-construction', { '--hp': '-28%', autoAlpha: 1 })
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

      /* the title steps aside as the record begins */
      tl.to('.build-title', { yPercent: -12, autoAlpha: 0, duration: 0.05 }, 0.02)
      tl.to('.build-hint', { autoAlpha: 0, duration: 0.03 }, 0.02)

      /* ---------- SURVEY: the drawing lays itself out ---------- */
      stage(0, 0.04)
      draw(strokesOf('grid'), 0.04, 0.05, 0.004)
      tl.to(textsOf('grid'), { opacity: 1, duration: 0.03 }, 0.08)
      draw(strokesOf('ground'), 0.07, 0.06, 0.015)
      draw(strokesOf('dims'), 0.09, 0.06, 0.008)
      tl.to(textsOf('dims'), { opacity: 1, duration: 0.04 }, 0.13)

      /* ---------- WIREFRAME: the structure is drawn ---------- */
      stage(1, 0.15)
      strokesOf('columns').forEach((col, i) => {
        tl.to(col, { strokeDashoffset: 0, duration: 0.03, ease: 'none' }, 0.14 + i * 0.012)
      })
      tl.call(() => sound.impact(0.6), null, 0.17)
      draw(strokesOf('slabs'), 0.19, 0.05, 0.012)
      draw(strokesOf('volume-left'), 0.22, 0.04)
      draw(strokesOf('volume-upper'), 0.24, 0.05, 0.008)
      draw(strokesOf('glazing'), 0.26, 0.05, 0.003)
      tl.fromTo(
        strokesOf('fins'),
        { scaleY: 0, transformOrigin: '50% 100%' },
        { scaleY: 1, duration: 0.03, stagger: 0.002 },
        0.28
      )
      tl.to(strokesOf('fins'), { strokeDashoffset: 0, duration: 0.001 }, 0.28)
      draw(strokesOf('landscape'), 0.3, 0.04)

      /* the day counter starts running with the works */
      const day = root.querySelector('.build-day')
      const dayProxy = { d: 1 }
      tl.fromTo(day, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.32)
      tl.to(
        dayProxy,
        {
          d: 196,
          duration: 0.58,
          ease: 'none',
          onUpdate: () => {
            day.textContent = `DAY ${String(Math.round(dayProxy.d)).padStart(3, '0')}`
          },
        },
        0.34
      )

      /* ---------- CONCRETE: the frame materialises upward ----------
         A wide, soft boundary travels continuously up the frame; below
         it the drawing has already become the real photograph. */
      tl.to(
        '.build-structure',
        { '--wp': '135%', duration: 0.24, ease: 'none' },
        0.34
      )
      /* the drawing yields exactly as the mass overtakes it */
      tl.to(
        [...strokesOf('grid'), ...textsOf('grid'), ...strokesOf('dims'), ...textsOf('dims')],
        { opacity: 0, duration: 0.1 },
        0.4
      )
      tl.to(elev, { autoAlpha: 0.5, duration: 0.16, ease: 'none' }, 0.42)
      tl.call(() => sound.impact(1.1), null, 0.45)

      /* ---------- ENVELOPE: cladding sweeps across the facade ---------- */
      stage(2, 0.56)
      tl.to(
        '.build-construction',
        { '--hp': '140%', duration: 0.22, ease: 'none' },
        0.58
      )
      tl.to(elev, { autoAlpha: 0, duration: 0.12, ease: 'none' }, 0.6)
      tl.call(() => sound.impact(0.9), null, 0.66)

      /* ---------- LIGHT: the house wakes up, continuously ---------- */
      stage(3, 0.8)
      root.querySelectorAll('.build-light').forEach((el, i) => {
        tl.to(el, { autoAlpha: 1, duration: 0.06, ease: 'none' }, 0.8 + i * 0.025)
      })
      tl.fromTo('.build-bloom', { opacity: 0 }, { opacity: 0.32, duration: 0.06, ease: 'none' }, 0.82)
      tl.set('.build-complete', { autoAlpha: 1 }, 0.86)
      tl.to(
        '.build-complete',
        { '--bw': '260%', '--bh': '230%', duration: 0.1, ease: 'none' },
        0.865
      )
      tl.call(() => sound.swell(), null, 0.89)
      tl.to('.build-bloom', { opacity: 0.1, duration: 0.06, ease: 'none' }, 0.94)
      tl.to([tags[3], day], { autoAlpha: 0, y: -8, duration: 0.03 }, 0.93)

      /* ---------- the finished residence, named, held ---------- */
      tl.fromTo('.build-word-presence', { yPercent: 22, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.06 }, 0.94)
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
          {/* the one locked shot — three states of the same frame,
              blended by soft boundaries that travel with the scroll */}
          <img
            className="img-cover build-structure"
            src={stills.residenceStructure}
            alt=""
            aria-hidden="true"
          />
          <img
            className="img-cover build-construction"
            src={stills.residenceConstruction}
            alt=""
            aria-hidden="true"
          />

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
        <span className="t-display build-word build-word-presence">PRESENCE</span>
      </div>

      <div className="build-hint t-tech">
        <span>Scroll to build the residence</span>
        <span className="build-hintline" />
      </div>

      {/* construction-record chrome */}
      <span className="t-tech build-day" aria-hidden="true">
        DAY 001
      </span>
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
