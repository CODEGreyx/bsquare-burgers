/**
 * The 8 aligned construction frames of the MONOLITH residence.
 * One villa, one camera, eight moments — scroll scrubs through them.
 * Files live in /public/house-sequence/ (16:9 WebP, center-aligned).
 * Paths are literal strings so the single-file build can inline them.
 */
export const FRAMES = [
  { file: '01_empty_land', phase: 'LAND', src: '/house-sequence/01_empty_land.webp' },
  { file: '02_foundation', phase: 'FOUNDATION', src: '/house-sequence/02_foundation.webp' },
  { file: '03_ground_structure', phase: 'STRUCTURE', src: '/house-sequence/03_ground_structure.webp' },
  { file: '04_full_structure', phase: 'FRAME', src: '/house-sequence/04_full_structure.webp' },
  { file: '05_walls_and_roof', phase: 'ENVELOPE', src: '/house-sequence/05_walls_and_roof.webp' },
  { file: '06_windows_and_materials', phase: 'GLAZING', src: '/house-sequence/06_windows_and_materials.webp' },
  { file: '07_pool_and_landscaping', phase: 'LANDSCAPE', src: '/house-sequence/07_pool_and_landscaping.webp' },
  { file: '08_completed_villa', phase: 'RESIDENCE', src: '/house-sequence/08_completed_villa.webp' },
].map((f, i) => ({ ...f, index: i }))
