import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { asset } from '../data/seed'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { CloseCircle, InfoCircle, TickCircle, Verify, Warning2, Add, Crown1, Pause, Play, Lock1 } from 'iconsax-react'
import { useApp } from '../store/useApp'
import { cx, initials, useUser } from '../lib/util'
import type { User } from '../data/types'

/* ─────────── Brand ─────────── */
export function Logo({ size = 28, word = true, to = '/home' }: { size?: number; word?: boolean; to?: string }) {
  return (
    <Link to={to} className="row gap-2" aria-label="CultureShare home">
      <motion.img
        src={asset('cs-mark.svg')}
        width={size}
        height={size}
        alt=""
        whileHover={{ rotate: 25 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      />
      {word && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: size * 0.66, letterSpacing: '-0.01em' }}>CultureShare</span>}
    </Link>
  )
}

/* ─────────── Avatar & identity ─────────── */
export function Avatar({ user, src, name, size = 40, ring, className }: { user?: User; src?: string; name?: string; size?: number; ring?: boolean; className?: string }) {
  const n = user?.name ?? name ?? ''
  const s = user?.avatar ?? src
  const [broken, setBroken] = useState(false)
  if (user?.id === 'rogue') {
    return (
      <span className={cx('avatar rogue', className)} style={{ ['--size' as string]: `${size}px` }} aria-label="Rogue Raider">
        <MaskGlyph size={size * 0.55} />
      </span>
    )
  }
  return (
    <span className={cx('avatar', ring && 'ring', className)} style={{ ['--size' as string]: `${size}px` }}>
      {s && !broken ? <img src={s} alt={n} loading="lazy" onError={() => setBroken(true)} /> : <span aria-label={n}>{initials(n)}</span>}
    </span>
  )
}

function MaskGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 7c3-1.5 6-2 9-2s6 .5 9 2c0 6-3.5 11-9 11S3 13 3 7Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10.5c.8-.6 2.2-.6 3 0M13.5 10.5c.8-.6 2.2-.6 3 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function VerifiedMark({ size = 14 }: { size?: number }) {
  return (
    <span className="verified" title="Verified" aria-label="Verified">
      <Verify size={size} variant="Bold" />
    </span>
  )
}

export function HistorianBadge({ compact }: { compact?: boolean }) {
  return (
    <span className="historian-badge" title="Historian — authorised to validate Scrolls">
      <Crown1 size={10} variant="Bold" />
      {!compact && 'Historian'}
    </span>
  )
}

export function NameLine({ user, size = 'md', link = true }: { user: User; size?: 'sm' | 'md' | 'lg'; link?: boolean }) {
  const fs = size === 'lg' ? '1.05rem' : size === 'sm' ? '0.8125rem' : '0.9375rem'
  const inner = (
    <span className="row gap-1" style={{ fontWeight: 600, fontSize: fs, minWidth: 0 }}>
      <span className="ellipsis">{user.id === 'rogue' ? 'Rogue Raider' : user.username}</span>
      {user.flag && <span className="flag">{user.flag}</span>}
      {user.verified && <VerifiedMark />}
      {user.role === 'historian' && <HistorianBadge compact={size === 'sm'} />}
    </span>
  )
  if (!link || user.id === 'rogue') return inner
  return (
    <Link to={user.id === 'me' ? '/profile' : `/u/${user.id}`} className="hover-underline" style={{ minWidth: 0 }}>
      {inner}
    </Link>
  )
}

export function RaidButton({ userId, solid, size }: { userId: string; solid?: boolean; size?: 'sm' }) {
  const raiding = useApp((s) => s.raiding.includes(userId))
  const toggleRaid = useApp((s) => s.toggleRaid)
  const toast = useApp((s) => s.toast)
  const user = useUser(userId)
  if (userId === 'me' || userId === 'rogue') return null
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      className={cx('raid-btn', raiding && 'is-raiding', solid && !raiding && 'solid')}
      style={size === 'sm' ? { height: 26, minWidth: 56, padding: '0 10px' } : undefined}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleRaid(userId)
        toast(raiding ? `You stopped raiding ${user?.name ?? 'this creator'}` : `Raiding ${user?.name ?? 'creator'} — you’ll get their Scrolls first-hand`, raiding ? 'info' : 'success')
      }}
      aria-pressed={raiding}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={raiding ? 'on' : 'off'} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} transition={{ duration: 0.15 }}>
          {raiding ? 'Raiding' : 'Raid'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

/* ─────────── Status ring (octagon + segmented ring) ─────────── */
/* ─────────── Status ring — CultureShare uses a hexagon, not a circle ───────────
   The outline is split into one dash per status item, so the number of dashes
   tells you how many updates the person has posted. */
const HEX = '50,3 92,27 92,73 50,97 8,73 8,27'
export function StatusRing({ src, segments = 1, seen, size = 64, add }: { src?: string; segments?: number; seen?: boolean; size?: number; add?: boolean }) {
  const gid = useId()
  const total = 120 // normalised outline length
  const n = Math.max(1, segments)
  const gap = n > 1 ? Math.min(11, 48 / n) : 0
  const dash = total / n - gap
  return (
    <span className="status-ring" style={{ ['--size' as string]: `${size}px` }} aria-label={add ? undefined : `${n} status update${n === 1 ? '' : 's'}${seen ? ', seen' : ''}`}>
      <svg viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3dda3" />
            <stop offset="1" stopColor="#c9a84c" />
          </linearGradient>
        </defs>
        {add ? (
          <polygon points={HEX} fill="none" stroke="var(--line-2)" strokeWidth="2.5" strokeDasharray="5 5" strokeLinejoin="round" />
        ) : (
          <polygon
            points={HEX}
            pathLength={total}
            fill="none"
            stroke={seen ? 'var(--line-2)' : `url(#${gid})`}
            strokeWidth="4.5"
            strokeLinejoin="round"
            strokeLinecap="butt"
            strokeDasharray={n > 1 ? `${dash} ${gap}` : undefined}
            strokeDashoffset={n > 1 ? -gap / 2 : undefined}
          />
        )}
      </svg>
      {add ? (
        <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--text)' }}>
          <Add size={size * 0.38} />
        </span>
      ) : (
        <span className="face">{src && <img src={src} alt="" />}</span>
      )}
    </span>
  )
}

/* ─────────── Tabs (animated ink) ─────────── */
export function Tabs<T extends string>({ tabs, value, onChange, fill, counts }: { tabs: readonly T[] | T[]; value: T; onChange: (v: T) => void; fill?: boolean; counts?: Partial<Record<T, number>> }) {
  const id = useId()
  return (
    <div className={cx('tabs', fill && 'fill')} role="tablist">
      {tabs.map((t) => (
        <button key={t} role="tab" aria-selected={value === t} className={cx('tab', value === t && 'is-on')} onClick={() => onChange(t)}>
          {t}
          {counts?.[t] !== undefined && <span className="count">{counts[t]}</span>}
          {value === t && <motion.span layoutId={`ink-${id}`} className="tab-ink" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
        </button>
      ))}
    </div>
  )
}

export function Segmented<T extends string>({ options, value, onChange }: { options: readonly T[] | T[]; value: T; onChange: (v: T) => void }) {
  const id = useId()
  return (
    <div className="segmented" role="radiogroup">
      {options.map((o) => (
        <button key={o} role="radio" aria-checked={value === o} className={cx(value === o && 'is-on')} onClick={() => onChange(o)} style={{ isolation: 'isolate' }}>
          {value === o && <motion.span layoutId={`seg-${id}`} className="seg-bg" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
          <span>{o}</span>
        </button>
      ))}
    </div>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)} />
}

/* ─────────── Overlays ─────────── */
function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', h)
      document.body.style.overflow = prev
    }
  }, [open, onClose])
}

function useFocusTrap(open: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open || !ref.current) return
    const el = ref.current
    const prev = document.activeElement as HTMLElement | null
    const focusables = () => Array.from(el.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter((x) => !x.hasAttribute('disabled'))
    const t = setTimeout(() => (el.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0])?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const f = focusables()
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    el.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      el.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [open])
  return ref
}

export function Modal({ open, onClose, title, children, footer, wide, label }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean; label?: string }) {
  useEscape(open, onClose)
  const ref = useFocusTrap(open)
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label ?? (typeof title === 'string' ? title : undefined)}
            className={cx('modal', wide && 'wide')}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            {title !== undefined && (
              <div className="modal-head">
                <h2 className="h3">{title}</h2>
                <button className="icon-btn sm round" onClick={onClose} aria-label="Close">
                  <CloseCircle size={20} />
                </button>
              </div>
            )}
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-foot">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Drawer({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEscape(open, onClose)
  const ref = useFocusTrap(open)
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="drawer-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
            className={cx('drawer', wide && 'wide')}
            initial={mobile ? { y: '100%' } : { x: '100%' }}
            animate={mobile ? { y: 0 } : { x: 0 }}
            exit={mobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
          >
            <div className="drawer-head">
              <h2 className="h3">{title}</h2>
              <button className="icon-btn sm round" onClick={onClose} aria-label="Close">
                <CloseCircle size={20} />
              </button>
            </div>
            <div className="drawer-body">{children}</div>
            {footer && <div className="drawer-foot">{footer}</div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Toasts() {
  const toasts = useApp((s) => s.toasts)
  const dismiss = useApp((s) => s.dismissToast)
  const nav = useNavigate()
  return (
    <div className="toasts" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} layout className={cx('toast', t.kind)} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
            <span className="t-icon">{t.kind === 'success' ? <TickCircle size={20} variant="Bold" /> : t.kind === 'error' ? <Warning2 size={20} variant="Bold" /> : <InfoCircle size={20} variant="Bold" />}</span>
            <span className="grow">{t.text}</span>
            {t.action && (
              <button
                className="link small"
                onClick={() => {
                  nav(t.action!.to)
                  dismiss(t.id)
                }}
              >
                {t.action.label}
              </button>
            )}
            <button className="icon-btn sm" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <CloseCircle size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ─────────── States ─────────── */
export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <motion.div className="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <span className="e-icon">{icon}</span>
      <h3 className="h3">{title}</h3>
      <p>{text}</p>
      {action}
    </motion.div>
  )
}

export function Skeleton({ h = 16, w = '100%', r, style }: { h?: number | string; w?: number | string; r?: number; style?: CSSProperties }) {
  return <span className="skeleton" style={{ display: 'block', height: h, width: w, borderRadius: r, ...style }} />
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row gap-3">
        <Skeleton h={40} w={40} r={40} />
        <div className="stack gap-2 grow">
          <Skeleton h={12} w="40%" />
          <Skeleton h={10} w="25%" />
        </div>
      </div>
      <Skeleton h={260} style={{ marginTop: 16 }} />
      <Skeleton h={12} style={{ marginTop: 16 }} />
      <Skeleton h={12} w="70%" style={{ marginTop: 8 }} />
    </div>
  )
}

export function Callout({ kind, icon, children }: { kind?: 'gold' | 'warn' | 'danger' | 'success'; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className={cx('callout', kind)}>
      <span className="c-icon">{icon ?? <InfoCircle size={18} />}</span>
      <div className="grow">{children}</div>
    </div>
  )
}

/** Makes an unresolved business rule explicit in the UI instead of inventing it. */
export function Decision({ children }: { children: ReactNode }) {
  return (
    <div className="decision" role="note">
      <InfoCircle size={16} style={{ flex: 'none', marginTop: 1, color: 'var(--accent-text)' }} />
      <div>
        <strong>Needs product decision</strong>
        {children}
      </div>
    </div>
  )
}

export function LaterBadge() {
  return (
    <span className="later-badge" title="Later-stage feature — not part of the initial product">
      <Lock1 size={9} variant="Bold" /> Later stage
    </span>
  )
}

/* ─────────── Form ─────────── */
type FieldProps = { label?: string; hint?: string; error?: string; valid?: boolean; icon?: ReactNode; trailing?: ReactNode; className?: string }

export function Input({ label, hint, error, valid, icon, trailing, className, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className={cx('field', className)}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className={cx('input-wrap', error && 'has-error', valid && 'is-valid')}>
        {icon}
        <input id={id} aria-invalid={!!error} {...rest} />
        {trailing}
        {valid !== undefined && (
          <span className="valid-tick" aria-hidden>
            <TickCircle size={22} variant="Bold" />
          </span>
        )}
      </div>
      {error ? <span className="error-text">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  )
}

export function Textarea({ label, hint, error, className, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <div className={cx('field', className)}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className={cx('input-wrap', error && 'has-error')} style={{ alignItems: 'stretch' }}>
        <textarea id={id} {...rest} />
      </div>
      {error ? <span className="error-text">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  )
}

export function Select({ label, hint, error, className, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <div className={cx('field', className)}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className={cx('input-wrap', error && 'has-error')}>
        <select id={id} {...rest}>
          {children}
        </select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ pointerEvents: 'none', color: 'var(--text-3)' }}>
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {error ? <span className="error-text">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  )
}

/* ─────────── Audio Scroll player (simulated playback) ─────────── */
export function AudioBlock({ title, duration = '5:17', compact }: { title: string; duration?: string; compact?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const bars = useRef(Array.from({ length: compact ? 36 : 54 }, (_, i) => 6 + Math.abs(Math.sin(i * 1.7) * 14 + Math.cos(i * 0.6) * 6)))
  const total = duration.split(':').reduce((a, b) => a * 60 + Number(b), 0)
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setProgress((p) => (p >= 1 ? (setPlaying(false), 0) : p + 1 / total)), 1000)
    return () => clearInterval(t)
  }, [playing, total])
  const elapsed = Math.round(progress * total)
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  return (
    <div className="audio" onClick={(e) => e.stopPropagation()}>
      <button className="a-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <Pause size={16} variant="Bold" /> : <Play size={16} variant="Bold" />}
      </button>
      <div className="stack gap-1 grow" style={{ minWidth: 0 }}>
        <span className="a-title ellipsis">{title}</span>
        <div
          className="wave"
          role="slider"
          aria-label="Seek"
          aria-valuenow={Math.round(progress * 100)}
          tabIndex={0}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setProgress((e.clientX - r.left) / r.width)
          }}
          style={{ cursor: 'pointer' }}
        >
          {bars.current.map((h, i) => (
            <i key={i} className={i / bars.current.length <= progress ? 'on' : ''} style={{ height: h, animation: playing ? `pulse ${0.6 + (i % 5) * 0.15}s ease-in-out infinite` : undefined }} />
          ))}
        </div>
      </div>
      <span className="a-time">{playing || progress > 0 ? `${fmt(elapsed)} / ` : ''}{duration.replace(':', 'm : ')}s</span>
    </div>
  )
}

export function Spinner() {
  return <span className="spin" aria-hidden />
}

export function SectionHead({ title, to, action }: { title: string; to?: string; action?: ReactNode }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {to ? (
        <Link to={to} className="see-all">
          See All
        </Link>
      ) : (
        action
      )}
    </div>
  )
}
