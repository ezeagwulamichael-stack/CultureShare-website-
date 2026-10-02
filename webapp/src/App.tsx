import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './store/useApp'
import { AppShell } from './components/Shell'
import { Toasts } from './components/ui'
import { Splash, Welcome, SignUp, Login, Forgot, VerifyContact } from './pages/Auth'
import { CardSkeleton } from './components/ui'

const Onboarding = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.Onboarding })))
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })))
const ScrollsFeed = lazy(() => import('./pages/Scrolls').then((m) => ({ default: m.ScrollsFeed })))
const ScrollDetail = lazy(() => import('./pages/Scrolls').then((m) => ({ default: m.ScrollDetail })))
const MyScrolls = lazy(() => import('./pages/Scrolls').then((m) => ({ default: m.MyScrolls })))
const DarkZone = lazy(() => import('./pages/Scrolls').then((m) => ({ default: m.DarkZone })))
const CreateScroll = lazy(() => import('./pages/Create').then((m) => ({ default: m.CreateScroll })))
const CreatePost = lazy(() => import('./pages/Create').then((m) => ({ default: m.CreatePost })))
const CreateStatus = lazy(() => import('./pages/Create').then((m) => ({ default: m.CreateStatus })))
const Discover = lazy(() => import('./pages/Discover').then((m) => ({ default: m.Discover })))
const Topic = lazy(() => import('./pages/Discover').then((m) => ({ default: m.Topic })))
const Search = lazy(() => import('./pages/Discover').then((m) => ({ default: m.Search })))
const DiscoverPeople = lazy(() => import('./pages/Discover').then((m) => ({ default: m.DiscoverPeople })))
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })))
const ProfileEditor = lazy(() => import('./pages/Profile').then((m) => ({ default: m.ProfileEditor })))
const AvatarCustomizer = lazy(() => import('./pages/Profile').then((m) => ({ default: m.AvatarCustomizer })))
const ProfileTunePage = lazy(() => import('./pages/Profile').then((m) => ({ default: m.ProfileTunePage })))
const Messages = lazy(() => import('./pages/Messages').then((m) => ({ default: m.Messages })))
const Notifications = lazy(() => import('./pages/Notifications').then((m) => ({ default: m.Notifications })))
const Communities = lazy(() => import('./pages/Communities').then((m) => ({ default: m.Communities })))
const CommunityDetail = lazy(() => import('./pages/Communities').then((m) => ({ default: m.CommunityDetail })))
const CommunityAdmin = lazy(() => import('./pages/Communities').then((m) => ({ default: m.CommunityAdmin })))
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))
const Verification = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Verification })))
const Plans = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Plans })))
const HistorianDesk = lazy(() => import('./pages/Historian').then((m) => ({ default: m.HistorianDesk })))
const HistorianReview = lazy(() => import('./pages/Historian').then((m) => ({ default: m.HistorianReview })))
const Wallet = lazy(() => import('./pages/Later').then((m) => ({ default: m.Wallet })))
const BuyScroll = lazy(() => import('./pages/Later').then((m) => ({ default: m.BuyScroll })))
const HallOfFame = lazy(() => import('./pages/Later').then((m) => ({ default: m.HallOfFame })))
const Family = lazy(() => import('./pages/Later').then((m) => ({ default: m.Family })))
const GoLive = lazy(() => import('./pages/Later').then((m) => ({ default: m.GoLive })))
const ShareLocation = lazy(() => import('./pages/Later').then((m) => ({ default: m.ShareLocation })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

/** Sends people to the right place for where they are in sign-up. */
function RequireActive() {
  const auth = useApp((s) => s.auth)
  const loc = useLocation()
  if (auth === 'guest') return <Navigate to="/welcome" replace state={{ from: loc.pathname }} />
  if (auth === 'verify_contact') return <Navigate to="/verify" replace />
  if (auth === 'onboarding') return <Navigate to="/onboarding" replace />
  return <Outlet />
}

function PublicOnly() {
  const auth = useApp((s) => s.auth)
  if (auth === 'active') return <Navigate to="/home" replace />
  return (
    <>
      <Outlet />
      <Toasts />
    </>
  )
}

export default function App() {
  const theme = useApp((s) => s.theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0C3122' : '#F6F1E6')
  }, [theme])

  return (
    <Suspense fallback={<div style={{ padding: 32, maxWidth: 760, margin: '0 auto' }}><CardSkeleton /></div>}>
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route element={<PublicOnly />}>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/verify" element={<VerifyContact />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/:step" element={<Onboarding />} />
      </Route>

      <Route element={<RequireActive />}>
        <Route element={<AppShell />}>
          <Route path="/home" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/discover/people" element={<DiscoverPeople />} />
          <Route path="/topic/:id" element={<Topic />} />
          <Route path="/search" element={<Search />} />

          <Route path="/scrolls" element={<ScrollsFeed />} />
          <Route path="/scrolls/mine" element={<MyScrolls />} />
          <Route path="/scroll/:id" element={<ScrollDetail />} />
          <Route path="/dark-zone" element={<DarkZone />} />

          <Route path="/create/scroll" element={<CreateScroll />} />
          <Route path="/create/post" element={<CreatePost />} />
          <Route path="/create/status" element={<CreateStatus />} />

          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/:id" element={<CommunityDetail />} />
          <Route path="/communities/:id/admin" element={<CommunityAdmin />} />

          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEditor />} />
          <Route path="/profile/edit/:section" element={<ProfileEditor />} />
          <Route path="/profile/avatar" element={<AvatarCustomizer />} />
          <Route path="/profile/tune" element={<ProfileTunePage />} />
          <Route path="/profile/:tab" element={<Profile />} />
          <Route path="/u/:id" element={<Profile />} />
          <Route path="/u/:id/:tab" element={<Profile />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/:section" element={<Settings />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/plans" element={<Plans />} />

          <Route path="/historian" element={<HistorianDesk />} />
          <Route path="/historian/review/:id" element={<HistorianReview />} />

          <Route path="/later/wallet" element={<Wallet />} />
          <Route path="/later/buy/:id" element={<BuyScroll />} />
          <Route path="/later/hall-of-fame" element={<HallOfFame />} />
          <Route path="/later/family" element={<Family />} />
          <Route path="/later/live" element={<GoLive />} />
          <Route path="/later/location" element={<ShareLocation />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
    </Suspense>
  )
}
