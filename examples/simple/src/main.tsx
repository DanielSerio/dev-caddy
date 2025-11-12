import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initDevCaddy } from 'dev-caddy'
import 'dev-caddy/dev-caddy.css'

// Initialize DevCaddy with environment variables
// Environment variables are read in YOUR app, then passed to the library
initDevCaddy({
  supabaseUrl: import.meta.env.VITE_DEVCADDY_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_DEVCADDY_SUPABASE_ANON_KEY,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
