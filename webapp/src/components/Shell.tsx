import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useNavigationType, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Home2, Discover, Note1, Slash, People, Messages2, Add, Profile, Archive, Setting2, Notification, SearchNormal1, Sun1, Moon, Wallet2, Crown1, Hierarchy, Video, Location, Medal, ArrowLeft, Logout, DocumentText, ArrowDown2, ShieldTick,
} from 'iconsax-react'
import { useApp } from '../store/useApp'
import { useUI } from '../store/useUI'
import { USERS, TOPICS } from '../data/seed'
import { cx } from '../lib/util'
import { Avatar, LaterBadge, Logo, Toasts } from './ui'
import { GlobalSheets } from './sheets'
import { Menu } from './content'

function NavItem({ to, icon, label, count, end, className }: { to: string; icon: ReactNode; label: string; count?: number; end?: boolean; className?: string }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => cx('nav-item has-tip', isActive && 'active', className)} title={label}>
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId="nav-bg" className="nav-bg" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
          <span className="nav-ico">{icon}</span>
          <span className="nav-text">{label}</span>
          {!!count && <span className="nav-count">{count}</span>}
        </>
      )}
    </NavLink>
  )
}

function Sidebar() {
  const openCreate = useUI((s) => s.openCreate)
  const unreadMsgs = useApp((s) => s.conversations.reduce((a, c) => a + c.unread, 0))
  const role = useApp((s) => s.me.role)
  const me = useApp((s) => s.me)
  const underReview = useApp((s) => s.scrolls.filter((x) => x.creatorId === 'me' && x.status === 'under_review').length)
  const [laterOpen, setLaterOpen] = useState(false)
  const nav = useNavigate()
  const i = (Icon: typeof Home2) => <Icon size={21} variant="Linear" />
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="brand">
        <Logo size={30} />
      </div>
      <nav className="nav-group">
        <NavItem to="/home" icon={i(Home2)} label="Home" />
        <NavItem to="/discover" icon={i(Discover)} label="Discover" />
        <NavItem to="/scrolls" icon={i(Note1)} label="Scrolls" end />
        <NavItem to="/dark-zone" icon={i(Slash)} label="Dark Zone" />
        <NavItem to="/communities" icon={i(People)} label="Communities" />
        <NavItem to="/messages" icon={i(Messages2)} label="Messages" count={unreadMsgs} />
      </nav>
      <button className="create-btn" onClick={openCreate} aria-label="Create">
        <Add size={20} />
        <span className="nav-text">Create</span>
      </button>
      <div className="nav-divider" />
      <div className="nav-group">
        <span className="nav-label">You</span>
        <NavItem to="/profile" icon={i(Profile)} label="Profile" end />
        <NavItem to="/profile/museum" icon={i(Archive)} label="Museum" />
        <NavItem to="/scrolls/mine" icon={i(DocumentText)} label="My Scrolls" count={underReview} />
        {role === 'historian' && <NavItem to="/historian" icon={i(Crown1)} label="Historian desk" />}
        <NavItem to="/settings" icon={i(Setting2)} label="Settings" />
      </div>
      <div className="nav-group later-group">
        <button className="nav-label" onClick={() => setLaterOpen((o) => !o)} aria-expanded={laterOpen} style={{ width: '100%' }}>
          <span>Coming later</span>
          <motion.span animate={{ rotate: laterOpen ? 180 : 0 }} style={{ display: 'grid' }}>
            <ArrowDown2 size={12} />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {laterOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }} className="stack">
              <NavItem to="/later/wallet" icon={<Wallet2 size={18} />} label="Wallet · Cowries" className="later" />
              <NavItem to="/later/hall-of-fame" icon={<Medal size={18} />} label="Hall of Fame" className="later" />
              <NavItem to="/later/family" icon={<Hierarchy size={18} />} label="Family & Root Tree" className="later" />
              <NavItem to="/later/live" icon={<Video size={18} />} label="Go Live" className="later" />
              <NavItem to="/later/location" icon={<Location size={18} />} label="Share Location" className="later" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="sidebar-foot">
        <button className="me-chip" onClick={() => nav('/profile')}>
          <Avatar src={me.avatar} name={`${me.firstName} ${me.lastName}`} size={36} />
          <span className="stack me-text" style={{ minWidth: 0 }}>
            <span className="small strong ellipsis">
              {me.firstName} {me.lastName}
            </span>
            <span className="xs faint ellipsis">@{me.username}</span>
          </span>
        </button>
      </div>
    </aside>
  )
}

function GlobalSearch() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const scrolls = useApp((s) => s.scrolls)
  const nav = useNavigate()
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])
  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return []
    const people = USERS.filter((u) => (u.name + u.username + (u.tribe ?? '')).toLowerCase().includes(t)).slice(0, 3).map((u) => ({ kind: 'Person', label: u.name, sub: `@${u.username} · ${u.tribe ?? ''} ${u.flag}`, img: u.avatar, to: `/u/${u.id}` }))
    const sc = scrolls.filter((s) => s.status === 'published' && (s.title + s.tribe + s.country + s.category + s.tags.join(' ')).toLowerCase().includes(t)).slice(0, 4).map((s) => ({ kind: 'Scroll', label: s.title, sub: `${s.flag} ${s.country} · ${s.tribe} · ${s.category}`, img: s.images[0], to: `/scroll/${s.id}` }))
    const topics = TOPICS.filter((x) => (x.name + x.region).toLowerCase().includes(t)).slice(0, 2).map((x) => ({ kind: 'Culture', label: x.name, sub: x.region, img: x.image, to: `/topic/${x.id}` }))
    return [...sc, ...people, ...topics]
  }, [q, scrolls])
  const go = (to: string) => {
    setOpen(false)
    setQ('')
    ref.current?.blur()
    nav(to)
  }
  return (
    <div className="global-search">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (results[active] && open && q) go(results[active].to)
          else if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`)
        }}
      >
        <div className="input-wrap">
          <SearchNormal1 size={18} color="var(--text-4)" />
          <input
            ref={ref}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setOpen(true)
              setActive(0)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') (e.preventDefault(), setActive((a) => Math.min(results.length - 1, a + 1)))
              if (e.key === 'ArrowUp') (e.preventDefault(), setActive((a) => Math.max(0, a - 1)))
              if (e.key === 'Escape') ref.current?.blur()
            }}
            placeholder="Search culture, people, tribes, stories…"
            aria-label="Search CultureShare"
            role="combobox"
            aria-expanded={open && results.length > 0}
          />
          <kbd>⌘K</kbd>
        </div>
      </form>
      <AnimatePresence>
        {open && q.trim() && (
          <motion.div className="search-pop" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} role="listbox">
            {results.length === 0 && <p className="small muted" style={{ padding: 12 }}>No quick matches — press Enter to search everything.</p>}
            {results.map((r, k) => (
              <button key={r.to + k} className={cx('sp-row', k === active && 'is-active')} onMouseDown={() => go(r.to)} onMouseEnter={() => setActive(k)} role="option" aria-selected={k === active}>
                {r.img ? <img src={r.img} alt="" style={{ width: 38, height: 38, borderRadius: r.kind === 'Person' ? '50%' : 8, objectFit: 'cover' }} /> : <span style={{ width: 38 }} />}
                <span className="stack grow" style={{ minWidth: 0 }}>
                  <span className="small strong ellipsis">{r.label}</span>
                  <span className="xs faint ellipsis">{r.sub}</span>
                </span>
                <span className="tag">{r.kind}</span>
              </button>
            ))}
            {q.trim() && (
              <button className="sp-row" onMouseDown={() => go(`/search?q=${encodeURIComponent(q.trim())}`)}>
                <span style={{ width: 38, display: 'grid', placeItems: 'center' }}>
                  <SearchNormal1 size={18} color="var(--accent-text)" />
                </span>
                <span className="small">
                  Search all for <strong className="gold">“{q}”</strong>
                </span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Topbar() {
  const unread = useApp((s) => s.notifications.filter((n) => !n.read).length)
  const theme = useApp((s) => s.theme)
  const toggleTheme = useApp((s) => s.toggleTheme)
  const me = useApp((s) => s.me)
  const logOut = useApp((s) => s.logOut)
  const nav = useNavigate()
  return (
    <header className="topbar">
      <BackButton />
      <span className="mobile-brand">
        <Logo size={26} />
      </span>
      <GlobalSearch />
      <div className="topbar-actions">
        <button className="icon-btn mobile-only" aria-label="Search" onClick={() => nav('/search')}>
          <SearchNormal1 size={21} />
        </button>
        <button className="icon-btn has-tip" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'grid' }}>
              {theme === 'dark' ? <Sun1 size={21} /> : <Moon size={21} />}
            </motion.span>
          </AnimatePresence>
          <span className="tooltip">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <Link to="/notifications" className="icon-btn has-tip" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
          <motion.span animate={unread ? { rotate: [0, -14, 12, -8, 0] } : {}} transition={{ duration: 0.8, repeat: unread ? Infinity : 0, repeatDelay: 5 }} style={{ display: 'grid', color: unread ? 'var(--accent)' : undefined }}>
            <Notification size={21} variant={unread ? 'Bold' : 'Linear'} />
          </motion.span>
          {unread > 0 && <span className="dot">{unread}</span>}
          <span className="tooltip">Notifications</span>
        </Link>
        <Link to="/messages" className="icon-btn mobile-only" aria-label="Messages">
          <Messages2 size={21} />
        </Link>
        <div className="hide-mobile">
          <Menu
            label="Account menu"
            icon={<Avatar src={me.avatar} name={me.firstName} size={34} ring />}
            items={[
              { label: 'View profile', icon: <Profile size={16} />, onClick: () => nav('/profile') },
              { label: 'Verification', icon: <ShieldTick size={16} />, onClick: () => nav('/verification') },
              { label: 'Settings', icon: <Setting2 size={16} />, onClick: () => nav('/settings') },
              { label: 'Log out', icon: <Logout size={16} />, danger: true, onClick: () => logOut() },
            ]}
          />
        </div>
      </div>
    </header>
  )
}

function BottomNav() {
  const items = [
    { to: '/home', icon: Home2, label: 'Home' },
    { to: '/scrolls', icon: Note1, label: 'Scrolls' },
    { to: '/discover', icon: Discover, label: 'Discover' },
    { to: '/dark-zone', icon: Slash, label: 'Dark Z' },
    { to: '/communities', icon: People, label: 'Community' },
  ]
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map(({ to, icon: I, label }) => (
        <NavLink key={to} to={to} end={to === '/scrolls'} className={({ isActive }) => cx(isActive && 'active')}>
          {({ isActive }) => (
            <>
              <motion.span animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.08 : 1 }} style={{ display: 'grid' }}>
                <I size={24} variant={isActive ? 'Bulk' : 'Linear'} />
              </motion.span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppShell() {
  const loc = useLocation()
  useTrackDepth()
  const openCreate = useUI((s) => s.openCreate)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [loc.pathname])
  return (
    <div className="shell">
      <Sidebar />
      <div className="main-col">
        <Topbar />
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
      {!/^\/(messages|create|scroll\/|later\/live)/.test(loc.pathname) && <motion.button className="fab" onClick={openCreate} aria-label="Create" whileTap={{ scale: 0.9 }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.3 }}>
        <Add size={26} />
      </motion.button>}
      <GlobalSheets />
      <Toasts />
    </div>
  )
}

/** Page frame: main column + optional contextual rail (hidden < 1440px). */
export function Page({ children, rail, narrow, wide, full, railAlways }: { children: ReactNode; rail?: ReactNode; narrow?: boolean; wide?: boolean; full?: boolean; railAlways?: boolean }) {
  return (
    <div className={cx('page-wrap', !rail && 'no-rail', wide && 'wide', full && 'full')}>
      <main className={cx('page-main', narrow && 'narrow')}>{children}</main>
      {rail && <aside className={cx('rail', !railAlways && 'collapsible')}>{rail}</aside>}
    </div>
  )
}

/** Where "Back" goes when there is no in-app history (e.g. the page was opened from a link). */
export function parentPath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  if (parts[0] === 'scroll') return '/scrolls'
  if (parts[0] === 'u' || parts[0] === 'topic') return '/discover'
  if (parts[0] === 'messages' && parts[1]) return '/messages'
  if (parts[0] === 'historian' && parts[1]) return '/historian'
  if (parts[0] === 'communities' && parts[2]) return `/communities/${parts[1]}`
  if (parts[0] === 'communities' && parts[1]) return '/communities'
  if (parts[0] === 'profile' && parts[1] === 'edit' && parts[2]) return '/profile/edit'
  if (parts[0] === 'profile' && (parts[1] === 'avatar' || parts[1] === 'tune')) return '/profile/edit'
  if (parts[0] === 'profile' && parts[1]) return '/profile'
  if (parts[0] === 'settings' && parts[1]) return '/settings'
  if (parts[0] === 'scrolls' && parts[1]) return '/scrolls'
  if (parts[0] === 'discover' && parts[1]) return '/discover'
  if (parts[0] === 'later' && parts[1] === 'buy') return '/scrolls'
  return '/home'
}

// How many in-app steps the user can go back. Only "Back" into our own history,
// never out of the app (a page opened from a link falls back to its parent).
let navDepth = 0
let lastKey = ''
function useTrackDepth() {
  const loc = useLocation()
  const type = useNavigationType()
  useEffect(() => {
    if (loc.key === lastKey) return
    lastKey = loc.key
    if (type === 'PUSH') navDepth++
    else if (type === 'POP') navDepth = Math.max(0, navDepth - 1)
  }, [loc.key, type])
}

/** One consistent back control on every screen except Home. */
export function BackButton() {
  const nav = useNavigate()
  const loc = useLocation()
  if (loc.pathname === '/home') return null
  return (
    <motion.button
      className="top-back"
      onClick={() => (navDepth > 0 ? nav(-1) : nav(parentPath(loc.pathname)))}
      aria-label="Go back"
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.94 }}
    >
      <span className="bb-ico">
        <ArrowLeft size={18} />
      </span>
      <span className="top-back-text">Back</span>
    </motion.button>
  )
}

export function PageHeader({ title, sub, actions, eyebrow, later }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode; eyebrow?: string; later?: boolean }) {
  return (
    <motion.div className="page-title" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <div className="stack gap-2">
        {eyebrow && <span className="eyebrow gold">{eyebrow}</span>}
        <div className="row gap-3 wrap">
          <h1 className="h1">{title}</h1>
          {later && <LaterBadge />}
        </div>
        {sub && <p className="lead" style={{ maxWidth: '62ch' }}>{sub}</p>}
      </div>
      {actions && <div className="row gap-2 wrap">{actions}</div>}
    </motion.div>
  )
}
