// Turns `vite build --mode export` output into a shareable folder:
//   CultureShare-WebApp/index.html  (all JS + CSS inlined — open it directly, no server)
//   CultureShare-WebApp/img/        (images, referenced relatively)
import fs from 'node:fs'
import path from 'node:path'

// `node scripts/export-html.mjs --artifact <dir>` writes the hosted-page variant instead:
// no <html>/<head>/<body> wrapper (the host adds its own skeleton).
const artifactDir = process.argv.includes('--artifact') ? process.argv[process.argv.indexOf('--artifact') + 1] : null
const src = path.resolve('export-build')
const out = path.resolve(artifactDir ?? '../CultureShare-WebApp')
let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8')

html = html.replace(/<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/g, (_, f) => {
  const js = fs.readFileSync(path.join(src, f), 'utf8').replace(/<\/script/gi, '<\\/script')
  return `<script type="module">${js}</script>`
})
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+\.css)">/g, (_, f) => `<style>${fs.readFileSync(path.join(src, f), 'utf8')}</style>`)
if (/src="\.\/assets\/|href="\.\/assets\//.test(html)) throw new Error('Un-inlined asset left in index.html')

if (artifactDir) {
  const head = html.match(/<head>([\s\S]*)<\/head>/)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>|<link rel="icon"[^>]*>/g, '')
  const body = html.match(/<body>([\s\S]*)<\/body>/)[1]
  const title = head.match(/<title>[\s\S]*?<\/title>/)[0]
  html = `${title}\n${head.replace(title, '')}\n${body}`
}

fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })
fs.writeFileSync(path.join(out, 'index.html'), html)
fs.cpSync(path.join(src, 'img'), path.join(out, 'img'), { recursive: true })
if (!artifactDir) fs.writeFileSync(
  path.join(out, 'README.txt'),
  `CultureShare — Web App (interactive prototype)

Open index.html in Chrome, Edge, Safari or Firefox. No install or server needed.
Keep the "img" folder next to index.html.

- Any 6-digit code passes verification (000000 shows the error state).
- Any email + a 6+ character password logs in.
- Data is saved in your browser only. Settings > Account > "Reset demo data" restores it.
- Fonts load from Google Fonts, so an internet connection gives the intended type.

Source code: the webapp/ folder of the CultureShare Website repository.
`,
)
console.log(`Exported to ${out} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB html)`)
