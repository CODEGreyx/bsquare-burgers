# PERFORMANCE NOTES — NØRTHLINE RESIDENCES

## Animation strategy

- **One Lenis instance drives everything.** Lenis is synced into GSAP's
  ticker (`gsap.ticker.add(lenis.raf)`, `lagSmoothing(0)`), so scroll,
  scrub and rendering share a single clock — no double-RAF, no fighting
  smoothers. Wheel multiplier is 0.85 so one aggressive trackpad flick
  cannot skip a scene.
- **Five pinned, scrubbed timelines** (one per scene) built inside
  `gsap.context()` via `src/hooks/useScrollTimeline.js`; every trigger is
  reverted on unmount — no ScrollTrigger leaks under HMR or route changes.
- **Scene boundaries carry matching states.** Each scene's static initial
  frame equals the previous scene's final frame, so the unpinned handoff
  reads as a wipe rather than a jump, and reverse scrolling reconstructs
  every stage exactly (scrub owns all state; nothing is time-based).
- **Draw-on lines** use stroke-dasharray offsets primed once per scene
  (`primeDraw`) — cheap, GPU-composited stroke rendering, no DrawSVG
  dependency.
- **Only compositor-friendly properties animate** in the hot path:
  transforms, opacity, clip-path. The lone filter animation (scene 5 slice
  desaturation) runs on six elements only.
- GSAP owns every initial transform. Never give an element a CSS
  `translate…%` that a `yPercent` tween will also touch — GSAP treats the
  CSS translate as a fixed px offset *underneath* its own percent channel
  and the element lands in the wrong place. Initial states are set with
  `gsap.set` at timeline build (this bug was found and fixed during
  verification).

## Video compression guidance (when real renders are added)

- H.264, CRF 20–23, `preset slow`, `-movflags +faststart`, AAC muted or
  no audio track; 1080p is enough (the site never shows video above
  viewport size). 8–10 s loops keep files ≈4–8 MB.
- Prefer `webm (VP9, CRF 30)` as a `<source>` alongside MP4 if hosting
  allows; scenes use plain `<video muted loop playsInline autoPlay>` so
  both containers drop in.
- Keep the dusk grade of the stills; a mismatched grade breaks the
  single-residence illusion more than any compression artifact.

## Likely bottlenecks (and what was done)

| Risk | Mitigation |
| --- | --- |
| Large hero images decoded during scroll | 2K WebP (≈250–340 KB each), `<link rel=preload>` for the hero, eager decode of scene-2 photo before its reveal |
| Pin refresh thrash on load | Single `ScrollTrigger.refresh()` after the loader completes + after hero decode (guarded for cached images) |
| Feathered mask reveals (lights-on, bloom, room wipe) | CSS mask-image gradients driven by GSAP custom-property tweens — compositor-friendly |
| Film grain overlay | One tiny SVG-noise tile animated with steps(4) transform — pausable via `Space` (adds `body.paused`) |
| Scroll-linked audio triggers | Impact synth is rate-limited (≥260 ms) so scrubbing can't machine-gun it |
| Long-session memory | All triggers/timelines live in `gsap.context` and are reverted on unmount |

## How to disable heavy effects

- **Film grain + vignette:** remove `<div className="grade" />` in
  `src/App.jsx` (or `display:none` on `.grade` in `global.css`).
- **Procedural material panels:** supply real `material-*.webp` files in
  `src/data/assets.js` — images are cheaper than turbulence filters.
- **Smooth scrolling:** Lenis auto-disables for
  `prefers-reduced-motion: reduce`; set `smoothWheel: false` in
  `src/App.jsx` to force native scrolling everywhere.
- **Slice desaturation filter (scene 5):** delete the `filter` tween in
  `FinalScene.jsx` — the separation still reads without it.
- **Idle animations** (scroll-hint pulse, sound bars, grain drift) all
  honor `prefers-reduced-motion`.

## Measured state

- Production build: ~315 KB JS (~107 KB gzip) including React + GSAP +
  Lenis; CSS ~25 KB. Four WebP stills ≈1.1 MB total.
- Verified in headless Chromium at 1440×900: zero console errors across
  the full scroll, forward and reverse; Filming Mode, reset, and pause
  shortcuts confirmed working.
