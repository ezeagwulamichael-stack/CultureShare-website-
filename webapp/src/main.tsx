import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter, MemoryRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Standalone HTML export (file://) routes via the URL hash; the hosted artifact keeps
// navigation in memory because the host frame owns the address bar.
const mode = import.meta.env.VITE_ROUTER
const Router = mode === 'hash' ? HashRouter : mode === 'memory' ? MemoryRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
