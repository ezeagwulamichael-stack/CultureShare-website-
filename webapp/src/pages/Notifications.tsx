import { useState } from 'react'
import { asset } from '../data/seed'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Notification as Bell, Message, People, ProfileAdd, ShieldTick, TickCircle, Timer1 } from 'iconsax-react'
import { useApp } from '../store/useApp'
import type { NotificationType } from '../data/types'
import { Page, PageHeader } from '../components/Shell'
import { Avatar, Empty, Tabs } from '../components/ui'
import { cx, timeAgo, useUser } from '../lib/util'

const FILTERS = ['All', 'Scrolls', 'Raiders', 'Messages', 'Communities'] as const
type F = (typeof FILTERS)[number]
const MATCH: Record<F, NotificationType[]> = {
  All: ['scroll', 'raider', 'comment', 'message', 'community', 'verification', 'review'],
  Scrolls: ['scroll', 'review', 'comment'],
  Raiders: ['raider'],
  Messages: ['message'],
  Communities: ['community'],
}

/* ─────────── Screen 23 — Notification centre ─────────── */
export function Notifications() {
  const all = useApp((s) => s.notifications)
  const markRead = useApp((s) => s.markNotificationRead)
  const markAll = useApp((s) => s.markAllRead)
  const [f, setF] = useState<F>('All')
  const list = all.filter((n) => MATCH[f].includes(n.type))
  const unread = all.filter((n) => !n.read).length
  const counts = Object.fromEntries(FILTERS.map((x) => [x, all.filter((n) => !n.read && MATCH[x].includes(n.type)).length || undefined])) as Partial<Record<F, number>>
  const nav = useNavigate()
  const today = list.filter((n) => Date.now() - n.at < 24 * 3600_000)
  const earlier = list.filter((n) => Date.now() - n.at >= 24 * 3600_000)
  return (
    <Page narrow>
      <PageHeader
        title="Notifications"
        sub={unread ? `${unread} unread` : 'You’re all caught up'}
        actions={
          <button className="btn btn-secondary btn-sm" disabled={!unread} onClick={markAll}>
            <TickCircle size={16} /> Mark all as read
          </button>
        }
      />
      <Tabs tabs={FILTERS} value={f} onChange={setF} counts={counts} />
      {list.length === 0 ? (
        <Empty icon={<Bell size={26} variant="Bulk" />} title="Nothing here yet" text={f === 'Scrolls' ? 'When people you raid upload Scrolls, you’ll be told first-hand.' : 'Activity will show up here.'} />
      ) : (
        <div className="stack gap-5">
          {[
            ['Today', today],
            ['Earlier', earlier],
          ].map(([label, items]) =>
            (items as typeof list).length ? (
              <section key={label as string} className="stack gap-2">
                <span className="eyebrow">{label as string}</span>
                <AnimatePresence initial={false}>
                  {(items as typeof list).map((n, k) => (
                    <NotificationRow
                      key={n.id}
                      k={k}
                      n={n}
                      onOpen={() => {
                        markRead(n.id)
                        nav(n.link)
                      }}
                    />
                  ))}
                </AnimatePresence>
              </section>
            ) : null,
          )}
        </div>
      )}
    </Page>
  )
}

function NotificationRow({ n, onOpen, k }: { n: ReturnType<typeof useApp.getState>['notifications'][number]; onOpen: () => void; k: number }) {
  const actor = useUser(n.actorId)
  const isScroll = n.type === 'scroll' || n.type === 'review'
  const icon = {
    scroll: <img src={asset('scroll-icon.webp')} alt="" width={14} />,
    review: <Timer1 size={12} variant="Bold" />,
    raider: <ProfileAdd size={12} variant="Bold" />,
    comment: <Message size={12} variant="Bold" />,
    message: <Message size={12} variant="Bold" />,
    community: <People size={12} variant="Bold" />,
    verification: <ShieldTick size={12} variant="Bold" />,
  }[n.type]
  return (
    <motion.button
      layout
      className={cx('notif', !n.read && 'unread', isScroll && 'scroll')}
      onClick={onOpen}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: k * 0.03 }}
    >
      <span style={{ position: 'relative', flex: 'none' }}>
        {actor ? <Avatar user={actor} size={44} /> : <span className="avatar" style={{ ['--size' as string]: '44px', background: 'var(--accent-soft)', color: 'var(--accent-text)' }}><ShieldTick size={20} /></span>}
        <span className="notif-type">{icon}</span>
      </span>
      <span className="stack grow" style={{ textAlign: 'left', minWidth: 0 }}>
        <span className="small" style={{ lineHeight: 1.45 }}>
          {actor && <strong>{actor.name} </strong>}
          {n.text}
        </span>
        <span className="xs faint row gap-2">
          {timeAgo(n.at)}
          {isScroll && n.type === 'scroll' && <span className="tag gold" style={{ height: 18 }}>First-hand · you raid them</span>}
        </span>
      </span>
      {n.image && <img src={n.image} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flex: 'none' }} />}
      {!n.read && <span style={{ width: 8, height: 8, borderRadius: 8, background: 'var(--brand-gold)', flex: 'none' }} aria-label="Unread" />}
    </motion.button>
  )
}
