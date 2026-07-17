/* Derives dist-single/artifact.html (no doc wrapper — the Artifact tool
   adds doctype/head/body) from dist-single/index.html. */
import { readFileSync, writeFileSync } from 'node:fs'
const html = readFileSync('dist-single/index.html', 'utf8')
const grab = (re) => (html.match(re) || [''])[0]
const title = grab(/<title>[\s\S]*?<\/title>/)
const style = grab(/<style>[\s\S]*?<\/style>/)
const script = grab(/<script type="module">[\s\S]*<\/script>/)
const out = `${title}\n${style}\n<div id="root"></div>\n${script}\n`
writeFileSync('dist-single/artifact.html', out)
console.log('dist-single/artifact.html:', (Buffer.byteLength(out) / 1024 / 1024).toFixed(2), 'MB')
