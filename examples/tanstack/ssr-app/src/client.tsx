import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { initDevCaddy } from 'dev-caddy'
import 'dev-caddy/dev-caddy.css'

// Initialize DevCaddy with environment variables
// Environment variables are read in YOUR app, then passed to the library
initDevCaddy({
  supabaseUrl: import.meta.env.VITE_DEVCADDY_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_DEVCADDY_SUPABASE_ANON_KEY,
})

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
)
