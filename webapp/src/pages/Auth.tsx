import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight2, Camera, Eye, EyeSlash, Share, TickCircle, Warning2, Sun1, Moon } from 'iconsax-react'
import { useApp } from '../store/useApp'
import { Input, Logo, Spinner } from '../components/ui'
import { cx, maskContact, wait } from '../lib/util'
import { img, asset } from '../data/seed'

const TAGLINE = 'Telling our own stories, our own way.'

function AuthBack({ to, label = 'Back' }: { to: string; label?: string }) {
  return (
    <Link to={to} className="back-btn" style={{ marginBottom: 18 }}>
      <span className="bb-ico">
        <ArrowLeft size={16} />
      </span>
      {label}
    </Link>
  )
}

function ThemeFab() {
  const theme = useApp((s) => s.theme)
  const toggle = useApp((s) => s.toggleTheme)
  return (
    <button className="icon-btn filled" onClick={toggle} aria-label="Toggle theme" style={{ position: 'fixed', top: 16, right: 16, zIndex: 5 }}>
      {theme === 'dark' ? <Sun1 size={20} /> : <Moon size={20} />}
    </button>
  )
}

/* ─────────── Screen 01 — Splash / brand entry ─────────── */
export function Splash() {
  const auth = useApp((s) => s.auth)
  const nav = useNavigate()
  useEffect(() => {
    const t = setTimeout(() => {
      nav(auth === 'active' ? '/home' : auth === 'verify_contact' ? '/verify' : auth === 'onboarding' ? '/onboarding' : '/welcome', { replace: true })
    }, 2300)
    return () => clearTimeout(t)
  }, [auth, nav])
  return (
    <div className="splash" role="status" aria-label="Loading CultureShare">
      <motion.div className="splash-pattern" style={{ backgroundImage: `url(${asset('welcome-rings.svg')})` }} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 0.08, rotate: 20 }} transition={{ duration: 2.6, ease: 'easeOut' }} />
      <div className="stack gap-3" style={{ alignItems: 'center', textAlign: 'center', position: 'relative' }}>
        <motion.svg width="84" height="84" viewBox="0 0 32 32" fill="none" initial="hidden" animate="show">
          {[
            { d: 'M16 30.5c8 0 14.5-6.5 14.5-14.5S24 1.5 16 1.5 1.5 8 1.5 16 8 30.5 16 30.5Z', o: 0.25, w: 0.9 },
            { d: 'M16 25.1c5 0 9.1-4.1 9.1-9.1S21 6.9 16 6.9 6.9 11 6.9 16s4.1 9.1 9.1 9.1Z', o: 0.4, w: 0.6 },
            { d: 'M16 30.5c2.8 0 5.1-6.5 5.1-14.5S18.8 1.5 16 1.5 10.9 8 10.9 16s2.3 14.5 5.1 14.5Z', o: 1, w: 0.9 },
            { d: 'M1.5 16h29', o: 0.45, w: 0.65 },
            { d: 'M2.9 10.9c8.7 1.9 17.5 1.9 26.2 0', o: 0.4, w: 0.55 },
            { d: 'M2.9 21.1c8.7-1.9 17.5-1.9 26.2 0', o: 0.4, w: 0.55 },
          ].map((p, k) => (
            <motion.path key={k} d={p.d} stroke="#C9A84C" strokeWidth={p.w} strokeOpacity={p.o} variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 1.1, delay: 0.1 + k * 0.12, ease: 'easeInOut' } } }} />
          ))}
          <motion.circle cx="16" cy="16" r="1.8" fill="#C9A84C" initial={{ scale: 0 }} animate={{ scale: [0, 1.6, 1] }} transition={{ delay: 1.1, duration: 0.5 }} />
        </motion.svg>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', letterSpacing: '-0.02em' }}>
          CultureShare
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 1, duration: 0.6 }} style={{ fontSize: '1.05rem' }}>
          {TAGLINE}
        </motion.p>
        <motion.div className="row gap-2" style={{ marginTop: 28 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          {[0, 1, 2].map((k) => (
            <motion.span key={k} style={{ width: 6, height: 6, borderRadius: 6, background: '#c9a84c' }} animate={{ opacity: [0.25, 1, 0.25], width: [6, 18, 6] }} transition={{ duration: 1.2, repeat: Infinity, delay: k * 0.2 }} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

/* ─────────── Onboarding slides (mobile Onboard 1–3) ─────────── */
const SLIDES = [
  { tag: 'Discover', title: 'Discover Africa, One Story at a Time.', text: 'Explore cultures, traditions, languages, food, music, art and histories shared by the people who live them.', visual: 'faces' },
  { tag: 'Connect', title: 'Our Roots Can Truly Connect Us', text: 'Discover storytellers, Historians and communities across Africa and the African diaspora.', visual: 'collage' },
  { tag: 'Preserve', title: 'Your Story, Part of Our History.', text: 'Create Scrolls using videos, images, voice recordings and written stories that preserve what matters.', visual: 'elders' },
] as const

function SlideVisual({ kind }: { kind: (typeof SLIDES)[number]['visual'] }) {
  if (kind === 'faces') return <motion.img src={img('onboard-faces')} alt="" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: 'easeOut' }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
  if (kind === 'collage') {
    const cols = [
      [{ i: 'ob-art-1' }, { t: 'Roots & Culture', bg: '#dec279' }, { i: 'ob-art-map' }, { t: 'Africans in Diaspora', bg: '#fff5cb' }],
      [{ i: 'ob-art-3' }, { i: 'ob-storyteller', bg: '#fb923c' }, { t: 'History & Historians', bg: '#a1bbae' }, { i: 'ob-scrolls' }],
      [{ i: 'ob-art-6' }, { t: 'Story Tellers', bg: '#c9a84c' }, { i: 'ob-art-7' }, { t: 'Scrolls & Raiders', bg: '#fbbf24' }],
    ]
    return (
      <div style={{ position: 'absolute', inset: '-20px 0 36% 0', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, padding: 10 }}>
        {cols.map((col, c) => (
          <motion.div key={c} className="stack" style={{ gap: 6, paddingTop: c === 1 ? 40 : 0 }} initial={{ y: c === 1 ? 60 : -60 }} animate={{ y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
            {col.map((t, k) => (
              <div key={k} style={{ height: 'clamp(96px, 15vh, 170px)', borderRadius: 12, overflow: 'hidden', background: 'bg' in t ? t.bg : '#1b2e20', display: 'grid', placeItems: 'center' }}>
                {'i' in t ? (
                  <img src={img(t.i!)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1rem,1.5vw,1.3rem)', color: '#070e09', textAlign: 'center', lineHeight: 1.15, padding: 8 }}>{t.t}</span>
                )}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    )
  }
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', paddingBottom: '22%' }}>
      <div style={{ position: 'relative', width: 'min(300px, 60%)', aspectRatio: '1' }}>
        <motion.div initial={{ rotate: -20, scale: 0.8 }} animate={{ rotate: -10, scale: 1 }} transition={{ type: 'spring', stiffness: 80 }} style={{ position: 'absolute', inset: '-6%', background: '#c9a84c', borderRadius: '36%' }} />
        <motion.div initial={{ rotate: 15 }} animate={{ rotate: 5 }} transition={{ type: 'spring', stiffness: 80 }} style={{ position: 'absolute', inset: 0, borderRadius: '25%', border: '4px solid #070e09', overflow: 'hidden', padding: 4, background: '#070e09' }}>
          <img src={img('elders-art')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '22%', objectPosition: '30% 50%' }} />
        </motion.div>
        <motion.span className="row" initial={{ scale: 0 }} animate={{ scale: 1, rotate: 5 }} transition={{ delay: 0.4, type: 'spring' }} style={{ position: 'absolute', top: '-8%', left: '-4%', background: '#e53935', borderRadius: 16, padding: 10, color: '#fff' }}>
          <Camera size={22} />
        </motion.span>
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1, rotate: 30 }} transition={{ delay: 0.55, type: 'spring' }} style={{ position: 'absolute', top: '12%', right: '-12%', background: '#1e88e5', borderRadius: 16, padding: 10, color: '#fff', display: 'grid' }}>
          <Share size={22} />
        </motion.span>
        <motion.span initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, rotate: 15 }} transition={{ delay: 0.7 }} style={{ position: 'absolute', top: '46%', right: '-22%', background: '#dec279', color: '#070e09', borderRadius: 20, padding: '8px 14px', fontWeight: 600, fontSize: 14 }}>
          #OurRoots
        </motion.span>
        <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, rotate: 15 }} transition={{ delay: 0.8 }} style={{ position: 'absolute', top: '38%', left: '-26%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', backdropFilter: 'blur(6px)', color: '#fff', borderRadius: 20, padding: '8px 14px', fontSize: 13 }}>
          #OralHistory
        </motion.span>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, rotate: 8 }} transition={{ delay: 0.9, type: 'spring' }} style={{ position: 'absolute', bottom: '-30%', left: '-8%', width: '88%', background: '#172c1f', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: 16, boxShadow: '0 10px 15px rgba(0,0,0,.5)' }}>
          <span style={{ background: '#c9a84c', color: '#070e09', fontSize: 11, fontWeight: 700, borderRadius: 12, padding: '4px 10px' }}>Scroll Caption</span>
          <p style={{ fontSize: 13, color: '#f4efe6', marginTop: 8, lineHeight: 1.4 }}>Capturing the vibrant stories of our elders before they fade. 🌍✨</p>
        </motion.div>
      </div>
    </div>
  )
}

/* ─────────── Welcome showcase (desktop/tablet left side) ───────────
   One large photo card with notched corners: a label in the top-left notch,
   previous/next controls in the bottom notches. The caption is set light and
   small so the right-hand headline stays the only loud text on the page. */
const SHOWCASE: { photo: string; tag: string; caption: string; scene?: 'elders' }[] = [
  { photo: 'aso-oke-women', tag: 'Discover', caption: 'Discover Africa, one story at a time.' },
  { photo: 'elders-art', tag: 'Connect', caption: 'Our roots can truly connect us.', scene: 'elders' as const },
  { photo: 'yoruba-drummers', tag: 'Preserve', caption: 'Your story, part of our history.' },
]

function WelcomeShowcase({ i, setI }: { i: number; setI: (k: number) => void }) {
  const slide = SHOWCASE[i]
  const nextIdx = (i + 1) % SHOWCASE.length
  const prev = () => setI((i - 1 + SHOWCASE.length) % SHOWCASE.length)
  const next = () => setI(nextIdx)
  return (
    <section
      className="welcome-showcase"
      aria-label="CultureShare highlights"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
      }}
    >
      <div className="ws-card">
      <div className="ws-stage">
        <div className="ws-photo">
          <AnimatePresence initial={false}>
            {slide.scene === 'elders' ? (
              <motion.div key={slide.photo} className="ws-scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
                <SlideVisual kind="elders" />
              </motion.div>
            ) : (
              <motion.img
                key={slide.photo}
                src={img(slide.photo)}
                alt=""
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 0.8 }, scale: { duration: 6, ease: 'easeOut' } }}
              />
            )}
          </AnimatePresence>
          <div className="ws-shade" />
          <AnimatePresence mode="wait">
            <motion.p key={i} className="ws-caption" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              {slide.caption}
            </motion.p>
          </AnimatePresence>
          <div className="ws-dots" role="tablist" aria-label="Highlights">
            {SHOWCASE.map((s, k) => (
              <button key={s.tag} role="tab" aria-selected={k === i} aria-label={s.tag} className={cx(k === i && 'is-on')} onClick={() => setI(k)} />
            ))}
          </div>
        </div>

        <div className="ws-notch tl">
          <AnimatePresence mode="wait">
            <motion.span key={i} className="ws-label" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
              <img src={asset('cs-mark.svg')} alt="" width={18} height={18} /> {slide.tag} on CultureShare
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="ws-notch bl">
          <motion.button className="ws-prev" onClick={prev} aria-label="Previous highlight" whileTap={{ scale: 0.94 }}>
            <ArrowLeft size={22} />
          </motion.button>
        </div>

        <div className="ws-notch br">
          <motion.button className="ws-next" onClick={next} aria-label="Next highlight" whileTap={{ scale: 0.96 }}>
            <AnimatePresence initial={false}>
              <motion.img key={SHOWCASE[nextIdx].photo} src={img(SHOWCASE[nextIdx].photo)} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </AnimatePresence>
            <span className="ws-next-arrow">
              <ArrowRight2 size={22} />
            </span>
          </motion.button>
        </div>
      </div>
      </div>
    </section>
  )
}

/* ─────────── Welcome (Onboard 1–3 + Welcome screen) ─────────── */
export function Welcome() {
  const [i, setI] = useState(0)
  const [mobileDone, setMobileDone] = useState(false)
  const nav = useNavigate()
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [i])
  const s = SLIDES[i]
  return (
    <div className="welcome">
      <ThemeFab />
      <WelcomeShowcase i={i} setI={setI} />
      <section className={cx('welcome-slides', mobileDone && 'is-done')}>
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ position: 'absolute', inset: 0 }}>
            <SlideVisual kind={s.visual} />
          </motion.div>
        </AnimatePresence>
        <div className="ws-scrim" />
        <div className="ws-logo">
          <Logo size={24} to="/welcome" />
        </div>
        <div className="ws-copy">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }} className="stack gap-3">
              <span className="pill-eyebrow" style={{ alignSelf: 'flex-start' }}>
                {s.tag}
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(2rem, 3.2vw, 2.8rem)', lineHeight: 1.12, color: '#f4efe6', maxWidth: '16ch' }}>{s.title}</h2>
              <p style={{ color: '#fef2f2', fontWeight: 500, fontSize: '1.02rem', lineHeight: 1.45, maxWidth: '44ch' }}>{s.text}</p>
            </motion.div>
          </AnimatePresence>
          <div className="row gap-4 ws-mobile-ctas" style={{ marginTop: 28 }}>
            <button className="btn btn-ghost" style={{ color: '#f5f5f5' }} onClick={() => setMobileDone(true)}>
              Skip
            </button>
            <button className="btn btn-lg grow" style={{ background: '#f3dda3', color: '#070e09' }} onClick={() => (i < SLIDES.length - 1 ? setI(i + 1) : setMobileDone(true))}>
              {i < SLIDES.length - 1 ? 'Continue' : 'Get Started'} <span style={{ letterSpacing: -4 }}>›››</span>
            </button>
          </div>
          <div className="row gap-2" style={{ marginTop: 26 }} role="tablist">
            {SLIDES.map((_, k) => (
              <button key={k} role="tab" aria-selected={k === i} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} style={{ height: 4, width: k === i ? 28 : 7, borderRadius: 2, background: k === i ? '#dec279' : 'rgba(255,255,255,.25)', transition: 'all .35s var(--ease)' }} />
            ))}
          </div>
        </div>
      </section>
      <section className={cx('welcome-panel', mobileDone && 'is-done')}>
        <span className="wp-logo">
          <Logo size={26} to="/welcome" />
        </span>
        <div className="orbit-wrap" style={{ width: 'min(340px, 70vw)' }}>
          <motion.img src={asset('welcome-rings.svg')} alt="" style={{ position: 'absolute', inset: '-10%', width: '120%', opacity: 0.5 }} animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }} />
          <img src={img('africa-map')} alt="" style={{ position: 'absolute', inset: '8%', width: '84%', height: '84%', objectFit: 'contain', opacity: 0.55, mixBlendMode: 'hard-light' }} />
          {['w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6'].map((w, k) => {
            const pos = [
              [8, 10],
              [78, 14],
              [24, 52],
              [86, 58],
              [-2, 72],
              [32, 88],
            ][k]
            return (
              <motion.img
                key={w}
                src={img(w)}
                alt=""
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
                transition={{ scale: { delay: 0.2 + k * 0.1, type: 'spring' }, opacity: { delay: 0.2 + k * 0.1 }, y: { duration: 4 + k * 0.4, repeat: Infinity, ease: 'easeInOut' } }}
                style={{ position: 'absolute', left: `${pos[0]}%`, top: `${pos[1]}%`, width: k === 1 ? 66 : 52, height: k === 1 ? 66 : 52, borderRadius: '50%', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,.4))' }}
              />
            )
          })}
        </div>
        <div className="stack gap-3" style={{ maxWidth: 420, width: '100%' }}>
          <span className="pill-eyebrow" style={{ alignSelf: 'flex-start' }}>
            Welcome
          </span>
          <h1 className="display">Your World, Shared.</h1>
          <p className="lead">Join a community celebrating our African culture in all its beauty and depth — {TAGLINE.toLowerCase()}</p>
          <div className="stack gap-3 mt-4">
            <motion.button whileTap={{ scale: 0.98 }} className="btn btn-primary btn-lg btn-block" onClick={() => nav('/signup')}>
              Create Account
            </motion.button>
            <motion.button whileTap={{ scale: 0.98 }} className="btn btn-secondary btn-lg btn-block" onClick={() => nav('/login')}>
              Sign In
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ─────────── Auth frame ─────────── */
function AuthFrame({ visual, eyebrow, title, text, children }: { visual: string; eyebrow: string; title: string; text: string; children: ReactNode }) {
  return (
    <div className="auth-shell">
      <ThemeFab />
      <aside className="auth-visual">
        <motion.img src={visual} alt="" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 8, ease: 'easeOut' }} />
        <div style={{ position: 'absolute', top: 32, left: 40, zIndex: 1 }}>
          <Logo size={26} to="/welcome" />
        </div>
        <motion.div className="av-copy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <span className="pill-eyebrow">{eyebrow}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(2rem, 3vw, 2.8rem)', lineHeight: 1.1, marginTop: 14, maxWidth: '15ch' }}>{title}</h2>
          <p style={{ marginTop: 12, opacity: 0.85, maxWidth: '42ch', lineHeight: 1.5 }}>{text}</p>
        </motion.div>
      </aside>
      <main className="auth-panel">
        <motion.div className="ap-inner" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <AuthBack to="/welcome" />
          {children}
        </motion.div>
      </main>
    </div>
  )
}

function SocialButtons({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="stack gap-3">
      <button type="button" className="btn btn-secondary btn-block" onClick={() => onPick('Google')}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        Continue with Google
      </button>
      <button type="button" className="btn btn-secondary btn-block" onClick={() => onPick('Facebook')}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z" />
        </svg>
        Continue with Facebook
      </button>
    </div>
  )
}

function OrDivider() {
  return (
    <div className="row gap-3 xs faint" style={{ margin: '4px 0' }}>
      <span className="divider grow" />
      OR
      <span className="divider grow" />
    </div>
  )
}

function PasswordField({ label, value, onChange, error, valid, placeholder }: { label: string; value: string; onChange: (v: string) => void; error?: string; valid?: boolean; placeholder: string }) {
  const [show, setShow] = useState(false)
  return (
    <Input
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      error={error}
      valid={valid}
      hint="Min. 8 characters"
      autoComplete="new-password"
      trailing={
        <button type="button" className="icon-btn sm" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeSlash size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  )
}

/* ─────────── Screen 02 — Sign up ─────────── */
export function SignUp() {
  const signUp = useApp((s) => s.signUp)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const [f, setF] = useState({ first: '', last: '', contact: '', pw: '', pw2: '', terms: false })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.contact) || /^\+?[\d\s]{10,15}$/.test(f.contact)
  const v = { first: f.first.trim().length > 1, last: f.last.trim().length > 1, contact: emailOk, pw: f.pw.length >= 8, pw2: f.pw2.length >= 8 && f.pw2 === f.pw }
  const ok = Object.values(v).every(Boolean) && f.terms
  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }))
  const submit = async () => {
    setTouched({ first: true, last: true, contact: true, pw: true, pw2: true })
    if (!ok) return
    setBusy(true)
    await wait(900)
    signUp({ firstName: f.first.trim(), lastName: f.last.trim(), contact: f.contact.trim() })
    nav('/verify')
  }
  return (
    <AuthFrame visual={img('ob-art-map')} eyebrow="Join CultureShare" title="Let’s Know Your Story" text="Join Africans everywhere sharing culture with one another — telling our own stories, our own way.">
      <div className="stack gap-2" style={{ marginBottom: 28 }}>
        <span className="mobile-only" style={{ marginBottom: 16 }}>
          <Logo size={24} to="/welcome" />
        </span>
        <h1 className="h1">Create your account</h1>
        <p className="muted small">Join millions celebrating our culture.</p>
      </div>
      <form
        className="stack gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        noValidate
      >
        <div className="form-grid">
          <Input label="First name" placeholder="Enter first name" value={f.first} onChange={set('first')} onBlur={blur('first')} valid={v.first} error={touched.first && !v.first ? 'Enter your first name' : undefined} autoComplete="given-name" />
          <Input label="Last name" placeholder="Enter last name" value={f.last} onChange={set('last')} onBlur={blur('last')} valid={v.last} error={touched.last && !v.last ? 'Enter your last name' : undefined} autoComplete="family-name" />
        </div>
        <Input label="Email or phone" placeholder="Enter email address or phone number" value={f.contact} onChange={set('contact')} onBlur={blur('contact')} valid={v.contact} error={touched.contact && !v.contact ? 'Enter a valid email or phone number' : undefined} autoComplete="email" />
        <PasswordField label="Password" placeholder="Enter password" value={f.pw} onChange={(x) => setF((p) => ({ ...p, pw: x }))} valid={v.pw} error={touched.pw && !v.pw ? 'Use at least 8 characters' : undefined} />
        <PasswordField label="Confirm password" placeholder="Enter password again" value={f.pw2} onChange={(x) => setF((p) => ({ ...p, pw2: x }))} valid={v.pw2} error={touched.pw2 && !v.pw2 ? 'Passwords don’t match' : undefined} />
        <label className="checkbox">
          <input type="checkbox" checked={f.terms} onChange={set('terms')} />
          <span>
            I agree to the{' '}
            <a className="gold" href="#terms" onClick={(e) => (e.preventDefault(), toast('Terms of Service will open from the legal team’s final copy'))}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a className="gold" href="#privacy" onClick={(e) => (e.preventDefault(), toast('Privacy Policy will open from the legal team’s final copy'))}>
              Privacy Policy
            </a>
          </span>
        </label>
        <motion.button whileTap={{ scale: 0.98 }} className="btn btn-primary btn-lg btn-block" disabled={!ok || busy}>
          {busy ? <Spinner /> : 'Create Account'}
        </motion.button>
      </form>
      <div className="stack gap-3 mt-6">
        <OrDivider />
        <SocialButtons
          onPick={async (p) => {
            toast(`Connecting to ${p}…`)
            await wait(900)
            signUp({ firstName: 'Chiamaka', lastName: 'Eze', contact: 'chiamaka@example.com' })
            nav('/verify')
          }}
        />
        <p className="small muted" style={{ textAlign: 'center', marginTop: 8 }}>
          Already have an account?{' '}
          <Link to="/login" className="link">
            Sign In
          </Link>
        </p>
      </div>
    </AuthFrame>
  )
}

/* ─────────── Screen 03 — Login ─────────── */
export function Login() {
  const logIn = useApp((s) => s.logIn)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setErr('')
    if (!id.trim() || !pw) return setErr('Enter your email or username and password.')
    setBusy(true)
    await wait(800)
    setBusy(false)
    if (pw.length < 6) return setErr('That email/username and password don’t match. Try again or reset your password.')
    logIn(id.trim())
    toast('Welcome back', 'success')
    nav('/home')
  }
  return (
    <div className="welcome login-page">
      <ThemeFab />
      <LoginShowcase />
      <main className="welcome-panel login-panel">
        <span className="wp-logo">
          <Logo size={26} to="/welcome" />
        </span>
      <motion.div className="login-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        <AuthBack to="/welcome" />
        <span className="mobile-only" style={{ marginBottom: 20 }}>
          <Logo size={26} to="/welcome" />
        </span>
        <div className="stack gap-2">
          <h1 className="display" style={{ fontSize: 'clamp(2rem, 3vw, 2.6rem)' }}>Welcome back</h1>
          <p className="lead">{TAGLINE}</p>
        </div>
        <AnimatePresence>
          {err && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} role="alert">
              <div className="callout danger mt-4">
                <span className="c-icon">
                  <Warning2 size={18} />
                </span>
                {err}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <form
          className="stack gap-4 mt-6"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Input label="Email or username" placeholder="you@example.com" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" />
          <Input
            label="Password"
            type={show ? 'text' : 'password'}
            placeholder="Enter password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
            trailing={
              <button type="button" className="icon-btn sm" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          <Link to="/forgot" className="link small" style={{ alignSelf: 'flex-end', marginTop: -6 }}>
            Forgot password?
          </Link>
          <motion.button whileTap={{ scale: 0.98 }} className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy ? <Spinner /> : 'Log in'}
          </motion.button>
        </form>
        <div className="stack gap-3 mt-6">
          <OrDivider />
          <SocialButtons
            onPick={async (p) => {
              toast(`Signing in with ${p}…`)
              await wait(800)
              logIn(`${p.toLowerCase()}-user@example.com`)
              nav('/home')
            }}
          />
          <p className="small muted" style={{ textAlign: 'center', marginTop: 8 }}>
            Don’t have an account?{' '}
            <Link to="/signup" className="link">
              Create account
            </Link>
          </p>
          <p className="xs faint" style={{ textAlign: 'center' }}>
            Prototype: any email with a 6+ character password signs in.
          </p>
        </div>
      </motion.div>
      </main>
    </div>
  )
}

/* Sign-in visual: the elders illustration alone, in the same notched card as Welcome (no carousel). */
function LoginShowcase() {
  return (
    <section className="welcome-showcase login-showcase" aria-label="CultureShare">
      <div className="ws-card">
        <div className="ws-stage">
          <div className="ws-photo">
            <div className="ws-scene">
              <SlideVisual kind="elders" />
            </div>
            <div className="ws-shade" />
            <motion.p className="ws-caption" style={{ bottom: 56 }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              Your story, part of our history.
            </motion.p>
          </div>
          <div className="ws-notch tl">
            <span className="ws-label">
              <img src={asset('cs-mark.svg')} alt="" width={18} height={18} /> Preserve on CultureShare
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Forgot() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  return (
    <div className="auth-center">
      <ThemeFab />
      <motion.div className="auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/login" className="back-btn">
          <span className="bb-ico">
            <ArrowLeft size={16} />
          </span>
          Back to log in
        </Link>
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.form
              key="f"
              exit={{ opacity: 0, x: -20 }}
              className="stack gap-4 mt-6"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!email.includes('@')) return
                setBusy(true)
                await wait(800)
                setBusy(false)
                setSent(true)
              }}
            >
              <h1 className="h1">Reset your password</h1>
              <p className="small muted">Enter the email on your account and we’ll send you a reset link.</p>
              <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn btn-primary btn-lg btn-block" disabled={!email.includes('@') || busy}>
                {busy ? <Spinner /> : 'Send reset link'}
              </button>
            </motion.form>
          ) : (
            <motion.div key="s" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="stack gap-4 mt-6" style={{ alignItems: 'center', textAlign: 'center' }}>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ color: 'var(--success)' }}>
                <TickCircle size={64} variant="Bulk" />
              </motion.span>
              <h1 className="h2">Check your inbox</h1>
              <p className="small muted">
                We sent a reset link to <strong>{maskContact(email)}</strong>. It expires in 30 minutes.
              </p>
              <Link to="/login" className="btn btn-primary btn-block">
                Back to log in
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

/* ─────────── Screen 04 — Email / phone verification ─────────── */
export function VerifyContact() {
  const me = useApp((s) => s.me)
  const auth = useApp((s) => s.auth)
  const verify = useApp((s) => s.verifyContact)
  const toast = useApp((s) => s.toast)
  const nav = useNavigate()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [state, setState] = useState<'default' | 'error' | 'expired' | 'verifying' | 'verified'>('default')
  const [left, setLeft] = useState(60)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  useEffect(() => {
    if (auth === 'guest') nav('/signup', { replace: true })
  }, [auth, nav])
  useEffect(() => {
    if (state === 'verified') return
    if (left <= 0) {
      setState((s) => (s === 'default' || s === 'error' ? 'expired' : s))
      return
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left, state])
  const check = async (digits: string[]) => {
    const c = digits.join('')
    if (c.length < 6) return
    if (state === 'expired') return
    setState('verifying')
    await wait(700)
    if (c === '000000') {
      setState('error')
      return
    }
    setState('verified')
    await wait(900)
    verify()
    nav('/onboarding')
  }
  const onChange = (k: number, v: string) => {
    const d = v.replace(/\D/g, '')
    if (!d) {
      const next = [...code]
      next[k] = ''
      setCode(next)
      return
    }
    const next = [...code]
    d.split('').slice(0, 6 - k).forEach((ch, j) => (next[k + j] = ch))
    setCode(next)
    if (state === 'error') setState('default')
    const nextIdx = Math.min(5, k + d.length)
    refs.current[nextIdx]?.focus()
    check(next)
  }
  const contact = me.email || me.phone
  return (
    <div className="auth-center">
      <ThemeFab />
      <motion.div className="auth-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <AuthBack to="/signup" label="Back to sign up" />
        <div className="row between">
          <Logo size={26} to="/welcome" />
          <span className="xs faint">Step 1 of 2 · Account</span>
        </div>
        <div className="progress-dashes mt-4">
          <span className="on" />
          <span className={state === 'verified' ? 'on' : ''} />
        </div>
        <div className="stack gap-2 mt-6" style={{ textAlign: 'center', alignItems: 'center' }}>
          <h1 className="h1">Verify your account</h1>
          <p className="small muted">
            We’ve sent a 6-digit code to
            <br />
            <strong style={{ color: 'var(--text)' }}>{maskContact(contact)}</strong>
          </p>
        </div>
        <div className={cx('otp mt-6', state === 'error' && 'has-error', state === 'verified' && 'is-verified')} onPaste={(e) => (e.preventDefault(), onChange(0, e.clipboardData.getData('text')))}>
          {code.map((d, k) => (
            <input
              key={k}
              ref={(el) => {
                refs.current[k] = el
              }}
              inputMode="numeric"
              autoComplete={k === 0 ? 'one-time-code' : 'off'}
              maxLength={6}
              value={d}
              aria-label={`Digit ${k + 1}`}
              disabled={state === 'verified' || state === 'expired'}
              autoFocus={k === 0}
              onChange={(e) => onChange(k, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !code[k] && k > 0) refs.current[k - 1]?.focus()
                if (e.key === 'ArrowLeft' && k > 0) refs.current[k - 1]?.focus()
                if (e.key === 'ArrowRight' && k < 5) refs.current[k + 1]?.focus()
              }}
            />
          ))}
        </div>
        <div style={{ minHeight: 64, marginTop: 18, textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            {state === 'verifying' && (
              <motion.p key="v" className="small muted row gap-2 center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Spinner /> Checking code…
              </motion.p>
            )}
            {state === 'error' && (
              <motion.p key="e" className="error-text center" style={{ justifyContent: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Warning2 size={14} /> That code isn’t right. Check the message and try again.
              </motion.p>
            )}
            {state === 'expired' && (
              <motion.p key="x" className="small" style={{ color: 'var(--warning)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                This code has expired. Request a new one below.
              </motion.p>
            )}
            {state === 'verified' && (
              <motion.p key="ok" className="row gap-2 center small strong" style={{ color: 'var(--success)' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TickCircle size={20} variant="Bold" /> Verified — let’s set up your profile
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="stack gap-2" style={{ alignItems: 'center' }}>
          <p className="small muted">Didn’t receive it?</p>
          {left > 0 && state !== 'expired' ? (
            <span className="small faint">Resend code in 0:{String(left).padStart(2, '0')}</span>
          ) : (
            <button
              className="link small"
              onClick={() => {
                setLeft(60)
                setCode(['', '', '', '', '', ''])
                setState('default')
                refs.current[0]?.focus()
                toast(`New code sent to ${maskContact(contact)}`, 'success')
              }}
            >
              Resend code
            </button>
          )}
        </div>
        <p className="xs faint mt-6" style={{ textAlign: 'center' }}>
          Prototype: any 6 digits verify. 000000 shows the incorrect-code state.
        </p>
        <p className="xs faint mt-2" style={{ textAlign: 'center' }}>
          This confirms your contact details. African identity verification is a separate step you can do later.
        </p>
        <Link to="/signup" className="link xs row gap-1 center mt-4" style={{ justifyContent: 'center' }}>
          Wrong email or phone? Change it <ArrowRight2 size={12} />
        </Link>
      </motion.div>
    </div>
  )
}
