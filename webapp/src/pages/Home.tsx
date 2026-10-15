import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Clock, Gallery, ShieldTick, ArrowRight2, Note, People } from 'iconsax-react'
import { useApp } from '../store/useApp'
import { useUI } from '../store/useUI'
import { TOPICS, USERS } from '../data/seed'
import type { Post } from '../data/types'
import { Page } from '../components/Shell'
import { PostCard } from '../components/content'
import { Avatar, CardSkeleton, FollowButton, SectionHead, StatusRing, Tabs, Empty } from '../components/ui'
import { compact, getUser } from '../lib/util'

export function useBoot(ms = 550) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), ms)
    return () => clearTimeout(t)
  }, [ms])
  return ready
}

/* ─────────── Status rail (Screen 09) ─────────── */
export function StatusRail() {
  const statuses = useApp((s) => s.statuses)
  const seen = useApp((s) => s.seenStatus)
  const me = useApp((s) => s.me)
  const openStatus = useUI((s) => s.openStatus)
  const nav = useNavigate()
  const now = Date.now()
  const live = statuses.filter((s) => s.expiresAt > now && (!s.scheduledFor || s.scheduledFor <= now))
  const mine = live.filter((s) => s.userId === 'me')
  const others = live.filter((s) => s.userId !== 'me').sort((a, b) => Number(seen.includes(a.id)) - Number(seen.includes(b.id)))
  const order = [...mine, ...others].map((s) => s.id)
  return (
    <section aria-label="Status">
      <SectionHead title="Status" to="/create/status" action={undefined} />
      <div className="status-rail">
        <button className="status-item" onClick={() => (mine.length ? openStatus(order, 0) : nav('/create/status'))}>
          {mine.length ? <StatusRing src={me.avatar} segments={mine[0].items.length} seen={seen.includes(mine[0].id)} /> : <StatusRing add />}
          <span className="name">{mine.length ? 'Your status' : 'Add status'}</span>
        </button>
        {others.map((s, k) => {
          const u = getUser(s.userId)
          return (
            <motion.button key={s.id} className="status-item" onClick={() => openStatus(order, order.indexOf(s.id))} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.05 }}>
              <StatusRing src={u?.avatar} segments={s.items.length} seen={seen.includes(s.id)} />
              <span className="name">{u?.name.split(' ')[0]}</span>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

function Composer() {
  const me = useApp((s) => s.me)
  const nav = useNavigate()
  const btn = (icon: ReactNode, label: string, to: string, color: string) => (
    <button className="btn btn-ghost btn-sm" onClick={() => nav(to)} style={{ background: 'var(--surface-glass)' }}>
      <span style={{ color, display: 'grid' }}>{icon}</span>
      {label}
    </button>
  )
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row gap-3">
        <Avatar src={me.avatar} name={me.firstName} size={42} />
        <button className="input-wrap grow" style={{ minHeight: 46, borderRadius: 12, cursor: 'text', color: 'var(--text-4)', fontSize: 'var(--fs-sm)' }} onClick={() => nav('/create/post')}>
          Tell your people a story, {me.firstName}…
        </button>
      </div>
      <div className="row gap-2 wrap mt-3" style={{ paddingLeft: 54 }}>
        {btn(<Gallery size={18} variant="Bulk" />, 'Photo post', '/create/post', '#22c55e')}
        {btn(<Note size={18} variant="Bulk" />, 'Post', '/create/post', '#38bdf8')}
        {btn(<Clock size={18} variant="Bulk" />, 'Status', '/create/status', '#f472b6')}
      </div>
    </div>
  )
}

/** Everyday accounts to keep up with — artists and celebrities included. */
function SuggestedFollows({ inline }: { inline?: boolean }) {
  const following = useApp((s) => s.following)
  const list = USERS.filter((u) => !following.includes(u.id)).sort((a, b) => b.followers - a.followers).slice(0, inline ? 4 : 5)
  if (!list.length) return null
  if (inline) {
    return (
      <div className="card" style={{ padding: 18 }}>
        <SectionHead title="People to follow" to="/discover/people" />
        <div className="grid-4" style={{ gap: 10 }}>
          {list.map((u) => (
            <Link key={u.id} to={`/u/${u.id}`} className="person-card" style={{ padding: '16px 8px 12px' }}>
              <Avatar user={u} size={52} />
              <span className="small strong ellipsis" style={{ maxWidth: '100%' }}>
                {u.name}
              </span>
              <span className="xs faint">
                {u.flag} {u.role === 'artist' ? 'Artist' : u.tribe}
              </span>
              <FollowButton userId={u.id} size="sm" />
            </Link>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="panel panel-pad">
      <SectionHead title="Who to follow" to="/discover/people" />
      <div className="stack gap-3">
        {list.map((u) => (
          <div key={u.id} className="row gap-3">
            <Link to={`/u/${u.id}`}>
              <Avatar user={u} size={38} />
            </Link>
            <Link to={`/u/${u.id}`} className="stack grow" style={{ minWidth: 0 }}>
              <span className="small strong ellipsis">
                {u.name} {u.flag}
              </span>
              <span className="xs faint ellipsis">{u.role === 'historian' ? 'Historian · ' : ''}{u.tagline} · {compact(u.followers)} followers</span>
            </Link>
            <FollowButton userId={u.id} size="sm" />
          </div>
        ))}
      </div>
    </div>
  )
}

function CommunitiesRail() {
  const communities = useApp((s) => s.communities)
  const joined = useApp((s) => s.joined)
  const toggleJoin = useApp((s) => s.toggleJoin)
  const toast = useApp((s) => s.toast)
  const list = communities.filter((c) => !joined.includes(c.id)).slice(0, 3)
  return (
    <div className="panel panel-pad">
      <SectionHead title="Communities" to="/communities" />
      <div className="stack gap-3">
        {list.map((c) => (
          <div key={c.id} className="row gap-3">
            <Link to={`/communities/${c.id}`}>
              <img src={c.image} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
            </Link>
            <Link to={`/communities/${c.id}`} className="stack grow" style={{ minWidth: 0 }}>
              <span className="small strong ellipsis">{c.name}</span>
              <span className="xs faint">
                {c.category} · {compact(c.members)} members
              </span>
            </Link>
            <button
              className="raid-btn"
              style={{ height: 26, minWidth: 52 }}
              onClick={() => {
                toggleJoin(c.id)
                toast(`Joined ${c.name}`, 'success')
              }}
            >
              Join
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="small muted">You’ve joined every suggested community.</p>}
      </div>
    </div>
  )
}

function TrendingRail() {
  return (
    <div className="panel panel-pad">
      <SectionHead title="Trending cultures" to="/discover" />
      <div className="stack gap-2">
        {TOPICS.slice(0, 5).map((t, k) => (
          <Link key={t.id} to={`/topic/${t.id}`} className="row gap-3 share-row">
            <span className="xs faint" style={{ width: 14 }}>
              {k + 1}
            </span>
            <img src={t.image} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
            <span className="stack grow" style={{ minWidth: 0 }}>
              <span className="small strong ellipsis">{t.name}</span>
              <span className="xs faint">
                {t.posts} posts
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function VerifyPrompt() {
  const v = useApp((s) => s.verification.state)
  if (v === 'approved') return null
  const copy: Record<string, string> = {
    not_started: 'Verify your African identity to earn the verified mark on your profile.',
    in_progress: 'You started African verification. Pick up where you left off.',
    submitted: 'Your verification is submitted.',
    under_review: 'Your verification is under review — usually within 24 hours.',
    rejected: 'Your verification needs attention.',
  }
  return (
    <Link to="/verification" className="panel panel-pad row gap-3 hover-lift" style={{ background: 'linear-gradient(135deg, var(--accent-soft), var(--surface-1))', borderColor: 'var(--accent-line)' }}>
      <span className="ci-icon" style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent-text)', flex: 'none' }}>
        <ShieldTick size={20} variant="Bulk" />
      </span>
      <span className="stack grow">
        <span className="small strong">{v === 'under_review' ? 'Verification under review' : 'African verification'}</span>
        <span className="xs muted">{copy[v]}</span>
      </span>
      <ArrowRight2 size={16} />
    </Link>
  )
}

export function HomeRail() {
  return (
    <>
      <VerifyPrompt />
      <SuggestedFollows />
      <CommunitiesRail />
      <TrendingRail />
      <p className="xs faint" style={{ padding: '0 4px' }}>
        CultureShare · Telling our own stories, our own way.
      </p>
    </>
  )
}

/* ─────────── Screen 08 — Home feed ───────────
   Home is for regular posts only. Scrolls and reading live in the Scrolls section. */
type FeedItem = { kind: 'post'; p: Post } | { kind: 'follows' } | { kind: 'communities' }

export function Home() {
  const posts = useApp((s) => s.posts)
  const following = useApp((s) => s.following)
  const me = useApp((s) => s.me)
  const [tab, setTab] = useState<'For you' | 'Following' | 'Latest'>('For you')
  const ready = useBoot()
  const nav = useNavigate()

  const feed = useMemo<FeedItem[]>(() => {
    let ps = posts.filter((p) => !p.communityId && !p.announcement)
    if (tab === 'Following') ps = ps.filter((p) => following.includes(p.authorId) || p.authorId === 'me')
    if (tab === 'For you') {
      const score = (p: Post) => (p.authorId === 'me' ? 4 : 0) + (following.includes(p.authorId) ? 2 : 0) + Math.log10(p.likes + 10) - (Date.now() - p.createdAt) / (24 * 3600_000)
      ps = [...ps].sort((a, b) => score(b) - score(a))
    }
    if (tab === 'Latest') ps = [...ps].sort((a, b) => b.createdAt - a.createdAt)
    const out: FeedItem[] = []
    ps.forEach((p, k) => {
      out.push({ kind: 'post', p })
      if (k === 2 && tab !== 'Following') out.push({ kind: 'follows' })
      if (k === 6 && tab !== 'Following') out.push({ kind: 'communities' })
    })
    return out
  }, [posts, following, tab])

  return (
    <Page rail={<HomeRail />}>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="stack gap-1">
        <span className="xs faint">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        <h1 className="h2">
          {greeting()}, {me.firstName}
        </h1>
      </motion.div>
      <StatusRail />
      <Composer />
      <Tabs tabs={['For you', 'Following', 'Latest'] as const} value={tab} onChange={setTab} />
      {!ready ? (
        <div className="stack gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : feed.length === 0 ? (
        <Empty icon={<People size={26} variant="Bulk" />} title="No posts from people you follow yet" text="Follow friends, artists and storytellers to see their posts here." action={<button className="btn btn-primary btn-sm" onClick={() => nav('/discover/people')}>Find people to follow</button>} />
      ) : (
        <div className="stack gap-5">
          {feed.map((it, k) =>
            it.kind === 'post' ? (
              <PostCard key={it.p.id} post={it.p} index={k} />
            ) : it.kind === 'follows' ? (
              <SuggestedFollows key="follows" inline />
            ) : (
              <InlineCommunities key="comms" />
            ),
          )}
          <p className="small faint" style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            ✦ You’re all caught up. <Link to="/discover" className="link">Discover more culture</Link>
          </p>
        </div>
      )}
    </Page>
  )
}

function InlineCommunities() {
  const communities = useApp((s) => s.communities)
  return (
    <div className="card" style={{ padding: 18 }}>
      <SectionHead title="Communities for you" to="/communities" />
      <div className="row gap-3" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        {communities.slice(0, 5).map((c) => (
          <Link key={c.id} to={`/communities/${c.id}`} className="stack gap-2" style={{ width: 150, flex: 'none' }}>
            <span className="topic-card" style={{ height: 110 }}>
              <img src={c.cover} alt="" />
            </span>
            <span className="small strong ellipsis">{c.name}</span>
            <span className="xs faint">{compact(c.members)} members</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}
