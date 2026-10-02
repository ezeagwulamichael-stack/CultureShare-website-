import { useEffect, useRef, useState, type ReactNode } from 'react'
import { asset } from '../data/seed'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, Message, Share, Archive, More, VolumeSlash, VolumeHigh, Eye, Play, Copy, Flag, UserAdd, ArrowRight2, Coin1 } from 'iconsax-react'
import type { Post, Scroll } from '../data/types'
import { useApp } from '../store/useApp'
import { useUI } from '../store/useUI'
import { compact, copyText, cx, timeAgo, useUser } from '../lib/util'
import { AudioBlock, Avatar, NameLine, RaidButton } from './ui'

/* ─────────── Popover menu ─────────── */
export function Menu({ items, label = 'More options', icon }: { items: { label: string; icon?: ReactNode; onClick: () => void; danger?: boolean }[]; label?: string; icon?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', h)
    document.addEventListener('keydown', k)
    return () => {
      document.removeEventListener('mousedown', h)
      document.removeEventListener('keydown', k)
    }
  }, [open])
  return (
    <div ref={ref} style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      <button className="engage-btn" aria-label={label} aria-expanded={open} onClick={(e) => (e.preventDefault(), setOpen((o) => !o))}>
        {icon ?? <More size={18} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="panel"
            style={{ position: 'absolute', right: 0, bottom: 'calc(100% + 6px)', minWidth: 200, padding: 6, zIndex: 30, boxShadow: 'var(--shadow-md)', background: 'var(--surface-raised)' }}
          >
            {items.map((it) => (
              <button
                key={it.label}
                role="menuitem"
                className="row gap-3 w-full"
                style={{ padding: '10px 12px', borderRadius: 8, fontSize: 'var(--fs-sm)', color: it.danger ? 'var(--danger)' : 'var(--text)', textAlign: 'left' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-glass)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={(e) => {
                  e.preventDefault()
                  setOpen(false)
                  it.onClick()
                }}
              >
                {it.icon}
                {it.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────── Engagement bar ─────────── */
export function EngageBar({ id, likes, comments, saves, kind = 'scroll', darkZone, onComments, creatorId }: { id: string; likes: number; comments: number; saves: number; kind?: 'scroll' | 'post'; darkZone?: boolean; onComments?: () => void; creatorId?: string }) {
  const liked = useApp((s) => !!s.likes[id])
  const saved = useApp((s) => !!s.museum[id])
  const toggleLike = useApp((s) => s.toggleLike)
  const removeFromMuseum = useApp((s) => s.removeFromMuseum)
  const toast = useApp((s) => s.toast)
  const toggleRaid = useApp((s) => s.toggleRaid)
  const raiding = useApp((s) => (creatorId ? s.raiding.includes(creatorId) : false))
  const { openShare, openSave, openComments, openReport } = useUI()
  const nav = useNavigate()
  const [pop, setPop] = useState(0)
  const likeCount = likes + (liked ? 1 : 0)
  const saveCount = saves + (saved ? 1 : 0)
  return (
    <div className={cx('engage', darkZone && 'darkzone-engage')} onClick={(e) => e.stopPropagation()}>
      <button
        className={cx('engage-btn', liked && 'liked')}
        aria-pressed={liked}
        aria-label={liked ? 'Unlike' : 'Like'}
        onClick={(e) => {
          e.preventDefault()
          toggleLike(id)
          setPop((p) => p + 1)
        }}
      >
        <span key={pop} className={pop ? 'pop' : undefined} style={{ display: 'grid' }}>
          <Heart size={18} variant={liked ? 'Bold' : 'Linear'} />
        </span>
        {compact(likeCount)}
      </button>
      <button className="engage-btn" aria-label="Comments" onClick={(e) => (e.preventDefault(), onComments ? onComments() : openComments(id))}>
        <Message size={18} />
        {compact(comments)}
      </button>
      <button className="engage-btn" aria-label="Share" onClick={(e) => (e.preventDefault(), openShare(id, kind))}>
        <Share size={18} />
      </button>
      <span className="grow" />
      {kind === 'scroll' && (
        <button
          className={cx('engage-btn', saved && 'saved')}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from Museum' : 'Save to Museum'}
          onClick={(e) => {
            e.preventDefault()
            if (saved) {
              removeFromMuseum(id)
              toast('Removed from your Museum')
            } else openSave(id)
          }}
        >
          <Archive size={18} variant={saved ? 'Bold' : 'Linear'} />
          <span className="muted-count">{compact(saveCount)} saves</span>
        </button>
      )}
      <Menu
        items={[
          ...(kind === 'scroll' ? [{ label: 'Open Scroll', icon: <ArrowRight2 size={16} />, onClick: () => nav(`/scroll/${id}`) }] : []),
          ...(creatorId && creatorId !== 'me' && creatorId !== 'rogue'
            ? [{ label: raiding ? 'Unraid creator' : 'Raid creator', icon: <UserAdd size={16} />, onClick: () => { toggleRaid(creatorId); toast(raiding ? 'Stopped raiding' : 'You are now raiding this creator', 'success') } }]
            : []),
          { label: 'Copy link', icon: <Copy size={16} />, onClick: async () => { const u = `${location.origin}/${kind === 'scroll' ? 'scroll' : 'post'}/${id}`; toast((await copyText(u)) ? 'Link copied' : `Copy this link: ${u}`, 'success') } },
          { label: 'Report', icon: <Flag size={16} />, danger: true, onClick: () => openReport(id) },
        ]}
      />
    </div>
  )
}

/* ─────────── Scroll media (gallery / video poster / audio) ─────────── */
export function ScrollMedia({ scroll, height = 300, rounded = 0, autoAdvance }: { scroll: Scroll; height?: number | string; rounded?: number; autoAdvance?: boolean }) {
  const [i, setI] = useState(0)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const imgs = scroll.images.length ? scroll.images : [asset('songs-sky.webp')]
  useEffect(() => {
    if (!autoAdvance || imgs.length < 2) return
    const t = setInterval(() => setI((x) => (x + 1) % imgs.length), 4200)
    return () => clearInterval(t)
  }, [autoAdvance, imgs.length])
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setProgress((p) => (p >= 100 ? (setPlaying(false), 0) : p + 0.5)), 100)
    return () => clearInterval(t)
  }, [playing])

  if (scroll.media === 'audio') {
    return (
      <div className="media" style={{ height: 'auto', borderRadius: rounded, padding: 16, background: `linear-gradient(rgba(7,14,9,.55), rgba(7,14,9,.75)), url(${imgs[0]}) center/cover` }}>
        <AudioBlock title={`${scroll.title === 'Songs We Grew Up With' ? 'The Griot’s Song — Oral Transmission' : scroll.title}`} duration={scroll.duration} />
      </div>
    )
  }
  return (
    <div
      className="media"
      style={{ height, borderRadius: rounded }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') setI((x) => Math.min(imgs.length - 1, x + 1))
        if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1))
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.img
          key={imgs[i]}
          src={imgs[i]}
          alt={scroll.title}
          loading="lazy"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: playing ? 1.08 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.45 }, scale: { duration: playing ? 12 : 0.6, ease: 'linear' } }}
          style={{ position: 'absolute', inset: 0 }}
        />
      </AnimatePresence>
      {scroll.media === 'video' && (
        <>
          {scroll.duration && <span className="duration">{scroll.duration}</span>}
          <button
            className="play-btn"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setPlaying((p) => !p)
            }}
            aria-label={playing ? 'Pause' : 'Play'}
            style={{ opacity: playing ? 0 : 1 }}
          >
            <Play size={22} variant="Bold" />
          </button>
          {playing && (
            <button className="sr-only" onClick={() => setPlaying(false)}>
              Pause
            </button>
          )}
          <button
            className="mute-btn"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setMuted((m) => !m)
            }}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeSlash size={15} variant="Bold" /> : <VolumeHigh size={15} variant="Bold" />}
          </button>
          {(playing || progress > 0) && (
            <div
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(255,255,255,.2)' }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setPlaying((p) => !p)
              }}
            >
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--brand-gold)' }} />
            </div>
          )}
        </>
      )}
      {imgs.length > 1 && (
        <div className="carousel-dots" onClick={(e) => e.stopPropagation()}>
          {imgs.map((_, k) => (
            <button key={k} className={cx(k === i && 'is-on')} aria-label={`Image ${k + 1}`} onClick={(e) => (e.preventDefault(), setI(k))} />
          ))}
        </div>
      )}
    </div>
  )
}

export function CultureMeta({ scroll, small }: { scroll: Pick<Scroll, 'country' | 'flag' | 'tribe' | 'category'>; small?: boolean }) {
  return (
    <span className={cx('row gap-1 wrap', small ? 'xs' : 'small')} style={{ color: 'var(--text-4)' }}>
      <span>{scroll.flag}</span>
      <Link to={`/search?country=${encodeURIComponent(scroll.country)}`} className="hover-underline" onClick={(e) => e.stopPropagation()}>
        {scroll.country}
      </Link>
      <span>·</span>
      <Link to={`/search?tribe=${encodeURIComponent(scroll.tribe)}`} className="hover-underline" onClick={(e) => e.stopPropagation()}>
        {scroll.tribe}
      </Link>
      <span>·</span>
      <Link to={`/search?topic=${encodeURIComponent(scroll.category)}`} className="hover-underline" onClick={(e) => e.stopPropagation()}>
        {scroll.category}
      </Link>
    </span>
  )
}

function Caption({ text, max = 180, onMore }: { text: string; max?: number; onMore?: () => void }) {
  const [open, setOpen] = useState(false)
  const long = text.length > max
  return (
    <p className="small" style={{ color: 'var(--text-2)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
      {open || !long ? text : text.slice(0, max).trimEnd() + '… '}
      {long && !open && (
        <button className="link" style={{ fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }} onClick={(e) => (e.preventDefault(), e.stopPropagation(), onMore ? onMore() : setOpen(true))}>
          Read more
        </button>
      )}
    </p>
  )
}

export const DZ_LABEL: Record<string, string> = {
  entered: 'Entered Dark Zone',
  under_scrutiny: 'Under scrutiny',
  restricted: 'Restricted',
  dropped: 'Dropped',
  discussion: 'Discussion open',
}

/* ─────────── Scroll card — feed variant (mobile "Scroll" card, wider) ─────────── */
export function ScrollCard({ scroll, index = 0 }: { scroll: Scroll; index?: number }) {
  const creator = useUser(scroll.anonymous ? 'rogue' : scroll.creatorId)
  const historian = useUser(scroll.historianId)
  const nav = useNavigate()
  if (!creator) return null
  const dz = !!scroll.darkZone
  return (
    <motion.article
      className="card scroll-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index, 4) * 0.04, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => nav(`/scroll/${scroll.id}`)}
      style={{ cursor: 'pointer', overflow: 'hidden', borderColor: dz ? 'var(--darkzone-line)' : undefined }}
    >
      <header className="row gap-3" style={{ padding: '16px 16px 14px' }}>
        <Link to={creator.id === 'rogue' ? '#' : `/u/${creator.id}`} onClick={(e) => e.stopPropagation()}>
          <Avatar user={creator} size={40} />
        </Link>
        <div className="stack grow" style={{ minWidth: 0 }}>
          <NameLine user={creator} />
          <span className="xs faint ellipsis">
            {creator.tagline} · {timeAgo(scroll.createdAt)}
          </span>
        </div>
        {!scroll.anonymous && creator.id !== 'me' && <RaidButton userId={creator.id} size="sm" />}
        <span className="scroll-mark has-tip" style={{ position: 'relative' }}>
          <img src={asset('scroll-icon.webp')} alt="Scroll" width={30} height={30} style={{ transform: 'rotate(-25deg)' }} />
          <span className="tooltip">{scroll.kind === 'documentary' ? 'Documentary Scroll' : 'Reel Scroll'}</span>
        </span>
      </header>
      <ScrollMedia scroll={scroll} height={scroll.media === 'audio' ? 'auto' : 'clamp(260px, 38vw, 420px)'} />
      <div className="stack gap-3" style={{ padding: 16 }}>
        <div className="stack gap-1">
          <div className="row gap-2 wrap">
            <h3 style={{ fontWeight: 600, fontSize: '1.02rem' }}>{scroll.title}</h3>
            {dz && <span className="tag dark">◐ Dark Zone · {DZ_LABEL[scroll.darkZone!.state]}</span>}
            {scroll.price && <span className="tag gold"><Coin1 size={10} variant="Bold" /> ₵{scroll.price.toLocaleString()}</span>}
          </div>
          <CultureMeta scroll={scroll} />
        </div>
        <Caption text={scroll.caption} onMore={() => nav(`/scroll/${scroll.id}`)} />
        {historian && (
          <span className="row gap-2 xs faint">
            <Avatar user={historian} size={18} /> Validated by <Link to={`/u/${historian.id}`} className="gold" onClick={(e) => e.stopPropagation()}>{historian.name}</Link>
          </span>
        )}
        <EngageBar id={scroll.id} likes={scroll.likes} comments={scroll.comments} saves={scroll.saves} darkZone={dz} creatorId={scroll.creatorId} />
      </div>
    </motion.article>
  )
}

/* ─────────── Popular Scroll card (Discover — title + meta, Raid tag on media) ─────────── */
export function ScrollTeaser({ scroll, index = 0 }: { scroll: Scroll; index?: number }) {
  const creator = useUser(scroll.creatorId)
  const nav = useNavigate()
  return (
    <motion.article
      className="card hover-lift"
      style={{ overflow: 'hidden', cursor: 'pointer' }}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
      onClick={() => nav(`/scroll/${scroll.id}`)}
    >
      <div style={{ position: 'relative' }}>
        <ScrollMedia scroll={scroll} height={scroll.media === 'audio' ? 'auto' : 180} />
        {scroll.media !== 'audio' && creator && (
          <span style={{ position: 'absolute', top: 12, right: 12 }}>
            <RaidButton userId={creator.id} size="sm" solid />
          </span>
        )}
      </div>
      <div className="stack gap-2" style={{ padding: 14 }}>
        <h3 className="clamp-2" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
          {scroll.title}
        </h3>
        {creator && (
          <span className="row gap-2 xs" style={{ color: 'var(--text-3)' }}>
            <Avatar user={creator} size={16} />
            <span>{creator.username}</span>
            <span>{scroll.flag}</span>
            <span className="faint">· {scroll.country} · {scroll.tribe} · {scroll.category}</span>
          </span>
        )}
        <EngageBar id={scroll.id} likes={scroll.likes} comments={scroll.comments} saves={scroll.saves} darkZone={!!scroll.darkZone} creatorId={scroll.creatorId} />
      </div>
    </motion.article>
  )
}

/* ─────────── Tile (masonry discover grid) ─────────── */
export function ScrollTile({ scroll, tall }: { scroll: Scroll; tall?: boolean }) {
  return (
    <Link to={`/scroll/${scroll.id}`} className="tile" style={{ gridRow: tall ? 'span 2' : undefined }}>
      <img src={scroll.images[0] ?? asset('songs-sky.webp')} alt={scroll.title} loading="lazy" />
      {scroll.media === 'video' && (
        <span className="tile-play">
          <Play size={12} variant="Bold" />
        </span>
      )}
      <span className="tile-meta">
        <span className="row gap-1">
          <Heart size={11} /> {compact(scroll.likes)}
        </span>
        <span className="row gap-1">
          <Eye size={11} /> {compact(scroll.views)}
        </span>
      </span>
      <span className="tile-title">{scroll.title}</span>
    </Link>
  )
}

/* ─────────── Row (Historian's "Their Scrolls" list) ─────────── */
export function ScrollRow({ title, meta, image, to }: { title: string; meta: string; image: string; to: string }) {
  return (
    <Link to={to} className="row gap-3 scroll-row">
      <img src={image} alt="" width={44} height={44} style={{ borderRadius: 8, objectFit: 'cover', flex: 'none', width: 44, height: 44 }} />
      <span className="stack grow" style={{ minWidth: 0 }}>
        <span className="small strong ellipsis">{title}</span>
        <span className="xs faint ellipsis">{meta}</span>
      </span>
      <span className="xs gold row gap-1">
        View <ArrowRight2 size={12} />
      </span>
    </Link>
  )
}

/* ─────────── Post card ─────────── */
export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const author = useUser(post.authorId)
  const openComments = useUI((s) => s.openComments)
  if (!author) return null
  if (post.announcement) {
    return (
      <motion.article className="card" style={{ padding: 20, background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 16%, var(--surface-1)), var(--surface-1))', borderColor: 'var(--accent-line)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="row between">
          <span className="eyebrow gold" style={{ fontSize: 13, letterSpacing: '0.08em' }}>
            Announcement
          </span>
          <span style={{ fontSize: 22 }}>📣</span>
        </div>
        <p className="mt-3" style={{ lineHeight: 1.6 }}>
          {post.text}
        </p>
        <span className="xs faint mt-3" style={{ display: 'block' }}>
          Posted by {author.name} · {timeAgo(post.createdAt)}
        </span>
      </motion.article>
    )
  }
  return (
    <motion.article
      className="card"
      style={{ overflow: 'hidden' }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 4) * 0.04 }}
    >
      <header className="row gap-3" style={{ padding: '16px 16px 12px' }}>
        <Link to={author.id === 'me' ? '/profile' : `/u/${author.id}`}>
          <Avatar user={author} size={40} />
        </Link>
        <div className="stack grow" style={{ minWidth: 0 }}>
          <NameLine user={author} />
          <span className="xs faint ellipsis">
            {author.tagline} · {timeAgo(post.createdAt)}
            {post.location && ` · 📍 ${post.location}`}
          </span>
        </div>
        <span className="tag">Post</span>
      </header>
      <div style={{ padding: '0 16px 12px' }}>
        <Caption text={post.text} max={260} />
        {post.music && <p className="xs gold mt-2">♪ {post.music}</p>}
      </div>
      {post.images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: post.images.length > 1 ? '1fr 1fr' : '1fr', gap: 4, padding: '0 16px' }}>
          {post.images.map((src) => (
            <img key={src} src={src} alt="" loading="lazy" style={{ width: '100%', height: post.images.length > 1 ? 220 : 340, objectFit: 'cover', borderRadius: 12 }} />
          ))}
        </div>
      )}
      <div style={{ padding: 16 }}>
        <EngageBar id={post.id} likes={post.likes} comments={post.comments} saves={post.saves} kind="post" creatorId={post.authorId} onComments={() => openComments(post.id)} />
      </div>
    </motion.article>
  )
}
