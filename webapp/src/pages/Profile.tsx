import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Archive, Camera, Edit2, Global, Lock1, Message, Music, Notification, NotificationBing, Pause, Play, SearchNormal1, Share, UserRemove, Flag, Profile as ProfileIcon, Tree, Crown1, Setting2, Brush2, VolumeHigh, ShieldTick } from 'iconsax-react'
import { useApp } from '../store/useApp'
import { useUI } from '../store/useUI'
import { COUNTRIES, USERS, asset } from '../data/seed'
import { Page, PageHeader } from '../components/Shell'
import { PostCard, ScrollTeaser, Menu } from '../components/content'
import { Avatar, Callout, Decision, Empty, HistorianBadge, Input, RaidButton, Select, Spinner, Switch, Tabs, Textarea, VerifiedMark, LaterBadge } from '../components/ui'
import { compact, cx, getUser, useUser, wait } from '../lib/util'
import { TUNES, playTune, stopTune } from '../lib/tune'
import { imageToDataUrl } from '../lib/media'

const OTHER_TUNES: Record<string, string> = { amaradia: 'Highlife guitar riff', kofi: 'Talking Drum — Dùndún call', tariro: 'Mbira lullaby', 'amara-okafor': 'Kora morning' }
const PUBLIC_MUSEUM = ['kofi', 'amaradia', 'tariro']
const TABS = ['Posts', 'Scrolls', 'Museum', 'Raiders', 'Raiding'] as const
type PTab = (typeof TABS)[number]

/* ─────────── Screens 16 / 19 / 20 / 21 / 32 — Profile ─────────── */
export function Profile() {
  const params = useParams()
  const isMe = !params.id || params.id === 'me'
  const uid = isMe ? 'me' : params.id!
  const user = useUser(uid)
  const scrolls = useApp((s) => s.scrolls)
  const posts = useApp((s) => s.posts)
  const tune = useApp((s) => s.tune)
  const startConv = useApp((s) => s.startConversation)
  const openShare = useUI((s) => s.openShare)
  const openReport = useUI((s) => s.openReport)
  const verification = useApp((s) => s.verification.state)
  const me = useApp((s) => s.me)
  const nav = useNavigate()
  const tabParam = (params.tab ?? 'posts').toLowerCase()
  const tab = (TABS.find((t) => t.toLowerCase() === tabParam) ?? 'Posts') as PTab
  const setTab = (t: PTab) => nav(`${isMe ? '/profile' : `/u/${uid}`}/${t.toLowerCase()}`, { replace: true })

  if (!user) {
    return (
      <Page narrow>
        <Empty icon={<ProfileIcon size={26} />} title="Profile not found" text="This account may have been deactivated, or the link is wrong." action={<Link className="btn btn-primary btn-sm" to="/discover/people">Find people</Link>} />
      </Page>
    )
  }
  const myScrolls = scrolls.filter((s) => s.creatorId === uid && (isMe || (s.status === 'published' && !s.anonymous)))
  const myPosts = posts.filter((p) => p.authorId === uid && !p.communityId)
  const tuneName = isMe ? (tune.enabled ? tune.sound : '') : OTHER_TUNES[uid]
  const country = COUNTRIES.find((c) => c.name === user.country)
  const verified = isMe ? verification === 'approved' : user.verified
  return (
    <Page wide>
      <motion.section className="profile-hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="profile-cover">
          <img src={user.cover ?? (isMe ? me.cover : undefined) ?? country?.image ?? asset('aso-oke-women.webp')} alt="" />
          {isMe && (
            <CoverButton />
          )}
        </div>
        <div className="profile-body">
          <div className="row between wrap gap-4" style={{ alignItems: 'flex-end' }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.1 }} style={{ position: 'relative' }}>
              <Avatar user={user} size={112} ring />
              {isMe && (
                <Link to="/profile/edit" className="ob-cam" style={{ right: 4, bottom: 6, width: 32, height: 32 }} aria-label="Change photo">
                  <Camera size={15} variant="Bold" />
                </Link>
              )}
            </motion.div>
            <div className="row gap-2 wrap">
              {isMe ? (
                <>
                  <Link to="/profile/edit" className="btn btn-secondary btn-sm">
                    <Edit2 size={16} /> Edit profile
                  </Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => openShare('me', 'profile')}>
                    <Share size={16} /> Share profile
                  </button>
                  <Link to="/settings" className="icon-btn filled" aria-label="Settings">
                    <Setting2 size={18} />
                  </Link>
                </>
              ) : (
                <>
                  <RaidButton userId={uid} solid />
                  <button className="btn btn-secondary btn-sm" onClick={() => nav(`/messages/${startConv(uid)}`)}>
                    <Message size={16} /> Message
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => openShare(uid, 'profile')}>
                    <Share size={16} /> Share
                  </button>
                  <div className="icon-btn filled">
                    <Menu items={[{ label: 'Report profile', icon: <Flag size={16} />, danger: true, onClick: () => openReport(uid) }]} />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="stack gap-2 mt-4">
            <div className="row gap-2 wrap">
              <h1 className="h1" style={{ fontSize: '1.9rem' }}>
                {user.name}
              </h1>
              {verified && <VerifiedMark size={20} />}
              {user.role === 'historian' && <HistorianBadge />}
            </div>
            <span className="small muted">
              @{user.username} · {user.flag} {[user.state, user.country].filter(Boolean).join(', ')} {user.tribe && `· ${user.tribe}`}
            </span>
            {user.bio && <p style={{ maxWidth: '64ch', lineHeight: 1.6, color: 'var(--text-2)' }}>{user.bio}</p>}
            <div className="row gap-2 wrap">
              {isMe && me.africanRoots && <span className="tag gold">🌳 Roots: {me.africanRoots}</span>}
              {user.specialty && <span className="tag gold">{user.specialty}</span>}
              {(isMe ? me.website : user.website) && (
                <a className="tag" href={(isMe ? me.website : user.website)!.startsWith('http') ? (isMe ? me.website : user.website) : `https://${isMe ? me.website : user.website}`} target="_blank" rel="noreferrer">
                  <Global size={10} /> {isMe ? me.website : user.website}
                </a>
              )}
              {isMe && verification !== 'approved' && (
                <Link to="/verification" className="tag amber">
                  <ShieldTick size={10} /> {verification === 'under_review' ? 'Verification under review' : 'Get verified'}
                </Link>
              )}
            </div>
            {tuneName && <TunePill name={tuneName} />}
          </div>
          <div className="row gap-6 wrap mt-6">
            <button className="stat-btn" onClick={() => setTab('Posts')}>
              <strong>{compact(myPosts.length)}</strong>
              <span>Posts</span>
            </button>
            <button className="stat-btn" onClick={() => setTab('Scrolls')}>
              <strong>{compact(myScrolls.length)}</strong>
              <span>Scrolls</span>
            </button>
            <button className="stat-btn" onClick={() => setTab('Raiders')}>
              <strong>{compact(user.raiders)}</strong>
              <span>Raiders</span>
            </button>
            <button className="stat-btn" onClick={() => setTab('Raiding')}>
              <strong>{compact(user.raiding)}</strong>
              <span>Raiding</span>
            </button>
          </div>
        </div>
      </motion.section>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === 'Posts' &&
            (myPosts.length ? (
              <div className="stack gap-5" style={{ maxWidth: 760 }}>
                {myPosts.map((p, k) => (
                  <PostCard key={p.id} post={p} index={k} />
                ))}
              </div>
            ) : (
              <Empty icon={<Edit2 size={26} />} title={isMe ? 'Share your first post' : 'No posts yet'} text={isMe ? 'Posts are quick moments and stories. For structured cultural media, create a Scroll.' : `${user.name.split(' ')[0]} hasn’t posted yet.`} action={isMe ? <Link className="btn btn-primary btn-sm" to="/create/post">Create post</Link> : undefined} />
            ))}
          {tab === 'Scrolls' &&
            (myScrolls.length ? (
              <div className="grid-3">
                {myScrolls.map((s, k) => (
                  <div key={s.id} style={{ position: 'relative' }}>
                    {isMe && s.status !== 'published' && (
                      <span className="tag amber" style={{ position: 'absolute', zIndex: 2, top: 12, left: 12 }}>
                        {s.status === 'draft' ? 'Draft' : s.status === 'under_review' ? 'Under review' : 'Restricted'}
                      </span>
                    )}
                    <ScrollTeaser scroll={s} index={k} />
                  </div>
                ))}
              </div>
            ) : (
              <Empty icon={<img src={asset('scroll-icon.webp')} alt="" width={34} />} title={isMe ? 'Create your first Scroll' : 'No Scrolls yet'} text={isMe ? 'Scrolls preserve culture: video, images, voice and written stories, validated by a Historian.' : `${user.name.split(' ')[0]} hasn’t published a Scroll yet.`} action={isMe ? <Link className="btn btn-primary btn-sm" to="/create/scroll">Create Scroll</Link> : undefined} />
            ))}
          {tab === 'Museum' && (isMe || PUBLIC_MUSEUM.includes(uid) ? <Museum own={isMe} uid={uid} /> : <Empty icon={<Lock1 size={26} />} title="This Museum is private" text={`${user.name.split(' ')[0]} keeps their Museum private. Private isn’t the same as empty — they just haven’t shared it.`} />)}
          {tab === 'Raiders' && <RaidersList uid={uid} own={isMe} />}
          {tab === 'Raiding' && <RaidingList uid={uid} own={isMe} />}
        </motion.div>
      </AnimatePresence>
    </Page>
  )
}

function CoverButton() {
  const update = useApp((s) => s.updateMe)
  const toast = useApp((s) => s.toast)
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <button className="btn btn-sm" style={{ position: 'absolute', right: 16, top: 16, zIndex: 2, background: 'rgba(0,0,0,.45)', color: '#fff', backdropFilter: 'blur(8px)' }} onClick={() => ref.current?.click()}>
        <Camera size={16} /> Change cover
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          update({ cover: await imageToDataUrl(f, 1600) })
          toast('Cover updated', 'success')
        }}
      />
    </>
  )
}

/* Profile Tune — explicit playback control (autoplay respects browser rules) */
function TunePill({ name }: { name: string }) {
  const [playing, setPlaying] = useState(false)
  const volume = useApp((s) => s.tune.volume)
  useEffect(() => () => stopTune(), [])
  return (
    <motion.button
      className="tag gold"
      style={{ height: 30, padding: '0 12px', alignSelf: 'flex-start', cursor: 'pointer' }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => {
        if (playing) {
          stopTune()
          setPlaying(false)
        } else {
          playTune(name, volume, () => setPlaying(false))
          setPlaying(true)
        }
      }}
      aria-label={playing ? 'Pause Profile Tune' : 'Play Profile Tune'}
    >
      {playing ? <Pause size={12} variant="Bold" /> : <Play size={12} variant="Bold" />} <Music size={12} /> Profile Tune · {name}
      {playing && (
        <span className="row" style={{ gap: 2, marginLeft: 4 }}>
          {[0, 1, 2].map((k) => (
            <motion.i key={k} style={{ width: 2, background: 'currentColor', borderRadius: 2 }} animate={{ height: [4, 12, 4] }} transition={{ duration: 0.6, repeat: Infinity, delay: k * 0.15 }} />
          ))}
        </span>
      )}
    </motion.button>
  )
}

/* ─────────── Screen 19 — Museum ─────────── */
function Museum({ own, uid }: { own: boolean; uid: string }) {
  const museum = useApp((s) => s.museum)
  const bought = useApp((s) => s.bought)
  const scrolls = useApp((s) => s.scrolls)
  const collections = useApp((s) => s.collections)
  const [sub, setSub] = useState<'Saved' | 'Bought' | 'Sold'>('Saved')
  const [col, setCol] = useState('All')
  const savedIds = own ? Object.keys(museum).filter((id) => !bought.includes(id)) : scrolls.filter((s) => s.historianId === uid || s.creatorId === uid).slice(0, 4).map((s) => s.id)
  const saved = savedIds.map((id) => scrolls.find((s) => s.id === id)).filter(Boolean).filter((s) => col === 'All' || museum[s!.id] === col)
  const boughtList = own ? bought.map((id) => scrolls.find((s) => s.id === id)).filter(Boolean) : []
  const sold = scrolls.filter((s) => s.creatorId === uid && s.sale === 'sold')
  return (
    <div className="stack gap-5">
      <div className="row between wrap gap-3">
        <div className="stack gap-1">
          <h2 className="h3">Museum</h2>
          <span className="small muted">{own ? 'Your cultural collection — Scrolls you’ve saved, bought and sold.' : 'Scrolls this person has collected.'}</span>
        </div>
        <Tabs tabs={['Saved', 'Bought', 'Sold'] as const} value={sub} onChange={setSub} counts={{ Saved: savedIds.length, Bought: boughtList.length, Sold: sold.length }} />
      </div>
      {sub === 'Saved' && own && (
        <div className="chip-row">
          {['All', ...collections.filter((c) => c !== 'Bought')].map((c) => (
            <button key={c} className={cx('chip sm', col === c && 'is-on')} onClick={() => setCol(c)}>
              {c}
            </button>
          ))}
        </div>
      )}
      {sub === 'Saved' &&
        (saved.length ? (
          <div className="grid-3">
            {saved.map((s, k) => (
              <div key={s!.id} className="stack gap-2">
                <ScrollTeaser scroll={s!} index={k} />
                {own && <span className="xs faint row gap-1"><Archive size={12} /> In “{museum[s!.id]}”</span>}
              </div>
            ))}
          </div>
        ) : (
          <Empty icon={<Archive size={26} variant="Bulk" />} title="Nothing saved yet" text="Tap the save icon on any Scroll to keep it in your Museum. Organise saves into collections." action={<Link to="/discover" className="btn btn-primary btn-sm">Discover Scrolls</Link>} />
        ))}
      {sub === 'Bought' &&
        (boughtList.length ? (
          <div className="grid-3">
            {boughtList.map((s, k) => (
              <ScrollTeaser key={s!.id} scroll={s!} index={k} />
            ))}
          </div>
        ) : (
          <Empty icon={<Archive size={26} />} title="No bought Scrolls" text="Buying Scrolls is a later-stage feature. Purchased Scrolls will live here." action={<span className="row gap-2"><LaterBadge /></span>} />
        ))}
      {sub === 'Sold' && <Empty icon={<Archive size={26} />} title="No sold Scrolls" text="When you sell a Scroll (later stage), its sale record appears here." action={<LaterBadge />} />}
    </div>
  )
}

/* ─────────── Screen 20 — Raiders ─────────── */
function RaidersList({ uid, own }: { uid: string; own: boolean }) {
  const myRaiders = useApp((s) => s.raiders)
  const remove = useApp((s) => s.removeRaider)
  const startConv = useApp((s) => s.startConversation)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const ids = own ? myRaiders : USERS.filter((u) => u.id !== uid && u.role !== 'artist').slice(0, 8).map((u) => u.id)
  const list = ids.map(getUser).filter((u) => u && (u.name + u.username).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="stack gap-4" style={{ maxWidth: 760 }}>
      <div className="stack gap-1">
        <h2 className="h3">Raiders</h2>
        <span className="small muted">Raiders receive first-hand notifications when {own ? 'you upload' : 'this creator uploads'} a Scroll.</span>
      </div>
      <Input placeholder="Search Raiders" value={q} onChange={(e) => setQ(e.target.value)} icon={<SearchNormal1 size={16} color="var(--text-4)" />} />
      {list.length === 0 && <Empty icon={<ProfileIcon size={26} />} title={q ? 'No Raiders match' : 'No Raiders yet'} text={q ? 'Try a different name.' : 'When people raid you, they’ll appear here.'} />}
      <AnimatePresence initial={false}>
        {list.map((u) => (
          <motion.div layout key={u!.id} className="panel row gap-3" style={{ padding: 12 }} exit={{ opacity: 0, x: -30 }}>
            <Avatar user={u} size={44} />
            <Link to={`/u/${u!.id}`} className="stack grow" style={{ minWidth: 0 }}>
              <span className="small strong row gap-1">
                {u!.name} {u!.flag} {u!.verified && <VerifiedMark size={12} />}
              </span>
              <span className="xs faint">@{u!.username}</span>
            </Link>
            <Link to={`/u/${u!.id}`} className="btn btn-secondary btn-xs">
              View
            </Link>
            <button className="btn btn-secondary btn-xs" onClick={() => nav(`/messages/${startConv(u!.id)}`)}>
              Message
            </button>
            {own && (
              <button
                className="icon-btn sm"
                aria-label={`Remove ${u!.name}`}
                onClick={() => {
                  remove(u!.id)
                  toast(`${u!.name} was removed from your Raiders`)
                }}
              >
                <UserRemove size={16} />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {own && <Decision>Whether removing a Raider also blocks them from re-raiding isn’t specified.</Decision>}
    </div>
  )
}

/* ─────────── Screen 21 — Raiding ─────────── */
function RaidingList({ uid, own }: { uid: string; own: boolean }) {
  const raiding = useApp((s) => s.raiding)
  const muted = useApp((s) => s.mutedRaid)
  const toggleRaid = useApp((s) => s.toggleRaid)
  const toggleMute = useApp((s) => s.toggleMuteRaid)
  const toast = useApp((s) => s.toast)
  const ids = own ? raiding : USERS.filter((u) => u.id !== uid && u.role !== 'artist').slice(3, 9).map((u) => u.id)
  const list = ids.map(getUser).filter(Boolean)
  return (
    <div className="stack gap-4" style={{ maxWidth: 760 }}>
      <div className="stack gap-1">
        <h2 className="h3">Raiding</h2>
        <span className="small muted">{own ? 'People you’re raiding — you get their Scrolls first-hand.' : 'Creators this person raids.'}</span>
      </div>
      {list.length === 0 && <Empty icon={<ProfileIcon size={26} />} title="Not raiding anyone yet" text="Raid storytellers and Historians to get their Scrolls first-hand." action={<Link to="/discover/people" className="btn btn-primary btn-sm">Find people to Raid</Link>} />}
      <AnimatePresence initial={false}>
        {list.map((u) => {
          const isMuted = muted.includes(u!.id)
          return (
            <motion.div layout key={u!.id} className="panel row gap-3" style={{ padding: 12 }} exit={{ opacity: 0, x: -30 }}>
              <Avatar user={u} size={44} />
              <Link to={`/u/${u!.id}`} className="stack grow" style={{ minWidth: 0 }}>
                <span className="small strong row gap-1">
                  {u!.name} {u!.flag} {u!.role === 'historian' && <HistorianBadge compact />}
                </span>
                <span className="xs faint">{u!.tagline}</span>
              </Link>
              {own ? (
                <>
                  <button
                    className={cx('icon-btn sm has-tip', !isMuted && 'gold')}
                    onClick={() => {
                      toggleMute(u!.id)
                      toast(isMuted ? `Scroll notifications on for ${u!.name}` : `Scroll notifications muted for ${u!.name}`)
                    }}
                    aria-label={isMuted ? 'Turn on notifications' : 'Mute notifications'}
                    style={!isMuted ? { color: 'var(--accent-text)' } : undefined}
                  >
                    {isMuted ? <Notification size={18} /> : <NotificationBing size={18} variant="Bold" />}
                    <span className="tooltip">{isMuted ? 'Notifications off' : 'Notifications on'}</span>
                  </button>
                  <Link to={`/u/${u!.id}`} className="btn btn-secondary btn-xs">
                    View
                  </Link>
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={() => {
                      toggleRaid(u!.id)
                      toast(`You unraided ${u!.name}`)
                    }}
                  >
                    Unraid
                  </button>
                </>
              ) : (
                <RaidButton userId={u!.id} size="sm" />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

/* ─────────── Screen 17 — Profile editor ─────────── */
const EDIT_SECTIONS = [
  { id: 'personal', label: 'Personal information', icon: ProfileIcon },
  { id: 'roots', label: 'African roots', icon: Tree },
  { id: 'family', label: 'Family', icon: Crown1 },
  { id: 'social', label: 'Social links', icon: Global },
  { id: 'avatar', label: 'Avatar', icon: Brush2 },
  { id: 'tune', label: 'Profile Tune', icon: Music },
  { id: 'notifications', label: 'Notifications', icon: Notification },
  { id: 'privacy', label: 'Privacy', icon: Lock1 },
] as const

export function ProfileEditor() {
  const { section = 'personal' } = useParams()
  const me = useApp((s) => s.me)
  const update = useApp((s) => s.updateMe)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const [f, setF] = useState(me)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (section === 'avatar') nav('/profile/avatar', { replace: true })
    if (section === 'tune') nav('/profile/tune', { replace: true })
    if (section === 'notifications') nav('/settings/notifications', { replace: true })
    if (section === 'privacy') nav('/settings/privacy', { replace: true })
    if (section === 'family') nav('/later/family', { replace: true })
  }, [section, nav])
  const dirty = JSON.stringify(f) !== JSON.stringify(me)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }))
  const country = COUNTRIES.find((c) => c.name === f.country)
  const save = async () => {
    setBusy(true)
    await wait(600)
    update({ ...f, flag: country?.flag ?? f.flag })
    setBusy(false)
    toast('Profile saved', 'success', { label: 'View profile', to: '/profile' })
  }
  return (
    <Page wide>
      <PageHeader
        title="Edit profile"
        sub="Grouped so it’s easier than one long form. Fields marked optional are never required."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" disabled={!dirty} onClick={() => setF(me)}>
              Discard
            </button>
            <button className="btn btn-primary btn-sm" disabled={!dirty || busy} onClick={save}>
              {busy ? <Spinner /> : 'Save changes'}
            </button>
          </>
        }
      />
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Profile sections">
          {EDIT_SECTIONS.map(({ id, label, icon: I }) => (
            <NavLink key={id} to={`/profile/edit/${id}`} className={({ isActive }) => cx(isActive || (id === 'personal' && section === 'personal') ? 'active' : '')}>
              <I size={18} /> {label}
              {id === 'family' && <LaterBadge />}
            </NavLink>
          ))}
        </nav>
        <AnimatePresence mode="wait">
          <motion.section key={section} className="card stack gap-5" style={{ padding: 'clamp(18px,3vw,28px)' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {section === 'personal' && (
              <>
                <h2 className="h3">Personal information</h2>
                <div className="row gap-4">
                  <Avatar src={f.avatar} name={f.firstName} size={72} />
                  <div className="stack gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
                      <Camera size={16} /> Change photo
                    </button>
                    <Link to="/profile/avatar" className="link xs">
                      Or design a cultural avatar
                    </Link>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const avatar = await imageToDataUrl(file, 400)
                        setF((x) => ({ ...x, avatar }))
                      }
                    }}
                  />
                </div>
                <div className="form-grid">
                  <Input label="First name" value={f.firstName} onChange={set('firstName')} />
                  <Input label="Last name" value={f.lastName} onChange={set('lastName')} />
                  <Input label="Username" value={f.username} onChange={(e) => setF((x) => ({ ...x, username: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '') }))} icon={<span className="faint">@</span>} />
                  <Input label="Date of birth" type="date" value={f.dob} onChange={set('dob')} />
                  <Select label="Gender" value={f.gender} onChange={set('gender')}>
                    <option value="">Prefer not to say</option>
                    <option>Female</option>
                    <option>Male</option>
                  </Select>
                  <Select label="Birth order (optional)" value={f.birthOrder} onChange={set('birthOrder')}>
                    <option value="">Select</option>
                    {['First child', 'Second child', 'Third child', 'Middle child', 'Last born', 'Only child', 'Twin'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </Select>
                  <Select label="Country" value={f.country} onChange={(e) => setF((x) => ({ ...x, country: e.target.value, state: '' }))}>
                    {COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </Select>
                  <Select label="State / region" value={f.state} onChange={set('state')}>
                    <option value="">Select</option>
                    {country?.states.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                  <Input label="Phone" type="tel" placeholder="+234 801 234 5678" value={f.phone} onChange={set('phone')} />
                  <Input label="Email" type="email" value={f.email} onChange={set('email')} />
                  <Textarea className="span-2" label="Bio" value={f.bio} onChange={set('bio')} maxLength={160} hint={`${f.bio.length}/160`} />
                  <Input className="span-2" label="Home address (optional, private)" value={f.homeAddress} onChange={set('homeAddress')} />
                </div>
              </>
            )}
            {section === 'roots' && (
              <>
                <h2 className="h3">African roots</h2>
                <p className="small muted">Your roots shape the cultural identity on your profile and drive the Root Tree later on.</p>
                <div className="form-grid">
                  <Select label="Tribe" value={f.tribe} onChange={set('tribe')}>
                    {(country?.tribes ?? []).map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                  <Input label="Roots (shown on profile)" placeholder="e.g. Igbo — Nsukka, Enugu State" value={f.africanRoots} onChange={set('africanRoots')} />
                  <Input label="Father’s name (optional)" value={f.fatherName} onChange={set('fatherName')} />
                  <Input label="Mother’s maiden name (optional)" value={f.motherMaiden} onChange={set('motherMaiden')} />
                </div>
                <div className="dropzone" onClick={() => toast('Certificate upload will connect to secure storage — not stored in this prototype')}>
                  <Archive size={24} color="var(--accent)" />
                  <span className="small strong">Optional certificate</span>
                  <span className="xs muted">e.g. a family or chieftaincy certificate. PDF or image.</span>
                </div>
                <Callout>
                  <span className="small">Family details are private by default. Only your “Roots” line appears on your public profile.</span>
                </Callout>
              </>
            )}
            {section === 'social' && (
              <>
                <h2 className="h3">Social links</h2>
                <div className="form-grid">
                  <Input label="Website" placeholder="yoursite.com" value={f.website} onChange={set('website')} icon={<Global size={16} color="var(--text-4)" />} />
                  {(['instagram', 'x', 'facebook', 'tiktok'] as const).map((k) => (
                    <Input key={k} label={k === 'x' ? 'X (Twitter)' : k[0].toUpperCase() + k.slice(1)} placeholder="@handle" value={f.socials[k]} onChange={(e) => setF((x) => ({ ...x, socials: { ...x.socials, [k]: e.target.value } }))} />
                  ))}
                </div>
              </>
            )}
            {dirty && (
              <motion.div className="row gap-3 panel" style={{ padding: 12, position: 'sticky', bottom: 16, boxShadow: 'var(--shadow-md)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <span className="small grow">You have unsaved changes</span>
                <button className="btn btn-ghost btn-xs" onClick={() => setF(me)}>
                  Discard
                </button>
                <button className="btn btn-primary btn-xs" onClick={save}>
                  Save
                </button>
              </motion.div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </Page>
  )
}

/* ─────────── Screen 18 — Avatar customiser ─────────── */
const AVATAR_OPTIONS: Record<string, Record<'Hats' | 'Clothes' | 'Jewelry' | 'Footwear', string[]>> = {
  Igbo: { Hats: ['Red cap (Okpu ododo)', 'Gele', 'None'], Clothes: ['Isiagu', 'George wrapper', 'Akwete'], Jewelry: ['Coral beads', 'Ivory bangle', 'None'], Footwear: ['Leather sandals', 'Beaded slippers'] },
  Yoruba: { Hats: ['Fila', 'Gele', 'None'], Clothes: ['Agbada', 'Aso-oke', 'Iro & buba'], Jewelry: ['Coral beads', 'Gold earrings', 'None'], Footwear: ['Leather sandals', 'Beaded slippers'] },
  Akan: { Hats: ['Kente crown', 'Headwrap', 'None'], Clothes: ['Kente cloth', 'Adinkra cloth', 'Batakari'], Jewelry: ['Gold bangles', 'Bead necklace', 'None'], Footwear: ['Ahenema sandals', 'Leather sandals'] },
  Zulu: { Hats: ['Isicholo', 'Beaded band', 'None'], Clothes: ['Isidwaba', 'Beaded cape', 'Umblaselo'], Jewelry: ['Beaded collar', 'Ankle beads', 'None'], Footwear: ['Barefoot', 'Leather sandals'] },
  Maasai: { Hats: ['Beaded headpiece', 'None'], Clothes: ['Shúkà (red)', 'Shúkà (blue)'], Jewelry: ['Enkarewa collar', 'Ear beads', 'None'], Footwear: ['Tyre sandals', 'Barefoot'] },
}
const SKINS = ['#5a3825', '#6f4528', '#8d5524', '#a8693e', '#c68642']
const COLORS = ['#c9a84c', '#b91c1c', '#1b4332', '#1e3a8a', '#7c2d12', '#6b21a8']

export function AvatarCustomizer() {
  const saved = useApp((s) => s.avatar)
  const setAvatar = useApp((s) => s.setAvatar)
  const toast = useApp((s) => s.toast)
  const [a, setA] = useState(saved)
  const [cat, setCat] = useState<'Hats' | 'Clothes' | 'Jewelry' | 'Footwear'>('Clothes')
  const tribes = Object.keys(AVATAR_OPTIONS)
  const opts = AVATAR_OPTIONS[a.tribe] ?? AVATAR_OPTIONS.Igbo
  const map = { Hats: 'hat', Clothes: 'clothes', Jewelry: 'jewelry', Footwear: 'footwear' } as const
  return (
    <Page wide>
      <PageHeader
        title="Avatar"
        sub="Dress your avatar in culturally based clothing from your country and tribe. Changes preview live."
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setA(saved)}>
              Reset
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setAvatar(a)
                toast('Avatar saved', 'success')
              }}
            >
              Save avatar
            </button>
          </>
        }
      />
      <div className="avatar-studio">
        <aside className="panel stack gap-4" style={{ padding: 18 }}>
          <Select label="Country" value={a.country} onChange={(e) => setA({ ...a, country: e.target.value })}>
            {COUNTRIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.flag} {c.name}
              </option>
            ))}
          </Select>
          <div className="stack gap-2">
            <span className="field-label">Tribe</span>
            <div className="row wrap gap-2">
              {tribes.map((t) => (
                <button key={t} className={cx('chip sm', a.tribe === t && 'is-on')} onClick={() => setA({ ...a, tribe: t, hat: AVATAR_OPTIONS[t].Hats[0], clothes: AVATAR_OPTIONS[t].Clothes[0], jewelry: AVATAR_OPTIONS[t].Jewelry[0], footwear: AVATAR_OPTIONS[t].Footwear[0] })}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="stack gap-2">
            <span className="field-label">Gender</span>
            <div className="row gap-2">
              {(['Female', 'Male'] as const).map((g) => (
                <button key={g} className={cx('chip sm', a.gender === g && 'is-on')} onClick={() => setA({ ...a, gender: g })}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="stack gap-2">
            <span className="field-label">Skin tone</span>
            <div className="row gap-2">
              {SKINS.map((s) => (
                <button key={s} className={cx('swatch', a.skin === s && 'is-on')} style={{ background: s }} onClick={() => setA({ ...a, skin: s })} aria-label={`Skin tone ${s}`} />
              ))}
            </div>
          </div>
        </aside>
        <section className="card stack" style={{ padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: 460, background: 'radial-gradient(circle at 50% 30%, var(--accent-soft), transparent 60%), var(--card-grad)' }}>
          <AvatarFigure a={a} />
          <div className="row gap-2 wrap center mt-4">
            <span className="tag gold">{a.tribe}</span>
            <span className="tag">{a.hat}</span>
            <span className="tag">{a.clothes}</span>
            <span className="tag">{a.jewelry}</span>
            <span className="tag">{a.footwear}</span>
          </div>
        </section>
        <aside className="panel stack gap-4" style={{ padding: 18 }}>
          <Tabs tabs={['Hats', 'Clothes', 'Jewelry', 'Footwear'] as const} value={cat} onChange={setCat} />
          <div className="stack gap-2">
            {opts[cat].map((o) => (
              <button key={o} className={cx('opt-tile', a[map[cat]] === o && 'is-on')} onClick={() => setA({ ...a, [map[cat]]: o })}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: a.color, opacity: 0.85, flex: 'none' }} />
                {o}
              </button>
            ))}
          </div>
          <div className="stack gap-2">
            <span className="field-label">Colour</span>
            <div className="row gap-2 wrap">
              {COLORS.map((c) => (
                <button key={c} className={cx('swatch', a.color === c && 'is-on')} style={{ background: c }} onClick={() => setA({ ...a, color: c })} aria-label={`Colour ${c}`} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Page>
  )
}

function AvatarFigure({ a }: { a: ReturnType<typeof useApp.getState>['avatar'] }) {
  const female = a.gender === 'Female'
  const hasHat = !a.hat.startsWith('None')
  const hasJewel = !a.jewelry.startsWith('None')
  return (
    <motion.svg key={a.tribe + a.gender} width="240" height="340" viewBox="0 0 240 340" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} aria-label="Avatar preview">
      <ellipse cx="120" cy="326" rx="70" ry="8" fill="rgba(0,0,0,.25)" />
      {/* legs + footwear */}
      <rect x="96" y="250" width="18" height="66" rx="8" fill={a.skin} />
      <rect x="126" y="250" width="18" height="66" rx="8" fill={a.skin} />
      {a.footwear !== 'Barefoot' && (
        <>
          <motion.rect animate={{ fill: a.footwear.includes('Beaded') ? a.color : '#5b3a1e' }} x="90" y="308" width="28" height="12" rx="6" />
          <motion.rect animate={{ fill: a.footwear.includes('Beaded') ? a.color : '#5b3a1e' }} x="122" y="308" width="28" height="12" rx="6" />
        </>
      )}
      {/* garment */}
      <motion.path animate={{ fill: a.color }} d={female ? 'M70 130 Q120 110 170 130 L190 270 Q120 290 50 270 Z' : 'M64 128 Q120 108 176 128 L184 262 Q120 278 56 262 Z'} />
      <path d={female ? 'M70 130 Q120 110 170 130 L175 160 Q120 150 65 160Z' : 'M64 128 Q120 108 176 128 L178 150 Q120 140 62 150Z'} fill="rgba(0,0,0,.15)" />
      {/* pattern stripes for woven cloth */}
      {[0, 1, 2, 3].map((k) => (
        <motion.rect key={k} x={female ? 62 : 58} y={180 + k * 22} width={female ? 116 : 124} height="5" fill="rgba(255,255,255,.25)" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.1 * k }} style={{ transformOrigin: '120px 0' }} />
      ))}
      {/* arms */}
      <rect x="44" y="136" width="20" height="96" rx="10" fill={a.skin} transform="rotate(8 54 136)" />
      <rect x="176" y="136" width="20" height="96" rx="10" fill={a.skin} transform="rotate(-8 186 136)" />
      {/* neck + head */}
      <rect x="108" y="96" width="24" height="24" rx="8" fill={a.skin} />
      <ellipse cx="120" cy="74" rx="36" ry="40" fill={a.skin} />
      <circle cx="107" cy="72" r="3.5" fill="#1a1008" />
      <circle cx="133" cy="72" r="3.5" fill="#1a1008" />
      <path d="M110 92 Q120 99 130 92" stroke="#1a1008" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* hair */}
      {!hasHat && <path d={female ? 'M84 66 Q86 28 120 30 Q154 28 156 66 Q150 46 120 44 Q90 46 84 66Z' : 'M86 62 Q90 34 120 34 Q150 34 154 62 Q146 46 120 46 Q94 46 86 62Z'} fill="#1a1008" />}
      {/* hat */}
      {hasHat && (
        <motion.g initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} key={a.hat}>
          {a.hat.includes('Gele') || a.hat.includes('Headwrap') || a.hat.includes('Isicholo') ? (
            <path d="M76 58 Q80 10 120 14 Q170 8 166 58 Q150 40 120 42 Q92 40 76 58Z" fill={a.color} stroke="rgba(0,0,0,.2)" strokeWidth="2" />
          ) : a.hat.includes('crown') ? (
            <path d="M86 44 L92 18 L106 34 L120 12 L134 34 L148 18 L154 44 Z" fill="#d4af37" stroke="#8a6a14" strokeWidth="2" />
          ) : (
            <path d="M88 50 Q90 22 120 22 Q150 22 152 50 Z" fill={a.hat.includes('Red') ? '#b91c1c' : a.color} />
          )}
        </motion.g>
      )}
      {/* jewelry */}
      {hasJewel && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={a.jewelry}>
          {Array.from({ length: 9 }).map((_, k) => (
            <circle key={k} cx={98 + k * 5.5} cy={118 + Math.sin((k / 8) * Math.PI) * 10} r="3.4" fill={a.jewelry.includes('Gold') ? '#d4af37' : a.jewelry.includes('Coral') ? '#e2553b' : '#38bdf8'} />
          ))}
        </motion.g>
      )}
    </motion.svg>
  )
}

/* ─────────── Screen 28 — Profile Tune ─────────── */
export function ProfileTunePage() {
  const tune = useApp((s) => s.tune)
  const setTune = useApp((s) => s.setTune)
  const toast = useApp((s) => s.toast)
  const plan = useApp((s) => s.plan)
  const [t, setT] = useState(tune)
  const [playing, setPlaying] = useState<string | null>(null)
  const [custom, setCustom] = useState<HTMLAudioElement | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(() => () => (stopTune(), custom?.pause()), [custom])
  const play = (name: string) => {
    custom?.pause()
    if (playing === name) {
      stopTune()
      setPlaying(null)
      return
    }
    playTune(name, t.volume, () => setPlaying(null))
    setPlaying(name)
  }
  const list = useMemo(() => Object.keys(TUNES), [])
  return (
    <Page narrow>
      <PageHeader title="Profile Tune" sub="A sound that plays when someone opens your profile. Visitors can always pause it." />
      <div className="card stack gap-5" style={{ padding: 24 }}>
        <div className="stack gap-2">
          <span className="eyebrow">Current sound</span>
          <div className="row gap-3 panel" style={{ padding: 14, background: 'linear-gradient(90deg, var(--accent-soft), transparent)' }}>
            <button className="a-play" style={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--brand-gold-200)', color: '#0a1800' }} onClick={() => play(t.sound)} aria-label={playing === t.sound ? 'Pause' : 'Play'}>
              {playing === t.sound ? <Pause size={18} variant="Bold" /> : <Play size={18} variant="Bold" />}
            </button>
            <span className="stack grow">
              <span className="strong">{t.sound}</span>
              <span className="xs muted">{playing === t.sound ? 'Playing…' : 'Tap to preview'}</span>
            </span>
            <VolumeHigh size={20} color="var(--accent)" />
          </div>
        </div>
        <div className="stack gap-2">
          <span className="eyebrow">Choose a sound</span>
          {list.map((name) => (
            <div key={name} className={cx('radio-card', t.sound === name && 'is-on')} style={{ alignItems: 'center' }} onClick={() => setT({ ...t, sound: name })} role="radio" aria-checked={t.sound === name} tabIndex={0}>
              <span className="radio-dot" />
              <span className="grow small strong">{name}</span>
              <button
                className="icon-btn sm"
                onClick={(e) => {
                  e.stopPropagation()
                  play(name)
                }}
                aria-label={`Preview ${name}`}
              >
                {playing === name ? <Pause size={16} variant="Bold" /> : <Play size={16} variant="Bold" />}
              </button>
            </div>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
            <Music size={16} /> Upload your own sound
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              stopTune()
              const au = new Audio(URL.createObjectURL(f))
              au.volume = t.volume / 100
              au.play()
              setCustom(au)
              setT({ ...t, sound: f.name })
              toast(`Playing ${f.name}`)
            }}
          />
        </div>
        <div className="stack gap-2">
          <span className="row between">
            <span className="eyebrow">Volume</span>
            <span className="xs muted">{t.volume}%</span>
          </span>
          <input type="range" min={0} max={100} value={t.volume} onChange={(e) => setT({ ...t, volume: Number(e.target.value) })} style={{ ['--fill' as string]: `${t.volume}%` }} aria-label="Volume" />
        </div>
        <div className="setting-row" style={{ padding: 0, border: 0 }}>
          <span className="stack grow">
            <span className="small strong">Play on profile load</span>
            <span className="xs muted">Browsers block sound until a visitor interacts, so we show a play control on your profile.</span>
          </span>
          <Switch checked={t.enabled} onChange={(v) => setT({ ...t, enabled: v })} label="Play on profile load" />
        </div>
        {plan === 'subpar' && <Callout kind="gold">Profile Tune is included on every plan.</Callout>}
        <button
          className="btn btn-primary"
          onClick={() => {
            setTune(t)
            stopTune()
            setPlaying(null)
            toast('Profile Tune saved', 'success', { label: 'View profile', to: '/profile' })
          }}
        >
          Save
        </button>
      </div>
    </Page>
  )
}

