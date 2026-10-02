import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Camera, CloseCircle, Crown1, DocumentText, Gallery, Global, Lock1, Microphone2, Music, Location, People, TickCircle, Video, ArrowLeft2, ArrowRight2, Clock, Calendar, Repeat, Add, Archive, Coin1, Profile2User, Danger } from 'iconsax-react'
import { useApp } from '../store/useApp'
import { CATEGORIES, COUNTRIES, USERS, img, asset } from '../data/seed'
import type { MediaKind, ScrollKind, Visibility } from '../data/types'
import { Page, PageHeader } from '../components/Shell'
import { AudioBlock, Avatar, Callout, Decision, HistorianBadge, Input, LaterBadge, Segmented, Select, Spinner, Switch, Textarea } from '../components/ui'
import { PeoplePicker } from '../components/sheets'
import { cx, getUser, wait } from '../lib/util'
import { imageToDataUrl, videoPoster } from '../lib/media'

const LIBRARY = ['aso-oke-women', 'kente-weaving', 'akan-festival', 'yoruba-drummers', 'maasai-ceremony', 'zulu-dance', 'ofe-onugbu', 'oba-tusks', 'egungun-village', 'amazigh-brides', 'great-zimbabwe', 'beaded-bride', 'emir-durbar', 'sepia-portrait', 'swahili-festival', 'bronze-artifacts'].map(img)

const STEPS = ['Content', 'Details', 'Culture', 'Access', 'Historian', 'Anonymous', 'Review'] as const
type Step = (typeof STEPS)[number]

interface Draft {
  kind: ScrollKind
  media: MediaKind
  images: string[]
  duration?: string
  docs: string[]
  recording?: string
  title: string
  caption: string
  people: string[]
  location: string
  music: string
  country: string
  tribe: string
  category: string
  tags: string
  visibility: Visibility
  sale: 'free' | 'sale'
  price: string
  historianId: string
  anonymous: boolean
}

const EMPTY: Draft = { kind: 'reel', media: 'image', images: [], docs: [], title: '', caption: '', people: [], location: '', music: '', country: '', tribe: '', category: '', tags: '', visibility: 'public', sale: 'free', price: '', historianId: '', anonymous: false }

/* ─────────── Screen 11 — Create Scroll (publishing studio) ─────────── */
export function CreateScroll() {
  const [params] = useSearchParams()
  const draftId = params.get('draft') ?? undefined
  const existing = useApp((s) => (draftId ? s.scrolls.find((x) => x.id === draftId) : undefined))
  const plan = useApp((s) => s.plan)
  const submit = useApp((s) => s.submitScroll)
  const saveDraft = useApp((s) => s.saveScrollDraft)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const [step, setStep] = useState<Step>('Content')
  const [d, setD] = useState<Draft>(() =>
    existing
      ? { ...EMPTY, kind: existing.kind, media: existing.media, images: existing.images, title: existing.title === 'Untitled Scroll' ? '' : existing.title, caption: existing.caption, country: existing.country, tribe: existing.tribe, category: existing.category, tags: existing.tags.join(', '), visibility: existing.visibility, historianId: existing.historianId ?? '' }
      : EMPTY,
  )
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  const idx = STEPS.indexOf(step)
  const canAnon = plan === 'executive' || plan === 'premium'
  const canDoc = plan !== 'subpar'
  const country = COUNTRIES.find((c) => c.name === d.country)
  const valid: Record<Step, boolean> = {
    Content: d.images.length > 0 || !!d.recording || d.docs.length > 0,
    Details: d.title.trim().length > 3 && d.caption.trim().length > 10,
    Culture: !!d.country && !!d.tribe && !!d.category,
    Access: d.sale === 'free' || Number(d.price) > 0,
    Historian: !!d.historianId,
    Anonymous: true,
    Review: true,
  }
  const allValid = STEPS.every((s) => valid[s])
  const firstInvalid = STEPS.find((s) => !valid[s])
  const go = (s: Step) => setStep(s)

  const doSubmit = async () => {
    if (!allValid) {
      setStep(firstInvalid!)
      toast(`Finish the ${firstInvalid} step first`, 'error')
      return
    }
    setBusy(true)
    await wait(1100)
    const id = submit(
      {
        title: d.title.trim(),
        creatorId: 'me',
        kind: d.kind,
        media: d.recording && !d.images.length ? 'audio' : d.media,
        images: d.images,
        duration: d.duration ?? (d.recording ? '2:14' : undefined),
        caption: d.caption.trim(),
        country: d.country,
        flag: country?.flag ?? '',
        tribe: d.tribe,
        category: d.category,
        tags: d.tags.split(',').map((t) => t.trim()).filter(Boolean),
        historianId: d.historianId,
        visibility: d.visibility,
        anonymous: d.anonymous,
        people: d.people.map((p) => getUser(p)?.name ?? p),
        location: d.location || undefined,
        music: d.music || undefined,
        price: d.sale === 'sale' ? Number(d.price) : undefined,
        sale: d.sale === 'sale' ? 'available' : undefined,
      },
      draftId,
    )
    setBusy(false)
    setSubmitted(id)
  }

  if (submitted) {
    const h = getUser(d.historianId)
    return (
      <Page narrow>
        <motion.div className="card stack gap-4" style={{ padding: 'clamp(24px,5vw,48px)', alignItems: 'center', textAlign: 'center' }} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: -15 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
            <img src={asset('scroll-icon.webp')} alt="" width={96} height={96} />
          </motion.div>
          <h1 className="h1">Your Scroll has been submitted</h1>
          <p className="lead" style={{ maxWidth: '48ch' }}>
            CultureShare{h ? ` and ${h.name}` : ' and the assigned Historian'} will review “{d.title}” before publication. We’ll notify you at each step.
          </p>
          <div className="panel" style={{ padding: 16, width: '100%', maxWidth: 460, textAlign: 'left' }}>
            <div className="review-track">
              <span className="rt-dot done">✓</span>
              <span className="rt-line on" />
              <span className="rt-dot now">1</span>
              <span className="rt-line" />
              <span className="rt-dot">2</span>
              <span className="rt-line" />
              <span className="rt-dot">3</span>
            </div>
            <div className="row between xs faint mt-2">
              <span>Submitted</span>
              <span>CultureShare</span>
              <span>Historian</span>
              <span>Published</span>
            </div>
          </div>
          <div className="row gap-3 wrap center mt-2">
            <button className="btn btn-primary" onClick={() => nav('/scrolls/mine?tab=under_review')}>
              Track review status
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setD(EMPTY)
                setStep('Content')
                setSubmitted(null)
              }}
            >
              Create another
            </button>
          </div>
        </motion.div>
      </Page>
    )
  }

  return (
    <Page full>
      <div style={{ padding: 'clamp(16px, 3vw, 28px)', maxWidth: 1440, margin: '0 auto', width: '100%' }}>
        <PageHeader
          eyebrow="Publishing studio"
          title="Create Scroll"
          sub="A Scroll is a structured cultural media document. Take your time — drafts save as you go."
          actions={
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const id = saveDraft({ id: draftId, title: d.title, kind: d.kind, media: d.media, images: d.images, caption: d.caption, country: d.country, flag: country?.flag, tribe: d.tribe, category: d.category, tags: d.tags.split(',').map((t) => t.trim()).filter(Boolean), historianId: d.historianId || undefined, visibility: d.visibility })
                  toast('Draft saved', 'success', { label: 'View drafts', to: '/scrolls/mine?tab=draft' })
                  if (!draftId) nav(`/create/scroll?draft=${id}`, { replace: true })
                }}
              >
                <Archive size={16} /> Save draft
              </button>
              <button className="btn btn-primary btn-sm" disabled={busy} onClick={doSubmit}>
                {busy ? <Spinner /> : 'Submit for review'}
              </button>
            </>
          }
        />
        <div className="workspace mt-6">
          <nav className="ws-steps" aria-label="Scroll steps">
            <div className="stepper">
              {STEPS.map((s, k) => (
                <button key={s} className={cx('step', s === step && 'is-on', valid[s] && s !== step && k < 6 && 'is-done')} onClick={() => go(s)}>
                  <span className="num">{valid[s] && s !== step && k < 6 ? <TickCircle size={16} variant="Bold" /> : String(k + 1).padStart(2, '0')}</span>
                  <span className="step-label">{s === 'Anonymous' ? 'Rogue Raider' : s}</span>
                </button>
              ))}
            </div>
          </nav>

          <section className="card" style={{ padding: 'clamp(18px, 3vw, 28px)', minHeight: 520 }}>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }} className="stack gap-5">
                {step === 'Content' && <ContentStep d={d} set={set} canDoc={canDoc} />}
                {step === 'Details' && (
                  <>
                    <StepHead n={2} title="Details" sub="Give your Scroll a title and tell its story." />
                    <Input label="Title" placeholder="e.g. The Language of Kente" value={d.title} onChange={(e) => set('title', e.target.value)} maxLength={80} hint={`${d.title.length}/80`} valid={d.title.trim().length > 3} />
                    <Textarea label="Caption" placeholder="What is this, who shared it with you, and why does it matter?" value={d.caption} onChange={(e) => set('caption', e.target.value)} rows={7} maxLength={2200} hint={`${d.caption.length}/2200`} />
                    <div className="stack gap-2">
                      <span className="field-label row gap-2">
                        <People size={16} /> People in this Scroll
                      </span>
                      <PeoplePicker value={d.people} onChange={(v) => set('people', v)} />
                    </div>
                    <div className="form-grid">
                      <Input label="Location" placeholder="e.g. Bonwire, Ashanti" value={d.location} onChange={(e) => set('location', e.target.value)} icon={<Location size={16} color="var(--text-4)" />} />
                      <Input label="Music" placeholder="e.g. Adowa drums" value={d.music} onChange={(e) => set('music', e.target.value)} icon={<Music size={16} color="var(--text-4)" />} />
                    </div>
                  </>
                )}
                {step === 'Culture' && (
                  <>
                    <StepHead n={3} title="Cultural classification" sub="This is how people discover your Scroll in search and Discover. Be precise." />
                    <div className="form-grid">
                      <Select label="Country" value={d.country} onChange={(e) => setD((x) => ({ ...x, country: e.target.value, tribe: '' }))}>
                        <option value="">Select country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </Select>
                      <Select label="Tribe" value={d.tribe} onChange={(e) => set('tribe', e.target.value)} disabled={!country}>
                        <option value="">{country ? 'Select tribe' : 'Choose a country first'}</option>
                        {country?.tribes.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="stack gap-2">
                      <span className="field-label">Category</span>
                      <div className="row wrap gap-2">
                        {CATEGORIES.map((c) => (
                          <button key={c} className={cx('chip sm', d.category === c && 'is-on')} onClick={() => set('category', c)}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input label="Tags" placeholder="Comma separated, e.g. Kente, Weaving, Bonwire" value={d.tags} onChange={(e) => set('tags', e.target.value)} />
                  </>
                )}
                {step === 'Access' && (
                  <>
                    <StepHead n={4} title="Access" sub="Who can see this Scroll once it’s published?" />
                    <div className="stack gap-3">
                      {(
                        [
                          ['public', 'Public', 'Anyone on CultureShare, including Discover and search.', <Global size={20} key="g" />],
                          ['raiders', 'Private to Raiders', 'Only people raiding you. They get it first-hand.', <Profile2User size={20} key="r" />],
                          ['friends', 'Private to friends', 'Only people you’ve connected with as friends.', <Lock1 size={20} key="f" />],
                        ] as const
                      ).map(([v, t, s, i]) => (
                        <button key={v} className={cx('radio-card', d.visibility === v && 'is-on')} onClick={() => set('visibility', v)}>
                          <span className="radio-dot" />
                          <span className="stack grow">
                            <span className="row gap-2 strong small">
                              {i} {t}
                            </span>
                            <span className="xs muted">{s}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <hr className="divider" />
                    <div className="row gap-2">
                      <Coin1 size={18} color="var(--accent)" />
                      <span className="strong small">Sale</span>
                      <LaterBadge />
                    </div>
                    <div className="grid-2" style={{ gap: 10 }}>
                      <button className={cx('radio-card', d.sale === 'free' && 'is-on')} onClick={() => set('sale', 'free')}>
                        <span className="radio-dot" />
                        <span className="small strong">Free</span>
                      </button>
                      <button className={cx('radio-card', d.sale === 'sale' && 'is-on')} onClick={() => set('sale', 'sale')}>
                        <span className="radio-dot" />
                        <span className="small strong">For sale</span>
                      </button>
                    </div>
                    {d.sale === 'sale' && (
                      <>
                        <Input label="Price in Cowries" placeholder="e.g. 2500" inputMode="numeric" value={d.price} onChange={(e) => set('price', e.target.value.replace(/\D/g, ''))} icon={<span className="gold strong">₵</span>} hint="1 Cowrie = ₦1 per the functionality spec." />
                        <Decision>Ownership after a sale (exclusive vs. licence) and what “sold” means for the creator’s copy isn’t defined yet.</Decision>
                      </>
                    )}
                  </>
                )}
                {step === 'Historian' && <HistorianStep d={d} set={set} />}
                {step === 'Anonymous' && (
                  <>
                    <StepHead n={6} title="Post anonymously" sub="Eligible plans can publish as a Rogue Raider. Your identity is hidden from everyone except CultureShare reviewers." />
                    {canAnon ? (
                      <div className={cx('radio-card', d.anonymous && 'is-on')} style={{ alignItems: 'center' }}>
                        <Avatar user={getUser('rogue')} size={48} />
                        <span className="stack grow">
                          <span className="strong">Post as Rogue Raider</span>
                          <span className="xs muted">Your name, avatar and profile link won’t appear on this Scroll.</span>
                        </span>
                        <Switch checked={d.anonymous} onChange={(v) => set('anonymous', v)} label="Post as Rogue Raider" />
                      </div>
                    ) : (
                      <SubscriptionRequired feature="Anonymous posting as Rogue Raider" plans="Executive or Premium" />
                    )}
                  </>
                )}
                {step === 'Review' && <ReviewStep d={d} valid={valid} go={go} />}

                <div className="row between mt-4" style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                  <button className="btn btn-ghost btn-sm" disabled={idx === 0} onClick={() => go(STEPS[idx - 1])}>
                    <ArrowLeft2 size={16} /> Back
                  </button>
                  {step === 'Review' ? (
                    <button className="btn btn-primary" disabled={busy} onClick={doSubmit}>
                      {busy ? <Spinner /> : 'Submit for review'}
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => go(STEPS[idx + 1])}>
                      Next: {STEPS[idx + 1] === 'Anonymous' ? 'Rogue Raider' : STEPS[idx + 1]} <ArrowRight2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </section>

          <aside className="ws-preview stack gap-3">
            <span className="eyebrow">Live preview</span>
            <ScrollPreview d={d} />
          </aside>
        </div>
      </div>
    </Page>
  )
}

function StepHead({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="stack gap-1">
      <span className="eyebrow gold">Step {String(n).padStart(2, '0')}</span>
      <h2 className="h2">{title}</h2>
      <p className="small muted">{sub}</p>
    </div>
  )
}

export function SubscriptionRequired({ feature, plans }: { feature: string; plans: string }) {
  return (
    <div className="panel stack gap-3" style={{ padding: 20, alignItems: 'flex-start', borderColor: 'var(--accent-line)' }}>
      <span className="row gap-2 strong">
        <Crown1 size={20} color="var(--accent)" variant="Bulk" /> Subscription required
      </span>
      <p className="small muted">
        {feature} is available on the {plans} plan.
      </p>
      <Link to="/plans" className="btn btn-outline-gold btn-sm">
        Compare plans
      </Link>
    </div>
  )
}

function ContentStep({ d, set, canDoc }: { d: Draft; set: <K extends keyof Draft>(k: K, v: Draft[K]) => void; canDoc: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rec, setRec] = useState<number | null>(null)
  useEffect(() => {
    if (rec === null) return
    const t = setInterval(() => setRec((r) => (r === null ? null : r + 1)), 1000)
    return () => clearInterval(t)
  }, [rec])
  const addImages = async (files: FileList | File[]) => {
    setLoading(true)
    const out: string[] = []
    for (const f of Array.from(files)) {
      if (f.type.startsWith('image/')) out.push(await imageToDataUrl(f))
      else if (f.type.startsWith('video/')) {
        const { poster, duration } = await videoPoster(f)
        out.push(poster)
        set('media', 'video')
        set('duration', duration)
      }
    }
    set('images', [...d.images, ...out].slice(0, 10))
    setLoading(false)
  }
  return (
    <>
      <StepHead n={1} title="Content" sub="Choose the kind of Scroll, then add images, video, a voice recording or documents." />
      <Segmented options={['Reel', 'Documentary'] as const} value={d.kind === 'reel' ? 'Reel' : 'Documentary'} onChange={(v) => set('kind', v === 'Reel' ? 'reel' : 'documentary')} />
      {d.kind === 'documentary' && !canDoc && <SubscriptionRequired feature="Documentary Scrolls" plans="Executive, Premium or Standard" />}
      <div
        className={cx('dropzone', over && 'is-over')}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => (e.preventDefault(), setOver(true))}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          addImages(e.dataTransfer.files)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
      >
        {loading ? <Spinner /> : <Gallery size={30} color="var(--accent)" variant="Bulk" />}
        <span className="strong">Drop images or video here</span>
        <span className="xs muted">or click to browse · up to 10 files</span>
      </div>
      <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => e.target.files && addImages(e.target.files)} />
      <input ref={videoRef} type="file" accept="video/*" hidden onChange={(e) => e.target.files && addImages(e.target.files)} />
      <input
        ref={docRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        multiple
        hidden
        onChange={(e) => {
          const names = Array.from(e.target.files ?? []).map((f) => f.name)
          set('docs', [...d.docs, ...names])
          if (!d.images.length) set('media', 'text')
        }}
      />
      <div className="grid-3" style={{ gap: 10 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => videoRef.current?.click()}>
          <Video size={16} /> Upload video
        </button>
        <button
          className={cx('btn btn-sm', rec !== null ? 'btn-danger' : 'btn-secondary')}
          onClick={() => {
            if (rec === null) setRec(0)
            else {
              const len = `${Math.floor(rec / 60)}:${String(rec % 60).padStart(2, '0')}`
              set('recording', len)
              set('duration', len)
              if (!d.images.length) set('media', 'audio')
              setRec(null)
            }
          }}
        >
          <Microphone2 size={16} /> {rec !== null ? `Stop · 0:${String(rec).padStart(2, '0')}` : d.recording ? 'Re-record' : 'Record voice'}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => docRef.current?.click()}>
          <DocumentText size={16} /> Attach document
        </button>
      </div>
      {d.recording && <AudioBlock title="Your recording" duration={d.recording} />}
      {d.docs.length > 0 && (
        <div className="stack gap-2">
          {d.docs.map((n) => (
            <div key={n} className="row gap-2 panel" style={{ padding: '8px 12px' }}>
              <DocumentText size={16} color="var(--accent)" /> <span className="small grow">{n}</span>
              <button className="icon-btn sm" aria-label={`Remove ${n}`} onClick={() => set('docs', d.docs.filter((x) => x !== n))}>
                <CloseCircle size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      {d.images.length > 0 && (
        <div className="stack gap-2">
          <span className="eyebrow">Selected media ({d.images.length})</span>
          <div className="thumb-grid">
            <AnimatePresence>
              {d.images.map((src, k) => (
                <motion.div layout key={src.slice(-40) + k} className="thumb is-on" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                  <img src={src} alt="" />
                  <button className="thumb-x" onClick={() => set('images', d.images.filter((_, j) => j !== k))} aria-label="Remove">
                    <CloseCircle size={14} />
                  </button>
                  {k === 0 && <span className="tag" style={{ position: 'absolute', left: 4, bottom: 4, background: 'rgba(0,0,0,.6)', color: '#fff' }}>Cover</span>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      <div className="stack gap-2">
        <span className="eyebrow">Or pick from the sample library</span>
        <div className="thumb-grid">
          {LIBRARY.map((src) => {
            const on = d.images.includes(src)
            return (
              <button key={src} className={cx('thumb', on && 'is-on')} onClick={() => set('images', on ? d.images.filter((x) => x !== src) : [...d.images, src].slice(0, 10))} aria-pressed={on}>
                <img src={src} alt="" loading="lazy" />
                {on && (
                  <span className="thumb-check">
                    <TickCircle size={14} variant="Bold" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="row gap-3 small">
        <span className="muted">Treat as:</span>
        {(['image', 'video'] as const).map((m) => (
          <button key={m} className={cx('chip sm', d.media === m && 'is-on')} onClick={() => set('media', m)}>
            {m === 'image' ? 'Image carousel' : 'Video'}
          </button>
        ))}
      </div>
    </>
  )
}

function HistorianStep({ d, set }: { d: Draft; set: <K extends keyof Draft>(k: K, v: Draft[K]) => void }) {
  const historians = USERS.filter((u) => u.role === 'historian')
  const ranked = useMemo(() => [...historians].sort((a, b) => Number(b.country === d.country) - Number(a.country === d.country)), [historians, d.country])
  return (
    <>
      <StepHead n={5} title="Choose a Historian" sub="Historians provide secondary accreditation. They’ll validate your Scroll’s cultural accuracy before it’s published." />
      <div className="stack gap-3">
        {ranked.map((h) => (
          <button key={h.id} className={cx('radio-card', d.historianId === h.id && 'is-on')} onClick={() => set('historianId', h.id)}>
            <span className="radio-dot" />
            <Avatar user={h} size={44} />
            <span className="stack grow">
              <span className="row gap-2 strong small">
                {h.name} {h.flag} <HistorianBadge />
              </span>
              <span className="xs muted">{h.specialty}</span>
              {h.country === d.country && <span className="xs gold">Recommended for {d.country}</span>}
            </span>
          </button>
        ))}
      </div>
      <Decision>How Historians are assigned (creator choice vs. CultureShare assignment) and their full permission model aren’t finalised. This screen lets the creator choose.</Decision>
    </>
  )
}

function ReviewStep({ d, valid, go }: { d: Draft; valid: Record<Step, boolean>; go: (s: Step) => void }) {
  return (
    <>
      <StepHead n={7} title="Review" sub="Check everything before you submit. You can still edit after submission while it’s under review." />
      <div className="stack gap-2">
        {STEPS.slice(0, 6).map((s) => (
          <div key={s} className="row gap-3 panel" style={{ padding: '12px 14px' }}>
            {valid[s] ? <TickCircle size={20} color="var(--success)" variant="Bold" /> : <Danger size={20} color="var(--warning)" />}
            <span className="small grow">{s === 'Anonymous' ? 'Rogue Raider' : s}</span>
            <button className="link xs" onClick={() => go(s)}>
              {valid[s] ? 'Edit' : 'Complete'}
            </button>
          </div>
        ))}
      </div>
      <div className="mobile-preview">
        <ScrollPreview d={d} />
      </div>
      <Callout kind="gold">
        <span className="small">After you submit, CultureShare and your Historian review the Scroll. It won’t be public until both approve.</span>
      </Callout>
    </>
  )
}

function ScrollPreview({ d }: { d: Draft }) {
  const me = useApp((s) => s.me)
  const country = COUNTRIES.find((c) => c.name === d.country)
  const h = getUser(d.historianId)
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="row gap-3" style={{ padding: 14 }}>
        {d.anonymous ? <Avatar user={getUser('rogue')} size={36} /> : <Avatar src={me.avatar} name={me.firstName} size={36} />}
        <div className="stack grow" style={{ minWidth: 0 }}>
          <span className="small strong">{d.anonymous ? 'Rogue Raider' : me.username}</span>
          <span className="xs faint">{d.kind === 'documentary' ? 'Documentary' : 'Reel'} · just now</span>
        </div>
        <img src={asset('scroll-icon.webp')} alt="" width={26} style={{ transform: 'rotate(-25deg)' }} />
      </div>
      <div className="media" style={{ height: 220 }}>
        {d.images[0] ? <img src={d.images[0]} alt="" /> : d.recording ? <div style={{ padding: 14, height: '100%', display: 'grid', alignItems: 'center' }}><AudioBlock title={d.title || 'Your recording'} duration={d.recording} compact /></div> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-4)' }} className="small"><Camera size={28} /></div>}
        {d.media === 'video' && d.duration && <span className="duration">{d.duration}</span>}
      </div>
      <div className="stack gap-2" style={{ padding: 14 }}>
        <span className="strong">{d.title || 'Your Scroll title'}</span>
        <span className="xs faint">{d.country ? `${country?.flag} ${d.country} · ${d.tribe || 'Tribe'} · ${d.category || 'Category'}` : 'Country · Tribe · Category'}</span>
        <p className="xs muted clamp-3">{d.caption || 'Your caption will appear here.'}</p>
        <div className="row gap-2 wrap">
          <span className="tag">
            {d.visibility === 'public' ? <Global size={10} /> : <Lock1 size={10} />} {d.visibility === 'public' ? 'Public' : d.visibility === 'raiders' ? 'Raiders' : 'Friends'}
          </span>
          {h && <span className="tag gold">Historian: {h.name}</span>}
          {d.sale === 'sale' && d.price && <span className="tag gold">₵{Number(d.price).toLocaleString()}</span>}
        </div>
      </div>
    </div>
  )
}

/* ─────────── Screen 12 — Create post ─────────── */
export function CreatePost() {
  const [params] = useSearchParams()
  const communityId = params.get('community') ?? undefined
  const community = useApp((s) => s.communities.find((c) => c.id === communityId))
  const create = useApp((s) => s.createPost)
  const defaultVis = useApp((s) => s.privacy.defaultPost)
  const me = useApp((s) => s.me)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [people, setPeople] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [music, setMusic] = useState('')
  const [vis, setVis] = useState<'public' | 'followers' | 'friends'>(defaultVis)
  const [extra, setExtra] = useState<'people' | 'location' | 'music' | 'library' | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <Page narrow>
      <CreateSwitcher active="Post" />
      <div className="card stack gap-4" style={{ padding: 20 }}>
        <div className="row gap-3">
          <Avatar src={me.avatar} name={me.firstName} size={44} />
          <div className="stack">
            <span className="strong small">
              {me.firstName} {me.lastName}
            </span>
            {community ? (
              <span className="xs gold">Posting in {community.name}</span>
            ) : (
              <select className="chip sm" value={vis} onChange={(e) => setVis(e.target.value as typeof vis)} aria-label="Visibility" style={{ width: 'fit-content', paddingRight: 8 }}>
                <option value="public">🌍 Public</option>
                <option value="followers">👥 Private to followers</option>
                <option value="friends">🔒 Private to friends</option>
              </select>
            )}
          </div>
        </div>
        <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="What’s on your mind?" rows={6} maxLength={2000} style={{ width: '100%', background: 'transparent', border: 0, outline: 0, resize: 'vertical', fontSize: '1.1rem', lineHeight: 1.55 }} />
        {images.length > 0 && (
          <div className="thumb-grid">
            {images.map((src, k) => (
              <div key={k} className="thumb is-on">
                <img src={src} alt="" />
                <button className="thumb-x" onClick={() => setImages(images.filter((_, j) => j !== k))} aria-label="Remove">
                  <CloseCircle size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="row gap-2 wrap">
          {people.length > 0 && <span className="tag gold">With {people.map((p) => getUser(p)?.name).join(', ')}</span>}
          {location && <span className="tag gold">📍 {location}</span>}
          {music && <span className="tag gold">♪ {music}</span>}
        </div>
        <AnimatePresence>
          {extra && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div className="panel" style={{ padding: 14 }}>
                {extra === 'people' && <PeoplePicker value={people} onChange={setPeople} />}
                {extra === 'location' && <Input placeholder="Add a location" value={location} onChange={(e) => setLocation(e.target.value)} autoFocus />}
                {extra === 'music' && <Input placeholder="Add music, e.g. Highlife — E.T. Mensah" value={music} onChange={(e) => setMusic(e.target.value)} autoFocus />}
                {extra === 'library' && (
                  <div className="thumb-grid">
                    {LIBRARY.slice(0, 12).map((src) => (
                      <button key={src} className={cx('thumb', images.includes(src) && 'is-on')} onClick={() => setImages(images.includes(src) ? images.filter((x) => x !== src) : [...images, src])}>
                        <img src={src} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="row gap-2 wrap" style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
          <ToolBtn icon={<Gallery size={18} color="#22c55e" />} label="Upload" onClick={() => fileRef.current?.click()} />
          <ToolBtn icon={<Gallery size={18} color="#38bdf8" variant="Bulk" />} label="Library" on={extra === 'library'} onClick={() => setExtra(extra === 'library' ? null : 'library')} />
          <ToolBtn icon={<People size={18} color="#a78bfa" />} label="People" on={extra === 'people'} onClick={() => setExtra(extra === 'people' ? null : 'people')} />
          <ToolBtn icon={<Location size={18} color="#f87171" />} label="Location" on={extra === 'location'} onClick={() => setExtra(extra === 'location' ? null : 'location')} />
          <ToolBtn icon={<Music size={18} color="#fbbf24" />} label="Music" on={extra === 'music'} onClick={() => setExtra(extra === 'music' ? null : 'music')} />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={async (e) => {
              const out = await Promise.all(Array.from(e.target.files ?? []).map((f) => imageToDataUrl(f)))
              setImages((x) => [...x, ...out].slice(0, 6))
            }}
          />
          <span className="grow" />
          <span className="xs faint">{text.length}/2000</span>
          <button
            className="btn btn-primary btn-sm"
            disabled={(!text.trim() && !images.length) || busy}
            onClick={async () => {
              setBusy(true)
              await wait(600)
              create({ text: text.trim(), images, visibility: vis, communityId, location: location || undefined, music: music || undefined, people: people.map((p) => getUser(p)?.name ?? p) })
              toast(community ? `Posted in ${community.name}` : 'Your post is live', 'success')
              nav(community ? `/communities/${community.id}` : '/home')
            }}
          >
            {busy ? <Spinner /> : 'Publish'}
          </button>
        </div>
      </div>
    </Page>
  )
}

function ToolBtn({ icon, label, onClick, on }: { icon: ReactNode; label: string; onClick: () => void; on?: boolean }) {
  return (
    <button className={cx('btn btn-ghost btn-xs', on && 'is-on')} onClick={onClick} style={on ? { background: 'var(--accent-soft)', color: 'var(--text)' } : { background: 'var(--surface-glass)' }}>
      {icon} {label}
    </button>
  )
}

function CreateSwitcher({ active }: { active: 'Post' | 'Scroll' | 'Status' }) {
  const nav = useNavigate()
  return (
    <div className="row between wrap gap-3">
      <h1 className="h1">Create</h1>
      <Segmented options={['Post', 'Scroll', 'Status'] as const} value={active} onChange={(v) => nav(`/create/${v.toLowerCase()}`)} />
    </div>
  )
}

/* ─────────── Screen 09 — Create status (side-panel scheduling) ─────────── */
export function CreateStatus() {
  const add = useApp((s) => s.addStatus)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const [items, setItems] = useState<{ image: string; caption: string }[]>([])
  const [active, setActive] = useState(0)
  const [hours, setHours] = useState(24)
  const [repeat, setRepeat] = useState(false)
  const [schedule, setSchedule] = useState(false)
  const [when, setWhen] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const max = new Date(Date.now() + 5 * 24 * 3600_000)
  const min = new Date(Date.now() + 10 * 60_000)
  const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  const cur = items[active]
  return (
    <Page wide>
      <CreateSwitcher active="Status" />
      <div className="status-studio">
        <section className="stack gap-4">
          <div className="dropzone" onClick={() => fileRef.current?.click()} role="button" tabIndex={0}>
            <Camera size={28} color="var(--accent)" variant="Bulk" />
            <span className="strong">Upload status content</span>
            <span className="xs muted">Add several — they play in order</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={async (e) => {
              const out = await Promise.all(Array.from(e.target.files ?? []).map((f) => imageToDataUrl(f, 900)))
              setItems((x) => [...x, ...out.map((image) => ({ image, caption: '' }))])
            }}
          />
          <span className="eyebrow">Or choose from library</span>
          <div className="thumb-grid">
            {LIBRARY.slice(0, 12).map((src) => {
              const on = items.some((i) => i.image === src)
              return (
                <button key={src} className={cx('thumb', on && 'is-on')} onClick={() => (on ? setItems(items.filter((i) => i.image !== src)) : setItems([...items, { image: src, caption: '' }]))}>
                  <img src={src} alt="" />
                  {on && (
                    <span className="thumb-check">
                      <TickCircle size={14} variant="Bold" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section className="stack gap-3" style={{ alignItems: 'center' }}>
          <div className="status-phone">
            {cur ? (
              <>
                <img src={cur.image} alt="" />
                <div className="story-top">
                  <div className="story-bars">
                    {items.map((_, k) => (
                      <span key={k}>
                        <i style={{ width: k <= active ? '100%' : 0 }} />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="story-bottom">
                  <textarea className="story-input" style={{ borderRadius: 14, height: 72, padding: 12, resize: 'none' }} placeholder="Add a caption…" value={cur.caption} onChange={(e) => setItems(items.map((it, k) => (k === active ? { ...it, caption: e.target.value } : it)))} />
                </div>
              </>
            ) : (
              <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,.5)', textAlign: 'center', padding: 20 }} className="small">
                Your status preview appears here
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="row gap-2 wrap center">
              {items.map((it, k) => (
                <button key={k} onClick={() => setActive(k)} style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', outline: k === active ? '2px solid var(--accent)' : '1px solid var(--line-2)', position: 'relative' }}>
                  <img src={it.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
              <button className="icon-btn filled sm" onClick={() => fileRef.current?.click()} aria-label="Add more">
                <Add size={18} />
              </button>
            </div>
          )}
        </section>

        <aside className="panel stack gap-4" style={{ padding: 20 }}>
          <h2 className="h3">Status settings</h2>
          <div className="stack gap-2">
            <span className="field-label row gap-2">
              <Clock size={16} /> Duration
            </span>
            <div className="row gap-2 wrap">
              {[6, 12, 24, 48, 72].map((h) => (
                <button key={h} className={cx('chip sm', hours === h && 'is-on')} onClick={() => setHours(h)}>
                  {h}h{h === 24 ? ' · default' : ''}
                </button>
              ))}
            </div>
          </div>
          <div className="setting-row" style={{ padding: '8px 0' }}>
            <Repeat size={18} />
            <span className="stack grow">
              <span className="small strong">Repeat upload</span>
              <span className="xs muted">Re-post this status when it expires</span>
            </span>
            <Switch checked={repeat} onChange={setRepeat} label="Repeat" />
          </div>
          <div className="setting-row" style={{ padding: '8px 0' }}>
            <Calendar size={18} />
            <span className="stack grow">
              <span className="small strong">Schedule</span>
              <span className="xs muted">Up to 5 days ahead</span>
            </span>
            <Switch checked={schedule} onChange={setSchedule} label="Schedule" />
          </div>
          {schedule && <Input type="datetime-local" value={when} min={toLocal(min)} max={toLocal(max)} onChange={(e) => setWhen(e.target.value)} label="Publish at" />}
          {repeat && <Decision>How many times a status may repeat and how “extensions” are priced or limited isn’t specified.</Decision>}
          <button
            className="btn btn-primary btn-block"
            disabled={!items.length || (schedule && !when)}
            onClick={() => {
              const at = schedule && when ? new Date(when).getTime() : undefined
              add(items, hours, at)
              toast(at ? `Status scheduled for ${new Date(at).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Your status is live for ' + hours + ' hours', 'success')
              nav('/home')
            }}
          >
            {schedule ? 'Schedule status' : 'Share status'}
          </button>
          <span className="xs faint">{items.length} item{items.length === 1 ? '' : 's'} selected</span>
        </aside>
      </div>
    </Page>
  )
}

