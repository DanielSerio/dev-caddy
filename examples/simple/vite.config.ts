import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { DevCaddyPlugin } from 'dev-caddy';

// https://vite.dev/config/
export default defineConfig((context) => ({
  plugins: [
    react(),
    DevCaddyPlugin({
      context,
      enabled: process.env.VITE_DEVCADDY_ENABLED !== 'false', // enabled by default
    })
  ],
}));
