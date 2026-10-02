import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Comment, Community, Conversation, Notification, Post, Scroll, Status, Visibility } from '../data/types'
import { COMMENTS, COMMUNITIES, CONVERSATIONS, NOTIFICATIONS, POSTS, SCROLLS, STATUSES } from '../data/seed'

/*
 * Client-side app state. Every CTA in the prototype writes here, and the
 * whole thing persists to localStorage under "cs-web". The action names are
 * written to map 1:1 onto API calls once a backend exists.
 */

export type AuthStage = 'guest' | 'verify_contact' | 'onboarding' | 'active'
export type VerificationState = 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected'
export type PlanId = 'executive' | 'premium' | 'standard' | 'subpar'

export interface Me {
  id: 'me'
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  avatar?: string
  cover?: string
  bio: string
  country: string
  state: string
  tribe: string
  flag: string
  dob: string
  gender: string
  birthOrder: string
  fatherName: string
  motherMaiden: string
  homeAddress: string
  africanRoots: string
  website: string
  socials: { instagram: string; x: string; facebook: string; tiktok: string }
  role: 'member' | 'historian'
}

export interface ProfileTune {
  sound: string
  enabled: boolean
  volume: number
}

export interface FamilyMember {
  id: string
  name: string
  username?: string
  relation: 'Parent' | 'Sibling' | 'Child' | 'Spouse' | 'Grandparent'
  bio: 'Biological' | 'Adopted'
  position?: string
}

export interface AvatarConfig {
  country: string
  tribe: string
  gender: 'Female' | 'Male'
  skin: string
  hat: string
  clothes: string
  jewelry: string
  footwear: string
  color: string
}

export interface Txn {
  id: string
  label: string
  amount: number
  at: number
  state: 'completed' | 'pending' | 'failed'
}

interface Toast {
  id: number
  text: string
  kind: 'info' | 'success' | 'error'
  action?: { label: string; to: string }
}

const DEFAULT_ME: Me = {
  id: 'me',
  firstName: 'Chiamaka',
  lastName: 'Eze',
  username: 'chiamaka.eze',
  email: '',
  phone: '',
  avatar: undefined,
  bio: 'Collector of my grandmother’s stories. Igbo by blood, Lagosian by accident.',
  country: 'Nigeria',
  state: 'Enugu',
  tribe: 'Igbo',
  flag: '🇳🇬',
  dob: '',
  gender: '',
  birthOrder: '',
  fatherName: '',
  motherMaiden: '',
  homeAddress: '',
  africanRoots: 'Igbo — Nsukka, Enugu State',
  website: '',
  socials: { instagram: '', x: '', facebook: '', tiktok: '' },
  role: 'member',
}

let toastSeq = 1

interface AppState {
  theme: 'dark' | 'light'
  auth: AuthStage
  me: Me
  prefs: { interests: string[]; cultures: string[]; genres: string[]; cuisines: string[]; foodStories: string[] }
  raiding: string[]
  raiders: string[]
  mutedRaid: string[]
  likes: Record<string, boolean>
  museum: Record<string, string> // scrollId -> collection
  collections: string[]
  bought: string[]
  scrolls: Scroll[]
  posts: Post[]
  statuses: Status[]
  seenStatus: string[]
  comments: Comment[]
  communities: Community[]
  joined: string[]
  conversations: Conversation[]
  notifications: Notification[]
  verification: { state: VerificationState; step: number; country: string; state_: string; tribe: string; race: string; docType: string; docName: string; videoName: string; submittedAt?: number; note?: string }
  plan: PlanId
  tune: ProfileTune
  avatar: AvatarConfig
  family: FamilyMember[]
  wallet: { balance: number; pending: number; txns: Txn[] }
  location: { audience: 'nobody' | 'friends' | 'raiders' | 'selected'; sharing: boolean }
  notifPrefs: Record<string, boolean>
  privacy: { defaultScroll: Visibility; defaultPost: 'public' | 'followers' | 'friends'; showRoots: boolean; messageFrom: 'everyone' | 'raiders' | 'nobody' }
  toasts: Toast[]

  // ui
  setTheme: (t: 'dark' | 'light') => void
  toggleTheme: () => void
  toast: (text: string, kind?: Toast['kind'], action?: Toast['action']) => void
  dismissToast: (id: number) => void

  // auth
  signUp: (d: { firstName: string; lastName: string; contact: string }) => void
  verifyContact: () => void
  finishOnboarding: () => void
  logIn: (contact: string) => void
  logOut: () => void
  resetDemo: () => void

  // profile
  updateMe: (patch: Partial<Me>) => void
  setPrefs: (patch: Partial<AppState['prefs']>) => void

  // social graph
  toggleRaid: (userId: string) => void
  toggleMuteRaid: (userId: string) => void
  removeRaider: (userId: string) => void

  // engagement
  toggleLike: (id: string) => void
  saveToMuseum: (scrollId: string, collection?: string) => void
  removeFromMuseum: (scrollId: string) => void
  createCollection: (name: string) => void
  addComment: (targetId: string, text: string, parentId?: string, anonymous?: boolean) => void
  toggleCommentLike: (id: string) => void

  // creation
  submitScroll: (s: Omit<Scroll, 'id' | 'likes' | 'comments' | 'saves' | 'views' | 'createdAt' | 'status' | 'review'>, draftId?: string) => string
  saveScrollDraft: (s: Partial<Scroll> & { title: string }) => string
  advanceReview: (scrollId: string) => void
  historianDecision: (scrollId: string, decision: 'approve' | 'clarify' | 'flag', note?: string) => void
  createPost: (p: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'likes' | 'comments' | 'saves'>) => string
  addStatus: (items: { image: string; caption: string }[], hours: number, scheduledFor?: number) => void
  markStatusSeen: (id: string) => void
  deleteStatus: (id: string) => void

  // communities
  toggleJoin: (id: string) => void
  createCommunity: (c: { name: string; about: string; category: string; privacy: 'public' | 'private'; image: string; members: string[] }) => string
  removeMember: (communityId: string, userId: string) => void
  addMember: (communityId: string, userId: string) => void
  toggleAdmin: (communityId: string, userId: string) => void
  updateCommunity: (communityId: string, patch: Partial<Community>) => void

  // messages
  sendMessage: (convId: string, text: string, attachment?: Conversation['messages'][number]['attachment'], scrollId?: string) => void
  startConversation: (userId: string) => string
  shareToConversation: (userId: string, scrollId: string, text?: string) => void
  pinReel: (convId: string, scrollId: string | undefined) => void
  markConversationRead: (convId: string) => void

  // notifications
  markNotificationRead: (id: string) => void
  markAllRead: () => void

  // verification, plans, tune
  setVerification: (patch: Partial<AppState['verification']>) => void
  submitVerification: () => void
  setPlan: (p: PlanId) => void
  setTune: (patch: Partial<ProfileTune>) => void
  setAvatar: (patch: Partial<AvatarConfig>) => void
  setNotifPref: (k: string, v: boolean) => void
  setPrivacy: (patch: Partial<AppState['privacy']>) => void

  // later stage
  buyScroll: (scrollId: string) => 'ok' | 'insufficient'
  addFunds: (amount: number) => void
  sendCowries: (to: string, amount: number) => boolean
  withdraw: (amount: number) => boolean
  addFamily: (m: Omit<FamilyMember, 'id'>) => void
  removeFamily: (id: string) => void
  setLocation: (patch: Partial<AppState['location']>) => void
}

const initialData = () => ({
  auth: 'guest' as AuthStage,
  me: DEFAULT_ME,
  prefs: { interests: [], cultures: [], genres: [], cuisines: [], foodStories: [] },
  raiding: ['amaradia', 'kofi', 'adaeze'],
  raiders: ['kwame', 'nana', 'sade', 'yuki', 'zola'],
  mutedRaid: [],
  likes: { 'language-of-kente': true, 'great-zimbabwe': true },
  museum: { 'adinkra-meaning': 'Default', 'great-zimbabwe': 'History I love' },
  collections: ['Default', 'History I love'],
  bought: [],
  scrolls: SCROLLS,
  posts: POSTS,
  statuses: STATUSES,
  seenStatus: [],
  comments: COMMENTS,
  communities: COMMUNITIES,
  joined: ['akan-circle', 'first-sons', 'yoruba-scholars'],
  conversations: CONVERSATIONS,
  notifications: NOTIFICATIONS,
  verification: { state: 'not_started' as VerificationState, step: 0, country: '', state_: '', tribe: '', race: '', docType: '', docName: '', videoName: '' },
  plan: 'standard' as PlanId,
  tune: { sound: 'Talking Drum — Dùndún call', enabled: true, volume: 60 },
  avatar: { country: 'Nigeria', tribe: 'Igbo', gender: 'Female' as const, skin: '#8d5524', hat: 'Gele', clothes: 'Isiagu', jewelry: 'Coral beads', footwear: 'Leather sandals', color: '#c9a84c' },
  family: [
    { id: 'f1', name: 'Obinna Eze', relation: 'Parent' as const, bio: 'Biological' as const, position: 'Father' },
    { id: 'f2', name: 'Ngozi Eze', relation: 'Parent' as const, bio: 'Biological' as const, position: 'Mother' },
    { id: 'f3', name: 'Ifeanyi Eze', relation: 'Sibling' as const, bio: 'Biological' as const, position: 'First son' },
  ],
  wallet: { balance: 12500, pending: 1500, txns: [
    { id: 't1', label: 'Added funds', amount: 10000, at: Date.now() - 72 * 3600_000, state: 'completed' as const },
    { id: 't2', label: 'Gift from @kwame.a', amount: 2500, at: Date.now() - 30 * 3600_000, state: 'completed' as const },
    { id: 't3', label: 'Withdrawal to bank', amount: -1500, at: Date.now() - 4 * 3600_000, state: 'pending' as const },
  ] },
  location: { audience: 'nobody' as const, sharing: false },
  notifPrefs: { scrolls: true, raiders: true, messages: true, communities: true, comments: true, email: false },
  privacy: { defaultScroll: 'public' as Visibility, defaultPost: 'public' as const, showRoots: true, messageFrom: 'raiders' as const },
})

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      ...initialData(),
      toasts: [],

      setTheme: (t) => {
        document.documentElement.dataset.theme = t
        set({ theme: t })
      },
      toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
      toast: (text, kind = 'info', action) => {
        const id = toastSeq++
        set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, kind, action }] }))
        setTimeout(() => get().dismissToast(id), 3600)
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      signUp: ({ firstName, lastName, contact }) =>
        set((s) => ({
          auth: 'verify_contact',
          me: {
            ...s.me,
            firstName,
            lastName,
            username: `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z.]/g, ''),
            email: contact.includes('@') ? contact : '',
            phone: contact.includes('@') ? '' : contact,
          },
        })),
      verifyContact: () => set({ auth: 'onboarding' }),
      finishOnboarding: () => set({ auth: 'active' }),
      logIn: (contact) =>
        set((s) => ({
          auth: 'active',
          me: { ...s.me, email: contact.includes('@') ? contact : s.me.email },
        })),
      logOut: () => set({ auth: 'guest' }),
      resetDemo: () => set({ ...initialData(), auth: 'active' }),

      updateMe: (patch) => set((s) => ({ me: { ...s.me, ...patch } })),
      setPrefs: (patch) => set((s) => ({ prefs: { ...s.prefs, ...patch } })),

      toggleRaid: (userId) => {
        const on = get().raiding.includes(userId)
        set((s) => ({ raiding: on ? s.raiding.filter((x) => x !== userId) : [...s.raiding, userId] }))
      },
      toggleMuteRaid: (userId) =>
        set((s) => ({ mutedRaid: s.mutedRaid.includes(userId) ? s.mutedRaid.filter((x) => x !== userId) : [...s.mutedRaid, userId] })),
      removeRaider: (userId) => set((s) => ({ raiders: s.raiders.filter((x) => x !== userId) })),

      toggleLike: (id) =>
        set((s) => {
          const likes = { ...s.likes }
          if (likes[id]) delete likes[id]
          else likes[id] = true
          return { likes }
        }),
      saveToMuseum: (scrollId, collection = 'Default') =>
        set((s) => ({
          museum: { ...s.museum, [scrollId]: collection },
          collections: s.collections.includes(collection) ? s.collections : [...s.collections, collection],
        })),
      removeFromMuseum: (scrollId) =>
        set((s) => {
          const museum = { ...s.museum }
          delete museum[scrollId]
          return { museum }
        }),
      createCollection: (name) => set((s) => ({ collections: s.collections.includes(name) ? s.collections : [...s.collections, name] })),
      addComment: (targetId, text, parentId, anonymous) =>
        set((s) => ({
          comments: [...s.comments, { id: uid('c'), targetId, authorId: anonymous ? 'rogue' : 'me', text, createdAt: Date.now(), likes: 0, parentId }],
          scrolls: s.scrolls.map((x) => (x.id === targetId ? { ...x, comments: x.comments + 1 } : x)),
          posts: s.posts.map((x) => (x.id === targetId ? { ...x, comments: x.comments + 1 } : x)),
        })),
      toggleCommentLike: (id) => get().toggleLike(`comment:${id}`),

      submitScroll: (data, draftId) => {
        const id = uid('scroll')
        const scroll: Scroll = {
          ...data,
          id,
          likes: 0,
          comments: 0,
          saves: 0,
          views: 0,
          createdAt: Date.now(),
          status: 'under_review',
          review: [
            { by: 'culture_share', state: 'in_progress' },
            { by: 'historian', state: 'pending' },
          ],
        }
        set((s) => ({
          scrolls: [scroll, ...s.scrolls.filter((x) => x.id !== draftId)],
          notifications: [
            { id: uid('n'), type: 'review', text: `“${data.title}” was submitted. CultureShare and your Historian will review it before publication.`, at: Date.now(), link: '/scrolls/mine', read: false, image: data.images[0] },
            ...s.notifications,
          ],
        }))
        return id
      },
      saveScrollDraft: (data) => {
        const id = data.id ?? uid('draft')
        const existing = get().scrolls.find((x) => x.id === id)
        const draft: Scroll = {
          id,
          title: data.title || 'Untitled Scroll',
          creatorId: 'me',
          kind: data.kind ?? 'reel',
          media: data.media ?? 'image',
          images: data.images ?? [],
          caption: data.caption ?? '',
          country: data.country ?? '',
          flag: data.flag ?? '',
          tribe: data.tribe ?? '',
          category: data.category ?? '',
          tags: data.tags ?? [],
          historianId: data.historianId,
          likes: 0,
          comments: 0,
          saves: 0,
          views: 0,
          createdAt: Date.now(),
          visibility: data.visibility ?? 'public',
          status: 'draft',
        }
        set((s) => ({ scrolls: existing ? s.scrolls.map((x) => (x.id === id ? draft : x)) : [draft, ...s.scrolls] }))
        return id
      },
      advanceReview: (scrollId) =>
        set((s) => ({
          scrolls: s.scrolls.map((x) => {
            if (x.id !== scrollId || !x.review) return x
            const [cs, hist] = x.review
            if (cs.state !== 'approved') return { ...x, review: [{ ...cs, state: 'approved', at: Date.now() }, { ...hist, state: 'in_progress' }] }
            if (hist.state !== 'approved') return { ...x, status: 'published', review: [cs, { ...hist, state: 'approved', at: Date.now() }] }
            return x
          }),
        })),
      historianDecision: (scrollId, decision, note) =>
        set((s) => ({
          scrolls: s.scrolls.map((x) => {
            if (x.id !== scrollId) return x
            const review = x.review ?? [{ by: 'culture_share', state: 'approved' }, { by: 'historian', state: 'pending' }]
            const [cs, hist] = review
            if (decision === 'approve') return { ...x, status: 'published', review: [{ ...cs, state: 'approved' }, { ...hist, state: 'approved', note, at: Date.now() }] }
            if (decision === 'clarify') return { ...x, review: [cs, { ...hist, state: 'clarification', note, at: Date.now() }] }
            return { ...x, status: 'restricted', review: [cs, { ...hist, state: 'clarification', note: note || 'Flagged for CultureShare review', at: Date.now() }] }
          }),
        })),
      createPost: (p) => {
        const id = uid('post')
        set((s) => ({ posts: [{ ...p, id, authorId: 'me', createdAt: Date.now(), likes: 0, comments: 0, saves: 0 }, ...s.posts] }))
        return id
      },
      addStatus: (items, hours, scheduledFor) => {
        const start = scheduledFor ?? Date.now()
        const st: Status = { id: uid('st'), userId: 'me', createdAt: start, expiresAt: start + hours * 3600_000, scheduledFor, items: items.map((i) => ({ ...i, id: uid('si') })) }
        set((s) => ({ statuses: [st, ...s.statuses] }))
      },
      markStatusSeen: (id) => set((s) => (s.seenStatus.includes(id) ? s : { seenStatus: [...s.seenStatus, id] })),
      deleteStatus: (id) => set((s) => ({ statuses: s.statuses.filter((x) => x.id !== id) })),

      toggleJoin: (id) =>
        set((s) => {
          const on = s.joined.includes(id)
          return {
            joined: on ? s.joined.filter((x) => x !== id) : [...s.joined, id],
            communities: s.communities.map((c) => (c.id === id ? { ...c, members: c.members + (on ? -1 : 1) } : c)),
          }
        }),
      createCommunity: (c) => {
        const id = uid('com')
        const community: Community = {
          id,
          name: c.name,
          image: c.image,
          cover: c.image,
          category: c.category,
          members: c.members.length + 1,
          privacy: c.privacy,
          about: c.about,
          rules: ['Respect all cultural content and members.', 'Share only authentic cultural content.'],
          adminIds: ['me'],
          memberIds: c.members,
          media: [],
        }
        set((s) => ({ communities: [community, ...s.communities], joined: [id, ...s.joined] }))
        return id
      },
      removeMember: (communityId, userId) =>
        set((s) => ({ communities: s.communities.map((c) => (c.id === communityId ? { ...c, memberIds: c.memberIds.filter((m) => m !== userId), adminIds: c.adminIds.filter((m) => m !== userId), members: c.members - 1 } : c)) })),
      addMember: (communityId, userId) =>
        set((s) => ({ communities: s.communities.map((c) => (c.id === communityId && !c.memberIds.includes(userId) ? { ...c, memberIds: [...c.memberIds, userId], members: c.members + 1 } : c)) })),
      toggleAdmin: (communityId, userId) =>
        set((s) => ({ communities: s.communities.map((c) => (c.id === communityId ? { ...c, adminIds: c.adminIds.includes(userId) ? c.adminIds.filter((a) => a !== userId) : [...c.adminIds, userId] } : c)) })),
      updateCommunity: (communityId, patch) => set((s) => ({ communities: s.communities.map((c) => (c.id === communityId ? { ...c, ...patch } : c)) })),

      sendMessage: (convId, text, attachment, scrollId) =>
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, { id: uid('m'), from: 'me', text, at: Date.now(), attachment, scrollId }] } : c)),
        })),
      startConversation: (userId) => {
        const existing = get().conversations.find((c) => c.participantId === userId)
        if (existing) return existing.id
        const id = uid('cv')
        set((s) => ({ conversations: [{ id, participantId: userId, messages: [], unread: 0 }, ...s.conversations] }))
        return id
      },
      shareToConversation: (userId, scrollId, text = '') => {
        const id = get().startConversation(userId)
        get().sendMessage(id, text, undefined, scrollId)
      },
      pinReel: (convId, scrollId) => set((s) => ({ conversations: s.conversations.map((c) => (c.id === convId ? { ...c, pinnedScrollId: scrollId } : c)) })),
      markConversationRead: (convId) => set((s) => ({ conversations: s.conversations.map((c) => (c.id === convId ? { ...c, unread: 0 } : c)) })),

      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      setVerification: (patch) => set((s) => ({ verification: { ...s.verification, ...patch } })),
      submitVerification: () =>
        set((s) => ({
          verification: { ...s.verification, state: 'under_review', submittedAt: Date.now() },
          notifications: [{ id: uid('n'), type: 'verification', text: 'Your African verification was submitted. Reviews usually take up to 24 hours.', at: Date.now(), link: '/verification', read: false }, ...s.notifications],
        })),
      setPlan: (p) => set({ plan: p }),
      setTune: (patch) => set((s) => ({ tune: { ...s.tune, ...patch } })),
      setAvatar: (patch) => set((s) => ({ avatar: { ...s.avatar, ...patch } })),
      setNotifPref: (k, v) => set((s) => ({ notifPrefs: { ...s.notifPrefs, [k]: v } })),
      setPrivacy: (patch) => set((s) => ({ privacy: { ...s.privacy, ...patch } })),

      buyScroll: (scrollId) => {
        const sc = get().scrolls.find((x) => x.id === scrollId)
        if (!sc?.price) return 'insufficient'
        if (get().wallet.balance < sc.price) return 'insufficient'
        set((s) => ({
          bought: [...s.bought, scrollId],
          museum: { ...s.museum, [scrollId]: 'Bought' },
          collections: s.collections.includes('Bought') ? s.collections : [...s.collections, 'Bought'],
          wallet: { ...s.wallet, balance: s.wallet.balance - sc.price!, txns: [{ id: uid('t'), label: `Bought “${sc.title}”`, amount: -sc.price!, at: Date.now(), state: 'completed' }, ...s.wallet.txns] },
        }))
        return 'ok'
      },
      addFunds: (amount) =>
        set((s) => ({ wallet: { ...s.wallet, balance: s.wallet.balance + amount, txns: [{ id: uid('t'), label: 'Added funds', amount, at: Date.now(), state: 'completed' }, ...s.wallet.txns] } })),
      sendCowries: (to, amount) => {
        if (get().wallet.balance < amount) return false
        set((s) => ({ wallet: { ...s.wallet, balance: s.wallet.balance - amount, txns: [{ id: uid('t'), label: `Sent to ${to}`, amount: -amount, at: Date.now(), state: 'completed' }, ...s.wallet.txns] } }))
        return true
      },
      withdraw: (amount) => {
        if (get().wallet.balance < amount) return false
        set((s) => ({ wallet: { ...s.wallet, balance: s.wallet.balance - amount, pending: s.wallet.pending + amount, txns: [{ id: uid('t'), label: 'Withdrawal to bank', amount: -amount, at: Date.now(), state: 'pending' }, ...s.wallet.txns] } }))
        return true
      },
      addFamily: (m) => set((s) => ({ family: [...s.family, { ...m, id: uid('f') }] })),
      removeFamily: (id) => set((s) => ({ family: s.family.filter((f) => f.id !== id) })),
      setLocation: (patch) => set((s) => ({ location: { ...s.location, ...patch } })),
    }),
    {
      name: 'cs-web',
      version: 2,
      // v2: sample statuses gained more items (hexagon dash counts) — refresh them, keep the user's own.
      migrate: (persisted, version) => {
        const st = persisted as Partial<AppState>
        if (version < 2) return { ...st, statuses: [...(st.statuses ?? []).filter((x) => x.userId === 'me'), ...STATUSES] } as AppState
        return st as AppState
      },
      storage: createJSONStorage(() => {
        try {
          return localStorage
        } catch {
          return sessionStorage
        }
      }),
      partialize: ({ toasts: _t, ...rest }) => rest,
    },
  ),
)
