import { create } from 'zustand'

/** Transient UI state for global sheets (not persisted). */
interface UIState {
  share: { id: string; kind: 'scroll' | 'post' | 'profile' } | null
  save: string | null
  comments: string | null
  statusViewer: { statusIds: string[]; index: number } | null
  create: boolean
  report: string | null
  openShare: (id: string, kind?: 'scroll' | 'post' | 'profile') => void
  openSave: (scrollId: string) => void
  openComments: (targetId: string) => void
  openStatus: (statusIds: string[], index: number) => void
  openCreate: () => void
  openReport: (id: string) => void
  close: (k: 'share' | 'save' | 'comments' | 'statusViewer' | 'create' | 'report') => void
}

export const useUI = create<UIState>((set) => ({
  share: null,
  save: null,
  comments: null,
  statusViewer: null,
  create: false,
  report: null,
  openShare: (id, kind = 'scroll') => set({ share: { id, kind } }),
  openSave: (save) => set({ save }),
  openComments: (comments) => set({ comments }),
  openStatus: (statusIds, index) => set({ statusViewer: { statusIds, index } }),
  openCreate: () => set({ create: true }),
  openReport: (report) => set({ report }),
  close: (k) => set({ [k]: k === 'create' ? false : null } as Partial<UIState>),
}))
