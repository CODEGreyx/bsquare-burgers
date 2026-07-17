/**
 * The 8 aligned construction frames of the MONOLITH residence.
 * One villa, one camera, eight moments — scroll scrubs through them.
 * Files live in /public/house-sequence/ (1920×1080 WebP, center-aligned).
 */
export const FRAMES = [
  { file: '01_empty_land', phase: 'LAND' },
  { file: '02_foundation', phase: 'FOUNDATION' },
  { file: '03_ground_structure', phase: 'STRUCTURE' },
  { file: '04_full_structure', phase: 'FRAME' },
  { file: '05_walls_and_roof', phase: 'ENVELOPE' },
  { file: '06_windows_and_materials', phase: 'GLAZING' },
  { file: '07_pool_and_landscaping', phase: 'LANDSCAPE' },
  { file: '08_completed_villa', phase: 'RESIDENCE' },
].map((f, i) => ({ ...f, index: i, src: `/house-sequence/${f.file}.webp` }))
