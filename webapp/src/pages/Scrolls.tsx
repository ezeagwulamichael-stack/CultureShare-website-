import { useEffect, useMemo, useState } from 'react'
import { asset } from '../data/seed'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft2, ArrowRight2, Book1, DocumentText, Edit2, Eye, Lock1, Message, Slash, TickCircle, Timer1, Warning2, Coin1, InfoCircle, Danger, Add } from 'iconsax-react'
import { useShallow } from 'zustand/react/shallow'
import { useApp } from '../store/useApp'
import { useUI } from '../store/useUI'
import type { Scroll, ScrollStatus } from '../data/types'
import { Page, PageHeader } from '../components/Shell'
import { CultureMeta, DZ_LABEL, EngageBar, ScrollCard, ScrollRow } from '../components/content'
import { CommentThread } from '../components/sheets'
import { AudioBlock, Avatar, CardSkeleton, Callout, Decision, Empty, HistorianBadge, LaterBadge, NameLine, RaidButton, SectionHead, Segmented, Tabs } from '../components/ui'
import { compact, cx, timeAgo, useUser } from '../lib/util'
import { StatusRail, useBoot } from './Home'

/* ─────────── Scrolls tab ─────────── */
export function ScrollsFeed() {
  const scrolls = useApp((s) => s.scrolls)
  const [kind, setKind] = useState<'All' | 'Reels' | 'Documentaries'>('All')
  const [cat, setCat] = useState('All')
  const ready = useBoot(450)
  const nav = useNavigate()
  const list = scrolls.filter((s) => s.status === 'published' && (kind === 'All' || (kind === 'Reels' ? s.kind === 'reel' : s.kind === 'documentary')) && (cat === 'All' || s.category === cat))
  const cats = ['All', ...new Set(scrolls.filter((s) => s.status === 'published').map((s) => s.category))]
  return (
    <Page rail={<ScrollsRail />}>
      <PageHeader
        title="Scrolls"
        sub="Structured cultural media — reels and documentaries, reviewed by CultureShare and validated by Historians."
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => nav('/create/scroll')}>
            <Add size={18} /> Create Scroll
          </button>
        }
      />
      <StatusRail />
      <div className="row between wrap gap-3">
        <Segmented options={['All', 'Reels', 'Documentaries'] as const} value={kind} onChange={setKind} />
        <Link to="/scrolls/mine" className="link small row gap-1">
          My Scrolls & review status <ArrowRight2 size={14} />
        </Link>
      </div>
      <div className="chip-row">
        {cats.map((c) => (
          <button key={c} className={cx('chip', cat === c && 'is-on')} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      {!ready ? (
        <CardSkeleton />
      ) : list.length === 0 ? (
        <Empty icon={<Book1 size={26} variant="Bulk" />} title="No Scrolls here yet" text={`There are no ${kind === 'All' ? '' : kind.toLowerCase() + ' '}Scrolls in ${cat} yet. Be the first to document it.`} action={<button className="btn btn-primary btn-sm" onClick={() => nav('/create/scroll')}>Create a Scroll</button>} />
      ) : (
        <div className="stack gap-5">
          {list.map((s, k) => (
            <ScrollCard key={s.id} scroll={s} index={k} />
          ))}
        </div>
      )}
    </Page>
  )
}

function ScrollsRail() {
  const mine = useApp(useShallow((s) => s.scrolls.filter((x) => x.creatorId === 'me')))
  const counts = { draft: 0, under_review: 0, published: 0, restricted: 0 } as Record<ScrollStatus, number>
  mine.forEach((m) => counts[m.status]++)
  return (
    <>
      <div className="panel panel-pad">
        <SectionHead title="Your publishing pipeline" to="/scrolls/mine" />
        <div className="grid-2" style={{ gap: 8 }}>
          {(['draft', 'under_review', 'published', 'restricted'] as ScrollStatus[]).map((k) => (
            <Link key={k} to={`/scrolls/mine?tab=${k}`} className="kpi" style={{ padding: 12 }}>
              <strong style={{ fontSize: '1.3rem' }}>{counts[k]}</strong>
              <span className="xs muted">{STATUS_LABEL[k]}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="panel panel-pad">
        <SectionHead title="Historians" to="/discover/people?role=historian" />
        <div className="stack gap-3">
          {['kofi', 'tariro'].map((id) => (
            <HistorianMini key={id} id={id} />
          ))}
        </div>
      </div>
    </>
  )
}

function HistorianMini({ id }: { id: string }) {
  const u = useUser(id)
  if (!u) return null
  return (
    <div className="row gap-3">
      <Avatar user={u} size={38} />
      <Link to={`/u/${u.id}`} className="stack grow" style={{ minWidth: 0 }}>
        <span className="small strong ellipsis">{u.name}</span>
        <span className="xs faint ellipsis">{u.specialty}</span>
      </Link>
      <RaidButton userId={u.id} size="sm" />
    </div>
  )
}

export const STATUS_LABEL: Record<ScrollStatus, string> = { draft: 'Drafts', under_review: 'Under review', published: 'Published', restricted: 'Restricted' }

/* ─────────── Screen 10 — Scroll detail ─────────── */
export function ScrollDetail() {
  const { id } = useParams()
  const scroll = useApp((s) => s.scrolls.find((x) => x.id === id))
  const bought = useApp((s) => (id ? s.bought.includes(id) : false))
  const startConv = useApp((s) => s.startConversation)
  const nav = useNavigate()
  const creator = useUser(scroll?.anonymous ? 'rogue' : scroll?.creatorId)
  const historian = useUser(scroll?.historianId)
  const ready = useBoot(350)
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    setI(0)
    setPlaying(false)
    setProgress(0)
  }, [id])
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setProgress((p) => (p >= 100 ? (setPlaying(false), 100) : p + 0.4)), 100)
    return () => clearInterval(t)
  }, [playing])
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea')) return
      if (!scroll) return
      if (e.key === 'ArrowRight') setI((x) => Math.min(scroll.images.length - 1, x + 1))
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1))
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [scroll])

  if (!scroll) {
    return (
      <Page narrow>
        <Empty icon={<Book1 size={26} variant="Bulk" />} title="This Scroll isn’t available" text="It may have been removed by its creator, or the link is wrong." action={<Link className="btn btn-primary btn-sm" to="/scrolls">Browse Scrolls</Link>} />
      </Page>
    )
  }
  const mine = scroll.creatorId === 'me'
  if (!mine && scroll.status !== 'published') {
    return (
      <Page narrow>
        <Empty icon={<Lock1 size={26} variant="Bulk" />} title={scroll.status === 'restricted' ? 'This Scroll is restricted' : 'Not published yet'} text={scroll.status === 'restricted' ? 'CultureShare has restricted this Scroll after review. It can’t be viewed right now.' : 'This Scroll is still being reviewed by CultureShare and its Historian.'} />
      </Page>
    )
  }
  if (scroll.darkZone?.state === 'restricted' || scroll.darkZone?.state === 'dropped') {
    return (
      <Page narrow>
        <Empty icon={<Slash size={26} />} title={`Dark Zone · ${DZ_LABEL[scroll.darkZone.state]}`} text={scroll.darkZone.reason} action={<Link className="btn btn-secondary btn-sm" to="/dark-zone">Back to Dark Zone</Link>} />
      </Page>
    )
  }
  const visibility = { public: 'Public', raiders: 'Private to Raiders', friends: 'Private to friends' }[scroll.visibility]
  const imgs = scroll.images.length ? scroll.images : [asset('songs-sky.webp')]

  return (
    <div className="scroll-detail">
      <section className="sd-media" aria-label="Scroll media">
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          {scroll.media === 'audio' ? (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 32, background: `linear-gradient(rgba(7,14,9,.5), rgba(7,14,9,.85)), url(${imgs[0]}) center/cover` }}>
              <div style={{ width: 'min(560px, 100%)' }}>
                <AudioBlock title="The Griot’s Song — Oral Transmission" duration={scroll.duration} />
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img key={imgs[i]} src={imgs[i]} alt={scroll.title} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: playing ? 1.08 : 1 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 0.4 }, scale: { duration: playing ? 20 : 0.5, ease: 'linear' } }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
              </AnimatePresence>
              <div style={{ position: 'absolute', inset: 0, background: `url(${imgs[i]}) center/cover`, filter: 'blur(40px) brightness(.35)', transform: 'scale(1.2)', zIndex: -1 }} />
              {scroll.media === 'video' && !playing && (
                <button className="play-btn" style={{ width: 72, height: 72 }} onClick={() => setPlaying(true)} aria-label="Play">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}
              {imgs.length > 1 && (
                <>
                  <button className="story-nav" style={{ left: 16, opacity: i === 0 ? 0.3 : 1 }} disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Previous image">
                    <ArrowLeft2 size={20} />
                  </button>
                  <button className="story-nav" style={{ right: 16, opacity: i === imgs.length - 1 ? 0.3 : 1 }} disabled={i === imgs.length - 1} onClick={() => setI(i + 1)} aria-label="Next image">
                    <ArrowRight2 size={20} />
                  </button>
                </>
              )}
            </>
          )}
        </div>
        {scroll.media === 'video' && (
          <div className="row gap-3" style={{ padding: '10px 16px', color: '#fff', background: '#050806' }}>
            <button onClick={() => setPlaying((p) => !p)} className="icon-btn sm" style={{ color: '#fff' }} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? '❚❚' : '▶'}
            </button>
            <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'rgba(255,255,255,.2)', cursor: 'pointer' }} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setProgress(((e.clientX - r.left) / r.width) * 100) }}>
              <div style={{ width: `${progress}%`, height: '100%', borderRadius: 4, background: 'var(--brand-gold)' }} />
            </div>
            <span className="xs" style={{ opacity: 0.7 }}>{scroll.duration}</span>
          </div>
        )}
        {imgs.length > 1 && (
          <div className="row gap-2" style={{ padding: 12, justifyContent: 'center', background: '#050806' }}>
            {imgs.map((src, k) => (
              <button key={src} onClick={() => setI(k)} aria-label={`Show image ${k + 1}`} style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', outline: k === i ? '2px solid var(--brand-gold)' : '1px solid rgba(255,255,255,.15)', opacity: k === i ? 1 : 0.6, transition: 'all .2s' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </section>

      <aside className="sd-info">
        {!ready ? (
          <div className="stack gap-3">
            <CardSkeleton />
          </div>
        ) : (
          <>
            {mine && scroll.status !== 'published' && <ReviewPanel scroll={scroll} />}
            {creator && (
              <div className="row gap-3">
                <Link to={creator.id === 'rogue' ? '#' : creator.id === 'me' ? '/profile' : `/u/${creator.id}`}>
                  <Avatar user={creator} size={46} />
                </Link>
                <div className="stack grow" style={{ minWidth: 0 }}>
                  <NameLine user={creator} />
                  <span className="xs faint">
                    {creator.tagline} · {timeAgo(scroll.createdAt)}
                  </span>
                </div>
                {!scroll.anonymous && creator.id !== 'me' && (
                  <>
                    <button className="icon-btn filled sm" aria-label="Message creator" onClick={() => nav(`/messages/${startConv(creator.id)}`)}>
                      <Message size={16} />
                    </button>
                    <RaidButton userId={creator.id} solid />
                  </>
                )}
              </div>
            )}
            <div className="stack gap-2">
              <div className="row gap-2 wrap">
                <span className="tag gold">{scroll.kind === 'documentary' ? 'Documentary Scroll' : 'Reel Scroll'}</span>
                {scroll.darkZone && <span className="tag dark">◐ Dark Zone · {DZ_LABEL[scroll.darkZone.state]}</span>}
                {scroll.visibility !== 'public' && (
                  <span className="tag">
                    <Lock1 size={10} /> {visibility}
                  </span>
                )}
              </div>
              <h1 className="h2" style={{ fontSize: '1.6rem' }}>
                {scroll.title}
              </h1>
              <CultureMeta scroll={scroll} />
            </div>
            <div className="row gap-2 wrap">
              {scroll.tags.map((t) => (
                <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="tag">
                  #{t.replace(/\s/g, '')}
                </Link>
              ))}
            </div>
            <p style={{ lineHeight: 1.7, color: 'var(--text-2)', whiteSpace: 'pre-line' }}>{scroll.caption}</p>
            {(scroll.people?.length || scroll.location || scroll.music) && (
              <div className="stack gap-1 small muted">
                {scroll.location && <span>📍 {scroll.location}</span>}
                {scroll.music && <span>♪ {scroll.music}</span>}
                {scroll.people?.length ? <span>With {scroll.people.join(', ')}</span> : null}
              </div>
            )}
            <div className="meta-grid">
              <Link className="meta-cell" to={`/search?country=${scroll.country}`}>
                <span className="k">Country</span>
                <span className="v">
                  {scroll.flag} {scroll.country}
                </span>
              </Link>
              <Link className="meta-cell" to={`/search?tribe=${scroll.tribe}`}>
                <span className="k">Tribe</span>
                <span className="v">{scroll.tribe}</span>
              </Link>
              <Link className="meta-cell" to={`/search?topic=${scroll.category}`}>
                <span className="k">Category</span>
                <span className="v">{scroll.category}</span>
              </Link>
              <div className="meta-cell">
                <span className="k">Views</span>
                <span className="v row gap-1">
                  <Eye size={14} /> {compact(scroll.views)}
                </span>
              </div>
            </div>
            {historian && scroll.status === 'published' && (
              <div className="panel" style={{ padding: 14, borderColor: 'var(--accent-line)', background: 'linear-gradient(135deg, var(--accent-soft), transparent)' }}>
                <div className="row gap-3">
                  <Avatar user={historian} size={40} />
                  <div className="stack grow" style={{ minWidth: 0 }}>
                    <span className="row gap-2 small strong">
                      {historian.name} <HistorianBadge />
                    </span>
                    <span className="xs muted">Validated this Scroll · {historian.specialty}</span>
                  </div>
                  <TickCircle size={22} color="var(--success)" variant="Bold" />
                </div>
              </div>
            )}
            {scroll.darkZone && (
              <Callout kind="warn" icon={<Slash size={18} />}>
                <strong>Why this is in the Dark Zone.</strong> {scroll.darkZone.reason}{' '}
                <Link to="/dark-zone" className="link">
                  About the Dark Zone
                </Link>
              </Callout>
            )}
            {scroll.price && <PurchasePanel scroll={scroll} bought={bought} />}
            <EngageBar id={scroll.id} likes={scroll.likes} comments={scroll.comments} saves={scroll.saves} darkZone={!!scroll.darkZone} creatorId={scroll.creatorId} onComments={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })} />
            <section id="comments" className="stack gap-3">
              <h2 className="h3">Comments</h2>
              <CommentThread targetId={scroll.id} />
            </section>
            <MoreFrom scroll={scroll} />
          </>
        )}
      </aside>
    </div>
  )
}

function PurchasePanel({ scroll, bought }: { scroll: Scroll; bought: boolean }) {
  return (
    <div className="panel" style={{ padding: 14 }}>
      <div className="row gap-3">
        <Coin1 size={22} color="var(--accent)" variant="Bulk" />
        <div className="stack grow">
          <span className="row gap-2 small strong">
            {bought ? 'In your Museum · Bought' : `For sale · ₵${scroll.price!.toLocaleString()}`} <LaterBadge />
          </span>
          <span className="xs muted">Buying and selling Scrolls is a later-stage feature.</span>
        </div>
        <Link className="btn btn-outline-gold btn-sm" to={`/later/buy/${scroll.id}`}>
          {bought ? 'View' : 'Buy'}
        </Link>
      </div>
    </div>
  )
}

function MoreFrom({ scroll }: { scroll: Scroll }) {
  const scrolls = useApp((s) => s.scrolls)
  const more = scrolls.filter((s) => s.id !== scroll.id && s.status === 'published' && (s.creatorId === scroll.creatorId || s.tribe === scroll.tribe)).slice(0, 4)
  if (!more.length) return null
  return (
    <section className="stack gap-3">
      <h2 className="h3">More {scroll.tribe} Scrolls</h2>
      {more.map((s) => (
        <ScrollRow key={s.id} title={s.title} meta={`${s.flag} ${s.country} · ${s.tribe} · ${s.category}`} image={s.images[0] ?? asset('songs-sky.webp')} to={`/scroll/${s.id}`} />
      ))}
    </section>
  )
}

/* ─────────── Review panel / track (Screen 29) ─────────── */
export function ReviewTrack({ scroll }: { scroll: Scroll }) {
  const rev = scroll.review ?? [
    { by: 'culture_share' as const, state: scroll.status === 'published' ? ('approved' as const) : ('pending' as const) },
    { by: 'historian' as const, state: scroll.status === 'published' ? ('approved' as const) : ('pending' as const) },
  ]
  const dot = (st: string) => (st === 'approved' ? 'done' : st === 'in_progress' ? 'now' : st === 'clarification' ? 'warn' : '')
  const label = (st: string) => ({ approved: 'Approved', in_progress: 'In review', pending: 'Waiting', clarification: 'Clarification requested' })[st]
  return (
    <div className="stack gap-2">
      <div className="review-track">
        <span className="rt-dot done">
          <TickCircle size={14} variant="Bold" />
        </span>
        <span className={cx('rt-line', 'on')} />
        <span className={cx('rt-dot', dot(rev[0].state))}>{rev[0].state === 'approved' ? <TickCircle size={14} variant="Bold" /> : '1'}</span>
        <span className={cx('rt-line', rev[0].state === 'approved' && 'on')} />
        <span className={cx('rt-dot', dot(rev[1].state))}>{rev[1].state === 'approved' ? <TickCircle size={14} variant="Bold" /> : rev[1].state === 'clarification' ? '!' : '2'}</span>
        <span className={cx('rt-line', scroll.status === 'published' && 'on')} />
        <span className={cx('rt-dot', scroll.status === 'published' && 'done')}>{scroll.status === 'published' ? <TickCircle size={14} variant="Bold" /> : '3'}</span>
      </div>
      <div className="row between xs faint" style={{ gap: 6 }}>
        <span>Submitted</span>
        <span>CultureShare · {label(rev[0].state)}</span>
        <span>Historian · {label(rev[1].state)}</span>
        <span>Published</span>
      </div>
      {rev[1].note && (
        <Callout kind="warn" icon={<Warning2 size={18} />}>
          <strong>Historian note:</strong> {rev[1].note}
        </Callout>
      )}
    </div>
  )
}

function ReviewPanel({ scroll }: { scroll: Scroll }) {
  const advance = useApp((s) => s.advanceReview)
  const toast = useApp((s) => s.toast)
  return (
    <div className="panel" style={{ padding: 16, borderColor: 'var(--accent-line)' }}>
      <div className="row gap-2 strong small">
        <Timer1 size={18} color="var(--accent)" /> {scroll.status === 'draft' ? 'Draft — not submitted' : scroll.status === 'restricted' ? 'Restricted after review' : 'Under review — only you can see this'}
      </div>
      {scroll.status !== 'draft' && (
        <div className="mt-4">
          <ReviewTrack scroll={scroll} />
        </div>
      )}
      {scroll.status === 'under_review' && (
        <button
          className="btn btn-ghost btn-xs mt-3"
          onClick={() => {
            advance(scroll.id)
            toast('Prototype: review advanced one step', 'info')
          }}
        >
          Prototype: advance review
        </button>
      )}
    </div>
  )
}

/* ─────────── Screen 29 — My Scrolls / content review status ─────────── */
export function MyScrolls() {
  const all = useApp((s) => s.scrolls)
  const advance = useApp((s) => s.advanceReview)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const [params] = useSearchParams()
  const q = params.get('tab') as ScrollStatus | null
  const tabs = ['Drafts', 'Under review', 'Published', 'Restricted'] as const
  const map: Record<(typeof tabs)[number], ScrollStatus> = { Drafts: 'draft', 'Under review': 'under_review', Published: 'published', Restricted: 'restricted' }
  const [tab, setTab] = useState<(typeof tabs)[number]>(q ? (Object.keys(map).find((k) => map[k as keyof typeof map] === q) as (typeof tabs)[number]) ?? 'Under review' : 'Under review')
  const mine = all.filter((s) => s.creatorId === 'me')
  const counts = Object.fromEntries(tabs.map((t) => [t, mine.filter((s) => s.status === map[t]).length])) as Record<(typeof tabs)[number], number>
  const list = mine.filter((s) => s.status === map[tab])
  return (
    <Page narrow>
      <PageHeader
        title="My Scrolls"
        sub="Scrolls are reviewed by CultureShare and an assigned Historian before they are published. Follow each one through the pipeline here."
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => nav('/create/scroll')}>
            <Add size={18} /> New Scroll
          </button>
        }
      />
      <Tabs tabs={tabs} value={tab} onChange={setTab} counts={counts} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="stack gap-4">
          {list.length === 0 && (
            <Empty
              icon={<DocumentText size={26} variant="Bulk" />}
              title={{ Drafts: 'No drafts', 'Under review': 'Nothing under review', Published: 'No published Scrolls yet', Restricted: 'Nothing restricted' }[tab]}
              text={{ Drafts: 'Drafts you save while creating a Scroll appear here.', 'Under review': 'When you submit a Scroll, you’ll see its CultureShare review and Historian validation here.', Published: 'Once both reviews are approved, your Scroll is published to your Raiders and the feed.', Restricted: 'Scrolls restricted after review would appear here with the reason.' }[tab]}
              action={tab !== 'Restricted' ? <button className="btn btn-primary btn-sm" onClick={() => nav('/create/scroll')}>Create a Scroll</button> : undefined}
            />
          )}
          {list.map((s) => (
            <motion.div layout key={s.id} className="card" style={{ padding: 16 }}>
              <div className="row gap-4" style={{ alignItems: 'flex-start' }}>
                <img src={s.images[0] ?? asset('songs-sky.webp')} alt="" style={{ width: 88, height: 88, borderRadius: 12, objectFit: 'cover', flex: 'none' }} />
                <div className="stack gap-2 grow" style={{ minWidth: 0 }}>
                  <div className="row gap-2 wrap">
                    <h3 className="strong">{s.title}</h3>
                    <span className={cx('tag', s.status === 'published' ? 'green' : s.status === 'under_review' ? 'amber' : s.status === 'restricted' ? 'red' : '')}>{STATUS_LABEL[s.status]}</span>
                  </div>
                  <span className="xs faint">
                    {s.country ? `${s.flag} ${s.country} · ${s.tribe} · ${s.category} · ` : ''}
                    {s.kind === 'documentary' ? 'Documentary' : 'Reel'} · {timeAgo(s.createdAt)}
                  </span>
                  {s.status !== 'draft' && (
                    <div className="mt-2">
                      <ReviewTrack scroll={s} />
                    </div>
                  )}
                  <div className="row gap-2 wrap mt-2">
                    {s.status === 'draft' ? (
                      <button className="btn btn-primary btn-xs" onClick={() => nav(`/create/scroll?draft=${s.id}`)}>
                        <Edit2 size={14} /> Continue editing
                      </button>
                    ) : (
                      <Link className="btn btn-secondary btn-xs" to={`/scroll/${s.id}`}>
                        <Eye size={14} /> View
                      </Link>
                    )}
                    {s.status === 'under_review' && (
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          advance(s.id)
                          toast('Prototype: review advanced one step')
                        }}
                      >
                        Prototype: advance review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      <Decision>Expected review turnaround and how creators are notified of each step aren’t defined in the functionality spec.</Decision>
    </Page>
  )
}

/* ─────────── Screen 15 — Dark Zone ─────────── */
export function DarkZone() {
  const scrolls = useApp((s) => s.scrolls)
  const openComments = useUI((s) => s.openComments)
  const [state, setState] = useState<'All' | string>('All')
  const states = ['entered', 'under_scrutiny', 'discussion', 'restricted', 'dropped']
  const dz = useMemo(() => scrolls.filter((s) => s.darkZone && (state === 'All' || s.darkZone.state === state)), [scrolls, state])
  return (
    <Page rail={<DarkZoneRail />}>
      <motion.section className="dz-hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="row gap-3" style={{ position: 'relative' }}>
          <span style={{ width: 52, height: 52, borderRadius: 14, display: 'grid', placeItems: 'center', border: '1.5px solid rgba(255,255,255,.55)', background: '#000' }}>
            <Slash size={26} color="#f4efe6" />
          </span>
          <div className="stack">
            <span className="eyebrow" style={{ color: 'rgba(244,239,230,.6)' }}>
              Distinct content state
            </span>
            <h1 className="h1" style={{ color: '#f4efe6' }}>
              Dark Zone
            </h1>
          </div>
        </div>
        <p style={{ position: 'relative', marginTop: 14, maxWidth: '62ch', lineHeight: 1.6, color: 'rgba(244,239,230,.82)' }}>
          Controversial Scrolls & conversations. Algorithmic checks move contested topics here so they can be discussed carefully — with dark-bordered controls so you always know you’re in a different space.
        </p>
      </motion.section>
      <div className="chip-row">
        {['All', ...states].map((s) => (
          <button key={s} className={cx('chip', state === s && 'is-on')} onClick={() => setState(s)}>
            {s === 'All' ? 'All' : DZ_LABEL[s]}
          </button>
        ))}
      </div>
      {dz.length === 0 ? (
        <Empty icon={<Slash size={26} />} title="Nothing in this state" text="No Scrolls are currently in this Dark Zone state." />
      ) : (
        <div className="stack gap-5">
          {dz.map((s, k) => (
            <div key={s.id} className="stack gap-2">
              <div className="row gap-2 xs" style={{ color: 'var(--text-3)' }}>
                <Danger size={14} /> <strong style={{ color: 'var(--text)' }}>{DZ_LABEL[s.darkZone!.state]}</strong> · {s.darkZone!.reason}
              </div>
              <ScrollCard scroll={s} index={k} />
              {s.darkZone!.state === 'discussion' && (
                <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => openComments(s.id)}>
                  <Message size={16} /> Join the discussion
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Page>
  )
}

function DarkZoneRail() {
  const items = [
    ['Entered Dark Zone', 'Flagged by an algorithmic check for contested content.'],
    ['Under scrutiny', 'CultureShare and Historians are reviewing context and consent.'],
    ['Discussion open', 'Moderated conversation is allowed.'],
    ['Restricted', 'Hidden from feeds; only reachable by link, if at all.'],
    ['Dropped', 'Removed from the Dark Zone, back to normal or taken down.'],
  ]
  return (
    <>
      <div className="panel panel-pad stack gap-3">
        <h3 className="strong small">How the Dark Zone works</h3>
        {items.map(([t, d]) => (
          <div key={t} className="row gap-3" style={{ alignItems: 'flex-start' }}>
            <span className="tag dark" style={{ flex: 'none' }}>
              ◐
            </span>
            <span className="stack">
              <span className="small strong">{t}</span>
              <span className="xs muted">{d}</span>
            </span>
          </div>
        ))}
      </div>
      <Decision>The functionality spec describes algorithmic entry and dark-bordered controls, but not who can move a Scroll between states or appeal. Confirm the moderation model.</Decision>
      <Callout icon={<InfoCircle size={18} />}>
        <span className="xs">Dark Zone content isn’t “bad” content — it’s content that needs care. Historians’ notes take precedence in disputes.</span>
      </Callout>
    </>
  )
}

