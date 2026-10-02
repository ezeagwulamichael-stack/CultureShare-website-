import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Profile, Lock1, Notification, Shield, Crown1, ShieldTick, Link21, Brush2, Setting4, Camera, DocumentUpload, TickCircle, Timer1, Warning2, Video, Monitor, Mobile, Sun1, Moon, Trash, Refresh, Logout, CloseCircle, ArrowRight2, Record } from 'iconsax-react'
import { useApp, type PlanId } from '../store/useApp'
import { COUNTRIES, PLANS, PLAN_MATRIX } from '../data/seed'
import { Page, PageHeader } from '../components/Shell'
import { Callout, Decision, Input, Modal, Select, Spinner, Switch } from '../components/ui'
import { cx, wait } from '../lib/util'

const SECTIONS = [
  { id: 'account', label: 'Account', icon: Setting4 },
  { id: 'profile', label: 'Profile', icon: Profile },
  { id: 'security', label: 'Security', icon: Lock1 },
  { id: 'notifications', label: 'Notifications', icon: Notification },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'subscription', label: 'Subscription', icon: Crown1 },
  { id: 'verification', label: 'Verification', icon: ShieldTick },
  { id: 'connected', label: 'Connected accounts', icon: Link21 },
  { id: 'appearance', label: 'Appearance', icon: Brush2 },
] as const

/* ─────────── Screen 31 — Account settings ─────────── */
export function Settings() {
  const { section = 'account' } = useParams()
  const nav = useNavigate()
  useEffect(() => {
    if (section === 'profile') nav('/profile/edit', { replace: true })
    if (section === 'subscription') nav('/plans', { replace: true })
    if (section === 'verification') nav('/verification', { replace: true })
  }, [section, nav])
  return (
    <Page wide>
      <PageHeader title="Settings" />
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {SECTIONS.map(({ id, label, icon: I }) => (
            <NavLink key={id} to={`/settings/${id}`} className={({ isActive }) => cx((isActive || (id === 'account' && section === 'account')) && 'active')}>
              <I size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <AnimatePresence mode="wait">
          <motion.section key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card" style={{ padding: 'clamp(18px,3vw,28px)' }}>
            {section === 'account' && <AccountSection />}
            {section === 'security' && <SecuritySection />}
            {section === 'notifications' && <NotificationsSection />}
            {section === 'privacy' && <PrivacySection />}
            {section === 'connected' && <ConnectedSection />}
            {section === 'appearance' && <AppearanceSection />}
          </motion.section>
        </AnimatePresence>
      </div>
    </Page>
  )
}

function Row({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="setting-row">
      <span className="stack grow" style={{ minWidth: 0 }}>
        <span className="small strong">{title}</span>
        {sub && <span className="xs muted">{sub}</span>}
      </span>
      {children}
    </div>
  )
}

function AccountSection() {
  const me = useApp((s) => s.me)
  const plan = useApp((s) => s.plan)
  const v = useApp((s) => s.verification.state)
  const update = useApp((s) => s.updateMe)
  const logOut = useApp((s) => s.logOut)
  const reset = useApp((s) => s.resetDemo)
  const toast = useApp((s) => s.toast)
  const [del, setDel] = useState(false)
  return (
    <div className="stack">
      <h2 className="h3">Account</h2>
      <Row title="Name" sub={`${me.firstName} ${me.lastName}`}>
        <Link to="/profile/edit" className="btn btn-secondary btn-xs">
          Edit
        </Link>
      </Row>
      <Row title="Username" sub={`@${me.username}`}>
        <Link to="/profile/edit" className="btn btn-secondary btn-xs">
          Edit
        </Link>
      </Row>
      <Row title="Plan" sub={PLANS.find((p) => p.id === plan)?.name}>
        <Link to="/plans" className="btn btn-secondary btn-xs">
          Manage
        </Link>
      </Row>
      <Row title="African verification" sub={{ not_started: 'Not started', in_progress: 'In progress', submitted: 'Submitted', under_review: 'Under review', approved: 'Approved', rejected: 'Action required' }[v]}>
        <Link to="/verification" className="btn btn-secondary btn-xs">
          Open
        </Link>
      </Row>
      <Row title="Prototype: Historian role" sub="Preview the Historian dashboard as an authorised Historian.">
        <Switch
          checked={me.role === 'historian'}
          onChange={(on) => {
            update({ role: on ? 'historian' : 'member' })
            toast(on ? 'Historian desk added to your sidebar' : 'Historian preview off', 'success', on ? { label: 'Open', to: '/historian' } : undefined)
          }}
          label="Historian role"
        />
      </Row>
      <Row title="Prototype: reset demo data" sub="Restores all sample Scrolls, messages and settings.">
        <button
          className="btn btn-secondary btn-xs"
          onClick={() => {
            reset()
            toast('Demo data reset', 'success')
          }}
        >
          <Refresh size={14} /> Reset
        </button>
      </Row>
      <Row title="Log out">
        <button className="btn btn-secondary btn-xs" onClick={() => logOut()}>
          <Logout size={14} /> Log out
        </button>
      </Row>
      <Row title="Delete account" sub="Permanently delete your account, Scrolls and Museum.">
        <button className="btn btn-danger btn-xs" onClick={() => setDel(true)}>
          <Trash size={14} /> Delete
        </button>
      </Row>
      <Modal
        open={del}
        onClose={() => setDel(false)}
        title="Delete your account?"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDel(false)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                setDel(false)
                toast('Account deletion needs the backend — nothing was deleted in this prototype', 'info')
              }}
            >
              Delete permanently
            </button>
          </>
        }
      >
        <p className="small muted">This removes your profile, posts, Scrolls and Museum. Published Scrolls already validated by Historians may be retained per CultureShare policy.</p>
        <div className="mt-4">
          <Decision>Retention of validated Scrolls after account deletion isn’t defined in the spec.</Decision>
        </div>
      </Modal>
    </div>
  )
}

function SecuritySection() {
  const me = useApp((s) => s.me)
  const toast = useApp((s) => s.toast)
  const [pw, setPw] = useState({ cur: '', next: '', again: '' })
  const [busy, setBusy] = useState(false)
  const [sessions, setSessions] = useState([
    { id: 's1', device: 'This browser', where: 'Lagos, Nigeria', when: 'Active now', icon: Monitor, current: true },
    { id: 's2', device: 'iPhone 14 · CultureShare app', where: 'Lagos, Nigeria', when: '2 hours ago', icon: Mobile },
    { id: 's3', device: 'Chrome on Windows', where: 'Accra, Ghana', when: '3 days ago', icon: Monitor },
  ])
  const ok = pw.cur.length >= 6 && pw.next.length >= 8 && pw.next === pw.again
  return (
    <div className="stack gap-5">
      <h2 className="h3">Security</h2>
      <form
        className="stack gap-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          await wait(700)
          setBusy(false)
          setPw({ cur: '', next: '', again: '' })
          toast('Password updated', 'success')
        }}
      >
        <span className="eyebrow">Password</span>
        <div className="form-grid">
          <Input className="span-2" type="password" label="Current password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} />
          <Input type="password" label="New password" hint="Min. 8 characters" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          <Input type="password" label="Confirm new password" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} error={pw.again && pw.again !== pw.next ? 'Passwords don’t match' : undefined} />
        </div>
        <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }} disabled={!ok || busy}>
          {busy ? <Spinner /> : 'Update password'}
        </button>
      </form>
      <div className="stack">
        <span className="eyebrow">Contact</span>
        <Row title="Email" sub={me.email || 'Not set'}>
          <Link to="/profile/edit" className="btn btn-secondary btn-xs">
            Change
          </Link>
        </Row>
        <Row title="Phone" sub={me.phone || 'Not set'}>
          <Link to="/profile/edit" className="btn btn-secondary btn-xs">
            Change
          </Link>
        </Row>
      </div>
      <div className="stack">
        <span className="eyebrow">Sessions</span>
        <AnimatePresence initial={false}>
          {sessions.map((s) => (
            <motion.div key={s.id} layout exit={{ opacity: 0, height: 0 }}>
              <div className="setting-row">
                <s.icon size={22} color="var(--text-3)" />
                <span className="stack grow">
                  <span className="small strong">{s.device}</span>
                  <span className="xs muted">
                    {s.where} · {s.when}
                  </span>
                </span>
                {s.current ? (
                  <span className="tag green">This device</span>
                ) : (
                  <button className="btn btn-secondary btn-xs" onClick={() => (setSessions(sessions.filter((x) => x.id !== s.id)), toast('Signed out of that session', 'success'))}>
                    Sign out
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function NotificationsSection() {
  const prefs = useApp((s) => s.notifPrefs)
  const set = useApp((s) => s.setNotifPref)
  const items = [
    ['scrolls', 'Scroll notifications', 'First-hand alerts when people you raid upload a Scroll'],
    ['raiders', 'Raider activity', 'New Raiders and Raider milestones'],
    ['comments', 'Comments & replies', 'On your Scrolls, posts and comments'],
    ['messages', 'Messages', 'New direct and community messages'],
    ['communities', 'Community notifications', 'Announcements and activity in your communities'],
    ['email', 'Email digest', 'A weekly summary by email'],
  ]
  return (
    <div className="stack">
      <h2 className="h3">Notifications</h2>
      {items.map(([k, t, s]) => (
        <Row key={k} title={t} sub={s}>
          <Switch checked={!!prefs[k]} onChange={(v) => set(k, v)} label={t} />
        </Row>
      ))}
      <p className="xs faint mt-4">Per-creator Scroll alerts can be muted from Profile → Raiding.</p>
    </div>
  )
}

function PrivacySection() {
  const p = useApp((s) => s.privacy)
  const set = useApp((s) => s.setPrivacy)
  const toast = useApp((s) => s.toast)
  return (
    <div className="stack gap-2">
      <h2 className="h3">Privacy</h2>
      <p className="small muted">These use CultureShare’s defined visibility options.</p>
      <Row title="Default Scroll visibility" sub="Used when you create a new Scroll">
        <Select value={p.defaultScroll} onChange={(e) => (set({ defaultScroll: e.target.value as typeof p.defaultScroll }), toast('Saved', 'success'))} aria-label="Default Scroll visibility">
          <option value="public">Public</option>
          <option value="raiders">Private to Raiders</option>
          <option value="friends">Private to friends</option>
        </Select>
      </Row>
      <Row title="Default post visibility">
        <Select value={p.defaultPost} onChange={(e) => (set({ defaultPost: e.target.value as typeof p.defaultPost }), toast('Saved', 'success'))} aria-label="Default post visibility">
          <option value="public">Public</option>
          <option value="followers">Private to followers</option>
          <option value="friends">Private to friends</option>
        </Select>
      </Row>
      <Row title="Who can message you">
        <Select value={p.messageFrom} onChange={(e) => (set({ messageFrom: e.target.value as typeof p.messageFrom }), toast('Saved', 'success'))} aria-label="Who can message you">
          <option value="everyone">Everyone</option>
          <option value="raiders">Raiders only</option>
          <option value="nobody">Nobody</option>
        </Select>
      </Row>
      <Row title="Show African roots on profile" sub="Your “Roots” line and tribe">
        <Switch checked={p.showRoots} onChange={(v) => set({ showRoots: v })} label="Show roots" />
      </Row>
    </div>
  )
}

function ConnectedSection() {
  const toast = useApp((s) => s.toast)
  const [c, setC] = useState({ Google: true, Facebook: false, Contacts: false })
  return (
    <div className="stack">
      <h2 className="h3">Connected accounts</h2>
      {(Object.keys(c) as (keyof typeof c)[]).map((k) => (
        <Row key={k} title={k} sub={c[k] ? 'Connected' : 'Not connected'}>
          <button
            className={cx('btn btn-xs', c[k] ? 'btn-secondary' : 'btn-primary')}
            onClick={() => {
              setC({ ...c, [k]: !c[k] })
              toast(c[k] ? `${k} disconnected` : `${k} connected`, 'success')
            }}
          >
            {c[k] ? 'Disconnect' : 'Connect'}
          </button>
        </Row>
      ))}
    </div>
  )
}

function AppearanceSection() {
  const theme = useApp((s) => s.theme)
  const setTheme = useApp((s) => s.setTheme)
  return (
    <div className="stack gap-4">
      <h2 className="h3">Appearance</h2>
      <div className="grid-2">
        {(['dark', 'light'] as const).map((t) => (
          <button key={t} className={cx('radio-card', theme === t && 'is-on')} onClick={() => setTheme(t)} style={{ flexDirection: 'column' }}>
            <span style={{ width: '100%', height: 110, borderRadius: 10, background: t === 'dark' ? 'radial-gradient(120% 80% at 30% 0%, #1b4332, #070e09 60%)' : 'radial-gradient(120% 80% at 30% 0%, #e8e3d2, #f6f1e6 60%)', border: '1px solid var(--line-2)', display: 'grid', placeItems: 'center' }}>
              <span style={{ width: '60%', height: 14, borderRadius: 6, background: t === 'dark' ? '#f3dda3' : '#1b4332' }} />
            </span>
            <span className="row gap-2 strong small">
              {t === 'dark' ? <Moon size={16} /> : <Sun1 size={16} />} {t === 'dark' ? 'Dark (default)' : 'Light'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─────────── Screen 07 — African verification ─────────── */
const V_STEPS = ['Identity', 'Origin', 'Video', 'Review'] as const
const DOCS = ['NIN (or country equivalent)', 'Passport', 'Driver’s licence', 'SSN']
const QUESTIONS = ['Say your full name and where your family is from.', 'Greet us in your mother tongue, then translate it.', 'Name a tradition or festival from your community and describe it briefly.']

export function Verification() {
  const v = useApp((s) => s.verification)
  const setV = useApp((s) => s.setVerification)
  const submit = useApp((s) => s.submitVerification)
  const toast = useApp((s) => s.toast)
  const [busy, setBusy] = useState(false)
  const step = Math.min(v.step, 3)
  const country = COUNTRIES.find((c) => c.name === v.country)
  const done = [!!v.docType && !!v.docName, !!v.country && !!v.state_ && !!v.tribe && !!v.race, !!v.videoName, true]
  const go = (k: number) => setV({ step: k, state: v.state === 'not_started' ? 'in_progress' : v.state })
  const docRef = useRef<HTMLInputElement>(null)
  const submitted = v.state === 'under_review' || v.state === 'approved' || v.state === 'submitted' || v.state === 'rejected'

  if (submitted) return <VerificationStatus />

  return (
    <Page wide>
      <PageHeader eyebrow="Major workflow" title="African verification" sub="Verify your identity and origin. A real person at CultureShare reviews every submission — it usually takes up to 24 hours, it isn’t instant." />
      <div className="settings-layout">
        <nav className="stepper" aria-label="Verification steps">
          {V_STEPS.map((s, k) => (
            <button key={s} className={cx('step', step === k && 'is-on', done[k] && step !== k && k < 3 && 'is-done')} onClick={() => go(k)}>
              <span className="num">{done[k] && step !== k && k < 3 ? <TickCircle size={16} variant="Bold" /> : String(k + 1).padStart(2, '0')}</span>
              <span className="step-label">{s}</span>
            </button>
          ))}
          <div className="callout mt-4" style={{ padding: 12 }}>
            <span className="c-icon">
              <Lock1 size={16} />
            </span>
            <span className="xs">Documents and video are only seen by CultureShare verification staff.</span>
          </div>
        </nav>
        <section className="card" style={{ padding: 'clamp(18px,3vw,28px)' }}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="stack gap-5">
              {step === 0 && (
                <>
                  <h2 className="h2">01 · Identity</h2>
                  <p className="small muted">Choose a document and upload a clear photo or scan.</p>
                  <div className="grid-2" style={{ gap: 10 }}>
                    {DOCS.map((d) => (
                      <button key={d} className={cx('radio-card', v.docType === d && 'is-on')} onClick={() => setV({ docType: d, state: 'in_progress' })}>
                        <span className="radio-dot" />
                        <span className="small strong">{d}</span>
                      </button>
                    ))}
                  </div>
                  <div className="dropzone" onClick={() => v.docType && docRef.current?.click()} style={!v.docType ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
                    {v.docName ? <TickCircle size={30} color="var(--success)" variant="Bulk" /> : <DocumentUpload size={30} color="var(--accent)" variant="Bulk" />}
                    <span className="strong">{v.docName || (v.docType ? `Upload your ${v.docType}` : 'Choose a document type first')}</span>
                    <span className="xs muted">{v.docName ? 'Click to replace' : 'JPG, PNG or PDF · max 10 MB'}</span>
                  </div>
                  <input ref={docRef} type="file" accept="image/*,.pdf" hidden onChange={(e) => e.target.files?.[0] && setV({ docName: e.target.files[0].name })} />
                </>
              )}
              {step === 1 && (
                <>
                  <h2 className="h2">02 · Origin</h2>
                  <div className="form-grid">
                    <Select label="Country" value={v.country} onChange={(e) => setV({ country: e.target.value, state_: '', tribe: '' })}>
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </Select>
                    <Select label="State" value={v.state_} onChange={(e) => setV({ state_: e.target.value })} disabled={!country}>
                      <option value="">Select state</option>
                      {country?.states.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                    <Select label="Tribe" value={v.tribe} onChange={(e) => setV({ tribe: e.target.value })} disabled={!country}>
                      <option value="">Select tribe</option>
                      {country?.tribes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                    <Input label="Race" placeholder="As you identify" value={v.race} onChange={(e) => setV({ race: e.target.value })} />
                  </div>
                  <Decision>The functionality spec requires “race” but doesn’t list accepted values; this is free text until the product team defines them.</Decision>
                </>
              )}
              {step === 2 && <VideoStep onDone={(name) => setV({ videoName: name })} videoName={v.videoName} />}
              {step === 3 && (
                <>
                  <h2 className="h2">04 · Review</h2>
                  <div className="stack gap-2">
                    {[
                      ['Identity', v.docType ? `${v.docType} · ${v.docName || 'not uploaded'}` : 'Not provided', 0],
                      ['Origin', v.country ? `${v.state_ || '—'}, ${v.country} · ${v.tribe || '—'} · ${v.race || '—'}` : 'Not provided', 1],
                      ['Video', v.videoName || 'Not recorded', 2],
                    ].map(([t, s, k]) => (
                      <div key={t as string} className="row gap-3 panel" style={{ padding: 14 }}>
                        {done[k as number] ? <TickCircle size={20} color="var(--success)" variant="Bold" /> : <Warning2 size={20} color="var(--warning)" />}
                        <span className="stack grow">
                          <span className="small strong">{t as string}</span>
                          <span className="xs muted">{s as string}</span>
                        </span>
                        <button className="link xs" onClick={() => go(k as number)}>
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                  <Callout kind="gold" icon={<Timer1 size={18} />}>
                    After you submit, a reviewer checks your documents and video. Expect a decision within about 24 hours.
                  </Callout>
                  <button
                    className="btn btn-primary btn-lg"
                    disabled={!done[0] || !done[1] || !done[2] || busy}
                    onClick={async () => {
                      setBusy(true)
                      await wait(1000)
                      submit()
                      setBusy(false)
                      toast('Verification submitted', 'success')
                    }}
                  >
                    {busy ? <Spinner /> : 'Submit for review'}
                  </button>
                </>
              )}
              <div className="row between" style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <button className="btn btn-ghost btn-sm" disabled={step === 0} onClick={() => go(step - 1)}>
                  Back
                </button>
                {step < 3 && (
                  <button className="btn btn-primary btn-sm" disabled={!done[step]} onClick={() => go(step + 1)}>
                    Continue <ArrowRight2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </Page>
  )
}

function VideoStep({ onDone, videoName }: { onDone: (n: string) => void; videoName: string }) {
  const [state, setState] = useState<'idle' | 'asking' | 'denied' | 'live' | 'recording' | 'done'>(videoName ? 'done' : 'idle')
  const [secs, setSecs] = useState(0)
  const [q, setQ] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), [])
  useEffect(() => {
    if (state !== 'recording') return
    const t = setInterval(() => setSecs((s) => (s >= 179 ? (stop(), 180) : s + 1)), 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])
  const open = async () => {
    setState('asking')
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = s
      setState('live')
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s
      }, 50)
    } catch {
      setState('denied')
    }
  }
  const start = () => {
    if (!streamRef.current) return
    try {
      recRef.current = new MediaRecorder(streamRef.current)
      recRef.current.start()
    } catch {
      /* recording unsupported — timer still demonstrates the flow */
    }
    setSecs(0)
    setQ(0)
    setState('recording')
  }
  const stop = () => {
    recRef.current?.state === 'recording' && recRef.current.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setState('done')
    onDone(`verification-video-${new Date().toISOString().slice(0, 10)}.webm`)
  }
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  return (
    <>
      <h2 className="h2">03 · Video</h2>
      <p className="small muted">Record a video of up to 3 minutes answering the questions shown on screen.</p>
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#050806', aspectRatio: '16 / 10', display: 'grid', placeItems: 'center', color: '#f4efe6' }}>
        {(state === 'live' || state === 'recording') && <video ref={videoRef} autoPlay muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />}
        {state === 'idle' && (
          <div className="stack gap-3" style={{ alignItems: 'center', textAlign: 'center', padding: 20 }}>
            <Video size={40} color="#c9a84c" variant="Bulk" />
            <span className="small">We’ll ask for camera and microphone access.</span>
            <button className="btn btn-gold btn-sm" onClick={open}>
              <Camera size={16} /> Turn on camera
            </button>
          </div>
        )}
        {state === 'asking' && <Spinner />}
        {state === 'denied' && (
          <div className="stack gap-3" style={{ alignItems: 'center', textAlign: 'center', padding: 20, maxWidth: 380 }}>
            <Warning2 size={36} color="#fbbf24" variant="Bulk" />
            <strong>Camera access is blocked</strong>
            <span className="small" style={{ opacity: 0.8 }}>
              Allow camera and microphone in your browser’s site settings, then try again — or upload a video you recorded on your phone.
            </span>
            <div className="row gap-2">
              <button className="btn btn-gold btn-sm" onClick={open}>
                Try again
              </button>
              <button className="btn btn-sm" style={{ border: '1px solid rgba(255,255,255,.3)', color: '#fff' }} onClick={() => fileRef.current?.click()}>
                Upload video
              </button>
            </div>
          </div>
        )}
        {state === 'done' && (
          <div className="stack gap-3" style={{ alignItems: 'center', textAlign: 'center' }}>
            <TickCircle size={44} color="#4ade80" variant="Bulk" />
            <strong>Video ready</strong>
            <span className="xs" style={{ opacity: 0.7 }}>{videoName}</span>
            <button className="btn btn-sm" style={{ border: '1px solid rgba(255,255,255,.3)', color: '#fff' }} onClick={open}>
              Record again
            </button>
          </div>
        )}
        {(state === 'live' || state === 'recording') && (
          <>
            <div style={{ position: 'absolute', left: 16, right: 16, top: 16, padding: 14, borderRadius: 12, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)' }}>
              <span className="eyebrow" style={{ color: '#c9a84c' }}>
                Question {q + 1} of {QUESTIONS.length}
              </span>
              <AnimatePresence mode="wait">
                <motion.p key={q} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="small strong" style={{ marginTop: 4 }}>
                  {QUESTIONS[q]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="row gap-3" style={{ position: 'absolute', bottom: 16, left: 0, right: 0, justifyContent: 'center' }}>
              {state === 'live' ? (
                <button className="btn btn-gold" onClick={start}>
                  <Record size={18} variant="Bold" /> Start recording
                </button>
              ) : (
                <>
                  <span className="tag red" style={{ height: 32, padding: '0 12px', background: 'rgba(220,38,38,.85)', color: '#fff' }}>
                    ● {fmt(secs)} / 3:00
                  </span>
                  {q < QUESTIONS.length - 1 && (
                    <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }} onClick={() => setQ(q + 1)}>
                      Next question
                    </button>
                  )}
                  <button className="btn btn-sm btn-gold" onClick={stop}>
                    Finish
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="video/*" hidden onChange={(e) => e.target.files?.[0] && (setState('done'), onDone(e.target.files[0].name))} />
      {state !== 'denied' && (
        <button className="link xs" style={{ alignSelf: 'flex-start' }} onClick={() => fileRef.current?.click()}>
          Prefer to upload a video instead?
        </button>
      )}
    </>
  )
}

function VerificationStatus() {
  const v = useApp((s) => s.verification)
  const setV = useApp((s) => s.setVerification)
  const toast = useApp((s) => s.toast)
  const steps = [
    { t: 'Submitted', d: v.submittedAt ? new Date(v.submittedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '', on: true },
    { t: 'Under review', d: 'Usually within 24 hours', on: true },
    { t: v.state === 'rejected' ? 'Action required' : 'Approved', d: v.state === 'approved' ? 'You’re verified' : v.state === 'rejected' ? v.note ?? '' : 'Waiting', on: v.state === 'approved' || v.state === 'rejected' },
  ]
  return (
    <Page narrow>
      <PageHeader title="African verification" />
      <motion.div className="card stack gap-5" style={{ padding: 28 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="row gap-4">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ color: v.state === 'approved' ? 'var(--success)' : v.state === 'rejected' ? 'var(--danger)' : 'var(--accent)' }}>
            {v.state === 'approved' ? <ShieldTick size={56} variant="Bulk" /> : v.state === 'rejected' ? <CloseCircle size={56} variant="Bulk" /> : <Timer1 size={56} variant="Bulk" />}
          </motion.span>
          <div className="stack gap-1">
            <h2 className="h2">{v.state === 'approved' ? 'You’re verified' : v.state === 'rejected' ? 'Action required' : 'Under review'}</h2>
            <p className="small muted">{v.state === 'approved' ? 'The verified mark now shows on your profile and Scrolls.' : v.state === 'rejected' ? 'We couldn’t verify you yet. See the note below and resubmit.' : 'A reviewer is checking your documents and video. We’ll notify you when it’s done.'}</p>
          </div>
        </div>
        <div className="stack gap-3">
          {steps.map((s, k) => (
            <div key={s.t} className="row gap-3">
              <span className={cx('rt-dot', s.on ? (k === 2 && v.state === 'rejected' ? 'warn' : 'done') : k === 2 ? 'now' : '')} style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', border: '1.5px solid var(--line-2)' }}>
                {s.on ? '✓' : k + 1}
              </span>
              <span className="stack">
                <span className="small strong">{s.t}</span>
                <span className="xs muted">{s.d}</span>
              </span>
            </div>
          ))}
        </div>
        {v.state === 'rejected' && (
          <button className="btn btn-primary" onClick={() => setV({ state: 'in_progress', step: 0, note: undefined })}>
            Fix and resubmit
          </button>
        )}
        {v.state === 'under_review' && (
          <div className="row gap-2 wrap" style={{ borderTop: '1px dashed var(--line-2)', paddingTop: 14 }}>
            <span className="xs faint grow">Prototype — simulate the reviewer’s decision:</span>
            <button className="btn btn-secondary btn-xs" onClick={() => (setV({ state: 'approved' }), toast('Verification approved', 'success'))}>
              Approve
            </button>
            <button className="btn btn-danger btn-xs" onClick={() => (setV({ state: 'rejected', note: 'The document photo was blurry — please upload a clearer image.' }), toast('Verification needs attention', 'error'))}>
              Reject
            </button>
          </div>
        )}
      </motion.div>
    </Page>
  )
}

/* ─────────── Screen 27 — Subscription plans ─────────── */
export function Plans() {
  const plan = useApp((s) => s.plan)
  const setPlan = useApp((s) => s.setPlan)
  const toast = useApp((s) => s.toast)
  const [confirm, setConfirm] = useState<PlanId | null>(null)
  const [busy, setBusy] = useState(false)
  const order: PlanId[] = ['executive', 'premium', 'standard', 'subpar']
  const can: Record<PlanId, string[]> = {
    executive: ['Documentary Scrolls', 'Post as Rogue Raider', 'Voice recordings', 'Profile Tune'],
    premium: ['Documentary Scrolls', 'Post as Rogue Raider', 'Voice recordings', 'Profile Tune'],
    standard: ['Documentary Scrolls', 'Voice recordings', 'Profile Tune'],
    subpar: ['Reel Scrolls', 'Voice recordings', 'Profile Tune'],
  }
  return (
    <Page wide>
      <PageHeader title="Plans" sub="What you can do on CultureShare — not just what you pay." />
      <div className="plans">
        {PLANS.map((p, k) => (
          <motion.div key={p.id} className={cx('plan', plan === p.id && 'is-current')} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.06 }}>
            {plan === p.id && (
              <span className="tag gold" style={{ position: 'absolute', top: 16, right: 16 }}>
                Current
              </span>
            )}
            <span className="row gap-2">
              <Crown1 size={20} color={k < 2 ? 'var(--accent)' : 'var(--text-3)'} variant={k === 0 ? 'Bold' : 'Linear'} />
              <span className="h3">{p.name}</span>
            </span>
            <span>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem' }}>{p.price}</strong>
              {p.price !== 'Free' && <span className="xs muted"> / month</span>}
            </span>
            <p className="small muted">{p.blurb}</p>
            <ul className="stack gap-2" style={{ flex: 1 }}>
              {can[p.id].map((c) => (
                <li key={c} className="row gap-2 small">
                  <TickCircle size={16} color="var(--success)" variant="Bold" /> {c}
                </li>
              ))}
            </ul>
            <button className={cx('btn btn-sm btn-block', plan === p.id ? 'btn-secondary' : 'btn-primary')} disabled={plan === p.id} onClick={() => setConfirm(p.id)}>
              {plan === p.id ? 'Your plan' : order.indexOf(p.id) < order.indexOf(plan) ? 'Upgrade' : 'Switch'}
            </button>
          </motion.div>
        ))}
      </div>
      <section className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="matrix">
          <thead>
            <tr>
              <th>Feature</th>
              {PLANS.map((p) => (
                <th key={p.id}>{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAN_MATRIX.map((r) => (
              <tr key={r.feature}>
                <td>
                  <span className="strong small">{r.feature}</span>
                  {r.note && <span className="xs faint" style={{ display: 'block', maxWidth: 300 }}>{r.note}</span>}
                </td>
                {r.values.map((v, k) => (
                  <td key={k} className={v === '✓' ? 'yes' : v === '—' ? 'no' : 'tbd'}>
                    {v === 'Confirm' ? 'TBC' : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <Decision>Use the product team’s exact commercial rules before launch. The functionality document has overlapping media limits that this page deliberately doesn’t reconcile; prices shown are placeholders.</Decision>
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`Switch to ${PLANS.find((p) => p.id === confirm)?.name}?`}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirm(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                await wait(900)
                setPlan(confirm!)
                setBusy(false)
                toast(`You’re now on ${PLANS.find((p) => p.id === confirm)?.name}`, 'success')
                setConfirm(null)
              }}
            >
              {busy ? <Spinner /> : 'Confirm'}
            </button>
          </>
        }
      >
        <p className="small muted">Payment is simulated in this prototype — no card is charged. Your new features apply immediately.</p>
      </Modal>
    </Page>
  )
}
