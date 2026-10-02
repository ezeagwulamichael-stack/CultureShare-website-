import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowDown2, CloseCircle, Filter, SearchNormal1, Book1, People } from 'iconsax-react'
import { useShallow } from 'zustand/react/shallow'
import { useApp } from '../store/useApp'
import { CATEGORIES, COUNTRIES, DISCOVER_THEMES, HISTORIAN_SCROLLS, TOPICS, TRENDING_CHIPS, USERS, asset } from '../data/seed'
import type { Scroll } from '../data/types'
import { Page, PageHeader } from '../components/Shell'
import { PostCard, ScrollCard, ScrollRow, ScrollTeaser, ScrollTile } from '../components/content'
import { Avatar, Drawer, Empty, HistorianBadge, Input, RaidButton, SectionHead, Select, Skeleton, Tabs, VerifiedMark } from '../components/ui'
import { compact, cx } from '../lib/util'
import { useBoot } from './Home'

/* ─────────── Screen 14 — Discover culture (editorial) ─────────── */
export function Discover() {
  const scrolls = useApp(useShallow((s) => s.scrolls.filter((x) => x.status === 'published' && !x.darkZone)))
  const [chip, setChip] = useState('For you')
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const ready = useBoot(400)
  const featured = TOPICS[6]
  return (
    <Page wide rail={<DiscoverRail />}>
      <PageHeader title="Discover" sub="Show me something I didn’t know I wanted to find." />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`)
        }}
      >
        <Input placeholder="Search cultures, stories, people…" value={q} onChange={(e) => setQ(e.target.value)} icon={<SearchNormal1 size={18} color="var(--text-4)" />} trailing={<button type="button" className="icon-btn sm" aria-label="Filters" onClick={() => nav('/search')}><Filter size={18} /></button>} />
      </form>
      <div className="chip-row">
        {TRENDING_CHIPS.map((c) => (
          <button key={c} className={cx('chip', chip === c && 'is-on')} onClick={() => (c === 'Historians' ? nav('/discover/people?role=historian') : c === 'Communities' ? nav('/communities') : setChip(c))}>
            {c}
          </button>
        ))}
      </div>

      <section>
        <SectionHead title="Featured" />
        <div className="featured-grid">
          <Link to={`/topic/${featured.id}`} className="topic-card featured-main">
            <img src={featured.image} alt="" />
            <span className="tag gold" style={{ position: 'absolute', top: 14, left: 14 }}>
              Featured
            </span>
            <span className="tc-label">
              <span className="h3" style={{ color: '#fff' }}>
                {featured.name}
              </span>
              <span className="xs" style={{ opacity: 0.8, display: 'block' }}>
                {featured.region} · {featured.posts} posts · {featured.scrolls} Scrolls
              </span>
            </span>
          </Link>
          {TOPICS.slice(7, 10).map((t) => (
            <Link key={t.id} to={`/topic/${t.id}`} className="topic-card">
              <img src={t.image} alt="" />
              <span className="tc-label">
                <span className="small strong">{t.name}</span>
                <span style={{ fontSize: 10, opacity: 0.75, display: 'block' }}>{t.posts} posts</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Explore by country" />
        <div className="row gap-3" style={{ overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {COUNTRIES.map((c, k) => (
            <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: k * 0.03 }}>
              <Link to={`/search?country=${encodeURIComponent(c.name)}`} className="topic-card" style={{ width: 150, height: 190, display: 'block', flex: 'none' }}>
                <img src={c.image} alt="" />
                <span className="tc-label">
                  <span style={{ fontSize: 22 }}>{c.flag}</span>
                  <span className="small strong" style={{ display: 'block' }}>
                    {c.name}
                  </span>
                  <span style={{ fontSize: 10, opacity: 0.75 }}>{c.tribes.length} tribes</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Explore by culture" />
        <div className="grid-4">
          {DISCOVER_THEMES.map((t) => (
            <Link key={t.name} to={`/search?topic=${encodeURIComponent(t.name)}`} className="topic-card" style={{ height: 130 }}>
              <img src={t.image} alt="" />
              <span className="tc-label">
                <span className="small strong">{t.name}</span>
                <span style={{ fontSize: 10, opacity: 0.75, display: 'block' }}>{compact(t.count)} Scrolls & posts</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Trending posts & topics" to="/search?tab=Culture" />
        <div className="grid-3" style={{ gap: 10 }}>
          {TOPICS.slice(0, 6).map((t) => (
            <Link key={t.id} to={`/topic/${t.id}`} className="stack gap-2">
              <span className="topic-card" style={{ height: 120 }}>
                <img src={t.image} alt="" />
              </span>
              <span className="xs strong">{t.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Popular Scrolls" to="/scrolls" />
        {ready ? (
          <div className="grid-2">
            {scrolls.slice(0, 6).map((s, k) => (
              <ScrollTeaser key={s.id} scroll={s} index={k} />
            ))}
          </div>
        ) : (
          <div className="grid-2">
            <Skeleton h={320} />
            <Skeleton h={320} />
          </div>
        )}
      </section>

      <section>
        <SectionHead title="From across the continent" />
        <div className="masonry">
          {[...scrolls, ...scrolls].slice(0, 16).map((s, k) => (
            <ScrollTile key={s.id + k} scroll={s} tall={k % 5 === 0 || k % 7 === 3} />
          ))}
        </div>
      </section>
    </Page>
  )
}

function DiscoverRail() {
  return (
    <>
      <div className="panel panel-pad">
        <SectionHead title="Trending Raiders" to="/discover/people" />
        <div className="stack gap-3">
          {USERS.filter((u) => u.role === 'historian' || (u.verified && u.role === 'creator'))
            .slice(0, 4)
            .map((u) => (
              <ExpandableRaider key={u.id} id={u.id} />
            ))}
        </div>
      </div>
    </>
  )
}

/** The mobile "Trending Raiders" row that expands to show bio + their Scrolls. */
export function ExpandableRaider({ id, defaultOpen }: { id: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  const u = USERS.find((x) => x.id === id)!
  const scrolls = useApp(useShallow((s) => s.scrolls.filter((x) => x.creatorId === id && x.status === 'published')))
  const theirs = HISTORIAN_SCROLLS[id] ?? scrolls.map((s) => ({ title: s.title, meta: `${s.country} · ${s.tribe} · ${s.category}`, image: s.images[0] ?? asset('songs-sky.webp'), scrollId: s.id }))
  return (
    <div className="panel" style={{ padding: 0, overflow: 'hidden', background: 'var(--surface-glass)' }}>
      <div className="row gap-3" style={{ padding: 12 }}>
        <Avatar user={u} size={44} />
        <Link to={`/u/${u.id}`} className="stack grow" style={{ minWidth: 0 }}>
          <span className="row gap-1 small strong">
            <span className="ellipsis">{u.name}</span> {u.flag} {u.verified && <VerifiedMark size={12} />}
          </span>
          <span className="xs faint ellipsis">{u.role === 'historian' ? `@${u.username} · Verified Historian` : u.specialty ?? u.tagline}</span>
        </Link>
        <RaidButton userId={u.id} size="sm" />
        <button className="icon-btn sm" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Collapse' : 'Expand'}>
          <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ display: 'grid' }}>
            <ArrowDown2 size={16} />
          </motion.span>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
            <div className="stack gap-3" style={{ padding: '0 12px 12px', borderTop: '1px solid var(--line)' }}>
              <p className="small muted mt-3">{u.bio}</p>
              {theirs.length > 0 && <span className="eyebrow">Their Scrolls</span>}
              {theirs.slice(0, 3).map((s) => (
                <ScrollRow key={s.title} title={s.title} meta={s.meta} image={s.image} to={`/scroll/${s.scrollId}`} />
              ))}
              <Link to={`/u/${u.id}`} className="btn btn-secondary btn-sm btn-block">
                View Full Profile
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────── Topic page (mobile "Yoruba Heritage") ─────────── */
export function Topic() {
  const { id } = useParams()
  const topic = TOPICS.find((t) => t.id === id)
  const scrolls = useApp(useShallow((s) => s.scrolls.filter((x) => x.status === 'published')))
  const posts = useApp((s) => s.posts)
  const [tab, setTab] = useState<'Top' | 'Latest' | 'Raiders' | 'Historians' | 'Scrolls'>('Top')
  if (!topic) {
    return (
      <Page narrow>
        <Empty icon={<Book1 size={26} />} title="Topic not found" text="We couldn’t find that cultural topic." action={<Link to="/discover" className="btn btn-primary btn-sm">Back to Discover</Link>} />
      </Page>
    )
  }
  const word = topic.name.split(' ')[0]
  const related = scrolls.filter((s) => s.tribe === word || s.tags.some((t) => topic.name.includes(t)) || s.title.includes(word))
  const relatedScrolls = related.length ? related : scrolls.slice(0, 4)
  const raiders = USERS.filter((u) => u.role === 'creator').slice(0, 6)
  return (
    <Page narrow>
      <motion.div className="stack" style={{ alignItems: 'center', textAlign: 'center', gap: 12 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <motion.img layoutId={`topic-${topic.id}`} src={topic.image} alt="" style={{ width: 200, height: 200, borderRadius: 12, objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
        <h1 className="h1">{topic.name}</h1>
        <span className="small muted">
          {topic.posts} posts · {topic.scrolls} Scrolls · {topic.region}
        </span>
      </motion.div>
      <Tabs tabs={['Top', 'Latest', 'Raiders', 'Historians', 'Scrolls'] as const} value={tab} onChange={setTab} fill />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="stack gap-5">
          {tab === 'Top' && relatedScrolls.map((s, k) => <ScrollCard key={s.id} scroll={s} index={k} />)}
          {tab === 'Latest' && (
            <>
              {posts.slice(0, 3).map((p, k) => (
                <PostCard key={p.id} post={p} index={k} />
              ))}
              {[...relatedScrolls].sort((a, b) => b.createdAt - a.createdAt).map((s, k) => (
                <ScrollCard key={s.id} scroll={s} index={k} />
              ))}
            </>
          )}
          {tab === 'Raiders' && (
            <div className="stack gap-3">
              {raiders.map((u) => (
                <ExpandableRaider key={u.id} id={u.id} />
              ))}
            </div>
          )}
          {tab === 'Historians' && (
            <div className="stack gap-3">
              {USERS.filter((u) => u.role === 'historian').map((u, k) => (
                <ExpandableRaider key={u.id} id={u.id} defaultOpen={k === 0} />
              ))}
            </div>
          )}
          {tab === 'Scrolls' && (
            <div className="grid-2">
              {relatedScrolls.map((s, k) => (
                <ScrollTeaser key={s.id} scroll={s} index={k} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Page>
  )
}

/* ─────────── Screen 13 — Search with persistent filter sidebar ─────────── */
const RESULT_TABS = ['Top', 'Latest', 'People', 'Photos', 'Videos', 'Culture'] as const
type RTab = (typeof RESULT_TABS)[number]

export function Search() {
  const [params, setParams] = useSearchParams()
  const scrolls = useApp(useShallow((s) => s.scrolls.filter((x) => x.status === 'published')))
  const posts = useApp((s) => s.posts)
  const [q, setQ] = useState(params.get('q') ?? '')
  const [tab, setTab] = useState<RTab>((params.get('tab') as RTab) ?? 'Top')
  const [types, setTypes] = useState<string[]>([])
  const [country, setCountry] = useState(params.get('country') ?? '')
  const [tribe, setTribe] = useState(params.get('tribe') ?? '')
  const [topics, setTopics] = useState<string[]>(params.get('topic') ? [params.get('topic')!] : [])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setQ(params.get('q') ?? '')
    setCountry(params.get('country') ?? '')
    setTribe(params.get('tribe') ?? '')
    setTopics(params.get('topic') ? [params.get('topic')!] : [])
  }, [params])
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 280)
    return () => clearTimeout(t)
  }, [q, country, tribe, topics, types, tab])
  const term = q.trim().toLowerCase()
  const matchScroll = (s: Scroll) =>
    (!term || (s.title + s.caption + s.tribe + s.country + s.category + s.tags.join(' ')).toLowerCase().includes(term)) &&
    (!country || s.country === country) &&
    (!tribe || s.tribe === tribe) &&
    (!topics.length || topics.includes(s.category))
  const sc = scrolls.filter(matchScroll)
  const ps = posts.filter((p) => !term || p.text.toLowerCase().includes(term))
  const people = USERS.filter((u) => u.role !== 'artist' && (!term || (u.name + u.username + (u.tribe ?? '') + u.country).toLowerCase().includes(term)) && (!country || u.country === country) && (!tribe || u.tribe === tribe))
  const cultures = TOPICS.filter((t) => !term || (t.name + t.region).toLowerCase().includes(term))
  const showScrolls = !types.length || types.includes('Scrolls')
  const showPosts = !types.length || types.includes('Posts')
  const showPeople = !types.length || types.includes('People')
  const tribes = COUNTRIES.find((c) => c.name === country)?.tribes ?? [...new Set(COUNTRIES.flatMap((c) => c.tribes))]
  const activeCount = types.length + topics.length + (country ? 1 : 0) + (tribe ? 1 : 0)
  const clear = () => {
    setTypes([])
    setCountry('')
    setTribe('')
    setTopics([])
    setParams(q ? { q } : {})
  }

  const filters = (
    <div className="stack gap-5">
      <div className="stack gap-2">
        <span className="eyebrow">Content type</span>
        {['Scrolls', 'Posts', 'People'].map((t) => (
          <label key={t} className="checkbox" style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-2)', alignItems: 'center' }}>
            <input type="checkbox" checked={types.includes(t)} onChange={() => setTypes((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))} />
            {t}
          </label>
        ))}
      </div>
      <div className="stack gap-3">
        <span className="eyebrow">Culture</span>
        <Select value={country} onChange={(e) => (setCountry(e.target.value), setTribe(''))} aria-label="Country">
          <option value="">Any country</option>
          {COUNTRIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.flag} {c.name}
            </option>
          ))}
        </Select>
        <Select value={tribe} onChange={(e) => setTribe(e.target.value)} aria-label="Tribe">
          <option value="">Any tribe</option>
          {tribes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </div>
      <div className="stack gap-2">
        <span className="eyebrow">Topics</span>
        <div className="row wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} className={cx('chip sm', topics.includes(c) && 'is-on')} onClick={() => setTopics((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]))}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {activeCount > 0 && (
        <button className="btn btn-ghost btn-sm" onClick={clear}>
          <CloseCircle size={16} /> Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
        </button>
      )}
    </div>
  )

  return (
    <div className="search-layout">
      <aside className="search-filters">
        <h2 className="h3" style={{ marginBottom: 18 }}>
          Search
        </h2>
        {filters}
      </aside>
      <main className="stack gap-5" style={{ minWidth: 0 }}>
        <form
          className="row gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const next = new URLSearchParams(params)
            if (q) next.set('q', q)
            else next.delete('q')
            setParams(next)
          }}
        >
          <Input className="grow" placeholder="Search culture, people, tribes, stories…" value={q} onChange={(e) => setQ(e.target.value)} icon={<SearchNormal1 size={18} color="var(--text-4)" />} autoFocus />
          <button type="button" className="btn btn-secondary filter-toggle" onClick={() => setFiltersOpen(true)}>
            <Filter size={18} /> Filters{activeCount ? ` (${activeCount})` : ''}
          </button>
        </form>
        {activeCount > 0 && (
          <div className="row gap-2 wrap">
            {[...types, country, tribe, ...topics].filter(Boolean).map((f) => (
              <span key={f} className="tag gold">
                {f}
              </span>
            ))}
          </div>
        )}
        <Tabs tabs={RESULT_TABS} value={tab} onChange={setTab} counts={{ People: people.length, Culture: cultures.length }} />
        {loading ? (
          <div className="stack gap-3">
            <Skeleton h={90} />
            <Skeleton h={90} />
            <Skeleton h={90} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="stack gap-5">
              {(tab === 'Top' || tab === 'Latest') && (
                <>
                  {showPeople && people.length > 0 && tab === 'Top' && (
                    <section>
                      <SectionHead title="People" action={<button className="see-all" onClick={() => setTab('People')}>See All</button>} />
                      <div className="grid-3" style={{ gap: 10 }}>
                        {people.slice(0, 3).map((u) => (
                          <PersonResult key={u.id} id={u.id} />
                        ))}
                      </div>
                    </section>
                  )}
                  {showScrolls &&
                    (tab === 'Latest' ? [...sc].sort((a, b) => b.createdAt - a.createdAt) : sc).map((s, k) => <ScrollCard key={s.id} scroll={s} index={k} />)}
                  {showPosts && !country && !tribe && !topics.length && ps.map((p, k) => <PostCard key={p.id} post={p} index={k} />)}
                  {!sc.length && !people.length && !ps.length && <NoResults q={q} onClear={clear} />}
                </>
              )}
              {tab === 'People' &&
                (people.length ? (
                  <div className="grid-3" style={{ gap: 10 }}>
                    {people.map((u) => (
                      <PersonResult key={u.id} id={u.id} />
                    ))}
                  </div>
                ) : (
                  <NoResults q={q} onClear={clear} />
                ))}
              {(tab === 'Photos' || tab === 'Videos') &&
                (() => {
                  const list = sc.filter((s) => (tab === 'Videos' ? s.media === 'video' : s.media === 'image'))
                  return list.length ? (
                    <div className="masonry">
                      {list.map((s, k) => (
                        <ScrollTile key={s.id} scroll={s} tall={k % 3 === 0} />
                      ))}
                    </div>
                  ) : (
                    <NoResults q={q} onClear={clear} />
                  )
                })()}
              {tab === 'Culture' &&
                (cultures.length ? (
                  <div className="grid-3" style={{ gap: 12 }}>
                    {cultures.map((t) => (
                      <Link key={t.id} to={`/topic/${t.id}`} className="topic-card" style={{ height: 160 }}>
                        <img src={t.image} alt="" />
                        <span className="tc-label">
                          <span className="small strong">{t.name}</span>
                          <span style={{ fontSize: 10, opacity: 0.75, display: 'block' }}>
                            {t.region} · {t.scrolls} Scrolls
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <NoResults q={q} onClear={clear} />
                ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" footer={<button className="btn btn-primary btn-block" onClick={() => setFiltersOpen(false)}>Show results</button>}>
        {filters}
      </Drawer>
    </div>
  )
}

function NoResults({ q, onClear }: { q: string; onClear: () => void }) {
  return <Empty icon={<SearchNormal1 size={26} />} title={q ? `No results for “${q}”` : 'No results with these filters'} text="Try a broader term, another spelling, or remove a filter. Many cultures have several names." action={<button className="btn btn-secondary btn-sm" onClick={onClear}>Clear filters</button>} />
}

function PersonResult({ id }: { id: string }) {
  const u = USERS.find((x) => x.id === id)!
  return (
    <Link to={`/u/${u.id}`} className="person-card">
      <Avatar user={u} size={56} />
      <span className="row gap-1 small strong" style={{ justifyContent: 'center' }}>
        {u.name} {u.verified && <VerifiedMark size={12} />}
      </span>
      <span className="xs faint">
        {u.flag} {u.tribe} · {u.country}
      </span>
      {u.role === 'historian' && <HistorianBadge />}
      <RaidButton userId={u.id} size="sm" />
    </Link>
  )
}

/* ─────────── Screen 06 — Discover people ─────────── */
export function DiscoverPeople() {
  const [params] = useSearchParams()
  const prefs = useApp((s) => s.prefs)
  const role = params.get('role')
  const [filter, setFilter] = useState<'All' | 'Historians' | 'Storytellers'>(role === 'historian' ? 'Historians' : 'All')
  const all = USERS.filter((u) => u.role !== 'artist' && (filter === 'All' || (filter === 'Historians' ? u.role === 'historian' : u.role === 'creator')))
  const recommended = all.filter((u) => u.verified).slice(0, 8)
  const byInterest = all.filter((u) => prefs.cultures.includes(u.tribe ?? '') || prefs.interests.length > 0).filter((u) => !recommended.includes(u))
  return (
    <Page wide>
      <PageHeader title="Discover People" sub="Raid creators to receive their Scrolls first-hand. Raiding is how CultureShare follows." actions={<Tabs tabs={['All', 'Historians', 'Storytellers'] as const} value={filter} onChange={setFilter} />} />
      <section>
        <SectionHead title="Recommended for you" />
        <div className="grid-4">
          {recommended.map((u, k) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.04 }}>
              <PersonResult id={u.id} />
            </motion.div>
          ))}
        </div>
      </section>
      {byInterest.length > 0 && (
        <section>
          <SectionHead title="Based on your interests" />
          <div className="grid-4">
            {byInterest.map((u) => (
              <PersonResult key={u.id} id={u.id} />
            ))}
          </div>
        </section>
      )}
      {all.length === 0 && <Empty icon={<People size={26} />} title="No one here yet" text="Try a different filter." />}
    </Page>
  )
}
