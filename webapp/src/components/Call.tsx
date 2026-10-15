import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { CallSlash, Microphone2, MicrophoneSlash1, VolumeHigh, VolumeSlash, Video, VideoSlash, Profile2User } from 'iconsax-react'
import { Avatar } from './ui'
import { cx } from '../lib/util'
import type { User } from '../data/types'

export type CallKind = 'voice' | 'video'

interface Props {
  kind: CallKind
  title: string
  user?: User
  image?: string
  /** Group calls are placed to a community conversation. */
  group?: boolean
  onEnd: (r: { kind: CallKind; seconds: number; connected: boolean }) => void
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/*
 * Full-screen call surface for a conversation. There is no calling backend
 * yet, so the other side "answers" after a short ring; the camera self-view
 * is real when the browser grants access.
 */
export function CallScreen({ kind: initialKind, title, user, image, group, onEnd }: Props) {
  const [kind, setKind] = useState<CallKind>(initialKind)
  const [phase, setPhase] = useState<'ringing' | 'connected'>('ringing')
  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted] = useState(false)
  const [speaker, setSpeaker] = useState(true)
  const [camera, setCamera] = useState(initialKind === 'video')
  const [camError, setCamError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setPhase('connected'), 2600)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (phase !== 'connected') return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  // camera self-view
  useEffect(() => {
    if (kind !== 'video' || !camera) return
    let cancelled = false
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (cancelled) return stream.getTracks().forEach((t) => t.stop())
        streamRef.current = stream
        setCamError(false)
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => !cancelled && setCamError(true))
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [kind, camera])

  const noCamera = camError || !navigator.mediaDevices
  const end = () => onEnd({ kind, seconds, connected: phase === 'connected' })
  const status = phase === 'ringing' ? (group ? 'Calling members…' : 'Ringing…') : fmt(seconds)
  const remoteImg = user?.avatar ?? image
  const video = kind === 'video'

  return createPortal(
    <motion.div className={cx('call-screen', video && 'is-video')} role="dialog" aria-modal="true" aria-label={`${video ? 'Video' : 'Voice'} call with ${title}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {video && remoteImg && (
        <motion.img className="call-remote" src={remoteImg} alt="" initial={{ scale: 1.08 }} animate={{ scale: phase === 'connected' ? 1 : 1.08, filter: phase === 'connected' ? 'blur(0px)' : 'blur(18px)' }} transition={{ duration: 1.2 }} />
      )}
      <div className="call-shade" />

      <div className="call-top">
        <span className="call-pill">{video ? <Video size={14} variant="Bold" /> : <Microphone2 size={14} variant="Bold" />} {group ? 'Group ' : ''}{video ? 'video' : 'voice'} call</span>
        {user && <span className="xs" style={{ opacity: 0.7 }}>{user.flag} @{user.username}</span>}
      </div>

      <div className={cx('call-center', video && phase === 'connected' && 'is-compact')}>
        {(!video || phase === 'ringing' || !remoteImg) && (
          <div className="call-avatar">
            {phase === 'ringing' &&
              [0, 1, 2].map((k) => <motion.span key={k} className="call-ring" initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 1.9, opacity: 0 }} transition={{ duration: 2, repeat: Infinity, delay: k * 0.6, ease: 'easeOut' }} />)}
            {group && image ? <img src={image} alt="" className="call-group-img" /> : <Avatar user={user} src={image} name={title} size={128} />}
          </div>
        )}
        <h2 className="call-name">{title}</h2>
        <AnimatePresence mode="wait">
          <motion.span key={phase} className="call-status" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {status}
            {muted && phase === 'connected' && ' · Muted'}
          </motion.span>
        </AnimatePresence>
        {group && phase === 'connected' && (
          <span className="call-status row gap-1" style={{ justifyContent: 'center' }}>
            <Profile2User size={14} /> 3 members joined
          </span>
        )}
      </div>

      {video && (
        <motion.div className="call-self" drag dragMomentum={false} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {camera && !noCamera ? (
            <video ref={videoRef} autoPlay playsInline muted />
          ) : (
            <span className="stack gap-1" style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <VideoSlash size={22} />
              <span className="xs">{camera && noCamera ? 'Camera unavailable' : 'Camera off'}</span>
            </span>
          )}
        </motion.div>
      )}

      <div className="call-controls">
        <CallBtn label={muted ? 'Unmute' : 'Mute'} on={muted} onClick={() => setMuted((m) => !m)} icon={muted ? <MicrophoneSlash1 size={22} /> : <Microphone2 size={22} />} />
        {video ? (
          <CallBtn label={camera ? 'Turn camera off' : 'Turn camera on'} on={!camera} onClick={() => setCamera((c) => !c)} icon={camera ? <Video size={22} /> : <VideoSlash size={22} />} />
        ) : (
          <CallBtn
            label="Switch to video"
            onClick={() => {
              setKind('video')
              setCamera(true)
            }}
            icon={<Video size={22} />}
          />
        )}
        <CallBtn label={speaker ? 'Speaker on' : 'Speaker off'} on={!speaker} onClick={() => setSpeaker((s) => !s)} icon={speaker ? <VolumeHigh size={22} /> : <VolumeSlash size={22} />} />
        <motion.button whileTap={{ scale: 0.9 }} className="call-btn end" onClick={end} aria-label="End call">
          <CallSlash size={24} variant="Bold" />
        </motion.button>
      </div>
      <p className="call-note">Calls are simulated in this prototype — no audio or video leaves your device.</p>
    </motion.div>,
    document.body,
  )
}

function CallBtn({ label, icon, on, onClick }: { label: string; icon: ReactNode; on?: boolean; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} className={cx('call-btn has-tip', on && 'is-on')} onClick={onClick} aria-label={label} aria-pressed={on}>
      {icon}
      <span className="tooltip">{label}</span>
    </motion.button>
  )
}
