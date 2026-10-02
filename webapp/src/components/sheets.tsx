import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Add, ArrowLeft2, ArrowRight, ArrowRight2, Book1, Clock, CloseCircle, Copy, ExportSquare, Heart, Message, People, Send2, Note, SearchNormal1, TickCircle } from 'iconsax-react'
import { useApp } from '../store/useApp'
import { useUI } from '../store/useUI'
import { USERS, asset } from '../data/seed'
import { copyText, cx, getUser, timeAgo, useUser } from '../lib/util'
import { Avatar, Drawer, Input, Modal, NameLine, Switch } from './ui'

/* ─────────── Share drawer (Screen 33) ─────────── */
export function ShareSheet() {
  const share = useUI((s) => s.share)
  const close = useUI((s) => s.close)
  const scrolls = useApp((s) => s.scrolls)
  const raiding = useApp((s) => s.raiding)
  const raiders = useApp((s) => s.raiders)
  const communities = useApp((s) => s.communities)
  const joined = useApp((s) => s.joined)
  const shareTo = useApp((s) => s.shareToConversation)
  const toast = useApp((s) => s.toast)
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [note, setNote] = useState('')
  const scroll = scrolls.find((x) => x.id === share?.id)
  const people = useMemo(() => [...new Set([...raiding, ...raiders])].map(getUser).filter(Boolean).filter((u) => u!.name.toLowerCase().includes(q.toLowerCase())), [raiding, raiders, q])
  const url = `${location.origin}/${share?.kind === 'profile' ? 'u' : share?.kind === 'post' ? 'post' : 'scroll'}/${share?.id}`
  const done = () => {
    setPicked([])
    setNote('')
    setQ('')
    close('share')
  }
  return (
    <Drawer
      open={!!share}
      onClose={done}
      title={share?.kind === 'profile' ? 'Share profile' : share?.kind === 'post' ? 'Share post' : 'Share Scroll'}
      footer={
        <button
          className="btn btn-primary btn-block"
          disabled={!picked.length}
          onClick={() => {
            picked.forEach((p) => {
              if (p.startsWith('com:')) return
              if (share) shareTo(p, share.id, note)
            })
            toast(`Shared with ${picked.length} ${picked.length === 1 ? 'recipient' : 'recipients'}`, 'success', { label: 'Open messages', to: '/messages' })
            done()
          }}
        >
          <Send2 size={18} /> Send{picked.length ? ` (${picked.length})` : ''}
        </button>
      }
    >
      {scroll && (
        <div className="row gap-3 panel" style={{ padding: 10, marginBottom: 16 }}>
          <img src={scroll.images[0] ?? asset('songs-sky.webp')} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover' }} />
          <div className="stack" style={{ minWidth: 0 }}>
            <span className="small strong ellipsis">{scroll.title}</span>
            <span className="xs faint">
              {scroll.flag} {scroll.country} · {scroll.tribe}
            </span>
          </div>
        </div>
      )}
      <div className="row gap-2" style={{ marginBottom: 18 }}>
        <button
          className="btn btn-secondary btn-sm grow"
          onClick={async () => {
            toast((await copyText(url)) ? 'Link copied' : `Copy this link: ${url}`, 'success')
          }}
        >
          <Copy size={16} /> Copy link
        </button>
        <button
          className="btn btn-secondary btn-sm grow"
          onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({ title: scroll?.title ?? 'CultureShare', url })
              } catch {
                /* user cancelled */
              }
            } else {
              toast((await copyText(url)) ? 'External sharing isn’t available here, so the link was copied instead' : `External sharing isn’t available here. Link: ${url}`)
            }
          }}
        >
          <ExportSquare size={16} /> External share
        </button>
      </div>
      <Input placeholder="Search Raiders and people you raid" value={q} onChange={(e) => setQ(e.target.value)} icon={<SearchNormal1 size={16} color="var(--text-4)" />} />
      <p className="eyebrow mt-4">Message</p>
      <div className="stack gap-1 mt-2">
        {people.map((u) => {
          const on = picked.includes(u!.id)
          return (
            <button key={u!.id} className={cx('row gap-3 share-row', on && 'is-on')} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== u!.id) : [...p, u!.id]))}>
              <Avatar user={u} size={38} />
              <span className="stack grow" style={{ textAlign: 'left', minWidth: 0 }}>
                <span className="small strong ellipsis">{u!.name}</span>
                <span className="xs faint">@{u!.username}</span>
              </span>
              <span className={cx('radio-dot')} style={on ? { borderColor: 'var(--accent)', background: 'var(--accent)' } : undefined}>
                {on && <TickCircle size={14} color="#0a1800" variant="Bold" />}
              </span>
            </button>
          )
        })}
      </div>
      <p className="eyebrow mt-4">Community</p>
      <div className="stack gap-1 mt-2">
        {communities
          .filter((c) => joined.includes(c.id))
          .map((c) => {
            const id = `com:${c.id}`
            const on = picked.includes(id)
            return (
              <button key={c.id} className={cx('row gap-3 share-row', on && 'is-on')} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== id) : [...p, id]))}>
                <img src={c.image} alt="" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover' }} />
                <span className="stack grow" style={{ textAlign: 'left' }}>
                  <span className="small strong">{c.name}</span>
                  <span className="xs faint">{c.members.toLocaleString()} members</span>
                </span>
                <span className="radio-dot" style={on ? { borderColor: 'var(--accent)', background: 'var(--accent)' } : undefined}>
                  {on && <TickCircle size={14} color="#0a1800" variant="Bold" />}
                </span>
              </button>
            )
          })}
      </div>
      {picked.length > 0 && <Input className="mt-4" placeholder="Add a note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />}
    </Drawer>
  )
}

/* ─────────── Save to Museum (Screen 35) ─────────── */
export function SaveSheet() {
  const scrollId = useUI((s) => s.save)
  const close = useUI((s) => s.close)
  const collections = useApp((s) => s.collections)
  const save = useApp((s) => s.saveToMuseum)
  const toast = useApp((s) => s.toast)
  const [pick, setPick] = useState('Default')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  return (
    <Modal
      open={!!scrollId}
      onClose={() => close('save')}
      title="Save to Museum"
      footer={
        <>
          <button className="btn btn-ghost" onClick={() => close('save')}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              const name = creating && newName.trim() ? newName.trim() : pick
              save(scrollId!, name)
              toast(`Saved to your Museum · ${name}`, 'success', { label: 'View Museum', to: '/profile/museum' })
              setCreating(false)
              setNewName('')
              close('save')
            }}
          >
            Save
          </button>
        </>
      }
    >
      <p className="small muted" style={{ marginBottom: 14 }}>
        Your Museum keeps the Scrolls you save, buy and sell. Choose a collection:
      </p>
      <div className="stack gap-2">
        {collections
          .filter((c) => c !== 'Bought')
          .map((c) => (
            <button key={c} className={cx('radio-card', !creating && pick === c && 'is-on')} onClick={() => (setPick(c), setCreating(false))}>
              <span className="radio-dot" />
              <span className="stack">
                <span className="strong small">{c}</span>
              </span>
            </button>
          ))}
        {creating ? (
          <Input autoFocus placeholder="Collection name, e.g. Igbo food" value={newName} onChange={(e) => setNewName(e.target.value)} />
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={() => setCreating(true)}>
            <Add size={16} /> Create collection
          </button>
        )}
      </div>
    </Modal>
  )
}

/* ─────────── Comments side panel (Screen 34) ─────────── */
export function CommentsSheet() {
  const target = useUI((s) => s.comments)
  const close = useUI((s) => s.close)
  return (
    <Drawer open={!!target} onClose={() => close('comments')} title="Comments">
      {target && <CommentThread targetId={target} />}
    </Drawer>
  )
}

export function CommentThread({ targetId, compact }: { targetId: string; compact?: boolean }) {
  const all = useApp((s) => s.comments)
  const add = useApp((s) => s.addComment)
  const likes = useApp((s) => s.likes)
  const toggleLike = useApp((s) => s.toggleCommentLike)
  const plan = useApp((s) => s.plan)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [anon, setAnon] = useState(false)
  const comments = all.filter((c) => c.targetId === targetId)
  const roots = comments.filter((c) => !c.parentId).sort((a, b) => b.createdAt - a.createdAt)
  const canAnon = plan === 'executive' || plan === 'premium'
  const submit = () => {
    if (!text.trim()) return
    add(targetId, text.trim(), replyTo ?? undefined, anon)
    setText('')
    setReplyTo(null)
  }
  return (
    <div className="stack gap-4">
      <form
        className="stack gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        {replyTo && (
          <span className="row gap-2 xs muted">
            Replying to {getUser(all.find((c) => c.id === replyTo)?.authorId ?? '')?.name ?? 'you'}
            <button type="button" className="link xs" onClick={() => setReplyTo(null)}>
              Cancel
            </button>
          </span>
        )}
        <div className="row gap-2">
          <Avatar src={useApp.getState().me.avatar} name="You" size={34} />
          <div className="input-wrap grow" style={{ minHeight: 44, borderRadius: 999 }}>
            <input placeholder={replyTo ? 'Write a reply…' : 'Write a comment…'} value={text} onChange={(e) => setText(e.target.value)} aria-label="Comment" />
          </div>
          <motion.button whileTap={{ scale: 0.9 }} className="icon-btn round" style={{ background: 'var(--brand-gold-200)', color: '#0a1800' }} aria-label="Send comment" disabled={!text.trim()}>
            <Send2 size={18} />
          </motion.button>
        </div>
        {canAnon && !compact && (
          <label className="row gap-2 xs muted" style={{ cursor: 'pointer' }}>
            <Switch checked={anon} onChange={setAnon} label="Comment as Rogue Raider" /> Comment anonymously as Rogue Raider
          </label>
        )}
      </form>
      {roots.length === 0 && <p className="small muted" style={{ textAlign: 'center', padding: 24 }}>No comments yet. Start the conversation.</p>}
      <AnimatePresence initial={false}>
        {roots.map((c) => (
          <motion.div key={c.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="stack gap-3">
            <CommentItem id={c.id} authorId={c.authorId} text={c.text} at={c.createdAt} likes={c.likes + (likes[`comment:${c.id}`] ? 1 : 0)} liked={!!likes[`comment:${c.id}`]} onLike={() => toggleLike(c.id)} onReply={() => setReplyTo(c.id)} />
            {comments
              .filter((r) => r.parentId === c.id)
              .map((r) => (
                <div key={r.id} style={{ paddingLeft: 44 }}>
                  <CommentItem id={r.id} authorId={r.authorId} text={r.text} at={r.createdAt} likes={r.likes + (likes[`comment:${r.id}`] ? 1 : 0)} liked={!!likes[`comment:${r.id}`]} onLike={() => toggleLike(r.id)} />
                </div>
              ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function CommentItem({ authorId, text, at, likes, liked, onLike, onReply }: { id: string; authorId: string; text: string; at: number; likes: number; liked: boolean; onLike: () => void; onReply?: () => void }) {
  const u = useUser(authorId)
  if (!u) return null
  return (
    <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
      <Avatar user={u} size={34} />
      <div className="stack gap-1 grow" style={{ minWidth: 0 }}>
        <span className="row gap-2">
          <NameLine user={u} size="sm" />
          <span className="xs faint">{timeAgo(at)}</span>
        </span>
        <p className="small" style={{ color: 'var(--text-2)', lineHeight: 1.55 }}>
          {text}
        </p>
        <span className="row gap-3 xs faint">
          <button className={cx('row gap-1', liked && 'gold')} onClick={onLike} style={liked ? { color: 'var(--heart)' } : undefined}>
            <Heart size={13} variant={liked ? 'Bold' : 'Linear'} /> {likes}
          </button>
          {onReply && (
            <button className="row gap-1" onClick={onReply}>
              <Message size={13} /> Reply
            </button>
          )}
        </span>
      </div>
    </div>
  )
}

/* ─────────── Status viewer (Screen 09 + mobile story screens) ─────────── */
export function StatusViewer() {
  const v = useUI((s) => s.statusViewer)
  const close = useUI((s) => s.close)
  const statuses = useApp((s) => s.statuses)
  const markSeen = useApp((s) => s.markStatusSeen)
  const startConv = useApp((s) => s.startConversation)
  const send = useApp((s) => s.sendMessage)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const [u, setU] = useState(0)
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reply, setReply] = useState('')
  useEffect(() => {
    if (v) {
      setU(v.index)
      setI(0)
    }
  }, [v])
  const status = v ? statuses.find((s) => s.id === v.statusIds[u]) : undefined
  const owner = useUser(status?.userId)
  const item = status?.items[i]
  const next = () => {
    if (!v || !status) return
    if (i < status.items.length - 1) setI(i + 1)
    else if (u < v.statusIds.length - 1) {
      setU(u + 1)
      setI(0)
    } else close('statusViewer')
  }
  const prev = () => {
    if (i > 0) setI(i - 1)
    else if (u > 0) {
      setU(u - 1)
      setI(0)
    }
  }
  useEffect(() => {
    if (status) markSeen(status.id)
  }, [status, markSeen])
  useEffect(() => {
    if (!v || paused) return
    const t = setTimeout(next, 5200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, u, i, paused])
  useEffect(() => {
    if (!v) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close('statusViewer')
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === ' ') setPaused((p) => !p)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })
  return createPortal(
    <AnimatePresence>
      {v && status && item && owner && (
        <motion.div className="story-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`${owner.name}'s status`}>
          <div className="story-backdrop" style={{ backgroundImage: `url(${item.image})` }} />
          {u > 0 && (
            <button className="story-nav left" onClick={() => (setU(u - 1), setI(0))} aria-label="Previous person">
              <ArrowLeft2 size={22} />
            </button>
          )}
          <motion.div className="story-frame" key={status.id} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img key={item.id} src={item.image} alt="" className="story-img" initial={{ opacity: 0 }} animate={{ opacity: 1, scale: [1, 1.06] }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 0.3 }, scale: { duration: 6, ease: 'linear' } }} />
            </AnimatePresence>
            <div className="story-top">
              <div className="story-bars">
                {status.items.map((it, k) => (
                  <span key={`${status.id}-${it.id}-${k === i ? i : 'x'}`}>
                    <i style={{ width: k < i ? '100%' : k > i ? '0%' : undefined, animation: k === i ? `storyFill 5.2s linear forwards` : undefined, animationPlayState: paused ? 'paused' : 'running' }} />
                  </span>
                ))}
              </div>
              <div className="row gap-2" style={{ marginTop: 12 }}>
                <Avatar user={owner} size={34} />
                <div className="stack grow" style={{ minWidth: 0, color: '#fff' }}>
                  <span className="row gap-1 small strong">
                    {owner.username} {owner.flag}
                  </span>
                  <span style={{ fontSize: 10, opacity: 0.75 }}>
                    {owner.tagline} · {timeAgo(status.createdAt)}
                  </span>
                </div>
                <button className="icon-btn sm" style={{ color: '#fff' }} onClick={() => close('statusViewer')} aria-label="Close status">
                  <CloseCircle size={22} />
                </button>
              </div>
            </div>
            <button className="story-hit left" onClick={(e) => (e.stopPropagation(), prev())} aria-label="Previous" />
            <button className="story-hit right" onClick={(e) => (e.stopPropagation(), next())} aria-label="Next" />
            <div className="story-bottom" onPointerDown={(e) => e.stopPropagation()}>
              <p className="small" style={{ color: 'rgba(255,255,255,.9)', lineHeight: 1.5 }}>
                {item.caption}
              </p>
              {item.scrollId && (
                <button
                  className="story-scroll"
                  onClick={() => {
                    close('statusViewer')
                    nav(`/scroll/${item.scrollId}`)
                  }}
                >
                  <span className="stack" style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: 10, letterSpacing: '0.08em', textDecoration: 'underline', color: 'var(--brand-gold)' }}>VIEW SCROLL</span>
                    <span className="small strong" style={{ color: '#fff' }}>
                      {useApp.getState().scrolls.find((s) => s.id === item.scrollId)?.title}
                    </span>
                  </span>
                  <ArrowRight size={18} color="var(--brand-gold)" />
                </button>
              )}
              {owner.id !== 'me' && (
                <form
                  className="row gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!reply.trim()) return
                    const id = startConv(owner.id)
                    send(id, `Replied to your status: ${reply.trim()}`)
                    setReply('')
                    toast(`Reply sent to ${owner.name}`, 'success')
                  }}
                >
                  <input className="story-input" placeholder="Add a comment…" value={reply} onChange={(e) => setReply(e.target.value)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} />
                  <button className="icon-btn round" style={{ background: 'var(--brand-gold-200)', color: '#0a1800' }} aria-label="Send reply">
                    <Send2 size={18} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
          {u < v.statusIds.length - 1 && (
            <button className="story-nav right" onClick={() => (setU(u + 1), setI(0))} aria-label="Next person">
              <ArrowRight2 size={22} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ─────────── Create hub (mobile "Create" sheet) ─────────── */
export function CreateHub() {
  const open = useUI((s) => s.create)
  const close = useUI((s) => s.close)
  const nav = useNavigate()
  const items = [
    { to: '/create/scroll', icon: <Book1 size={22} variant="Bulk" />, title: 'Create Scroll', text: 'Reel or Documentary cultural story' },
    { to: '/create/post', icon: <Note size={22} variant="Bulk" />, title: 'Create Post', text: 'Share a moment or story' },
    { to: '/create/status', icon: <Clock size={22} variant="Bulk" />, title: 'Add Status', text: 'Disappears in 24 hours' },
    { to: '/communities?create=1', icon: <People size={22} variant="Bulk" />, title: 'Create Community', text: 'Start a cultural community' },
  ]
  return (
    <Modal open={open} onClose={() => close('create')} title="Create">
      <div className="stack gap-3">
        {items.map((it, k) => (
          <motion.button
            key={it.to}
            className="create-item"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * k }}
            onClick={() => {
              close('create')
              nav(it.to)
            }}
          >
            <span className="ci-icon">{it.icon}</span>
            <span className="stack grow" style={{ textAlign: 'left' }}>
              <span className="strong">{it.title}</span>
              <span className="xs muted">{it.text}</span>
            </span>
            <ArrowRight2 size={16} color="var(--text-3)" />
          </motion.button>
        ))}
      </div>
    </Modal>
  )
}

/* ─────────── Report ─────────── */
export function ReportSheet() {
  const id = useUI((s) => s.report)
  const close = useUI((s) => s.close)
  const toast = useApp((s) => s.toast)
  const [reason, setReason] = useState('')
  const reasons = ['Misrepresents a culture or tribe', 'Harmful stereotype', 'Sacred content shared without permission', 'Not original / uncredited', 'Harassment', 'Spam']
  return (
    <Modal
      open={!!id}
      onClose={() => close('report')}
      title="Report content"
      footer={
        <>
          <button className="btn btn-ghost" onClick={() => close('report')}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            disabled={!reason}
            onClick={() => {
              toast('Thanks — CultureShare and the assigned Historian will look at this.', 'success')
              setReason('')
              close('report')
            }}
          >
            Submit report
          </button>
        </>
      }
    >
      <div className="stack gap-2">
        {reasons.map((r) => (
          <button key={r} className={cx('radio-card', reason === r && 'is-on')} onClick={() => setReason(r)}>
            <span className="radio-dot" />
            <span className="small">{r}</span>
          </button>
        ))}
      </div>
    </Modal>
  )
}

/* People picker used by community creation, Scroll tagging and family tree */
export function PeoplePicker({ value, onChange, exclude = [] }: { value: string[]; onChange: (v: string[]) => void; exclude?: string[] }) {
  const [q, setQ] = useState('')
  const list = USERS.filter((u) => u.role !== 'artist' && !exclude.includes(u.id) && (u.name + u.username).toLowerCase().includes(q.toLowerCase())).slice(0, 8)
  return (
    <div className="stack gap-2">
      <Input placeholder="Search by name or username" value={q} onChange={(e) => setQ(e.target.value)} icon={<SearchNormal1 size={16} color="var(--text-4)" />} />
      {value.length > 0 && (
        <div className="row gap-2 wrap">
          {value.map((id) => {
            const u = getUser(id)
            return (
              <button key={id} className="chip sm is-on" onClick={() => onChange(value.filter((x) => x !== id))}>
                {u?.name} <CloseCircle size={12} />
              </button>
            )
          })}
        </div>
      )}
      <div className="stack gap-1" style={{ maxHeight: 220, overflow: 'auto' }}>
        {list.map((u) => {
          const on = value.includes(u.id)
          return (
            <button key={u.id} type="button" className={cx('row gap-3 share-row', on && 'is-on')} onClick={() => onChange(on ? value.filter((x) => x !== u.id) : [...value, u.id])}>
              <Avatar user={u} size={32} />
              <span className="stack grow" style={{ textAlign: 'left' }}>
                <span className="small strong">{u.name}</span>
                <span className="xs faint">@{u.username}</span>
              </span>
              {on && <TickCircle size={18} color="var(--accent)" variant="Bold" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function GlobalSheets() {
  return (
    <>
      <ShareSheet />
      <SaveSheet />
      <CommentsSheet />
      <StatusViewer />
      <CreateHub />
      <ReportSheet />
    </>
  )
}
