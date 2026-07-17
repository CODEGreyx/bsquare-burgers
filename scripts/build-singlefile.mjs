/**
 * Packs the Vite build into ONE self-contained index.html:
 * JS + CSS inlined, woff2 fonts and webp stills embedded as data URIs.
 * Output: dist-single/index.html — double-click to run, or drag-drop
 * (zipped) onto https://app.netlify.com/drop
 *
 * Usage: npm run build && node scripts/build-singlefile.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
let html = readFileSync(join(dist, 'index.html'), 'utf8')

const dataUri = (path, mime) =>
  `data:${mime};base64,${readFileSync(path).toString('base64')}`

/* ---- CSS: inline stylesheet, embed woff2 fonts ---- */
const cssFile = readdirSync(join(dist, 'assets')).find((f) => f.endsWith('.css'))
let css = readFileSync(join(dist, 'assets', cssFile), 'utf8')
css = css.replace(/url\(([^)]+\.woff2)\)/g, (_, p) => {
  const file = p.replace(/^["']|["']$/g, '').split('/').pop()
  return `url(${dataUri(join(dist, 'assets', file), 'font/woff2')})`
})
/* drop the .woff fallbacks (every target browser takes woff2) */
css = css.replace(/,\s*url\([^)]+\.woff\)\s*format\("woff"\)/g, '')
html = html.replace(
  /<link rel="stylesheet"[^>]*>/,
  `<style>${css}</style>`
)

/* ---- JS: inline bundle, embed the four stills ---- */
const jsFile = readdirSync(join(dist, 'assets')).find((f) => f.endsWith('.js'))
let js = readFileSync(join(dist, 'assets', jsFile), 'utf8')
const media = [
  ['house-build.mp4', 'video/mp4'],
  ['assets/frames/land.webp', 'image/webp'],
  ['assets/frames/slab.webp', 'image/webp'],
  ['assets/frames/frame.webp', 'image/webp'],
  ['assets/frames/envelope.webp', 'image/webp'],
  ['assets/frames/day.webp', 'image/webp'],
  ['assets/frames/dusk.webp', 'image/webp'],
  ['assets/frames/hero.webp', 'image/webp'],
  ['assets/frames/frame2.webp', 'image/webp'],
  ['assets/frames/golden.webp', 'image/webp'],
  ['assets/frames/day2.webp', 'image/webp'],
  ['assets/frames/evening.webp', 'image/webp'],
  ['assets/frames/duskb.webp', 'image/webp'],
  ['house-sequence/07_pool_and_landscaping.webp', 'image/webp'],
  ['house-sequence/08_completed_villa.webp', 'image/webp'],
  ['assets/exterior/residence-complete.webp', 'image/webp'],
  ['assets/interior/interior-living.webp', 'image/webp'],
  ['assets/interior/interior-living-2.webp', 'image/webp'],
  ['film-frames/01_land.webp', 'image/webp'],
  ['film-frames/02_foundation.webp', 'image/webp'],
  ['film-frames/03_structure.webp', 'image/webp'],
  ['film-frames/04_frame.webp', 'image/webp'],
  ['film-frames/05_envelope.webp', 'image/webp'],
  ['film-frames/06_glazing.webp', 'image/webp'],
  ['film-frames/07_landscape.webp', 'image/webp'],
  ['film-frames/08_residence.webp', 'image/webp'],
]
for (const [rel, mime] of media) {
  if (!existsSync(join(dist, rel))) continue
  js = js.replaceAll(`/${rel}`, dataUri(join(dist, rel), mime))
}
js = js.replace(/<\/script>/g, '<\\/script>')
html = html.replace(
  /<script type="module"[^>]*><\/script>/,
  () => `<script type="module">${js}</script>`
)

/* ---- head cleanup: preload is pointless once embedded ---- */
html = html.replace(/\s*<link rel="preload"[^>]*>/, '')

mkdirSync('dist-single', { recursive: true })
writeFileSync('dist-single/index.html', html)
console.log(
  'dist-single/index.html:',
  (Buffer.byteLength(html) / 1024 / 1024).toFixed(2),
  'MB'
)
