// iconsax-react sets color/size via `defaultProps`, which React 19 ignores for
// forwardRef components — icons then render with no stroke (invisible). This
// rewrites the destructuring to apply the same defaults directly. Idempotent;
// runs on postinstall so fresh installs and CI builds get it too.
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('node_modules/iconsax-react/dist')
let patched = 0
for (const dir of ['esm', 'cjs']) {
  const d = path.join(root, dir)
  if (!fs.existsSync(d)) continue
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.js')) continue
    const p = path.join(d, f)
    const src = fs.readFileSync(p, 'utf8')
    const out = src
      .replace(/(\bcolor = )(_ref\d+)\.color(,|;)/g, "$1$2.color === undefined ? 'currentColor' : $2.color$3")
      .replace(/(\bsize = )(_ref\d+)\.size(,|;)/g, "$1$2.size === undefined ? '24' : $2.size$3")
      .replace(/(\bvariant = )(_ref\d+)\.variant(,|;)/g, "$1$2.variant === undefined ? 'Linear' : $2.variant$3")
    if (out !== src) {
      fs.writeFileSync(p, out)
      patched++
    }
  }
}
console.log(`fix-iconsax: patched ${patched} files`)
