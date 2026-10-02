import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Add, Camera, Crown1, Global, Lock1, People, SearchNormal1, Setting2, Shield, Trash, UserAdd, Message, ArrowRight2, Logout } from 'iconsax-react'
import { useShallow } from 'zustand/react/shallow'
import { useApp } from '../store/useApp'
import { img } from '../data/seed'
import { Page, PageHeader } from '../components/Shell'
import { PostCard } from '../components/content'
import { PeoplePicker } from '../components/sheets'
import { Avatar, Decision, Drawer, Empty, Input, Modal, Select, SectionHead, Tabs, Textarea, Spinner } from '../components/ui'
import { compact, cx, getUser, wait } from '../lib/util'
import { imageToDataUrl } from '../lib/media'

/* ─────────── Screen 24 — Communities ─────────── */
export function Communities() {
  const communities = useApp((s) => s.communities)
  const joined = useApp((s) => s.joined)
  const toggleJoin = useApp((s) => s.toggleJoin)
  const toast = useApp((s) => s.toast)
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [createOpen, setCreateOpen] = useState(params.get('create') === '1')
  useEffect(() => {
    if (params.get('create') === '1') setCreateOpen(true)
  }, [params])
  const mine = communities.filter((c) => joined.includes(c.id) && c.name.toLowerCase().includes(q.toLowerCase()))
  const discover = communities.filter((c) => !joined.includes(c.id) && c.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <Page wide>
      <PageHeader
        title="Communities"
        sub="Close circles of a few hundred people around a shared identity — first sons, only children, daughters, a tribe, a craft."
        actions={
          <motion.button whileTap={{ scale: 0.95 }} className="btn btn-gold btn-sm" onClick={() => setCreateOpen(true)}>
            <Add size={18} /> Create community
          </motion.button>
        }
      />
      <Input placeholder="Search community" value={q} onChange={(e) => setQ(e.target.value)} icon={<SearchNormal1 size={16} color="var(--text-4)" />} />
      <section>
        <SectionHead title="Your communities" />
        {mine.length ? (
          <div className="grid-4">
            {mine.map((c, k) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.04 }}>
                <Link to={`/communities/${c.id}`} className="stack gap-2 hover-lift" style={{ borderRadius: 14 }}>
                  <span className="topic-card" style={{ height: 140 }}>
                    <img src={c.cover} alt="" />
                    {c.adminIds.includes('me') && (
                      <span className="tag gold" style={{ position: 'absolute', top: 10, left: 10 }}>
                        <Crown1 size={10} /> Admin
                      </span>
                    )}
                  </span>
                  <span className="small strong" style={{ padding: '0 4px' }}>
                    {c.name}
                  </span>
                  <span className="xs faint" style={{ padding: '0 4px' }}>
                    {compact(c.members)} members · {c.privacy === 'private' ? 'Private' : 'Public'}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Empty icon={<People size={26} variant="Bulk" />} title={q ? 'No matches' : 'You haven’t joined a community yet'} text="Join one below, or start your own." />
        )}
      </section>
      <section>
        <SectionHead title="Discover communities" />
        <div className="grid-2" style={{ gap: 12 }}>
          {discover.map((c, k) => (
            <motion.div key={c.id} className="list-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.04 }}>
              <Link to={`/communities/${c.id}`} style={{ flex: 'none' }}>
                <img src={c.image} alt="" style={{ width: 76, height: 76, objectFit: 'cover' }} />
              </Link>
              <Link to={`/communities/${c.id}`} className="stack grow" style={{ minWidth: 0, padding: '8px 0' }}>
                <span className="small strong ellipsis">{c.name}</span>
                <span className="xs faint">
                  {c.category} · {c.members.toLocaleString()} members
                </span>
                <span className="xs muted clamp-2" style={{ marginTop: 2 }}>
                  {c.about}
                </span>
              </Link>
              <button
                className="raid-btn"
                style={{ marginRight: 14, minWidth: 58 }}
                onClick={() => {
                  toggleJoin(c.id)
                  toast(c.privacy === 'private' ? `Request sent to ${c.name}` : `Joined ${c.name}`, 'success', { label: 'Open', to: `/communities/${c.id}` })
                }}
              >
                {c.privacy === 'private' ? 'Request' : 'Join'}
              </button>
            </motion.div>
          ))}
          {discover.length === 0 && <p className="small muted">You’re in every community — impressive.</p>}
        </div>
      </section>
      <CreateCommunity
        open={createOpen}
        onClose={() => {
          setCreateOpen(false)
          if (params.get('create')) setParams({})
        }}
      />
    </Page>
  )
}

/* ─────────── Screen 25 — Create community (drawer) ─────────── */
function CreateCommunity({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useApp((s) => s.createCommunity)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', about: '', category: 'Culture', privacy: 'public' as 'public' | 'private', image: img('kente-weaving') })
  const [members, setMembers] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const ok = f.name.trim().length > 2 && f.about.trim().length > 10
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Create community"
      wide
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary grow"
            disabled={!ok || busy}
            onClick={async () => {
              setBusy(true)
              await wait(700)
              const id = create({ ...f, members })
              setBusy(false)
              onClose()
              toast(`${f.name} is live — you’re the admin`, 'success')
              nav(`/communities/${id}`)
            }}
          >
            {busy ? <Spinner /> : 'Create community'}
          </button>
        </>
      }
    >
      <div className="stack gap-4">
        <button className="topic-card" style={{ height: 150, width: '100%' }} onClick={() => fileRef.current?.click()} aria-label="Change image">
          <img src={f.image} alt="" />
          <span className="tc-label row gap-2 small strong">
            <Camera size={16} /> Change image
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) setF({ ...f, image: await imageToDataUrl(file, 1000) })
          }}
        />
        <Input label="Community name" placeholder="e.g. Daughters of Benin" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={50} />
        <Textarea label="Description" placeholder="Who is this for and what will you share?" value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} maxLength={400} hint={`${f.about.length}/400`} />
        <Select label="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          {['Culture', 'Family', 'Heritage', 'History', 'Music', 'Food', 'Language', 'Arts'].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <div className="stack gap-2">
          <span className="field-label">Privacy & access</span>
          <div className="grid-2" style={{ gap: 10 }}>
            {(
              [
                ['public', 'Public', 'Anyone can find and join', <Global size={18} key="g" />],
                ['private', 'Private', 'People request to join', <Lock1 size={18} key="l" />],
              ] as const
            ).map(([v, t, s, i]) => (
              <button key={v} className={cx('radio-card', f.privacy === v && 'is-on')} onClick={() => setF({ ...f, privacy: v })}>
                <span className="radio-dot" />
                <span className="stack">
                  <span className="row gap-2 small strong">
                    {i} {t}
                  </span>
                  <span className="xs muted">{s}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="stack gap-2">
          <span className="field-label">Add members</span>
          <PeoplePicker value={members} onChange={setMembers} />
        </div>
        <p className="xs faint">You’ll be the first admin. You can choose more admins after creating it.</p>
        <Decision>The source mentions communities of roughly 300–500 members; whether that’s a hard limit needs product confirmation.</Decision>
      </div>
    </Drawer>
  )
}

/* ─────────── Community detail ─────────── */
export function CommunityDetail() {
  const { id } = useParams()
  const c = useApp((s) => s.communities.find((x) => x.id === id))
  const joined = useApp((s) => (id ? s.joined.includes(id) : false))
  const posts = useApp(useShallow((s) => s.posts.filter((p) => p.communityId === id)))
  const toggleJoin = useApp((s) => s.toggleJoin)
  const toast = useApp((s) => s.toast)
  const conversations = useApp((s) => s.conversations)
  const nav = useNavigate()
  const [tab, setTab] = useState<'Feed' | 'Members' | 'About' | 'Media'>('Feed')
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  if (!c) {
    return (
      <Page narrow>
        <Empty icon={<People size={26} />} title="Community not found" text="It may have been closed by its admins." action={<Link to="/communities" className="btn btn-primary btn-sm">Browse communities</Link>} />
      </Page>
    )
  }
  const isAdmin = c.adminIds.includes('me')
  const locked = c.privacy === 'private' && !joined
  const announcement = posts.find((p) => p.announcement)
  const feed = posts.filter((p) => !p.announcement).sort((a, b) => b.createdAt - a.createdAt)
  const conv = conversations.find((x) => x.communityId === c.id)
  return (
    <Page wide>
      <motion.section className="profile-hero" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="profile-cover" style={{ height: 'clamp(160px, 22vw, 260px)' }}>
          <img src={c.cover} alt="" />
        </div>
        <div className="stack gap-3" style={{ padding: '18px 24px 22px', alignItems: 'center', textAlign: 'center' }}>
          <h1 className="h1">{c.name}</h1>
          <span className="small muted row gap-2 wrap center">
            {c.category} · {c.members.toLocaleString()} members · {c.privacy === 'private' ? <span className="row gap-1"><Lock1 size={12} /> Private</span> : 'Public'}
          </span>
          <div className="row gap-2 wrap center">
            {joined ? (
              <>
                <button className="btn btn-gold btn-sm" onClick={() => nav(`/create/post?community=${c.id}`)}>
                  <Add size={16} /> Post
                </button>
                {conv && (
                  <Link to={`/messages/${conv.id}`} className="btn btn-secondary btn-sm">
                    <Message size={16} /> Group chat
                  </Link>
                )}
                {isAdmin ? (
                  <Link to={`/communities/${c.id}/admin`} className="btn btn-secondary btn-sm">
                    <Setting2 size={16} /> Admin tools
                  </Link>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => setLeaveOpen(true)}>
                    <Logout size={16} /> Leave
                  </button>
                )}
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="btn btn-gold"
                onClick={() => {
                  toggleJoin(c.id)
                  toast(c.privacy === 'private' ? 'Request sent — admins will review it' : `Welcome to ${c.name}`, 'success')
                }}
              >
                {c.privacy === 'private' ? 'Request to join' : 'Join community'}
              </motion.button>
            )}
          </div>
        </div>
      </motion.section>
      <Tabs tabs={['Feed', 'Members', 'About', 'Media'] as const} value={tab} onChange={setTab} fill />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ maxWidth: 820, width: '100%', margin: '0 auto' }}>
          {tab === 'Feed' &&
            (locked ? (
              <Empty icon={<Lock1 size={26} />} title="This community is private" text="Request to join to see posts and members. Private means members-only — not that it’s empty." />
            ) : (
              <div className="stack gap-5">
                {announcement && <PostCard post={announcement} />}
                {feed.map((p, k) => (
                  <PostCard key={p.id} post={p} index={k} />
                ))}
                {!feed.length && !announcement && <Empty icon={<Add size={26} />} title="No posts yet" text="Start the conversation for this community." action={joined ? <button className="btn btn-primary btn-sm" onClick={() => nav(`/create/post?community=${c.id}`)}>Create post</button> : undefined} />}
              </div>
            ))}
          {tab === 'Members' && (
            <div className="stack gap-4">
              <span className="eyebrow">Admins · {c.adminIds.length}</span>
              {c.adminIds.map((m) => (
                <MemberRow key={m} id={m} role="Admin" />
              ))}
              <hr className="divider" />
              <span className="eyebrow">Members · {c.members.toLocaleString()}</span>
              {c.memberIds
                .filter((m) => !c.adminIds.includes(m))
                .map((m) => (
                  <MemberRow key={m} id={m} role="Member" />
                ))}
              {joined && !c.memberIds.includes('me') && !isAdmin && <MemberRow id="me" role="Member" />}
              <p className="xs faint" style={{ textAlign: 'center' }}>
                Showing a sample of members.
              </p>
            </div>
          )}
          {tab === 'About' && (
            <div className="stack gap-4">
              <div className="card" style={{ padding: 22, background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, var(--surface-1)), var(--surface-1))', borderColor: 'var(--accent-line)' }}>
                <span className="eyebrow gold" style={{ fontSize: 14 }}>
                  About
                </span>
                <p className="mt-3" style={{ lineHeight: 1.65 }}>
                  {c.about}
                </p>
              </div>
              <div className="card" style={{ padding: 22 }}>
                <span className="eyebrow gold" style={{ fontSize: 14 }}>
                  Community rules
                </span>
                <ol className="stack gap-3 mt-3" style={{ listStyle: 'decimal', paddingLeft: 18 }}>
                  {c.rules.map((r) => (
                    <li key={r} className="small" style={{ color: 'var(--text-2)' }}>
                      {r}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
          {tab === 'Media' &&
            (locked ? (
              <Empty icon={<Lock1 size={26} />} title="Members only" text="Join to see shared media." />
            ) : c.media.length ? (
              <div className="grid-3" style={{ gap: 4 }}>
                {c.media.map((m, k) => (
                  <motion.button key={m} className="thumb" style={{ borderRadius: 4 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: k * 0.02 }} onClick={() => setLightbox(m)}>
                    <img src={m} alt="" />
                  </motion.button>
                ))}
              </div>
            ) : (
              <Empty icon={<Camera size={26} />} title="No media yet" text="Photos and videos shared in posts collect here." />
            ))}
        </motion.div>
      </AnimatePresence>
      <Modal open={!!lightbox} onClose={() => setLightbox(null)} wide label="Image">
        {lightbox && <img src={lightbox} alt="" style={{ width: '100%', borderRadius: 12 }} />}
      </Modal>
      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title={`Leave ${c.name}?`}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setLeaveOpen(false)}>
              Stay
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                toggleJoin(c.id)
                setLeaveOpen(false)
                toast(`You left ${c.name}`)
              }}
            >
              Leave community
            </button>
          </>
        }
      >
        <p className="small muted">You’ll stop seeing its posts and lose access to the group chat. {c.privacy === 'private' && 'You’ll need to request again to rejoin.'}</p>
      </Modal>
    </Page>
  )
}

function MemberRow({ id, role }: { id: string; role: 'Admin' | 'Member' }) {
  const u = getUser(id) ?? (id === 'me' ? { id: 'me', name: 'You', flag: '', avatar: useApp.getState().me.avatar } : undefined)
  if (!u) return null
  return (
    <Link to={id === 'me' ? '/profile' : `/u/${id}`} className="row gap-3" style={{ padding: '6px 0' }}>
      <Avatar src={u.avatar} name={u.name} size={42} />
      <span className="stack grow">
        <span className="small strong">
          {u.name} {u.flag}
        </span>
        <span className={cx('xs', role === 'Admin' ? 'gold' : 'faint')}>{role}</span>
      </span>
      <ArrowRight2 size={16} color="var(--text-4)" />
    </Link>
  )
}

/* ─────────── Screen 26 — Community admin ─────────── */
export function CommunityAdmin() {
  const { id } = useParams()
  const c = useApp((s) => s.communities.find((x) => x.id === id))
  const remove = useApp((s) => s.removeMember)
  const add = useApp((s) => s.addMember)
  const toggleAdmin = useApp((s) => s.toggleAdmin)
  const update = useApp((s) => s.updateCommunity)
  const toast = useApp((s) => s.toast)
  const [tab, setTab] = useState<'Members' | 'Moderation' | 'Information'>('Members')
  const [addOpen, setAddOpen] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const [confirm, setConfirm] = useState<string | null>(null)
  const [info, setInfo] = useState({ name: c?.name ?? '', about: c?.about ?? '', privacy: c?.privacy ?? 'public' })
  const [queue, setQueue] = useState([
    { id: 'q1', author: 'tunde', text: 'Selling Kente cloth cheap — DM me!!!', reason: 'Possible spam' },
    { id: 'q2', author: 'yuki', text: 'Here is a photo from a sacred shrine ceremony in my village.', reason: 'Sacred content — consent check' },
  ])
  if (!c) return <Page narrow><Empty icon={<People size={26} />} title="Community not found" text="" /></Page>
  if (!c.adminIds.includes('me')) {
    return (
      <Page narrow>
        <Empty icon={<Shield size={26} />} title="Admins only" text="You need to be an admin of this community to use admin tools." action={<Link className="btn btn-secondary btn-sm" to={`/communities/${c.id}`}>Back to community</Link>} />
      </Page>
    )
  }
  return (
    <Page wide>
      <PageHeader eyebrow="Admin tools" title={c.name} sub="Admin controls are kept separate from normal member controls. Changes apply immediately." />
      <Tabs tabs={['Members', 'Moderation', 'Information'] as const} value={tab} onChange={setTab} counts={{ Moderation: queue.length }} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="stack gap-4">
          {tab === 'Members' && (
            <>
              <div className="row between wrap gap-3">
                <span className="small muted">{c.memberIds.length + c.adminIds.length} people listed · {c.members.toLocaleString()} total</span>
                <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
                  <UserAdd size={16} /> Add member
                </button>
              </div>
              <div className="panel" style={{ padding: '4px 16px' }}>
                {[...new Set([...c.adminIds, ...c.memberIds])].map((m) => {
                  const u = m === 'me' ? { name: 'You', avatar: useApp.getState().me.avatar, username: useApp.getState().me.username } : getUser(m)
                  if (!u) return null
                  const admin = c.adminIds.includes(m)
                  return (
                    <div key={m} className="setting-row">
                      <Avatar src={u.avatar} name={u.name} size={40} />
                      <span className="stack grow">
                        <span className="small strong">{u.name}</span>
                        <span className={cx('xs', admin ? 'gold' : 'faint')}>{admin ? 'Admin' : 'Member'}</span>
                      </span>
                      {m !== 'me' && (
                        <>
                          <button
                            className="btn btn-secondary btn-xs"
                            onClick={() => {
                              toggleAdmin(c.id, m)
                              toast(admin ? `${u.name} is no longer an admin` : `${u.name} is now an admin`, 'success')
                            }}
                          >
                            <Crown1 size={14} /> {admin ? 'Remove admin' : 'Make admin'}
                          </button>
                          <button className="btn btn-danger btn-xs" onClick={() => setConfirm(m)}>
                            <Trash size={14} /> Remove
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
          {tab === 'Moderation' && (
            <>
              {queue.length === 0 && <Empty icon={<Shield size={26} />} title="Queue is clear" text="Reported and flagged posts in this community will appear here." />}
              <AnimatePresence>
                {queue.map((q) => {
                  const u = getUser(q.author)!
                  return (
                    <motion.div key={q.id} layout exit={{ opacity: 0, x: 40 }} className="card stack gap-3" style={{ padding: 16 }}>
                      <div className="row gap-3">
                        <Avatar user={u} size={36} />
                        <span className="stack grow">
                          <span className="small strong">{u.name}</span>
                          <span className="tag amber" style={{ alignSelf: 'flex-start' }}>
                            {q.reason}
                          </span>
                        </span>
                      </div>
                      <p className="small" style={{ color: 'var(--text-2)' }}>
                        {q.text}
                      </p>
                      <div className="row gap-2">
                        <button className="btn btn-secondary btn-xs" onClick={() => (setQueue(queue.filter((x) => x.id !== q.id)), toast('Post approved', 'success'))}>
                          Approve
                        </button>
                        <button className="btn btn-danger btn-xs" onClick={() => (setQueue(queue.filter((x) => x.id !== q.id)), toast('Post removed'))}>
                          Remove post
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </>
          )}
          {tab === 'Information' && (
            <div className="card stack gap-4" style={{ padding: 22, maxWidth: 720 }}>
              <Input label="Community name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
              <Textarea label="Description" value={info.about} onChange={(e) => setInfo({ ...info, about: e.target.value })} />
              <Select label="Privacy" value={info.privacy} onChange={(e) => setInfo({ ...info, privacy: e.target.value as 'public' | 'private' })}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </Select>
              <button
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => {
                  update(c.id, info)
                  toast('Community information saved', 'success')
                }}
              >
                Save information
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add members"
        footer={
          <button
            className="btn btn-primary"
            disabled={!picked.length}
            onClick={() => {
              picked.forEach((p) => add(c.id, p))
              toast(`Added ${picked.length} member${picked.length > 1 ? 's' : ''}`, 'success')
              setPicked([])
              setAddOpen(false)
            }}
          >
            Add {picked.length || ''}
          </button>
        }
      >
        <PeoplePicker value={picked} onChange={setPicked} exclude={[...c.memberIds, ...c.adminIds]} />
      </Modal>
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Remove member?"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirm(null)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                remove(c.id, confirm!)
                toast(`${getUser(confirm!)?.name} was removed`)
                setConfirm(null)
              }}
            >
              Remove
            </button>
          </>
        }
      >
        <p className="small muted">{getUser(confirm ?? '')?.name} will lose access to this community’s posts and chat.</p>
      </Modal>
    </Page>
  )
}

