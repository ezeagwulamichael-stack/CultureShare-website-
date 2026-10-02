import { useState } from 'react'
import { asset } from '../data/seed'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Crown1, TickCircle, MessageQuestion, Flag, Eye, Timer1 } from 'iconsax-react'
import { useApp } from '../store/useApp'
import { Page, PageHeader } from '../components/Shell'
import { ScrollMedia, CultureMeta } from '../components/content'
import { Avatar, Decision, Empty, Spinner, Tabs, Textarea, Callout } from '../components/ui'
import { cx, timeAgo, useUser, wait } from '../lib/util'
import type { Scroll } from '../data/types'

/* ─────────── Screen 30 — Historian dashboard ─────────── */
export function HistorianDesk() {
  const role = useApp((s) => s.me.role)
  const scrolls = useApp((s) => s.scrolls)
  const updateMe = useApp((s) => s.updateMe)
  const [tab, setTab] = useState<'Pending validation' | 'Clarification requested' | 'Recently validated'>('Pending validation')
  if (role !== 'historian') {
    return (
      <Page narrow>
        <Empty
          icon={<Crown1 size={26} variant="Bulk" />}
          title="Historians only"
          text="The Historian desk is for authorised Historians who provide secondary accreditation of Scrolls."
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => updateMe({ role: 'historian' })}>
              Prototype: preview as Historian
            </button>
          }
        />
      </Page>
    )
  }
  const pending = scrolls.filter((s) => s.status === 'under_review' && s.review?.[0].state === 'approved' && s.review?.[1].state !== 'clarification')
  const waitingCS = scrolls.filter((s) => s.status === 'under_review' && s.review?.[0].state !== 'approved')
  const clar = scrolls.filter((s) => s.review?.[1].state === 'clarification')
  const done = scrolls.filter((s) => s.status === 'published' && s.historianId === 'kofi').slice(0, 6)
  const list = tab === 'Pending validation' ? pending : tab === 'Clarification requested' ? clar : done
  return (
    <Page wide>
      <PageHeader eyebrow="Historian desk" title="Pending validation" sub="Scrolls cleared by CultureShare’s first review, waiting for your cultural accreditation." />
      <div className="grid-4">
        {[
          ['Pending', pending.length, 'var(--accent-text)'],
          ['Awaiting CultureShare', waitingCS.length, 'var(--text-3)'],
          ['Clarification', clar.length, 'var(--warning)'],
          ['Validated (30d)', done.length, 'var(--success)'],
        ].map(([l, n, c]) => (
          <motion.div key={l as string} className="kpi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <strong style={{ color: c as string }}>{n as number}</strong>
            <span className="xs muted">{l as string}</span>
          </motion.div>
        ))}
      </div>
      <Tabs tabs={['Pending validation', 'Clarification requested', 'Recently validated'] as const} value={tab} onChange={setTab} counts={{ 'Pending validation': pending.length, 'Clarification requested': clar.length }} />
      {list.length === 0 ? (
        <Empty icon={<TickCircle size={26} variant="Bulk" />} title="Nothing here" text={tab === 'Pending validation' ? 'You’re up to date. New submissions appear once CultureShare clears them.' : 'No Scrolls in this state.'} />
      ) : (
        <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="matrix" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th>Scroll</th>
                <th>Creator</th>
                <th>Culture</th>
                <th>Submitted</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <QueueRow key={s.id} s={s} done={tab === 'Recently validated'} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Decision>The functionality document establishes the Historian role but not a complete permission model. The actions here (validate, request clarification, flag) need final sign-off from the CultureShare team.</Decision>
    </Page>
  )
}

function QueueRow({ s, done }: { s: Scroll; done: boolean }) {
  const creator = useUser(s.creatorId)
  const nav = useNavigate()
  return (
    <tr style={{ cursor: 'pointer' }} onClick={() => nav(done ? `/scroll/${s.id}` : `/historian/review/${s.id}`)}>
      <td>
        <span className="row gap-3">
          <img src={s.images[0] ?? asset('songs-sky.webp')} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
          <span className="stack" style={{ textAlign: 'left' }}>
            <span className="small strong">{s.title}</span>
            <span className="xs faint">{s.kind === 'documentary' ? 'Documentary' : 'Reel'}</span>
          </span>
        </span>
      </td>
      <td>
        <span className="row gap-2 small" style={{ justifyContent: 'center' }}>
          <Avatar user={creator} size={24} /> {creator?.name}
        </span>
      </td>
      <td className="small">
        {s.flag} {s.tribe} · {s.category}
      </td>
      <td className="xs muted">{timeAgo(s.createdAt)} ago</td>
      <td>
        <button className={cx('btn btn-xs', done ? 'btn-secondary' : 'btn-primary')}>{done ? <><Eye size={14} /> View</> : 'Review'}</button>
      </td>
    </tr>
  )
}

export function HistorianReview() {
  const { id } = useParams()
  const s = useApp((st) => st.scrolls.find((x) => x.id === id))
  const decide = useApp((st) => st.historianDecision)
  const toast = useApp((st) => st.toast)
  const creator = useUser(s?.creatorId)
  const nav = useNavigate()
  const [note, setNote] = useState('')
  const [checks, setChecks] = useState({ accurate: false, attributed: false, consent: false })
  const [busy, setBusy] = useState<string | null>(null)
  if (!s) return <Page narrow><Empty icon={<Crown1 size={26} />} title="Scroll not found" text="" /></Page>
  const act = async (d: 'approve' | 'clarify' | 'flag') => {
    setBusy(d)
    await wait(800)
    decide(s.id, d, note || undefined)
    setBusy(null)
    toast(d === 'approve' ? `Validated — “${s.title}” is now published` : d === 'clarify' ? 'Clarification requested from the creator' : 'Flagged for CultureShare review', d === 'approve' ? 'success' : 'info')
    nav('/historian')
  }
  const allChecked = Object.values(checks).every(Boolean)
  return (
    <Page wide>
      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', alignItems: 'start', gap: 24 }}>
        <section className="card" style={{ overflow: 'hidden' }}>
          <ScrollMedia scroll={s} height={420} />
          <div className="stack gap-3" style={{ padding: 20 }}>
            <h1 className="h2">{s.title}</h1>
            <CultureMeta scroll={s} />
            <p style={{ lineHeight: 1.65, color: 'var(--text-2)', whiteSpace: 'pre-line' }}>{s.caption}</p>
          </div>
        </section>
        <aside className="stack gap-4">
          <div className="panel stack gap-3" style={{ padding: 18 }}>
            <span className="eyebrow">Submission</span>
            <div className="row gap-3">
              <Avatar user={creator} size={40} />
              <span className="stack">
                <Link to={`/u/${creator?.id}`} className="small strong">
                  {creator?.name}
                </Link>
                <span className="xs faint">{creator?.tagline}</span>
              </span>
            </div>
            <div className="meta-grid">
              <div className="meta-cell">
                <span className="k">Country</span>
                <span className="v">
                  {s.flag} {s.country}
                </span>
              </div>
              <div className="meta-cell">
                <span className="k">Tribe</span>
                <span className="v">{s.tribe}</span>
              </div>
              <div className="meta-cell">
                <span className="k">Category</span>
                <span className="v">{s.category}</span>
              </div>
              <div className="meta-cell">
                <span className="k">CultureShare review</span>
                <span className="v" style={{ color: 'var(--success)' }}>
                  Cleared
                </span>
              </div>
            </div>
          </div>
          <div className="panel stack gap-3" style={{ padding: 18 }}>
            <span className="eyebrow gold">Historian assessment</span>
            {(
              [
                ['accurate', 'Cultural content is accurate'],
                ['attributed', 'Country, tribe and category are correct'],
                ['consent', 'Sacred or restricted practice is shared with permission'],
              ] as const
            ).map(([k, l]) => (
              <label key={k} className="checkbox" style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-2)', alignItems: 'center' }}>
                <input type="checkbox" checked={checks[k]} onChange={() => setChecks({ ...checks, [k]: !checks[k] })} /> {l}
              </label>
            ))}
            <Textarea label="Notes to creator" placeholder="Context, corrections or sources…" value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
            <button className="btn btn-primary" disabled={!allChecked || !!busy} onClick={() => act('approve')}>
              {busy === 'approve' ? <Spinner /> : <><TickCircle size={18} /> Validate</>}
            </button>
            <div className="grid-2" style={{ gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={!note.trim() || !!busy} onClick={() => act('clarify')}>
                {busy === 'clarify' ? <Spinner /> : <><MessageQuestion size={16} /> Request clarification</>}
              </button>
              <button className="btn btn-danger btn-sm" disabled={!!busy} onClick={() => act('flag')}>
                {busy === 'flag' ? <Spinner /> : <><Flag size={16} /> Flag for review</>}
              </button>
            </div>
            {!allChecked && <span className="xs faint">Tick all three checks to validate.</span>}
          </div>
          <Callout icon={<Timer1 size={18} />}>
            <span className="xs">Validating publishes the Scroll to the creator’s Raiders immediately.</span>
          </Callout>
        </aside>
      </div>
    </Page>
  )
}
