import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initDevCaddy } from 'dev-caddy'
import 'dev-caddy/dev-caddy.css'

// Initialize DevCaddy with Supabase configuration
initDevCaddy({
  supabaseUrl: import.meta.env.VITE_DEV_CADDY_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_DEV_CADDY_SUPABASE_ANON_KEY,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
