/**
 * MONOLITH — the construction film and its 8 anchor stills.
 * The film (/house-build.mp4 + .webm, one locked camera, 8 s) is the
 * primary visual; these stills are extracted from it and serve as the
 * poster, the no-video fallback and the material crops, so the whole
 * site is one house from one camera.
 * Paths are literal strings so the single-file build can inline them.
 */
export const FRAMES = [
  { file: '01_land', phase: 'LAND', src: '/film-frames/01_land.webp' },
  { file: '02_foundation', phase: 'FOUNDATION', src: '/film-frames/02_foundation.webp' },
  { file: '03_structure', phase: 'STRUCTURE', src: '/film-frames/03_structure.webp' },
  { file: '04_frame', phase: 'FRAME', src: '/film-frames/04_frame.webp' },
  { file: '05_envelope', phase: 'ENVELOPE', src: '/film-frames/05_envelope.webp' },
  { file: '06_glazing', phase: 'GLAZING', src: '/film-frames/06_glazing.webp' },
  { file: '07_landscape', phase: 'LANDSCAPE', src: '/film-frames/07_landscape.webp' },
  { file: '08_residence', phase: 'RESIDENCE', src: '/film-frames/08_residence.webp' },
].map((f, i) => ({ ...f, index: i }))

/* where each stage sits on the film's normalized timeline (t / 8 s) */
export const STAGE_AT = [0, 0.13, 0.25, 0.38, 0.5, 0.6, 0.7, 0.82]
