import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Add, ArrowDown, ArrowUp, Bank, Camera, Coin1, Location, Lock1, Medal, Microphone2, Send2, TickCircle, Trash, Video, Warning2, Wallet2, Eye, Minus } from 'iconsax-react'
import { useApp, type FamilyMember } from '../store/useApp'
import { img } from '../data/seed'
import { Page, PageHeader } from '../components/Shell'
import { CultureMeta, ScrollMedia } from '../components/content'
import { Avatar, Callout, Decision, Empty, Input, Modal, Select, Spinner, Switch, Tabs, Textarea } from '../components/ui'
import { cx, timeAgo, getUser, useUser, wait } from '../lib/util'

function LaterBanner({ children }: { children?: ReactNode }) {
  return (
    <div className="callout" style={{ borderStyle: 'dashed' }}>
      <span className="c-icon">
        <Lock1 size={18} />
      </span>
      <div className="small">
        <strong>Later-stage preview.</strong> This feature belongs to the 2-years-and-above roadmap. It’s shown so the team can review the experience — it isn’t part of the initial product. {children}
      </div>
    </div>
  )
}

/* ─────────── Screen 39 — Wallet / Cowries ─────────── */
export function Wallet() {
  const w = useApp((s) => s.wallet)
  const addFunds = useApp((s) => s.addFunds)
  const send = useApp((s) => s.sendCowries)
  const withdraw = useApp((s) => s.withdraw)
  const toast = useApp((s) => s.toast)
  const [modal, setModal] = useState<'add' | 'send' | 'withdraw' | null>(null)
  const [amt, setAmt] = useState('')
  const [to, setTo] = useState('')
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<'All' | 'In' | 'Out' | 'Pending'>('All')
  const txns = w.txns.filter((t) => filter === 'All' || (filter === 'In' ? t.amount > 0 : filter === 'Out' ? t.amount < 0 : t.state === 'pending'))
  const run = async () => {
    const n = Number(amt)
    if (!n) return
    setBusy(true)
    await wait(900)
    setBusy(false)
    if (modal === 'add') (addFunds(n), toast(`₵${n.toLocaleString()} added`, 'success'))
    if (modal === 'send') send(to || 'a friend', n) ? toast(`Sent ₵${n.toLocaleString()} to ${to}`, 'success') : toast('Not enough Cowries', 'error')
    if (modal === 'withdraw') withdraw(n) ? toast(`Withdrawal of ₵${n.toLocaleString()} is pending`, 'success') : toast('Not enough Cowries', 'error')
    setModal(null)
    setAmt('')
    setTo('')
  }
  return (
    <Page narrow>
      <PageHeader title="Wallet" later sub="Cowries are CultureShare’s currency. 1 Cowrie = ₦1 per the functionality spec." />
      <LaterBanner />
      <motion.div className="card" style={{ padding: 28, background: 'radial-gradient(120% 140% at 100% 0%, rgba(201,168,76,.25), transparent 50%), linear-gradient(135deg, #1b4332, #0c3122)', color: '#f4efe6', border: 0 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="row gap-2 small" style={{ opacity: 0.8 }}>
          <Wallet2 size={18} /> Balance
        </span>
        <motion.strong key={w.balance} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 3.2rem)', marginTop: 6 }}>
          ₵ {w.balance.toLocaleString()}
        </motion.strong>
        <span className="small" style={{ opacity: 0.75 }}>≈ ₦{w.balance.toLocaleString()} · ₵{w.pending.toLocaleString()} pending</span>
        <div className="row gap-2 wrap mt-6">
          <button className="btn btn-sm" style={{ background: '#f3dda3', color: '#0a1800' }} onClick={() => setModal('add')}>
            <Add size={16} /> Add funds
          </button>
          <button className="btn btn-sm" style={{ border: '1px solid rgba(255,255,255,.3)', color: '#fff' }} onClick={() => setModal('send')}>
            <Send2 size={16} /> Send
          </button>
          <button className="btn btn-sm" style={{ border: '1px solid rgba(255,255,255,.3)', color: '#fff' }} onClick={() => setModal('withdraw')}>
            <Bank size={16} /> Withdraw
          </button>
        </div>
      </motion.div>
      <div className="grid-2">
        <div className="kpi">
          <span className="xs muted">Available</span>
          <strong>₵{w.balance.toLocaleString()}</strong>
        </div>
        <div className="kpi">
          <span className="xs muted">Pending</span>
          <strong style={{ color: 'var(--warning)' }}>₵{w.pending.toLocaleString()}</strong>
        </div>
      </div>
      <div className="row between wrap gap-3">
        <h2 className="h3">Transactions</h2>
        <Tabs tabs={['All', 'In', 'Out', 'Pending'] as const} value={filter} onChange={setFilter} />
      </div>
      <div className="panel" style={{ padding: '4px 16px' }}>
        {txns.length === 0 && <p className="small muted" style={{ padding: 16 }}>No transactions.</p>}
        <AnimatePresence initial={false}>
          {txns.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="setting-row">
              <span style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', background: t.amount > 0 ? 'var(--success-soft)' : 'var(--surface-3)', color: t.amount > 0 ? 'var(--success)' : 'var(--text-2)' }}>{t.amount > 0 ? <ArrowDown size={18} /> : <ArrowUp size={18} />}</span>
              <span className="stack grow">
                <span className="small strong">{t.label}</span>
                <span className="xs faint">{timeAgo(t.at)} ago</span>
              </span>
              <span className="stack" style={{ alignItems: 'flex-end' }}>
                <span className="small strong" style={{ color: t.amount > 0 ? 'var(--success)' : 'var(--text)' }}>
                  {t.amount > 0 ? '+' : '−'}₵{Math.abs(t.amount).toLocaleString()}
                </span>
                <span className={cx('tag', t.state === 'pending' ? 'amber' : t.state === 'failed' ? 'red' : 'green')} style={{ height: 18 }}>
                  {t.state}
                </span>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <Decision>The monetary model (funding methods, fees, KYC limits, AI-assisted payments) needs product and technical confirmation before implementation.</Decision>
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add funds' : modal === 'send' ? 'Send Cowries' : 'Withdraw'}
        footer={
          <button className="btn btn-primary" disabled={!Number(amt) || busy || (modal === 'send' && !to)} onClick={run}>
            {busy ? <Spinner /> : 'Confirm'}
          </button>
        }
      >
        <div className="stack gap-4">
          {modal === 'send' && <Input label="To (username)" placeholder="@kwame.a" value={to} onChange={(e) => setTo(e.target.value)} />}
          <Input label="Amount" inputMode="numeric" placeholder="0" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ''))} icon={<span className="gold strong">₵</span>} hint={modal !== 'add' ? `Available: ₵${w.balance.toLocaleString()}` : 'Simulated — no real payment'} error={modal !== 'add' && Number(amt) > w.balance ? 'More than your available balance' : undefined} />
          <div className="row gap-2">
            {[500, 1000, 5000].map((n) => (
              <button key={n} className="chip sm" onClick={() => setAmt(String(n))}>
                ₵{n.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </Page>
  )
}

/* ─────────── Screen 40 — Buy Scroll ─────────── */
export function BuyScroll() {
  const { id } = useParams()
  const s = useApp((st) => st.scrolls.find((x) => x.id === id))
  const bought = useApp((st) => (id ? st.bought.includes(id) : false))
  const balance = useApp((st) => st.wallet.balance)
  const buy = useApp((st) => st.buyScroll)
  const creator = useUser(s?.creatorId)
  const historian = useUser(s?.historianId)
  const [state, setState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const nav = useNavigate()
  if (!s || !s.price) return <Page narrow><Empty icon={<Coin1 size={26} />} title="Not for sale" text="This Scroll isn’t listed for sale." /></Page>
  const status = bought ? 'Purchased' : s.sale === 'sold' ? 'Sold' : s.darkZone ? 'Restricted' : 'Available'
  return (
    <Page wide>
      <LaterBanner />
      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', alignItems: 'start', gap: 24 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <ScrollMedia scroll={s} height={440} />
        </div>
        <div className="stack gap-4">
          <span className={cx('tag', status === 'Available' ? 'green' : status === 'Purchased' ? 'gold' : 'red')} style={{ alignSelf: 'flex-start' }}>
            {status}
          </span>
          <h1 className="h1">{s.title}</h1>
          <CultureMeta scroll={s} />
          <div className="row gap-3">
            <Avatar user={creator} size={36} />
            <span className="small">
              by <strong>{creator?.name}</strong> · validated by <strong className="gold">{historian?.name}</strong>
            </span>
          </div>
          <p className="small" style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
            {s.caption}
          </p>
          <div className="panel stack gap-3" style={{ padding: 18 }}>
            <span className="row between">
              <span className="muted small">Price</span>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>₵{s.price.toLocaleString()}</strong>
            </span>
            <span className="row between xs muted">
              <span>Your balance</span>
              <span>₵{balance.toLocaleString()}</span>
            </span>
            <AnimatePresence mode="wait">
              {state === 'success' || bought ? (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="stack gap-2">
                  <Callout kind="success" icon={<TickCircle size={18} />}>
                    Payment successful — it’s in your Museum under “Bought”.
                  </Callout>
                  <button className="btn btn-secondary" onClick={() => nav('/profile/museum')}>
                    Open Museum
                  </button>
                </motion.div>
              ) : state === 'failed' ? (
                <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stack gap-2">
                  <Callout kind="danger" icon={<Warning2 size={18} />}>
                    Payment failed — not enough Cowries.
                  </Callout>
                  <Link to="/later/wallet" className="btn btn-primary">
                    Add funds
                  </Link>
                </motion.div>
              ) : (
                <motion.button
                  key="b"
                  className="btn btn-primary btn-lg"
                  disabled={state === 'processing' || status !== 'Available'}
                  onClick={async () => {
                    setState('processing')
                    await wait(1400)
                    setState(buy(s.id) === 'ok' ? 'success' : 'failed')
                  }}
                >
                  {state === 'processing' ? (
                    <>
                      <Spinner /> Processing payment…
                    </>
                  ) : (
                    'Buy Scroll'
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Page>
  )
}

/* ─────────── Screen 36 — Hall of Fame ─────────── */
const LEGENDS = [
  { name: 'Queen Amina of Zazzau', era: '16th century · Hausa', img: img('emir-durbar'), text: 'Warrior queen who expanded Zazzau’s trade routes and built the walled cities still called “ganuwar Amina”.' },
  { name: 'Mansa Musa', era: '14th century · Mali', img: img('bronze-artifacts'), text: 'Ruler of the Mali Empire whose pilgrimage to Mecca reshaped how the world saw West African wealth.' },
  { name: 'Yaa Asantewaa', era: '1840–1921 · Asante', img: img('akan-festival'), text: 'Queen mother of Ejisu who led the War of the Golden Stool against British colonial forces.' },
  { name: 'Shaka kaSenzangakhona', era: '1787–1828 · Zulu', img: img('zulu-dance'), text: 'Founder of the Zulu Kingdom, whose military reforms reshaped Southern Africa.' },
  { name: 'Funmilayo Ransome-Kuti', era: '1900–1978 · Yoruba', img: img('sepia-portrait'), text: 'Educator and activist who led the Abeokuta Women’s Union and fought for women’s suffrage.' },
  { name: 'Wangari Maathai', era: '1940–2011 · Kikuyu', img: img('sisters'), text: 'Founder of the Green Belt Movement and the first African woman to win the Nobel Peace Prize.' },
]
export function HallOfFame() {
  const [open, setOpen] = useState<(typeof LEGENDS)[number] | null>(null)
  return (
    <Page wide>
      <PageHeader eyebrow="Editorial archive" title="Hall of Fame" later sub="Past & Great Africans — remembered by the people who carry their stories." />
      <LaterBanner>It isn’t shown in core navigation unless the roadmap promotes it.</LaterBanner>
      <div className="grid-3">
        {LEGENDS.map((l, k) => (
          <motion.button key={l.name} className="card hover-lift" style={{ overflow: 'hidden', textAlign: 'left' }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.05 }} onClick={() => setOpen(l)}>
            <div className="media" style={{ height: 220 }}>
              <img src={l.img} alt="" style={{ filter: 'grayscale(.35) sepia(.15)' }} />
              <span className="tag gold" style={{ position: 'absolute', top: 12, left: 12 }}>
                <Medal size={10} variant="Bold" /> Hall of Fame
              </span>
            </div>
            <div className="stack gap-1" style={{ padding: 16 }}>
              <span className="h3">{l.name}</span>
              <span className="xs gold">{l.era}</span>
              <p className="small muted clamp-2 mt-2">{l.text}</p>
            </div>
          </motion.button>
        ))}
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name} wide>
        {open && (
          <div className="stack gap-3">
            <img src={open.img} alt="" style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 12 }} />
            <span className="small gold">{open.era}</span>
            <p style={{ lineHeight: 1.7 }}>{open.text}</p>
            <Decision>How people are nominated and who approves Hall of Fame entries isn’t defined.</Decision>
          </div>
        )}
      </Modal>
    </Page>
  )
}

/* ─────────── Screens 37 & 38 — Family Profile + Root Tree ─────────── */
export function Family() {
  const family = useApp((s) => s.family)
  const add = useApp((s) => s.addFamily)
  const remove = useApp((s) => s.removeFamily)
  const me = useApp((s) => s.me)
  const toast = useApp((s) => s.toast)
  const [tab, setTab] = useState<'Root Tree' | 'Family Profile'>('Root Tree')
  const [open, setOpen] = useState(false)
  const [f, setF] = useState<{ mode: 'username' | 'name'; name: string; relation: FamilyMember['relation']; bio: FamilyMember['bio']; position: string }>({ mode: 'username', name: '', relation: 'Sibling', bio: 'Biological', position: '' })
  const [zoom, setZoom] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const groups = useMemo(
    () => ({
      Grandparent: family.filter((m) => m.relation === 'Grandparent'),
      Parent: family.filter((m) => m.relation === 'Parent'),
      Sibling: family.filter((m) => m.relation === 'Sibling'),
      Spouse: family.filter((m) => m.relation === 'Spouse'),
      Child: family.filter((m) => m.relation === 'Child'),
    }),
    [family],
  )
  const node = (m: FamilyMember, k: number) => (
    <motion.button key={m.id} layout className={cx('tree-node', selected === m.id && 'me')} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: k * 0.04, type: 'spring' }} onClick={() => setSelected(selected === m.id ? null : m.id)}>
      <Avatar name={m.name} src={m.username ? getUser(m.username)?.avatar : undefined} size={40} />
      <span className="small strong">{m.name}</span>
      <span className="xs faint">
        {m.position || m.relation}
        {m.bio === 'Adopted' && ' · Adopted'}
      </span>
      {selected === m.id && (
        <span
          className="btn btn-danger btn-xs mt-2"
          role="button"
          onClick={(e) => {
            e.stopPropagation()
            remove(m.id)
            setSelected(null)
            toast(`${m.name} removed from your tree`)
          }}
        >
          <Trash size={12} /> Remove
        </span>
      )}
    </motion.button>
  )
  return (
    <Page wide>
      <PageHeader
        title="Family"
        later
        sub="Family data is kept separate from your personal profile — it drives your Root Tree."
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            <Add size={16} /> Add member
          </button>
        }
      />
      <LaterBanner />
      <Tabs tabs={['Root Tree', 'Family Profile'] as const} value={tab} onChange={setTab} />
      {tab === 'Root Tree' ? (
        <div className="stack gap-3">
          <div className="row gap-2">
            <button className="icon-btn filled sm" onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))} aria-label="Zoom out">
              <Minus size={16} />
            </button>
            <span className="xs muted" style={{ width: 44, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button className="icon-btn filled sm" onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))} aria-label="Zoom in">
              <Add size={16} />
            </button>
            <span className="xs faint">Click a person to manage them.</span>
          </div>
          <div className="tree-canvas">
            <motion.div animate={{ scale: zoom }} style={{ transformOrigin: 'top center', padding: 40, minWidth: 720 }} className="stack gap-8" >
              {(['Grandparent', 'Parent'] as const).map((g) =>
                groups[g].length ? (
                  <div key={g} className="stack gap-3" style={{ alignItems: 'center' }}>
                    <span className="eyebrow">{g === 'Grandparent' ? 'Grandparents' : 'Parents'}</span>
                    <div className="row gap-4 center wrap">{groups[g].map(node)}</div>
                    <span style={{ width: 2, height: 28, background: 'var(--line-2)' }} />
                  </div>
                ) : null,
              )}
              <div className="row gap-4 center wrap" style={{ alignItems: 'flex-start' }}>
                <div className="stack gap-2" style={{ alignItems: 'center' }}>
                  <div className="tree-node me">
                    <Avatar src={me.avatar} name={me.firstName} size={48} ring />
                    <span className="small strong">
                      {me.firstName} {me.lastName}
                    </span>
                    <span className="xs gold">You</span>
                  </div>
                </div>
                {groups.Spouse.map(node)}
                {groups.Sibling.length > 0 && (
                  <div className="stack gap-2" style={{ alignItems: 'center', paddingLeft: 24, borderLeft: '2px dashed var(--line-2)' }}>
                    <span className="eyebrow">Siblings</span>
                    <div className="row gap-3 wrap">{groups.Sibling.map(node)}</div>
                  </div>
                )}
              </div>
              {groups.Child.length > 0 && (
                <div className="stack gap-3" style={{ alignItems: 'center' }}>
                  <span style={{ width: 2, height: 28, background: 'var(--line-2)' }} />
                  <span className="eyebrow">Children</span>
                  <div className="row gap-4 center wrap">{groups.Child.map(node)}</div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {(['Parent', 'Sibling', 'Child', 'Spouse', 'Grandparent'] as const).map((g) => (
            <div key={g} className="panel panel-pad stack gap-3">
              <span className="row between">
                <span className="strong">{g === 'Child' ? 'Children' : `${g}s`}</span>
                <span className="xs faint">{groups[g].length}</span>
              </span>
              {groups[g].length === 0 && <span className="xs muted">None added</span>}
              {groups[g].map((m) => (
                <div key={m.id} className="row gap-3">
                  <Avatar name={m.name} size={34} />
                  <span className="stack grow">
                    <span className="small strong">{m.name}</span>
                    <span className="xs faint">
                      {m.position || g} · {m.bio}
                    </span>
                  </span>
                  <button className="icon-btn sm" aria-label={`Remove ${m.name}`} onClick={() => remove(m.id)}>
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add family member"
        footer={
          <button
            className="btn btn-primary"
            disabled={!f.name.trim()}
            onClick={() => {
              const u = f.mode === 'username' ? getUser(f.name.replace('@', '')) : undefined
              add({ name: u ? u.name : f.name.trim(), username: u ? u.id : undefined, relation: f.relation, bio: f.bio, position: f.position || undefined })
              toast('Added to your Root Tree', 'success')
              setOpen(false)
              setF({ ...f, name: '', position: '' })
            }}
          >
            Add to tree
          </button>
        }
      >
        <div className="stack gap-4">
          <Tabs tabs={['Search username', 'Add by full name'] as const} value={f.mode === 'username' ? 'Search username' : 'Add by full name'} onChange={(v) => setF({ ...f, mode: v === 'Search username' ? 'username' : 'name' })} fill />
          <Input label={f.mode === 'username' ? 'Username' : 'Full name'} placeholder={f.mode === 'username' ? 'e.g. kwame (try “kwame” or “zola”)' : 'e.g. Adaobi Eze'} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} hint={f.mode === 'username' && f.name && getUser(f.name.replace('@', '')) ? `Found: ${getUser(f.name.replace('@', ''))!.name}` : undefined} />
          <div className="form-grid">
            <Select label="Relationship" value={f.relation} onChange={(e) => setF({ ...f, relation: e.target.value as FamilyMember['relation'] })}>
              {['Parent', 'Sibling', 'Child', 'Spouse', 'Grandparent'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
            <Select label="Biological / adopted" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value as FamilyMember['bio'] })}>
              <option>Biological</option>
              <option>Adopted</option>
            </Select>
            <Input className="span-2" label="Sibling / family position (optional)" placeholder="e.g. First son, Second daughter, Mother" value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} />
          </div>
        </div>
      </Modal>
    </Page>
  )
}

/* ─────────── Screen 42 — Going live ─────────── */
export function GoLive() {
  const toast = useApp((s) => s.toast)
  const [cam, setCam] = useState<'off' | 'on' | 'denied'>('off')
  const [mic, setMic] = useState(true)
  const [live, setLive] = useState(false)
  const [secs, setSecs] = useState(0)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [aud, setAud] = useState('Public')
  const vRef = useRef<HTMLVideoElement>(null)
  const sRef = useRef<MediaStream | null>(null)
  useEffect(() => () => sRef.current?.getTracks().forEach((t) => t.stop()), [])
  useEffect(() => {
    if (!live) return
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [live])
  const turnOn = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      sRef.current = s
      setCam('on')
      setTimeout(() => vRef.current && (vRef.current.srcObject = s), 30)
    } catch {
      setCam('denied')
    }
  }
  return (
    <Page wide>
      <PageHeader title="Go Live" later sub="A live creation studio. Not core MVP navigation unless the roadmap says otherwise." />
      <LaterBanner />
      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', alignItems: 'start' }}>
        <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 16, overflow: 'hidden', background: '#050806', display: 'grid', placeItems: 'center', color: '#f4efe6' }}>
          {cam === 'on' ? (
            <video ref={vRef} autoPlay muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          ) : cam === 'denied' ? (
            <div className="stack gap-2" style={{ alignItems: 'center', textAlign: 'center', padding: 20 }}>
              <Warning2 size={34} color="#fbbf24" />
              <strong>Camera blocked</strong>
              <span className="small" style={{ opacity: 0.8 }}>Allow camera access in your browser to go live.</span>
              <button className="btn btn-gold btn-sm" onClick={turnOn}>
                Try again
              </button>
            </div>
          ) : (
            <button className="btn btn-gold" onClick={turnOn}>
              <Camera size={18} /> Turn on camera
            </button>
          )}
          {live && (
            <span className="tag red" style={{ position: 'absolute', top: 14, left: 14, background: '#dc2626', color: '#fff', height: 26 }}>
              ● LIVE {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
            </span>
          )}
          {live && (
            <span className="tag" style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,.5)', color: '#fff', height: 26 }}>
              <Eye size={12} /> {Math.floor(secs * 1.7)}
            </span>
          )}
          <div className="row gap-2" style={{ position: 'absolute', bottom: 14, left: '50%', translate: '-50% 0' }}>
            <button className="icon-btn round" style={{ background: 'rgba(0,0,0,.5)', color: mic ? '#fff' : '#f87171' }} onClick={() => setMic(!mic)} aria-label={mic ? 'Mute microphone' : 'Unmute microphone'}>
              <Microphone2 size={18} />
            </button>
            <button className="icon-btn round" style={{ background: 'rgba(0,0,0,.5)', color: '#fff' }} onClick={() => (cam === 'on' ? (sRef.current?.getTracks().forEach((t) => t.stop()), setCam('off')) : turnOn())} aria-label="Toggle camera">
              <Video size={18} />
            </button>
          </div>
        </div>
        <div className="card stack gap-4" style={{ padding: 20 }}>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Live from the Osun-Osogbo festival" />
          <Textarea label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
          <Select label="Audience" value={aud} onChange={(e) => setAud(e.target.value)}>
            <option>Public</option>
            <option>Raiders only</option>
            <option>Friends only</option>
          </Select>
          {live ? (
            <button className="btn btn-danger btn-lg" onClick={() => (setLive(false), setSecs(0), toast('Live ended. A replay will be available once review rules are defined.'))}>
              End live
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" disabled={cam !== 'on' || !title.trim()} onClick={() => (setLive(true), toast('You’re live (simulated)', 'success'))}>
              Go Live
            </button>
          )}
          <Decision>Whether live streams are moderated by Historians, saved as Scrolls, or limited by plan isn’t specified.</Decision>
        </div>
      </div>
    </Page>
  )
}

/* ─────────── Screen 43 — Share location ─────────── */
export function ShareLocation() {
  const loc = useApp((s) => s.location)
  const set = useApp((s) => s.setLocation)
  const toast = useApp((s) => s.toast)
  const [coords, setCoords] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'asking' | 'denied'>('idle')
  const [selected, setSelected] = useState<string[]>([])
  const options = [
    ['nobody', 'Nobody', 'Your location is never shared'],
    ['friends', 'Friends', 'People you’ve connected with as friends'],
    ['raiders', 'Raiders', 'Everyone raiding you'],
    ['selected', 'Selected people', 'Only the people you choose'],
  ] as const
  return (
    <Page narrow>
      <PageHeader title="Share Location" later />
      <LaterBanner />
      <div className="card stack gap-4" style={{ padding: 22 }}>
        <span className="strong">Choose who can see your location</span>
        {options.map(([v, t, s]) => (
          <button key={v} className={cx('radio-card', loc.audience === v && 'is-on')} onClick={() => set({ audience: v })}>
            <span className="radio-dot" />
            <span className="stack">
              <span className="small strong">{t}</span>
              <span className="xs muted">{s}</span>
            </span>
          </button>
        ))}
        {loc.audience === 'selected' && (
          <div className="row gap-2 wrap">
            {['kwame', 'adaeze', 'zola', 'kofi'].map((id) => {
              const u = getUser(id)!
              const on = selected.includes(id)
              return (
                <button key={id} className={cx('chip', on && 'is-on')} onClick={() => setSelected(on ? selected.filter((x) => x !== id) : [...selected, id])}>
                  <Avatar user={u} size={20} /> {u.name}
                </button>
              )
            })}
          </div>
        )}
        <div className="setting-row" style={{ padding: '8px 0' }}>
          <Location size={20} color="var(--accent)" />
          <span className="stack grow">
            <span className="small strong">{loc.sharing ? 'Sharing location' : 'Not sharing'}</span>
            <span className="xs muted">{coords ?? (state === 'denied' ? 'Location permission was denied in your browser.' : 'We’ll ask your browser for permission.')}</span>
          </span>
          {loc.sharing && <Switch checked onChange={() => (set({ sharing: false }), setCoords(null), toast('Stopped sharing location'))} label="Stop sharing" />}
        </div>
        {!loc.sharing && (
          <button
            className="btn btn-primary"
            disabled={loc.audience === 'nobody' || state === 'asking'}
            onClick={() => {
              setState('asking')
              if (!navigator.geolocation) {
                setState('denied')
                return
              }
              navigator.geolocation.getCurrentPosition(
                (p) => {
                  setState('idle')
                  setCoords(`${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)} (approximate)`)
                  set({ sharing: true })
                  toast('Location shared', 'success')
                },
                () => setState('denied'),
                { timeout: 8000 },
              )
            }}
          >
            {state === 'asking' ? <Spinner /> : 'Share location'}
          </button>
        )}
        <Decision>The source lists Share Location as later-stage but doesn’t define permissions, precision or duration. Exact privacy behaviour needs product definition before implementation.</Decision>
      </div>
    </Page>
  )
}

