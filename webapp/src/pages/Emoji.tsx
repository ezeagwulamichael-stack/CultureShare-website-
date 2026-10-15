import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft2, ArrowRight2, Messages2, Profile, Refresh2, Shuffle, TickCircle } from 'iconsax-react'
import { useApp } from '../store/useApp'
import { Page, PageHeader } from '../components/Shell'
import { Modal } from '../components/ui'
import { Emoji } from '../components/Emoji'
import { ATTIRE_COLORS, BACKGROUNDS, DEFAULT_EMOJI, EYE_COLORS, HAIR_COLORS, OPTIONS, SKIN_TONES, STICKERS, randomEmoji, svgToDataUrl, type EmojiConfig } from '../lib/emoji'
import { cx } from '../lib/util'

type Key = keyof EmojiConfig
interface Cat {
  id: string
  label: string
  hint: string
  key?: Key
  options?: { id: string; label: string }[]
  crop?: 'full' | 'head' | 'face'
  swatch?: { key: Key; list: string[]; label: string }
}

const CATS: Cat[] = [
  { id: 'skin', label: 'Skin tone', hint: 'Start with the shade that matches yours.', key: 'skin', options: SKIN_TONES.map((t) => ({ id: t, label: '' })), crop: 'face' },
  { id: 'face', label: 'Face shape', hint: 'Round, oval, square or heart.', key: 'face', options: OPTIONS.face, crop: 'head' },
  { id: 'eyes', label: 'Eyes', hint: 'Pick a shape, then the colour.', key: 'eyes', options: OPTIONS.eyes, crop: 'face', swatch: { key: 'eyeColor', list: EYE_COLORS, label: 'Eye colour' } },
  { id: 'brows', label: 'Brows', hint: 'Brows take their colour from your hair.', key: 'brows', options: OPTIONS.brows, crop: 'face' },
  { id: 'expression', label: 'Expression', hint: 'Your everyday face. Stickers use the others.', key: 'expression', options: OPTIONS.expression, crop: 'face' },
  { id: 'hair', label: 'Hair', hint: 'Style first, then colour.', key: 'hair', options: OPTIONS.hair, crop: 'head', swatch: { key: 'hairColor', list: HAIR_COLORS, label: 'Hair colour' } },
  { id: 'beard', label: 'Beard', hint: 'Facial hair matches your hair colour.', key: 'beard', options: OPTIONS.beard, crop: 'face', swatch: { key: 'hairColor', list: HAIR_COLORS, label: 'Beard & hair colour' } },
  { id: 'attire', label: 'Attire', hint: 'Dress it in something from home.', key: 'attire', options: OPTIONS.attire, crop: 'full', swatch: { key: 'attireColor', list: ATTIRE_COLORS, label: 'Fabric colour' } },
  { id: 'headwear', label: 'Headwear', hint: 'Gele, fila, kufi and more — cut from your fabric.', key: 'headwear', options: OPTIONS.headwear, crop: 'head', swatch: { key: 'attireColor', list: ATTIRE_COLORS, label: 'Fabric colour (matches attire)' } },
  { id: 'eyewear', label: 'Glasses', hint: 'Frames or shades.', key: 'eyewear', options: OPTIONS.eyewear, crop: 'face' },
  { id: 'jewelry', label: 'Jewellery', hint: 'Hoops, studs or coral beads.', key: 'jewelry', options: OPTIONS.jewelry, crop: 'full' },
  { id: 'background', label: 'Background', hint: 'Shown behind your emoji when it’s your profile photo.', swatch: { key: 'background', list: BACKGROUNDS, label: 'Background colour' } },
]

/* ─────────── Emoji studio — design your own emoji ─────────── */
export function EmojiStudio() {
  const saved = useApp((s) => s.emoji)
  const skin = useApp((s) => s.avatar.skin)
  const setEmoji = useApp((s) => s.setEmoji)
  const updateMe = useApp((s) => s.updateMe)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const start = saved ?? { ...DEFAULT_EMOJI, skin }
  const [cfg, setCfg] = useState<EmojiConfig>(start)
  const [step, setStep] = useState(0)
  const [bump, setBump] = useState(0)
  const [done, setDone] = useState(false)
  const photoRef = useRef<SVGSVGElement>(null)
  const cat = CATS[step]
  const dirty = JSON.stringify(cfg) !== JSON.stringify(saved)

  const patch = (p: Partial<EmojiConfig>) => {
    setCfg((c) => ({ ...c, ...p }))
    setBump((b) => b + 1)
  }
  const save = () => {
    setEmoji(cfg)
    setDone(true)
  }

  return (
    <Page wide>
      <PageHeader
        eyebrow="Profile"
        title="Emoji studio"
        sub="Design an emoji that looks like you. Use it as your profile photo, or send it as stickers in Messages."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => patch(randomEmoji())}>
              <Shuffle size={16} /> Shuffle
            </button>
            <button className="btn btn-ghost btn-sm" disabled={!dirty} onClick={() => (setCfg(start), setBump((b) => b + 1))}>
              <Refresh2 size={16} /> Reset
            </button>
            <button className="btn btn-primary btn-sm" onClick={save}>
              <TickCircle size={16} /> Save emoji
            </button>
          </>
        }
      />
      <div className="emoji-studio">
        <section className="card emoji-stage">
          <motion.div key={bump} initial={{ scale: 0.94 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}>
            <Emoji config={cfg} size={240} title="Your emoji" />
          </motion.div>
          <div className="stack gap-1" style={{ alignItems: 'center', width: '100%' }}>
            <span className="xs faint">Your stickers update as you go</span>
            <div className="row gap-1" style={{ justifyContent: 'center' }}>
              {STICKERS.slice(0, 4).map((s) => (
                <Emoji key={s.caption} config={cfg} expression={s.expression} bg="none" size={58} />
              ))}
            </div>
          </div>
          <hr className="divider" style={{ width: '100%' }} />
          <div className="row between" style={{ width: '100%' }}>
            <button className="btn btn-ghost btn-sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft2 size={16} /> Back
            </button>
            <span className="xs faint">
              Step {step + 1} of {CATS.length}
            </span>
            {step < CATS.length - 1 ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setStep((s) => s + 1)}>
                Next <ArrowRight2 size={16} />
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={save}>
                Finish
              </button>
            )}
          </div>
        </section>

        <section className="stack gap-4" style={{ minWidth: 0 }}>
          <div className="emoji-cats" role="tablist" aria-label="Emoji features">
            {CATS.map((c, k) => (
              <button key={c.id} role="tab" aria-selected={k === step} className={cx('chip sm', k === step && 'is-on')} onClick={() => setStep(k)}>
                {c.label}
              </button>
            ))}
          </div>
          <motion.div key={cat.id} className="card stack gap-4" style={{ padding: 'clamp(16px, 2.4vw, 22px)' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div className="stack gap-1">
              <h2 className="h3">{cat.label}</h2>
              <span className="small muted">{cat.hint}</span>
            </div>
            {cat.key && cat.options && (
              <div className="emoji-grid">
                {cat.options.map((o) => {
                  const on = cfg[cat.key!] === o.id
                  return (
                    <button key={o.id} className={cx('emoji-tile', on && 'is-on')} aria-pressed={on} aria-label={o.label || `Skin tone ${o.id}`} onClick={() => patch({ [cat.key!]: o.id } as Partial<EmojiConfig>)}>
                      <Emoji config={{ ...cfg, [cat.key!]: o.id }} bg="none" crop={cat.crop} size={76} />
                      {o.label && <span>{o.label}</span>}
                    </button>
                  )
                })}
              </div>
            )}
            {cat.swatch && (
              <div className="stack gap-2">
                <span className="field-label">{cat.swatch.label}</span>
                <div className="row gap-2 wrap">
                  {cat.swatch.list.map((c) => (
                    <button
                      key={c}
                      className={cx('swatch', cfg[cat.swatch!.key] === c && 'is-on', c === 'transparent' && 'emoji-swatch-transparent')}
                      style={{ background: c }}
                      onClick={() => patch({ [cat.swatch!.key]: c } as Partial<EmojiConfig>)}
                      aria-label={c === 'transparent' ? 'No background' : `${cat.swatch!.label} ${c}`}
                      aria-pressed={cfg[cat.swatch!.key] === c}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </section>
      </div>

      {/* full-frame render used for the profile photo */}
      <div hidden>
        <Emoji ref={photoRef} config={{ ...cfg, background: cfg.background === 'transparent' ? '#1b4332' : cfg.background }} bg="fill" size={400} />
      </div>

      <Modal
        open={done}
        onClose={() => setDone(false)}
        title="Your emoji is ready"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => (setDone(false), nav('/profile'))}>
              Done
            </button>
            <button className="btn btn-secondary" onClick={() => nav('/messages')}>
              <Messages2 size={16} /> Send stickers
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!photoRef.current) return
                updateMe({ avatar: svgToDataUrl(photoRef.current) })
                toast('Your emoji is now your profile photo', 'success', { label: 'View profile', to: '/profile' })
                setDone(false)
              }}
            >
              <Profile size={16} /> Use as profile photo
            </button>
          </>
        }
      >
        <div className="stack gap-4" style={{ alignItems: 'center' }}>
          <Emoji config={cfg} size={150} />
          <p className="small muted" style={{ textAlign: 'center' }}>
            Saved. It’s also a sticker pack now — open any conversation and tap the sticker button.
          </p>
          <div className="sticker-grid" style={{ width: '100%', maxHeight: 'none' }}>
            {STICKERS.map((s) => (
              <span key={s.caption} className="sticker-btn">
                <Emoji config={cfg} expression={s.expression} caption={s.caption} bg="none" size={80} />
              </span>
            ))}
          </div>
        </div>
      </Modal>
    </Page>
  )
}
