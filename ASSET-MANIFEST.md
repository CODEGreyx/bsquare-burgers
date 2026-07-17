# ASSET MANIFEST — NØRTHLINE RESIDENCES

Status: **final** = shipped and used in production · **temporary** =
code-generated stand-in with a documented replacement path ·
**slot** = empty, activates via `src/data/assets.js`.

## Stills (Higgsfield, nano_banana_pro, 2K)

| File | Type | Resolution | Scene | Purpose | Status |
| --- | --- | --- | --- | --- | --- |
| `public/assets/exterior/residence-complete.webp` | WebP still | 2752×1536 | 3 · 4 · 5 | Completed residence at dusk; master reference for all other generations; lights-on reveal, interior approach, final deconstruction | **final** |
| `public/assets/construction/residence-structure.webp` | WebP still | 2752×1536 | 2 · 3 | Raw structural skeleton the animated wireframe resolves into | **final** |
| `public/assets/construction/residence-construction.webp` | WebP still | 2752×1536 | 3 | Mid-construction stage carried in by the concrete curtain panels | **final** |
| `public/assets/interior/interior-living.webp` | WebP still | 2752×1536 | 4 | Full-screen living space; light sweep, material labels, plan overlay | **final** |
| `public/assets/interior/interior-living-2.webp` | WebP still | 2752×1536 | 4 | Reverse/wider view of the same room, revealed by a travelling light wipe; property details sit over it | **final** |

## Code-drawn architectural artwork (vector, resolution-independent)

| File | Type | Scene | Purpose | Status |
| --- | --- | --- | --- | --- |
| `src/components/svg/FloorPlanSVG.jsx` | SVG component | 1 · 2 · 4 | Ground-floor plan: draws itself in scene 1, tilts into the ground plane in scene 2, flashes over the interior in scene 4 | **final** (intentionally vector — crisper than raster for scroll-drawing) |
| `src/components/svg/ElevationSVG.jsx` | SVG component | 2 · 3 | Structural elevation traced against the hero photo; columns/slabs/volumes/glazing rise layer by layer | **final** (same rationale) |

## Video

| File | Type | Duration | Scene | Purpose | Status |
| --- | --- | --- | --- | --- | --- |
| `public/assets/video/build-timelapse.mp4` | H.264 MP4, 1920×1012, keyframe every 8 frames | 19.2 s | 1 | THE BUILD — real 4K construction timelapse (day → golden hour → deep dusk over tower cranes), playhead scrubbed 1:1 to scroll. Source: Pexels video 7025003, native 4096×2160, free for commercial use, no attribution required. Re-encoded with dense keyframes for smooth bidirectional seeking. | **final** |
| `public/assets/video/build-timelapse.webm` | VP9 WebM, same cut | 19.2 s | 1 | Fallback source for browsers without H.264 (open-codec Chromium builds) | **final** |

## Video slots (empty — still + code-motion fallback active)

| File (slot) | Type | Target duration | Scene | Purpose | Status |
| --- | --- | --- | --- | --- | --- |
| `public/assets/video/exterior-approach.mp4` | MP4 16:9 | 8–10 s loop | 3 | Slow push toward the lit residence after the reveal | **slot** (fallback: still + scale drift) |
| `public/assets/video/exterior-reflection.mp4` | MP4 16:9 | 6–8 s loop | 3 | Water/pavement reflection b-roll | **slot** |
| `public/assets/video/interior-light.mp4` | MP4 16:9 | 8–10 s loop | 4 | Light moving across travertine | **slot** (fallback: still + gradient light sweep) |
| `public/assets/video/material-macro.mp4` | MP4 16:9 | 8 s | 3 | Macro material sequence | **slot** (fallback: procedural swatches) |
| `public/assets/video/berlin-atmosphere.mp4` | MP4 16:9 | 8–10 s loop | 5 | Berlin blue-hour under the deconstruction | **slot** |

## Audio

| Source | Type | Scene | Purpose | Status |
| --- | --- | --- | --- | --- |
| `src/lib/sound.js` (WebAudio synthesis) | Procedural | all | Room tone, assembly impacts, completion swell, brand tone; opt-in, `M` to toggle | **final** (no files required; `public/assets/audio/` reserved for future recordings) |

## Original PNG masters

The 2K PNG masters fetched from Higgsfield are converted to WebP in place
and the PNGs are **not kept in the repository** (≈10 MB each). Regenerate
via HIGGSFIELD-PROMPTS.md or re-run the CI fetch workflow if masters are
needed again.
