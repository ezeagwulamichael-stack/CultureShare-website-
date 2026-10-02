import { USERS } from '../data/seed'
import type { User } from '../data/types'
import { useApp, type Me } from '../store/useApp'

export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '')}M`
  if (n >= 10_000) return `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1).replace(/\.0$/, '')}K`
  return n.toLocaleString('en-US')
}

export function timeAgo(t: number): string {
  const s = Math.max(1, Math.round((Date.now() - t) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d`
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function clock(t: number): string {
  return new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export const ROGUE: User = {
  id: 'rogue',
  name: 'Rogue Raider',
  username: 'rogue.raider',
  flag: '',
  country: '',
  tagline: 'Posting anonymously',
  role: 'member',
  verified: false,
  raiders: 0,
  raiding: 0,
}

export function meAsUser(me: Me, raiders: number, raiding: number): User {
  return {
    id: 'me',
    name: `${me.firstName} ${me.lastName}`.trim(),
    username: me.username,
    avatar: me.avatar,
    flag: me.flag,
    country: me.country,
    state: me.state,
    tribe: me.tribe,
    tagline: me.africanRoots || `${me.tribe} · ${me.country}`,
    bio: me.bio,
    role: me.role === 'historian' ? 'historian' : 'creator',
    verified: false,
    raiders,
    raiding,
    website: me.website,
    cover: me.cover,
  }
}

const byId = new Map(USERS.map((u) => [u.id, u]))

export function getUser(id: string): User | undefined {
  if (id === 'rogue') return ROGUE
  return byId.get(id)
}

/** Resolves any user id — including "me" — against live state. */
export function useUser(id: string | undefined): User | undefined {
  const me = useApp((s) => s.me)
  const raiders = useApp((s) => s.raiders.length)
  const raiding = useApp((s) => s.raiding.length)
  const raidingMe = useApp((s) => (id ? s.raiding.includes(id) : false))
  if (!id) return undefined
  if (id === 'me') return meAsUser(me, raiders, raiding)
  const u = getUser(id)
  if (!u) return undefined
  // reflect my own raid in their count
  return raidingMe ? { ...u, raiders: u.raiders + 1 } : u
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

export function maskContact(c: string) {
  if (!c) return 'your email'
  if (c.includes('@')) {
    const [u, d] = c.split('@')
    return `${u[0]}••••@${d}`
  }
  return `${c.slice(0, 4)} ••• ${c.slice(-2)}`
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Copies text; resolves false when the browser or host frame refuses clipboard access. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
