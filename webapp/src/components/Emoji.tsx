import { forwardRef, useId, type ReactNode } from 'react'
import { shade, type EmojiConfig, type Expression } from '../lib/emoji'

/*
 * Draws a user's emoji from part choices. Plain SVG only (no motion
 * components) so the rendered node can be serialised into a profile photo or
 * a sticker image.
 */

const FACE: Record<EmojiConfig['face'], { d: string; hw: number }> = {
  round: { d: 'M100 38 C128 38 146 58 146 88 C146 118 126 136 100 136 C74 136 54 118 54 88 C54 58 72 38 100 38Z', hw: 46 },
  oval: { d: 'M100 34 C126 34 142 56 142 86 C142 120 124 140 100 140 C76 140 58 120 58 86 C58 56 74 34 100 34Z', hw: 42 },
  square: { d: 'M100 36 C130 36 144 52 144 80 L144 104 C144 126 126 138 100 138 C74 138 56 126 56 104 L56 80 C56 52 70 36 100 36Z', hw: 44 },
  heart: { d: 'M100 36 C130 36 147 54 146 82 C145 108 124 140 100 140 C76 140 55 108 54 82 C53 54 70 36 100 36Z', hw: 46 },
}

const BODY = 'M22 200 C24 168 44 152 78 148 L122 148 C156 152 176 168 178 200 Z'
const BODY_WIDE = 'M10 200 C12 166 40 150 78 148 L122 148 C160 150 188 166 190 200 Z'
const HAIR_CAP = 'M56 80 C54 46 76 30 100 30 C124 30 146 46 144 80 C138 62 122 52 100 52 C78 52 62 62 56 80Z'

/** Hair styles a covering headwear hides completely. */
const WRAPPED: EmojiConfig['hair'][] = ['afro', 'puff', 'bantu', 'fade', 'cornrows']

interface Props {
  config: EmojiConfig
  size?: number
  /** Overrides the saved expression — used for the sticker set. */
  expression?: Expression
  /** 'fill' paints the whole square (profile photo); 'none' is transparent (stickers). */
  bg?: 'fill' | 'circle' | 'none'
  caption?: string
  className?: string
  title?: string
  /** Zooms the frame for option tiles: 'face' for features, 'head' for hair and headwear. */
  crop?: 'full' | 'head' | 'face'
}

const CROP = { full: '0 0 200 200', head: '18 -4 164 164', face: '44 40 112 112' }

export const Emoji = forwardRef<SVGSVGElement, Props>(function Emoji({ config: c, size = 160, expression, bg = 'circle', caption, className, title, crop = 'full' }, ref) {
  const raw = useId()
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, '')
  const ex = expression ?? c.expression
  const face = FACE[c.face]
  const skinShadow = shade(c.skin, -0.18)
  const ink = '#1d120a'
  const covered = c.headwear !== 'none'
  const showBg = bg !== 'none' && c.background !== 'transparent'
  return (
    <svg ref={ref} viewBox={CROP[crop]} width={size} height={size} className={className} role="img" aria-label={title ?? 'Emoji'}>
      <defs>
        <clipPath id={`${id}-face`}>
          <path d={face.d} />
        </clipPath>
        <clipPath id={`${id}-body`}>
          <path d={c.attire === 'agbada' ? BODY_WIDE : BODY} />
        </clipPath>
        <clipPath id={`${id}-frame`}>{bg === 'circle' ? <circle cx="100" cy="100" r="100" /> : <rect width="200" height="200" />}</clipPath>
      </defs>
      <g clipPath={bg === 'circle' ? `url(#${id}-frame)` : undefined}>
        {showBg && (bg === 'circle' ? <circle cx="100" cy="100" r="100" fill={c.background} /> : <rect width="200" height="200" fill={c.background} />)}
        {showBg && <circle cx="100" cy="80" r="74" fill="#fff" opacity={0.06} />}

        {/* hair behind the head */}
        {!(covered && WRAPPED.includes(c.hair)) && <HairBack c={c} />}

        {/* body + attire */}
        <Attire c={c} clip={`url(#${id}-body)`} />

        {/* neck */}
        <rect x="87" y="116" width="26" height="40" rx="10" fill={c.skin} />
        <path d="M87 126 Q100 140 113 126 L113 138 Q100 146 87 138Z" fill={skinShadow} />
        {c.attire === 'hoodie' && <path d="M68 152 C72 138 128 138 132 152 C120 160 80 160 68 152Z" fill={shade(c.attireColor, -0.22)} />}
        {(c.jewelry === 'beads' || c.jewelry === 'both') && <Beads />}

        {/* ears + head */}
        <circle cx={100 - face.hw} cy="92" r="9" fill={c.skin} />
        <circle cx={100 + face.hw} cy="92" r="9" fill={c.skin} />
        <circle cx={100 - face.hw} cy="92" r="4.5" fill={skinShadow} />
        <circle cx={100 + face.hw} cy="92" r="4.5" fill={skinShadow} />
        <path d={face.d} fill={c.skin} />
        <g clipPath={`url(#${id}-face)`}>
          <ellipse cx="86" cy="62" rx="20" ry="12" fill="#fff" opacity={0.08} />
          <Beard c={c} hw={face.hw} />
        </g>
        {c.beard === 'full' && <path d="M72 128 Q100 160 128 128 Q100 140 72 128Z" fill={c.hairColor} />}
        {(c.beard === 'goatee' || c.beard === 'moustache' || c.beard === 'full') && (
          <path d="M84 110 C90 104 96 106 100 108 C104 106 110 104 116 110 C110 113 104 112 100 111 C96 112 90 113 84 110Z" fill={c.hairColor} />
        )}
        {c.beard === 'goatee' && <path d="M90 124 Q100 142 110 124 Q100 129 90 124Z" fill={c.hairColor} />}

        {/* cheeks */}
        {(ex === 'laugh' || ex === 'love' || ex === 'grin' || ex === 'cheeky') && (
          <>
            <ellipse cx="72" cy="106" rx="8" ry="4.5" fill="#ff6b6b" opacity={0.25} />
            <ellipse cx="128" cy="106" rx="8" ry="4.5" fill="#ff6b6b" opacity={0.25} />
          </>
        )}

        {/* features */}
        <Brows c={c} ex={ex} />
        <Eye cx={82} c={c} ex={ex} side="l" />
        <Eye cx={118} c={c} ex={ex} side="r" />
        <path d="M92 103 Q94 99 97 101 M108 103 Q106 99 103 101 M95 105 Q100 108 105 105" stroke={shade(c.skin, -0.32)} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <Mouth ex={ex} lip={shade(c.skin, -0.38)} />

        {/* hair + headwear on top */}
        {!covered && <HairFront c={c} />}
        {covered && <Headwear c={c} />}

        <Eyewear kind={c.eyewear} />
        {(c.jewelry === 'earrings' || c.jewelry === 'both') && (
          <>
            <circle cx={100 - face.hw} cy="106" r="5.5" fill="none" stroke="#e2b13c" strokeWidth="2.4" />
            <circle cx={100 + face.hw} cy="106" r="5.5" fill="none" stroke="#e2b13c" strokeWidth="2.4" />
          </>
        )}
        {c.jewelry === 'studs' && (
          <>
            <circle cx={100 - face.hw} cy="99" r="2.8" fill="#f3dda3" stroke="#b8860b" strokeWidth="0.8" />
            <circle cx={100 + face.hw} cy="99" r="2.8" fill="#f3dda3" stroke="#b8860b" strokeWidth="0.8" />
          </>
        )}
      </g>
      {caption && (
        <text x="100" y="192" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="24" fill="#fff" stroke={ink} strokeWidth="6" paintOrder="stroke" strokeLinejoin="round">
          {caption}
        </text>
      )}
    </svg>
  )
})

function Eye({ cx, c, ex, side }: { cx: number; c: EmojiConfig; ex: Expression; side: 'l' | 'r' }) {
  const cy = 88
  const ink = '#1d120a'
  if (ex === 'laugh' || (ex === 'wink' && side === 'r')) {
    return <path d={`M${cx - 8} ${cy + 1} Q${cx} ${cy - 7} ${cx + 8} ${cy + 1}`} stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
  }
  if (ex === 'love') {
    return <path d={`M${cx} ${cy + 7} C${cx - 11} ${cy - 1} ${cx - 6} ${cy - 10} ${cx} ${cy - 4} C${cx + 6} ${cy - 10} ${cx + 11} ${cy - 1} ${cx} ${cy + 7}Z`} fill="#e11d48" />
  }
  const shape = ex === 'surprised' ? 'wide' : c.eyes
  const iris = shape === 'wide' ? 5.4 : shape === 'narrow' ? 3.6 : 4.5
  let white: ReactNode
  if (shape === 'almond' || shape === 'hooded') white = <path d={`M${cx - 9} ${cy} Q${cx} ${cy - 8.5} ${cx + 9} ${cy} Q${cx} ${cy + 7.5} ${cx - 9} ${cy}Z`} fill="#fff" />
  else if (shape === 'narrow') white = <ellipse cx={cx} cy={cy} rx="8.5" ry="4.6" fill="#fff" />
  else white = <ellipse cx={cx} cy={cy} rx={shape === 'wide' ? 8.6 : 7.2} ry={shape === 'wide' ? 9 : 7.6} fill="#fff" />
  return (
    <g>
      {white}
      <circle cx={cx} cy={cy} r={iris} fill={c.eyeColor} />
      <circle cx={cx} cy={cy} r={iris * 0.48} fill={ink} />
      <circle cx={cx + 1.6} cy={cy - 1.8} r="1.3" fill="#fff" />
      {shape === 'almond' && <path d={`M${cx - 9.5} ${cy} Q${cx} ${cy - 9} ${cx + 9.5} ${cy}`} stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />}
      {(shape === 'hooded' || ex === 'calm') && (
        <path d={`M${cx - 10} ${cy + (ex === 'calm' ? 0.5 : -1)} Q${cx} ${cy - 12} ${cx + 10} ${cy + (ex === 'calm' ? 0.5 : -1)} L${cx + 10} ${cy - 12} L${cx - 10} ${cy - 12}Z`} fill={shade(c.skin, -0.06)} />
      )}
      {(shape === 'hooded' || ex === 'calm') && <path d={`M${cx - 9} ${cy + (ex === 'calm' ? 0.5 : -1)} Q${cx} ${cy - (ex === 'calm' ? 1 : 5)} ${cx + 9} ${cy + (ex === 'calm' ? 0.5 : -1)}`} stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />}
    </g>
  )
}

function Brows({ c, ex }: { c: EmojiConfig; ex: Expression }) {
  const dy = ex === 'surprised' ? -6 : ex === 'love' || ex === 'laugh' ? -2 : ex === 'calm' ? 1 : 0
  const d = { soft: 'M72 74 Q82 68 92 72', thick: 'M71 74 Q82 67 93 72', arched: 'M71 77 Q80 64 93 72', straight: 'M72 72 L92 71' }[c.brows]
  const w = { soft: 3.4, thick: 6, arched: 3.6, straight: 4.4 }[c.brows]
  const col = shade(c.hairColor, -0.15)
  return (
    <g transform={`translate(0 ${dy})`} stroke={col} strokeWidth={w} fill="none" strokeLinecap="round">
      <path d={d} />
      <path d={d} transform={ex === 'wink' ? 'translate(200 3) scale(-1 1)' : 'translate(200 0) scale(-1 1)'} />
    </g>
  )
}

function Mouth({ ex, lip }: { ex: Expression; lip: string }) {
  const dark = '#3a1410'
  switch (ex) {
    case 'grin':
      return (
        <g>
          <path d="M84 113 Q100 132 116 113 Q100 118 84 113Z" fill={dark} />
          <path d="M86 114 Q100 119 114 114 L113 117.5 Q100 121 87 117.5Z" fill="#fff" />
        </g>
      )
    case 'laugh':
      return (
        <g>
          <path d="M82 111 Q100 140 118 111 Z" fill={dark} />
          <path d="M83 111.5 L117 111.5 L115 116 Q100 118.5 85 116Z" fill="#fff" />
          <path d="M90 126 Q100 120 110 126 Q100 134 90 126Z" fill="#e0707a" />
        </g>
      )
    case 'surprised':
      return <ellipse cx="100" cy="120" rx="6.5" ry="8" fill={dark} />
    case 'wink':
      return <path d="M88 118 Q102 123 114 112" stroke={lip} strokeWidth="3.2" fill="none" strokeLinecap="round" />
    case 'calm':
      return <path d="M91 118 Q100 121 109 118" stroke={lip} strokeWidth="3" fill="none" strokeLinecap="round" />
    case 'cheeky':
      return (
        <g>
          <path d="M96.5 118 Q96 128 101 128.5 Q106.5 128 106 118Z" fill="#e0707a" stroke={shade('#e0707a', -0.25)} strokeWidth="1" />
          <path d="M86 115 Q100 125 114 115" stroke={lip} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'love':
      return <path d="M88 115 Q100 125 112 115" stroke={lip} strokeWidth="3.2" fill="none" strokeLinecap="round" />
    default:
      return <path d="M86 115 Q100 126 114 115" stroke={lip} strokeWidth="3.2" fill="none" strokeLinecap="round" />
  }
}

function Beard({ c, hw }: { c: EmojiConfig; hw: number }) {
  const region = 'M30 94 C44 104 58 108 72 106 C84 106 90 110 100 110 C110 110 116 106 128 106 C142 108 156 104 170 94 L170 170 L30 170Z'
  if (c.beard === 'full') return <path d={region} fill={c.hairColor} />
  if (c.beard === 'stubble') return <path d={region} fill={c.hairColor} opacity={0.3} />
  if (c.beard === 'chinstrap')
    return (
      <g>
        <path d={region} fill={c.hairColor} />
        <ellipse cx="100" cy="106" rx={hw - 9} ry="30" fill={c.skin} />
      </g>
    )
  return null
}

function HairBack({ c }: { c: EmojiConfig }) {
  const f = c.hairColor
  switch (c.hair) {
    case 'afro':
      return (
        <g fill={f}>
          <circle cx="100" cy="74" r="62" />
          <circle cx="56" cy="96" r="22" />
          <circle cx="144" cy="96" r="22" />
        </g>
      )
    case 'puff':
      return <circle cx="100" cy="26" r="25" fill={f} />
    case 'locs':
      return (
        <g fill={f}>
          {[48, 57, 66, 134, 143, 152].map((x) => (
            <rect key={x} x={x - 4.5} y="58" width="9" height="96" rx="4.5" />
          ))}
        </g>
      )
    case 'braids':
      return (
        <g fill={f} stroke={shade(f, 0.18)} strokeWidth="0.8">
          {[50, 57, 64, 136, 143, 150].map((x) => (
            <g key={x}>
              <rect x={x - 3} y="60" width="6" height="104" rx="3" />
              {[72, 84, 96, 108, 120, 132, 144, 156].map((y) => (
                <path key={y} d={`M${x - 3} ${y} L${x + 3} ${y + 4}`} fill="none" />
              ))}
            </g>
          ))}
        </g>
      )
    case 'long':
      return <path d="M52 80 C46 40 74 24 100 24 C126 24 154 40 148 80 L158 170 C140 178 122 172 114 160 L86 160 C78 172 60 178 42 170Z" fill={f} />
    default:
      return null
  }
}

function HairFront({ c }: { c: EmojiConfig }) {
  const f = c.hairColor
  const line = shade(f, 0.28)
  switch (c.hair) {
    case 'none':
      return <ellipse cx="100" cy="46" rx="18" ry="6" fill="#fff" opacity={0.12} />
    case 'afro':
      return <path d="M54 84 C50 40 74 24 100 24 C126 24 150 40 146 84 C140 66 124 58 100 58 C76 58 60 66 54 84Z" fill={f} />
    case 'cornrows':
      return (
        <g>
          <path d={HAIR_CAP} fill={f} />
          <g stroke={line} strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path d="M66 70 Q70 46 84 34" />
            <path d="M82 56 Q86 40 95 31" />
            <path d="M100 52 L100 30" />
            <path d="M118 56 Q114 40 105 31" />
            <path d="M134 70 Q130 46 116 34" />
          </g>
        </g>
      )
    case 'bantu':
      return (
        <g>
          <path d={HAIR_CAP} fill={f} />
          {[
            [68, 46],
            [84, 32],
            [100, 27],
            [116, 32],
            [132, 46],
          ].map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="9.5" fill={f} />
              <path d={`M${x - 4} ${y} A4 4 0 1 1 ${x} ${y + 4}`} stroke={line} strokeWidth="1.5" fill="none" />
            </g>
          ))}
        </g>
      )
    case 'long':
      return <path d="M56 86 C54 46 76 28 100 28 C128 28 148 46 144 88 C136 60 118 50 96 52 C82 54 66 64 56 86Z" fill={f} />
    case 'braids':
      return (
        <g>
          <path d={HAIR_CAP} fill={f} />
          <path d="M100 31 L100 52" stroke={shade(c.skin, -0.1)} strokeWidth="2" />
        </g>
      )
    case 'locs':
      return (
        <g>
          <path d={HAIR_CAP} fill={f} />
          <g fill={f}>
            {[64, 76, 124, 136].map((x) => (
              <rect key={x} x={x - 4.5} y="48" width="9" height="26" rx="4.5" />
            ))}
          </g>
        </g>
      )
    default:
      // fade + puff share the short cap
      return <path d={HAIR_CAP} fill={f} />
  }
}

function Headwear({ c }: { c: EmojiConfig }) {
  const col = c.attireColor
  const dark = shade(col, -0.22)
  const light = shade(col, 0.16)
  switch (c.headwear) {
    case 'gele':
      return (
        <g>
          <path d="M58 46 C48 14 80 0 100 12 C120 -2 154 12 144 44 C130 32 116 30 100 32 C84 30 70 34 58 46Z" fill={light} />
          <path d="M50 80 C50 42 74 26 100 26 C126 26 150 42 150 80 C134 66 118 62 100 62 C82 62 66 66 50 80Z" fill={col} />
          <g stroke={dark} strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M70 40 Q84 18 100 14" />
            <path d="M130 40 Q116 18 100 14" />
            <path d="M60 64 Q100 42 140 64" />
          </g>
        </g>
      )
    case 'fila':
      return (
        <g>
          <path d="M56 74 C54 44 74 28 100 28 C130 28 150 40 160 54 C150 62 130 58 100 60 C80 61 66 66 56 74Z" fill={col} />
          <path d="M56 74 C70 64 90 60 104 60 C130 59 150 60 160 54 L160 61 C148 69 126 66 104 66 C88 66 70 70 56 80Z" fill={dark} />
        </g>
      )
    case 'kufi':
      return (
        <g>
          <path d="M57 68 C57 40 78 28 100 28 C122 28 143 40 143 68 Z" fill={col} />
          <path d="M57 62 L143 62 L143 70 L57 70Z" fill={dark} />
          {[66, 78, 90, 102, 114, 126].map((x) => (
            <circle key={x} cx={x + 6} cy="48" r="2.4" fill={light} />
          ))}
        </g>
      )
    case 'headwrap':
      return (
        <g>
          <path d="M53 78 C51 40 76 24 100 24 C124 24 149 40 147 78 C132 67 116 63 100 63 C84 63 68 67 53 78Z" fill={col} />
          <path d="M66 70 Q84 40 120 30 M80 68 Q104 44 136 44" stroke={dark} strokeWidth="2" fill="none" />
          <circle cx="100" cy="46" r="10" fill={light} />
        </g>
      )
    case 'okpu':
      return (
        <g>
          <path d="M62 64 L67 26 C80 18 120 18 133 26 L138 64 C120 56 80 56 62 64Z" fill="#b3261e" />
          <path d="M67 26 C80 32 120 32 133 26" stroke="#7f1d1d" strokeWidth="2" fill="none" />
        </g>
      )
    case 'beanie':
      return (
        <g>
          <path d="M54 76 C52 36 76 22 100 22 C124 22 148 36 146 76Z" fill={col} />
          <rect x="51" y="64" width="98" height="14" rx="6" fill={dark} />
          <circle cx="100" cy="20" r="8" fill={light} />
        </g>
      )
    default:
      return null
  }
}

function Eyewear({ kind }: { kind: EmojiConfig['eyewear'] }) {
  if (kind === 'none') return null
  const frame = '#1a1a1a'
  if (kind === 'shades')
    return (
      <g>
        <rect x="68" y="78" width="28" height="18" rx="7" fill="#111" />
        <rect x="104" y="78" width="28" height="18" rx="7" fill="#111" />
        <path d="M96 84 L104 84 M68 82 L56 80 M132 82 L144 80" stroke={frame} strokeWidth="3" />
        <path d="M73 82 L80 82 M109 82 L116 82" stroke="#fff" strokeWidth="2" opacity={0.35} strokeLinecap="round" />
      </g>
    )
  return (
    <g stroke={frame} strokeWidth="2.6" fill="#fff" fillOpacity={0.08}>
      {kind === 'round' ? (
        <>
          <circle cx="82" cy="88" r="12" />
          <circle cx="118" cy="88" r="12" />
        </>
      ) : (
        <>
          <rect x="68" y="78" width="28" height="20" rx="6" />
          <rect x="104" y="78" width="28" height="20" rx="6" />
        </>
      )}
      <path d="M95 86 Q100 82 105 86 M68 84 L56 82 M132 84 L144 82" fill="none" />
    </g>
  )
}

function Beads() {
  const pts = Array.from({ length: 11 }, (_, t) => [76 + t * 4.8, 150 + 11 * Math.sin((Math.PI * t) / 10)])
  return (
    <g>
      {pts.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="3.4" fill="#e4572e" stroke="#9a3412" strokeWidth="0.8" />
      ))}
    </g>
  )
}

function Attire({ c, clip }: { c: EmojiConfig; clip: string }) {
  const col = c.attireColor
  const dark = shade(col, -0.25)
  const light = col.toLowerCase() === '#f5f0e6' ? '#c9a84c' : shade(col, 0.35)
  const trim = col.toLowerCase() === '#c9a84c' ? '#1b4332' : '#c9a84c'
  const body = c.attire === 'agbada' ? BODY_WIDE : BODY
  return (
    <g>
      <path d={body} fill={c.attire === 'kente' ? '#c9a84c' : col} />
      <g clipPath={clip}>
        {c.attire === 'tee' && <path d="M84 148 Q100 162 116 148" stroke={dark} strokeWidth="3.5" fill="none" />}
        {c.attire === 'hoodie' && <path d="M92 156 L90 182 M108 156 L110 182" stroke="#f5f0e6" strokeWidth="2.6" strokeLinecap="round" />}
        {c.attire === 'dashiki' && (
          <g>
            <path d="M84 146 L100 172 L116 146Z" fill={c.skin} />
            <path d="M76 146 L100 184 L124 146" stroke={trim} strokeWidth="7" fill="none" strokeLinejoin="round" />
            <path d="M80 150 L84 156 L88 152 L92 160 L96 156 L100 168 L104 156 L108 160 L112 152 L116 156 L120 150" stroke={dark} strokeWidth="1.8" fill="none" />
            <path d="M40 200 L44 176 L52 186 L58 172 L64 188 M160 200 L156 176 L148 186 L142 172 L136 188" stroke={trim} strokeWidth="3" fill="none" />
          </g>
        )}
        {c.attire === 'agbada' && (
          <g>
            <path d="M40 200 Q60 170 82 160 M160 200 Q140 170 118 160" stroke={dark} strokeWidth="3" fill="none" />
            <path d="M84 150 Q100 188 116 150" stroke={trim} strokeWidth="5" fill="none" />
            <circle cx="100" cy="178" r="9" stroke={trim} strokeWidth="3" fill="none" />
            <circle cx="100" cy="178" r="3.5" fill={trim} />
          </g>
        )}
        {c.attire === 'kente' && (
          <g>
            {Array.from({ length: 14 }, (_, k) => (
              <rect key={k} x={10 + k * 13} y="140" width="7" height="70" fill={[col, '#1b4332', '#b3261e', '#111827'][k % 4]} />
            ))}
            {[156, 172, 188].map((y) => (
              <rect key={y} x="0" y={y} width="200" height="5" fill={shade(col, -0.35)} opacity={0.7} />
            ))}
            <path d="M84 148 Q100 162 116 148" stroke="#111827" strokeWidth="4" fill="none" />
          </g>
        )}
        {c.attire === 'isiagu' && (
          <g>
            {[160, 178, 196].map((y, r) =>
              Array.from({ length: 10 }, (_, k) => {
                const x = 20 + k * 18 + (r % 2) * 9
                return (
                  <g key={`${y}-${k}`}>
                    <circle cx={x} cy={y} r="5" fill={shade(col, -0.5)} />
                    <circle cx={x} cy={y} r="2" fill={light} />
                  </g>
                )
              }),
            )}
            <path d="M88 148 L100 160 L112 148" stroke={trim} strokeWidth="3" fill="none" />
            <circle cx="100" cy="170" r="2.6" fill={trim} />
            <circle cx="100" cy="182" r="2.6" fill={trim} />
          </g>
        )}
        {c.attire === 'kaftan' && (
          <g>
            <path d="M86 148 Q100 160 114 148" stroke={trim} strokeWidth="4" fill="none" />
            <rect x="95" y="156" width="10" height="50" fill={trim} />
            {[164, 174, 184, 194].map((y) => (
              <circle key={y} cx="100" cy={y} r="2" fill={dark} />
            ))}
          </g>
        )}
        {c.attire === 'shuka' && (
          <g opacity={0.75}>
            {[150, 162, 174, 186, 198].map((y) => (
              <rect key={y} x="0" y={y} width="200" height="3" fill={dark} />
            ))}
            {[30, 46, 62, 78, 94, 110, 126, 142, 158, 174].map((x) => (
              <rect key={x} x={x} y="140" width="3" height="70" fill={dark} />
            ))}
            <path d="M58 148 L160 200 L138 200 L50 160Z" fill={shade(col, -0.12)} />
          </g>
        )}
        {c.attire === 'suit' && (
          <g>
            <path d="M84 146 L100 188 L116 146Z" fill="#f8f8f4" />
            <path d="M97 154 L103 154 L105 180 L100 187 L95 180Z" fill="#c9a84c" />
            <path d="M84 146 L100 188 L78 168 L74 150Z" fill={dark} />
            <path d="M116 146 L100 188 L122 168 L126 150Z" fill={dark} />
          </g>
        )}
      </g>
    </g>
  )
}
