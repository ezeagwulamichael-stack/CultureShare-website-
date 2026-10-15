/*
 * Emoji studio model. A user's emoji is a small set of part choices that the
 * <Emoji> component draws as SVG, so it can be re-rendered with any
 * expression (stickers) without storing images.
 */

export type FaceShape = 'round' | 'oval' | 'square' | 'heart'
export type EyeShape = 'round' | 'almond' | 'wide' | 'hooded' | 'narrow'
export type BrowShape = 'soft' | 'thick' | 'arched' | 'straight'
export type Expression = 'smile' | 'grin' | 'laugh' | 'wink' | 'surprised' | 'calm' | 'love' | 'cheeky'
export type HairStyle = 'none' | 'fade' | 'afro' | 'locs' | 'braids' | 'bantu' | 'puff' | 'cornrows' | 'long'
export type Beard = 'none' | 'stubble' | 'moustache' | 'goatee' | 'chinstrap' | 'full'
export type Attire = 'tee' | 'dashiki' | 'agbada' | 'kente' | 'isiagu' | 'kaftan' | 'shuka' | 'suit' | 'hoodie'
export type Headwear = 'none' | 'gele' | 'fila' | 'kufi' | 'headwrap' | 'okpu' | 'beanie'
export type Eyewear = 'none' | 'glasses' | 'round' | 'shades'
export type Jewelry = 'none' | 'earrings' | 'studs' | 'beads' | 'both'

export interface EmojiConfig {
  skin: string
  face: FaceShape
  eyes: EyeShape
  eyeColor: string
  brows: BrowShape
  expression: Expression
  hair: HairStyle
  hairColor: string
  beard: Beard
  attire: Attire
  attireColor: string
  headwear: Headwear
  eyewear: Eyewear
  jewelry: Jewelry
  background: string
}

export const DEFAULT_EMOJI: EmojiConfig = {
  skin: '#8d5524',
  face: 'oval',
  eyes: 'almond',
  eyeColor: '#3b2314',
  brows: 'soft',
  expression: 'smile',
  hair: 'afro',
  hairColor: '#1a1008',
  beard: 'none',
  attire: 'dashiki',
  attireColor: '#c9a84c',
  headwear: 'none',
  eyewear: 'none',
  jewelry: 'none',
  background: '#1b4332',
}

export const SKIN_TONES = ['#f1c9a5', '#e0ac69', '#c68642', '#a86b3c', '#8d5524', '#6f4120', '#5a3418', '#3d2210']
export const EYE_COLORS = ['#3b2314', '#1a0f08', '#6b4423', '#8a5a2b', '#5c6b3a', '#4a6b8a', '#7a7a7a']
export const HAIR_COLORS = ['#1a1008', '#3b2314', '#6b4423', '#a0522d', '#c9a84c', '#8a8a8a', '#e8e2d6', '#7a1f3d']
export const ATTIRE_COLORS = ['#c9a84c', '#1b4332', '#b3261e', '#1e3a8a', '#6d28d9', '#0f766e', '#ea580c', '#111827', '#f5f0e6', '#db2777']
export const BACKGROUNDS = ['#1b4332', '#c9a84c', '#0c3122', '#2b1d12', '#7a1f3d', '#1e3a8a', '#ea580c', '#f5f0e6', 'transparent']

type Opt<T extends string> = { id: T; label: string }

export const OPTIONS = {
  face: [
    { id: 'round', label: 'Round' },
    { id: 'oval', label: 'Oval' },
    { id: 'square', label: 'Square' },
    { id: 'heart', label: 'Heart' },
  ] as Opt<FaceShape>[],
  eyes: [
    { id: 'almond', label: 'Almond' },
    { id: 'round', label: 'Round' },
    { id: 'wide', label: 'Wide' },
    { id: 'hooded', label: 'Hooded' },
    { id: 'narrow', label: 'Narrow' },
  ] as Opt<EyeShape>[],
  brows: [
    { id: 'soft', label: 'Soft' },
    { id: 'thick', label: 'Thick' },
    { id: 'arched', label: 'Arched' },
    { id: 'straight', label: 'Straight' },
  ] as Opt<BrowShape>[],
  expression: [
    { id: 'smile', label: 'Smile' },
    { id: 'grin', label: 'Grin' },
    { id: 'laugh', label: 'Laugh' },
    { id: 'wink', label: 'Wink' },
    { id: 'surprised', label: 'Surprised' },
    { id: 'calm', label: 'Calm' },
    { id: 'love', label: 'In love' },
    { id: 'cheeky', label: 'Cheeky' },
  ] as Opt<Expression>[],
  hair: [
    { id: 'afro', label: 'Afro' },
    { id: 'fade', label: 'Low fade' },
    { id: 'locs', label: 'Locs' },
    { id: 'braids', label: 'Braids' },
    { id: 'bantu', label: 'Bantu knots' },
    { id: 'puff', label: 'Puff' },
    { id: 'cornrows', label: 'Cornrows' },
    { id: 'long', label: 'Long' },
    { id: 'none', label: 'Bald' },
  ] as Opt<HairStyle>[],
  beard: [
    { id: 'none', label: 'None' },
    { id: 'stubble', label: 'Stubble' },
    { id: 'moustache', label: 'Moustache' },
    { id: 'goatee', label: 'Goatee' },
    { id: 'chinstrap', label: 'Chinstrap' },
    { id: 'full', label: 'Full beard' },
  ] as Opt<Beard>[],
  attire: [
    { id: 'dashiki', label: 'Dashiki' },
    { id: 'agbada', label: 'Agbada' },
    { id: 'kente', label: 'Kente' },
    { id: 'isiagu', label: 'Isiagu' },
    { id: 'kaftan', label: 'Kaftan' },
    { id: 'shuka', label: 'Shúkà' },
    { id: 'suit', label: 'Suit' },
    { id: 'hoodie', label: 'Hoodie' },
    { id: 'tee', label: 'T-shirt' },
  ] as Opt<Attire>[],
  headwear: [
    { id: 'none', label: 'None' },
    { id: 'gele', label: 'Gele' },
    { id: 'fila', label: 'Fila' },
    { id: 'kufi', label: 'Kufi' },
    { id: 'headwrap', label: 'Headwrap' },
    { id: 'okpu', label: 'Red cap' },
    { id: 'beanie', label: 'Beanie' },
  ] as Opt<Headwear>[],
  eyewear: [
    { id: 'none', label: 'None' },
    { id: 'glasses', label: 'Glasses' },
    { id: 'round', label: 'Round frames' },
    { id: 'shades', label: 'Shades' },
  ] as Opt<Eyewear>[],
  jewelry: [
    { id: 'none', label: 'None' },
    { id: 'earrings', label: 'Hoops' },
    { id: 'studs', label: 'Studs' },
    { id: 'beads', label: 'Coral beads' },
    { id: 'both', label: 'Hoops + beads' },
  ] as Opt<Jewelry>[],
}

/** Sticker set: the user's emoji re-drawn with a different expression and a caption. */
export const STICKERS: { expression: Expression; caption: string }[] = [
  { expression: 'grin', caption: 'Ẹ ṣé!' },
  { expression: 'laugh', caption: 'LOL' },
  { expression: 'love', caption: 'Love it' },
  { expression: 'surprised', caption: 'Ehn?!' },
  { expression: 'wink', caption: 'Say less' },
  { expression: 'calm', caption: 'Medaase' },
  { expression: 'cheeky', caption: 'Abeg' },
  { expression: 'smile', caption: 'Asante' },
]

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]

export function randomEmoji(): EmojiConfig {
  return {
    skin: pick(SKIN_TONES),
    face: pick(OPTIONS.face).id,
    eyes: pick(OPTIONS.eyes).id,
    eyeColor: pick(EYE_COLORS),
    brows: pick(OPTIONS.brows).id,
    expression: pick(OPTIONS.expression).id,
    hair: pick(OPTIONS.hair).id,
    hairColor: pick(HAIR_COLORS.slice(0, 6)),
    beard: Math.random() < 0.55 ? 'none' : pick(OPTIONS.beard).id,
    attire: pick(OPTIONS.attire).id,
    attireColor: pick(ATTIRE_COLORS),
    headwear: Math.random() < 0.6 ? 'none' : pick(OPTIONS.headwear).id,
    eyewear: Math.random() < 0.7 ? 'none' : pick(OPTIONS.eyewear).id,
    jewelry: Math.random() < 0.6 ? 'none' : pick(OPTIONS.jewelry).id,
    background: pick(BACKGROUNDS.slice(0, 7)),
  }
}

/** Mixes a hex colour toward black (amt < 0) or white (amt > 0). */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const mix = (c: number) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)
  const r = mix((n >> 16) & 255)
  const g = mix((n >> 8) & 255)
  const b = mix(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/** Serialises a rendered emoji <svg> to a data URL (profile photo, stickers). */
export function svgToDataUrl(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.removeAttribute('class')
  clone.removeAttribute('style')
  const xml = new XMLSerializer().serializeToString(clone)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`
}
