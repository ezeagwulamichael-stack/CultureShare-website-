import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight2, Camera, InfoCircle, SearchNormal1, TickCircle, Profile2User, Crown1, Global, Sun1, Moon, Check as Tick } from 'iconsax-react'
import { useApp } from '../store/useApp'
import { CULTURES, CUISINES, FEATURED_ARTISTS, FOOD_STORIES, GENRES, INTERESTS, REGIONS, USERS, COUNTRIES, img, asset } from '../data/seed'
import { Avatar, Input, Logo, RaidButton, Select, Textarea, Modal } from '../components/ui'
import { cx, getUser } from '../lib/util'

const STEPS = ['profile', 'interests', 'cultures', 'music', 'food', 'people', 'discovering', 'recommended'] as const
type Step = (typeof STEPS)[number]
const LABELS: Record<Step, string> = { profile: 'Your profile', interests: 'Interests', cultures: 'Cultures', music: 'Music', food: 'Food', people: 'Find your people', discovering: 'Personalising', recommended: 'People to Raid' }
const PROGRESS: Step[] = ['profile', 'interests', 'cultures', 'music', 'food']

function toggle(list: string[], v: string, max?: number) {
  if (list.includes(v)) return list.filter((x) => x !== v)
  if (max && list.length >= max) return list
  return [...list, v]
}

export function Onboarding() {
  const params = useParams()
  const step = (STEPS.includes(params.step as Step) ? params.step : 'profile') as Step
  const nav = useNavigate()
  const auth = useApp((s) => s.auth)
  const me = useApp((s) => s.me)
  const prefs = useApp((s) => s.prefs)
  const setPrefs = useApp((s) => s.setPrefs)
  const updateMe = useApp((s) => s.updateMe)
  const finish = useApp((s) => s.finishOnboarding)
  const toast = useApp((s) => s.toast)
  const theme = useApp((s) => s.theme)
  const toggleTheme = useApp((s) => s.toggleTheme)
  const idx = STEPS.indexOf(step)
  const go = (s: Step) => nav(`/onboarding/${s}`)
  const next = () => (idx < STEPS.length - 1 ? go(STEPS[idx + 1]) : done())
  const back = () => (idx > 0 ? go(STEPS[idx - 1]) : nav('/verify'))
  const done = () => {
    finish()
    toast(`Welcome to CultureShare, ${me.firstName}`, 'success')
    nav('/home')
  }
  useEffect(() => {
    if (auth === 'guest') nav('/welcome', { replace: true })
    if (auth === 'verify_contact') nav('/verify', { replace: true })
  }, [auth, nav])

  // step-local state
  const [display, setDisplay] = useState(me.firstName ? `${me.firstName} ${me.lastName[0] ?? ''}`.trim() : '')
  const [bio, setBio] = useState('')
  const [country, setCountry] = useState('')
  const [avatar, setAvatar] = useState<string | undefined>(undefined)
  const [cq, setCq] = useState('')
  const [region, setRegion] = useState('All')
  const fileRef = useRef<HTMLInputElement>(null)
  const [contacts, setContacts] = useState(false)

  const canContinue: Record<Step, boolean> = {
    profile: display.trim().length > 1 && !!country,
    interests: prefs.interests.length >= 3,
    cultures: prefs.cultures.length >= 3,
    music: true,
    food: true,
    people: true,
    discovering: false,
    recommended: true,
  }
  const count: Partial<Record<Step, number>> = { interests: prefs.interests.length, cultures: prefs.cultures.length, music: prefs.genres.length, food: prefs.cuisines.length + prefs.foodStories.length }

  useEffect(() => {
    if (step !== 'discovering') return
    const t = setTimeout(() => go('recommended'), 2600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const ctaLabel = step === 'recommended' ? 'Start exploring' : count[step] ? `Continue (${count[step]} selected)` : 'Continue'
  const onContinue = () => {
    if (step === 'profile') {
      const c = COUNTRIES.find((x) => x.name === country)
      updateMe({ bio: bio || me.bio, country, flag: c?.flag ?? me.flag, avatar: avatar ?? me.avatar, username: me.username })
    }
    next()
  }

  return (
    <div className="ob-shell">
      <aside className="ob-side">
        <Logo size={26} to="/welcome" />
        <div className="stack gap-2 mt-8">
          <span className="eyebrow gold">Setting up</span>
          <h2 className="h2">Make CultureShare yours</h2>
          <p className="small muted">A few questions so your feed starts with the cultures and stories that move you.</p>
        </div>
        <div className="stepper mt-6">
          {STEPS.filter((s) => s !== 'discovering').map((s, k) => {
            const i = STEPS.indexOf(s)
            const doneStep = i < idx
            return (
              <button key={s} className={cx('step', s === step && 'is-on', doneStep && 'is-done')} onClick={() => i <= idx && go(s)} disabled={i > idx}>
                <span className="num">{doneStep ? <Tick size={14} /> : k + 1}</span>
                <span className="step-label">{LABELS[s]}</span>
              </button>
            )
          })}
        </div>
        <p className="xs faint" style={{ marginTop: 'auto' }}>
          ✦ You can update your preferences anytime in Settings.
        </p>
      </aside>

      <main className="ob-main">
        {step !== 'discovering' && (
          <div className="ob-top">
            <button className="icon-btn filled round sm" onClick={back} aria-label="Back">
              <ArrowLeft size={16} />
            </button>
            <div className="progress-dashes grow" style={{ maxWidth: 240 }}>
              {PROGRESS.map((p) => (
                <span key={p} className={STEPS.indexOf(p) <= idx ? 'on' : ''} />
              ))}
            </div>
            <span className="grow" />
            <button className="icon-btn sm" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun1 size={18} /> : <Moon size={18} />}
            </button>
            {step !== 'recommended' && (
              <button className="chip sm" onClick={next}>
                Skip
              </button>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.section key={step} className="ob-content" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            {step === 'profile' && (
              <div className="stack gap-6">
                <Head title="Set Up Your Profile" sub="Tell us a bit more about yourself." />
                <div className="stack" style={{ alignItems: 'center' }}>
                  <button className="ob-avatar" onClick={() => fileRef.current?.click()} aria-label="Upload profile photo">
                    {avatar ? <img src={avatar} alt="" /> : <Profile2User size={40} color="var(--text-3)" />}
                    <span className="ob-cam">
                      <Camera size={14} variant="Bold" />
                    </span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setAvatar(URL.createObjectURL(f))
                    }}
                  />
                  <div className="row gap-2 mt-3">
                    {['w-3', 's-gracie', 's-george', 'p-tunde'].map((a) => (
                      <button key={a} onClick={() => setAvatar(img(a))} aria-label="Use sample photo" style={{ borderRadius: '50%', outline: avatar === img(a) ? '2px solid var(--accent)' : 'none', outlineOffset: 2 }}>
                        <Avatar src={img(a)} size={30} />
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="Display name" placeholder="How should people know you?" value={display} onChange={(e) => setDisplay(e.target.value)} valid={display.trim().length > 1} />
                <Textarea label="Bio" placeholder="Tell the world about your cultural background…" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} hint={`${bio.length}/160`} />
                <Select label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                  <option value="Other">Other / Diaspora</option>
                </Select>
              </div>
            )}

            {step === 'interests' && (
              <div className="stack gap-6">
                <Head title="What Moves You?" sub="Choose at least 3 interests to personalise your feed." />
                <div className="row wrap gap-3">
                  {INTERESTS.map((it, k) => {
                    const on = prefs.interests.includes(it.name)
                    return (
                      <motion.button key={it.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: k * 0.02 }} whileTap={{ scale: 0.94 }} className={cx('pick', on && 'is-on')} onClick={() => setPrefs({ interests: toggle(prefs.interests, it.name) })} aria-pressed={on}>
                        <span>
                          {it.emoji} {it.name}
                        </span>
                        <AnimatePresence>
                          {on && (
                            <motion.span className="tick" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <TickCircle size={18} variant="Bold" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 'cultures' && (
              <div className="stack gap-5">
                <Head title="Which Cultures Would You Like To Explore?" sub="Choose at least 3 to personalise your feed." />
                <Input placeholder="Search cultures, regions, languages…" value={cq} onChange={(e) => setCq(e.target.value)} icon={<SearchNormal1 size={18} color="var(--text-4)" />} />
                {prefs.cultures.length > 0 && (
                  <div className="stack gap-3">
                    <span className="eyebrow gold">Selected ({prefs.cultures.length})</span>
                    <div className="row wrap gap-2">
                      <AnimatePresence>
                        {prefs.cultures.map((c) => (
                          <motion.button layout key={c} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="pick is-on" onClick={() => setPrefs({ cultures: toggle(prefs.cultures, c) })}>
                            <span className="tick">
                              <TickCircle size={16} variant="Bold" />
                            </span>
                            {c}
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                    <hr className="divider" />
                  </div>
                )}
                <div className="chip-row">
                  {REGIONS.map((r) => (
                    <button key={r} className={cx('chip outline-on', region === r && 'is-on')} onClick={() => setRegion(r)}>
                      {r}
                    </button>
                  ))}
                </div>
                <span className="eyebrow">Explore interest</span>
                <div className="ob-grid-2">
                  {CULTURES.filter((c) => (region === 'All' || c.region === region) && (c.name + c.region).toLowerCase().includes(cq.toLowerCase())).map((c) => {
                    const on = prefs.cultures.includes(c.name)
                    return (
                      <button key={c.name} className={cx('pick', on && 'is-on')} onClick={() => setPrefs({ cultures: toggle(prefs.cultures, c.name) })} aria-pressed={on}>
                        <span>
                          {c.name}
                          <span className="sub">{c.region}</span>
                        </span>
                        {on && (
                          <span className="tick">
                            <TickCircle size={16} variant="Bold" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="callout gold">
                  <span className="c-icon">
                    <InfoCircle size={18} />
                  </span>
                  These are discovery interests, not identity labels. Explore any culture that speaks to you.
                </div>
              </div>
            )}

            {step === 'music' && (
              <div className="stack gap-6">
                <Head title="What Sounds Move You?" sub="Select the music traditions you want to discover." />
                <span className="eyebrow">Genres & traditions</span>
                <div className="ob-grid-2">
                  {GENRES.map((g) => {
                    const on = prefs.genres.includes(g.name)
                    return (
                      <motion.button key={g.name} whileTap={{ scale: 0.97 }} className={cx('genre', on && 'is-on')} onClick={() => setPrefs({ genres: toggle(prefs.genres, g.name) })} aria-pressed={on}>
                        <span style={{ fontSize: 18 }}>{g.emoji}</span>
                        {g.name}
                      </motion.button>
                    )
                  })}
                </div>
                <div className="stack gap-1">
                  <span className="eyebrow">Featured artists</span>
                  <span className="xs faint">Raid artists to get personalised Scroll recommendations.</span>
                </div>
                <div className="ob-grid-3">
                  {FEATURED_ARTISTS.map((id) => {
                    const u = getUser(id)!
                    return (
                      <div key={id} className="artist">
                        <Avatar user={u} size={56} />
                        <span className="small strong">{u.name}</span>
                        <span className="xs faint">{u.country}</span>
                        <RaidButton userId={id} size="sm" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 'food' && (
              <div className="stack gap-6">
                <Head title="What Flavours Should We Serve First?" sub="Choose the cuisines and food stories you want to discover." />
                <span className="eyebrow">Regional cuisines</span>
                <div className="ob-grid-2">
                  {CUISINES.map((c) => {
                    const on = prefs.cuisines.includes(c.name)
                    return (
                      <motion.button key={c.name} whileTap={{ scale: 0.97 }} className={cx('cuisine', on && 'is-on')} onClick={() => setPrefs({ cuisines: toggle(prefs.cuisines, c.name) })} aria-pressed={on}>
                        <img src={c.image} alt="" />
                        {on && (
                          <motion.span className="c-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Tick size={12} />
                          </motion.span>
                        )}
                        <span>{c.name}</span>
                      </motion.button>
                    )
                  })}
                </div>
                <span className="eyebrow">Food stories & interests</span>
                <div className="ob-grid-2">
                  {FOOD_STORIES.map((f) => {
                    const on = prefs.foodStories.includes(f)
                    return (
                      <button key={f} className={cx('pick', on && 'is-on')} style={{ justifyContent: 'center' }} onClick={() => setPrefs({ foodStories: toggle(prefs.foodStories, f) })}>
                        {on && <Tick size={14} color="var(--accent)" />} {f}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 'people' && (
              <div className="stack gap-6">
                <div className="orbit-wrap" style={{ width: 'min(320px, 72vw)' }}>
                  {[100, 74, 48].map((s, k) => (
                    <motion.span key={s} className="ring" style={{ inset: `${(100 - s) / 2}%` }} animate={{ rotate: k % 2 ? -360 : 360 }} transition={{ duration: 40 + k * 10, repeat: Infinity, ease: 'linear' }} />
                  ))}
                  <span style={{ position: 'absolute', inset: '38%', borderRadius: '50%', background: 'rgba(27,67,50,.6)', display: 'grid', placeItems: 'center' }}>
                    <img src={asset('cs-mark.svg')} alt="" width={34} />
                  </span>
                  {['w-3', 'p-amara', 'p-kofi', 'w-6', 'p-tariro'].map((a, k) => {
                    const pos = [
                      [12, 14],
                      [70, 4],
                      [84, 52],
                      [4, 62],
                      [44, 82],
                    ][k]
                    return (
                      <motion.span key={a} initial={{ scale: 0 }} animate={{ scale: 1, y: [0, -6, 0] }} transition={{ scale: { delay: 0.1 * k, type: 'spring' }, y: { duration: 3 + k * 0.5, repeat: Infinity } }} style={{ position: 'absolute', left: `${pos[0]}%`, top: `${pos[1]}%` }}>
                        <Avatar src={img(a)} size={k === 2 ? 54 : 44} ring={k === 2} />
                      </motion.span>
                    )
                  })}
                </div>
                <Head title="Find your people" sub="Discover friends, storytellers, Historians and communities already sharing on CultureShare." />
                <div className="stack gap-3">
                  <PeopleOption
                    icon={<Profile2User size={22} variant="Bulk" color="#38bdf8" />}
                    title={contacts ? 'Contacts synced — 4 friends found' : 'Sync Contacts'}
                    onClick={async () => {
                      if (contacts) return go('discovering')
                      setContacts(true)
                      toast('Contacts synced. We found 4 people you know.', 'success')
                    }}
                    done={contacts}
                  />
                  <PeopleOption icon={<Crown1 size={22} variant="Bulk" color="#c9a84c" />} title="Explore Historians" onClick={() => go('discovering')} />
                  <PeopleOption icon={<Global size={22} variant="Bulk" color="#22c55e" />} title="Browse Communities" onClick={() => go('discovering')} />
                </div>
                <button className="btn btn-outline-gold btn-lg btn-block" onClick={() => go('discovering')}>
                  Maybe Later
                </button>
                <ContactsNote />
              </div>
            )}

            {step === 'discovering' && <Discovering />}

            {step === 'recommended' && <Recommended />}
          </motion.section>
        </AnimatePresence>

        {step !== 'people' && step !== 'discovering' && (
          <div className="ob-foot">
            <p className="xs faint" style={{ textAlign: 'center' }}>
              ✦ You can update your preferences anytime in Settings.
            </p>
            <motion.button whileTap={{ scale: 0.98 }} className="btn btn-primary btn-lg btn-block" disabled={!canContinue[step]} onClick={onContinue}>
              {ctaLabel}
              {step === 'recommended' && <ArrowRight2 size={18} />}
            </motion.button>
          </div>
        )}
      </main>
    </div>
  )
}

function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="stack gap-1">
      <h1 className="h2" style={{ fontSize: 'clamp(1.5rem, 2.4vw, 1.9rem)' }}>
        {title}
      </h1>
      <p className="small muted">{sub}</p>
    </div>
  )
}

function PeopleOption({ icon, title, onClick, done }: { icon: ReactNode; title: string; onClick: () => void; done?: boolean }) {
  return (
    <motion.button whileHover={{ x: 3 }} className="create-item" onClick={onClick} style={done ? { borderColor: 'var(--success)' } : undefined}>
      <span className="ci-icon" style={{ background: 'var(--surface-3)' }}>
        {icon}
      </span>
      <span className="grow strong small" style={{ textAlign: 'left' }}>
        {title}
      </span>
      {done ? <TickCircle size={18} color="var(--success)" variant="Bold" /> : <ArrowRight2 size={16} color="var(--text-3)" />}
    </motion.button>
  )
}

function ContactsNote() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="link xs" onClick={() => setOpen(true)} style={{ alignSelf: 'center' }}>
        How we use your contacts
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Your contacts">
        <p className="small muted" style={{ lineHeight: 1.6 }}>
          When you sync contacts, we match phone numbers and emails against existing CultureShare accounts so you can Raid people you already know. We don’t message your contacts.
        </p>
        <div className="mt-4">
          <div className="decision">
            <InfoCircle size={16} style={{ flex: 'none', color: 'var(--accent-text)' }} />
            <div>
              <strong>Needs product decision</strong>
              Retention period for uploaded contact hashes isn’t defined in the functionality spec.
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

function Discovering() {
  const [k, setK] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setK((x) => (x + 1) % 4), 600)
    return () => clearInterval(t)
  }, [])
  const lines = ['Discovering cultures you may enjoy…', 'Finding Historians for your interests…', 'Gathering Scrolls from your cultures…', 'Almost ready…']
  return (
    <div className="stack" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24, textAlign: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} style={{ width: 96, height: 96, borderRadius: '50%', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center' }}>
        <motion.img src={asset('cs-mark.svg')} alt="" width={48} animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p key={k} className="lead" style={{ fontStyle: 'italic' }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
          {lines[k]}
        </motion.p>
      </AnimatePresence>
      <div className="row gap-2">
        {[0, 1, 2, 3].map((d) => (
          <span key={d} style={{ height: 4, width: d === k ? 22 : 6, borderRadius: 4, background: d === k ? 'var(--brand-gold)' : 'var(--line-2)', transition: 'all .3s' }} />
        ))}
      </div>
    </div>
  )
}

/* Screen 06 — Discover people */
function Recommended() {
  const prefs = useApp((s) => s.prefs)
  const raiding = useApp((s) => s.raiding)
  const people = USERS.filter((u) => u.role !== 'artist')
  const recommended = people.filter((u) => u.role === 'historian' || u.verified).slice(0, 6)
  const byInterest = useMemo(() => {
    const cs = prefs.cultures
    const list = people.filter((u) => cs.some((c) => u.tribe === c) && !recommended.includes(u))
    return list.length ? list : people.filter((u) => !recommended.includes(u)).slice(0, 6)
  }, [prefs.cultures, people, recommended])
  return (
    <div className="stack gap-6">
      <Head title="People to Raid" sub="Raid a creator to get their Scrolls first-hand. You can unraid anytime." />
      <div className="row between">
        <span className="eyebrow gold">Recommended for you</span>
        <span className="xs faint">Raiding {raiding.length}</span>
      </div>
      <div className="ob-grid-3">
        {recommended.map((u, k) => (
          <PersonCard key={u.id} id={u.id} k={k} />
        ))}
      </div>
      <span className="eyebrow">Based on your interests</span>
      <div className="ob-grid-3">
        {byInterest.slice(0, 6).map((u, k) => (
          <PersonCard key={u.id} id={u.id} k={k} />
        ))}
      </div>
    </div>
  )
}

function PersonCard({ id, k }: { id: string; k: number }) {
  const u = getUser(id)!
  return (
    <motion.div className="person-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.05 }}>
      <Avatar user={u} size={60} />
      <span className="row gap-1 small strong" style={{ justifyContent: 'center' }}>
        {u.name} {u.verified && <TickCircle size={14} color="var(--success)" variant="Bold" />}
      </span>
      <span className="xs faint">
        {u.flag} {u.tribe} · {u.country}
      </span>
      {u.role === 'historian' && <span className="historian-badge">Historian</span>}
      <RaidButton userId={u.id} />
    </motion.div>
  )
}

