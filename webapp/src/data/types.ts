export type Id = string

export type Role = 'member' | 'creator' | 'historian' | 'artist'

export interface User {
  id: Id
  name: string
  username: string
  avatar?: string
  flag: string
  country: string
  state?: string
  tribe?: string
  tagline: string
  bio?: string
  role: Role
  verified: boolean
  raiders: number
  raiding: number
  specialty?: string
  website?: string
  cover?: string
}

export type ScrollKind = 'reel' | 'documentary'
export type MediaKind = 'image' | 'video' | 'audio' | 'text'
export type ScrollStatus = 'draft' | 'under_review' | 'published' | 'restricted'
export type Visibility = 'public' | 'raiders' | 'friends'
export type DarkZoneState = 'entered' | 'under_scrutiny' | 'restricted' | 'dropped' | 'discussion'

export interface ReviewStep {
  by: 'culture_share' | 'historian'
  state: 'pending' | 'in_progress' | 'approved' | 'clarification'
  note?: string
  at?: number
}

export interface Scroll {
  id: Id
  title: string
  creatorId: Id
  kind: ScrollKind
  media: MediaKind
  images: string[]
  duration?: string
  caption: string
  country: string
  flag: string
  tribe: string
  category: string
  tags: string[]
  historianId?: Id
  likes: number
  comments: number
  saves: number
  views: number
  createdAt: number
  visibility: Visibility
  status: ScrollStatus
  review?: ReviewStep[]
  darkZone?: { state: DarkZoneState; reason: string }
  anonymous?: boolean
  people?: string[]
  location?: string
  music?: string
  price?: number
  sale?: 'available' | 'sold'
}

export interface Post {
  id: Id
  authorId: Id
  text: string
  images: string[]
  createdAt: number
  likes: number
  comments: number
  saves: number
  communityId?: Id
  visibility: 'public' | 'followers' | 'friends'
  location?: string
  people?: string[]
  music?: string
  announcement?: boolean
}

export interface StatusItem {
  id: Id
  image: string
  caption: string
  scrollId?: Id
}

export interface Status {
  id: Id
  userId: Id
  items: StatusItem[]
  createdAt: number
  expiresAt: number
  scheduledFor?: number
}

export interface Community {
  id: Id
  name: string
  image: string
  cover: string
  category: string
  members: number
  privacy: 'public' | 'private'
  about: string
  rules: string[]
  adminIds: Id[]
  memberIds: Id[]
  media: string[]
}

export interface Comment {
  id: Id
  targetId: Id
  authorId: Id
  text: string
  createdAt: number
  likes: number
  parentId?: Id
}

export interface Message {
  id: Id
  from: Id
  text: string
  at: number
  attachment?: { kind: 'image' | 'video' | 'document'; name: string; src?: string }
  scrollId?: Id
}

export interface Conversation {
  id: Id
  participantId?: Id
  communityId?: Id
  messages: Message[]
  pinnedScrollId?: Id
  unread: number
}

export type NotificationType = 'scroll' | 'raider' | 'comment' | 'message' | 'community' | 'verification' | 'review'

export interface Notification {
  id: Id
  type: NotificationType
  actorId?: Id
  text: string
  at: number
  link: string
  read: boolean
  image?: string
}

export interface Topic {
  id: Id
  name: string
  image: string
  region: string
  posts: number
  scrolls: number
}
