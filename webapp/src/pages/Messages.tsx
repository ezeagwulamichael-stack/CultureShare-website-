import { useEffect, useMemo, useRef, useState } from 'react'
import { asset } from '../data/seed'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Paperclip2, Gallery, Video, DocumentText, Send2, SearchNormal1, Messages2, Profile, Add, CloseCircle, Edit } from 'iconsax-react'
import { useApp } from '../store/useApp'
import type { Conversation, Message } from '../data/types'
import { Avatar, Empty, Input, Modal, VerifiedMark, Tabs, Decision } from '../components/ui'
import { Menu } from '../components/content'
import { PeoplePicker } from '../components/sheets'
import { clock, cx, getUser, timeAgo, useUser } from '../lib/util'
import { imageToDataUrl } from '../lib/media'

const REPLIES = ['Ẹ ṣé! That means a lot.', 'Medaase — I’ll send you more soon.', 'Haha, my grandmother would say the same 😄', 'Let’s make a Scroll about this together.', 'Sharing this with my cousins now.', 'Asante sana 🙏🏾']

function useConvTitle(c: Conversation) {
  const u = useUser(c.participantId)
  const community = useApp((s) => s.communities.find((x) => x.id === c.communityId))
  return { title: community?.name ?? u?.name ?? 'Conversation', image: community?.image ?? u?.avatar, user: u, community }
}

/* ─────────── Screen 22 — Messages ─────────── */
export function Messages() {
  const { id } = useParams()
  const conversations = useApp((s) => s.conversations)
  const markRead = useApp((s) => s.markConversationRead)
  const start = useApp((s) => s.startConversation)
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Communities'>('All')
  const [newOpen, setNewOpen] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const active = conversations.find((c) => c.id === id)
  useEffect(() => {
    if (active?.unread) markRead(active.id)
  }, [active, markRead])
  const sorted = useMemo(
    () =>
      [...conversations]
        .filter((c) => (filter === 'Unread' ? c.unread > 0 : filter === 'Communities' ? !!c.communityId : true))
        .filter((c) => {
          const name = c.communityId ? c.communityId : getUser(c.participantId ?? '')?.name ?? ''
          return name.toLowerCase().includes(q.toLowerCase())
        })
        .sort((a, b) => (b.messages.at(-1)?.at ?? 0) - (a.messages.at(-1)?.at ?? 0)),
    [conversations, q, filter],
  )
  return (
    <div className={cx('msg-shell', active && 'has-active')}>
      <aside className="msg-list">
        <div className="stack gap-3" style={{ padding: '20px 16px 12px' }}>
          <div className="row between">
            <h1 className="h2">Messages</h1>
            <button className="icon-btn filled" aria-label="New message" onClick={() => setNewOpen(true)}>
              <Edit size={18} />
            </button>
          </div>
          <Input placeholder="Search messages" value={q} onChange={(e) => setQ(e.target.value)} icon={<SearchNormal1 size={16} color="var(--text-4)" />} />
          <Tabs tabs={['All', 'Unread', 'Communities'] as const} value={filter} onChange={setFilter} fill />
        </div>
        <div style={{ overflowY: 'auto', padding: '0 8px 16px', flex: 1 }}>
          {sorted.length === 0 && <p className="small muted" style={{ padding: 20, textAlign: 'center' }}>No conversations here.</p>}
          {sorted.map((c) => (
            <ConvRow key={c.id} c={c} active={c.id === id} />
          ))}
        </div>
      </aside>
      <section className="msg-thread">{active ? <Thread c={active} /> : <Empty icon={<Messages2 size={26} variant="Bulk" />} title="Your messages" text="Share Scrolls, voice notes and stories directly with the people you raid and your communities." action={<button className="btn btn-primary btn-sm" onClick={() => setNewOpen(true)}>New message</button>} />}</section>
      <aside className="msg-context">{active ? <Context c={active} /> : null}</aside>
      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New message"
        footer={
          <button
            className="btn btn-primary"
            disabled={!picked.length}
            onClick={() => {
              const cid = start(picked[0])
              setNewOpen(false)
              setPicked([])
              nav(`/messages/${cid}`)
            }}
          >
            Start conversation
          </button>
        }
      >
        <PeoplePicker value={picked} onChange={(v) => setPicked(v.slice(-1))} />
      </Modal>
    </div>
  )
}

function ConvRow({ c, active }: { c: Conversation; active: boolean }) {
  const { title, image, user } = useConvTitle(c)
  const last = c.messages.at(-1)
  const preview = last ? (last.scrollId ? '📜 Shared a Scroll' : last.attachment ? `📎 ${last.attachment.name}` : last.text) : 'Say hello 👋🏾'
  return (
    <Link to={`/messages/${c.id}`} className={cx('conv-row', active && 'active')}>
      {c.communityId ? <img src={image} alt="" style={{ width: 46, height: 46, borderRadius: 12, objectFit: 'cover', flex: 'none' }} /> : <Avatar user={user} size={46} />}
      <span className="stack grow" style={{ minWidth: 0 }}>
        <span className="row between gap-2">
          <span className="small strong ellipsis row gap-1">
            {title} {user?.verified && <VerifiedMark size={12} />}
          </span>
          {last && <span className="xs faint" style={{ flex: 'none' }}>{timeAgo(last.at)}</span>}
        </span>
        <span className={cx('xs ellipsis', c.unread ? 'strong' : 'faint')} style={c.unread ? { color: 'var(--text)' } : undefined}>
          {last?.from === 'me' && 'You: '}
          {preview}
        </span>
      </span>
      {c.unread > 0 && (
        <span className="nav-count" style={{ position: 'static', background: 'var(--brand-gold)', color: '#0a1800' }}>
          {c.unread}
        </span>
      )}
      {c.pinnedScrollId && <span title="Must Watch pinned" style={{ fontSize: 12 }}>📌</span>}
    </Link>
  )
}

function Thread({ c }: { c: Conversation }) {
  const send = useApp((s) => s.sendMessage)
  const scrolls = useApp((s) => s.scrolls)
  const pin = useApp((s) => s.pinReel)
  const toast = useApp((s) => s.toast)
  const { title, image, user, community } = useConvTitle(c)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const vidRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)
  const nav = useNavigate()
  const pinned = scrolls.find((s) => s.id === c.pinnedScrollId)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [c.messages.length, typing])
  const reply = () => {
    if (!user) return
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      useApp.setState((s) => ({
        conversations: s.conversations.map((x) => (x.id === c.id ? { ...x, messages: [...x.messages, { id: `r-${Date.now()}`, from: user.id, text: REPLIES[Math.floor(Math.random() * REPLIES.length)], at: Date.now() }] } : x)),
      }))
    }, 1600)
  }
  const submit = () => {
    if (!text.trim()) return
    send(c.id, text.trim())
    setText('')
    reply()
  }
  const grouped = useMemo(() => {
    const out: { day: string; items: Message[] }[] = []
    c.messages.forEach((m) => {
      const day = new Date(m.at).toDateString() === new Date().toDateString() ? 'Today' : new Date(m.at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
      const g = out.at(-1)
      if (g?.day === day) g.items.push(m)
      else out.push({ day, items: [m] })
    })
    return out
  }, [c.messages])
  return (
    <>
      <header className="row gap-3" style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
        {community ? <img src={image} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} /> : <Avatar user={user} size={40} />}
        <Link to={community ? `/communities/${community.id}` : `/u/${user?.id}`} className="stack grow" style={{ minWidth: 0 }}>
          <span className="strong small row gap-1">
            {title} {user?.verified && <VerifiedMark size={12} />}
          </span>
          <span className="xs faint">{typing ? <span className="gold">typing…</span> : community ? `${community.members.toLocaleString()} members` : `@${user?.username}`}</span>
        </Link>
        <Menu
          items={[
            ...(user ? [{ label: 'View profile', icon: <Profile size={16} />, onClick: () => nav(`/u/${user.id}`) }] : []),
            ...(c.pinnedScrollId ? [{ label: 'Unpin Must Watch', icon: <CloseCircle size={16} />, onClick: () => (pin(c.id, undefined), toast('Unpinned')) }] : []),
          ]}
        />
      </header>
      <AnimatePresence>
        {pinned && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', borderBottom: '1px solid var(--line)' }}>
            <Link to={`/scroll/${pinned.id}`} className="row gap-3" style={{ padding: '10px 20px', background: 'linear-gradient(90deg, var(--accent-soft), transparent)' }}>
              <span>📌</span>
              <img src={pinned.images[0]} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
              <span className="stack grow" style={{ minWidth: 0 }}>
                <span className="eyebrow gold" style={{ fontSize: 10 }}>
                  Must Watch
                </span>
                <span className="small strong ellipsis">{pinned.title}</span>
              </span>
              <span className="xs gold">Watch</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {c.messages.length === 0 && <p className="small muted" style={{ textAlign: 'center', marginTop: 40 }}>Start the conversation with {title.split(' ')[0]}.</p>}
        {grouped.map((g) => (
          <div key={g.day} className="stack gap-2">
            <span className="xs faint" style={{ textAlign: 'center', margin: '10px 0' }}>
              {g.day}
            </span>
            {g.items.map((m) => (
              <MessageBubble key={m.id} m={m} community={!!community} />
            ))}
          </div>
        ))}
        <AnimatePresence>
          {typing && (
            <motion.div className="bubble theirs row gap-1" style={{ width: 64 }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {[0, 1, 2].map((k) => (
                <motion.span key={k} style={{ width: 7, height: 7, borderRadius: 7, background: 'var(--text-3)' }} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: k * 0.12 }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <Menu
          label="Attach"
          icon={<Paperclip2 size={20} />}
          items={[
            { label: 'Photo', icon: <Gallery size={16} />, onClick: () => imgRef.current?.click() },
            { label: 'Video', icon: <Video size={16} />, onClick: () => vidRef.current?.click() },
            { label: 'Document', icon: <DocumentText size={16} />, onClick: () => docRef.current?.click() },
          ]}
        />
        <input
          ref={imgRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            send(c.id, '', { kind: 'image', name: f.name, src: await imageToDataUrl(f, 800) })
            reply()
          }}
        />
        <input ref={vidRef} type="file" accept="video/*" hidden onChange={(e) => e.target.files?.[0] && (send(c.id, '', { kind: 'video', name: e.target.files[0].name }), reply())} />
        <input ref={docRef} type="file" accept=".pdf,.doc,.docx,.txt" hidden onChange={(e) => e.target.files?.[0] && (send(c.id, '', { kind: 'document', name: e.target.files[0].name }), reply())} />
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${title.split(' ')[0]}…`}
          aria-label="Message"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
        />
        <motion.button whileTap={{ scale: 0.9 }} className="icon-btn round" style={{ width: 44, height: 44, background: text.trim() ? 'var(--brand-gold-200)' : 'var(--surface-3)', color: text.trim() ? '#0a1800' : 'var(--text-3)' }} disabled={!text.trim()} aria-label="Send">
          <Send2 size={20} />
        </motion.button>
      </form>
    </>
  )
}

function MessageBubble({ m, community }: { m: Message; community: boolean }) {
  const mine = m.from === 'me'
  const author = useUser(m.from)
  const scroll = useApp((s) => s.scrolls.find((x) => x.id === m.scrollId))
  return (
    <motion.div className="stack gap-1" style={{ alignItems: mine ? 'flex-end' : 'flex-start' }} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      {community && !mine && <span className="xs faint" style={{ paddingLeft: 4 }}>{author?.name}</span>}
      {scroll && (
        <Link to={`/scroll/${scroll.id}`} className="card" style={{ width: 260, overflow: 'hidden' }}>
          <img src={scroll.images[0] ?? asset('songs-sky.webp')} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
          <div className="stack" style={{ padding: 10 }}>
            <span className="row gap-1 xs gold">
              <img src={asset('scroll-icon.webp')} alt="" width={14} /> Scroll
            </span>
            <span className="small strong">{scroll.title}</span>
            <span className="xs faint">
              {scroll.flag} {scroll.country} · {scroll.tribe}
            </span>
          </div>
        </Link>
      )}
      {m.attachment?.kind === 'image' && m.attachment.src && <img src={m.attachment.src} alt={m.attachment.name} style={{ maxWidth: 260, borderRadius: 14 }} />}
      {m.attachment && m.attachment.kind !== 'image' && (
        <span className={cx('bubble row gap-2', mine ? 'mine' : 'theirs')}>
          {m.attachment.kind === 'video' ? <Video size={18} /> : <DocumentText size={18} />} {m.attachment.name}
        </span>
      )}
      {m.text && <span className={cx('bubble', mine ? 'mine' : 'theirs')}>{m.text}</span>}
      <span className="xs faint" style={{ padding: '0 4px' }}>
        {clock(m.at)}
      </span>
    </motion.div>
  )
}

function Context({ c }: { c: Conversation }) {
  const { title, image, user, community } = useConvTitle(c)
  const scrolls = useApp((s) => s.scrolls)
  const pin = useApp((s) => s.pinReel)
  const toast = useApp((s) => s.toast)
  const raidingMe = useApp((s) => (user ? s.raiders.includes(user.id) || s.raiding.includes(user.id) : true))
  const reels = scrolls.filter((s) => s.status === 'published' && s.kind === 'reel').slice(0, 6)
  const [pinOpen, setPinOpen] = useState(false)
  const media = c.messages.filter((m) => m.attachment?.src || m.scrollId)
  return (
    <div className="stack gap-5">
      <div className="stack gap-2" style={{ alignItems: 'center', textAlign: 'center' }}>
        {community ? <img src={image} alt="" style={{ width: 84, height: 84, borderRadius: 18, objectFit: 'cover' }} /> : <Avatar user={user} size={84} />}
        <span className="strong">{title}</span>
        {user && <span className="xs faint">{user.flag} {user.tribe} · {user.country}</span>}
        {user && <span className="xs muted">{user.tagline}</span>}
        <Link to={community ? `/communities/${community.id}` : `/u/${user?.id}`} className="btn btn-secondary btn-sm mt-2">
          {community ? 'Open community' : 'View profile'}
        </Link>
      </div>
      <hr className="divider" />
      <div className="stack gap-2">
        <span className="eyebrow">📌 Must Watch</span>
        <p className="xs muted">Pin a Reel to the top of this conversation.</p>
        {raidingMe ? (
          <button className="btn btn-outline-gold btn-sm" onClick={() => setPinOpen(true)}>
            <Add size={16} /> {c.pinnedScrollId ? 'Change pinned Reel' : 'Pin a Reel'}
          </button>
        ) : (
          <p className="xs faint">Only Raiders can pin Must Watch Reels here.</p>
        )}
        <Decision>Which followers/Raiders may pin, and how many pins are allowed, should follow the mobile rule once confirmed.</Decision>
      </div>
      {media.length > 0 && (
        <div className="stack gap-2">
          <span className="eyebrow">Shared</span>
          <div className="thumb-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {media.map((m) => {
              const s = scrolls.find((x) => x.id === m.scrollId)
              return (
                <Link key={m.id} to={s ? `/scroll/${s.id}` : '#'} className="thumb">
                  <img src={m.attachment?.src ?? s?.images[0]} alt="" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
      <Modal open={pinOpen} onClose={() => setPinOpen(false)} title="Pin a Must Watch Reel">
        <div className="stack gap-2">
          {reels.map((r) => (
            <button
              key={r.id}
              className={cx('radio-card', c.pinnedScrollId === r.id && 'is-on')}
              onClick={() => {
                pin(c.id, r.id)
                setPinOpen(false)
                toast(`Pinned “${r.title}”`, 'success')
              }}
            >
              <img src={r.images[0]} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
              <span className="stack grow">
                <span className="small strong">{r.title}</span>
                <span className="xs faint">
                  {r.country} · {r.tribe}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
