import { config } from 'dotenv';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { DevCaddyPlugin } from 'dev-caddy';

config();



// https://vite.dev/config/
export default defineConfig((context) => ({
  plugins: [
    react(),
    DevCaddyPlugin({
      context,
      enabled: process.env.VITE_DEV_CADDY_ENABLED ? !!JSON.parse(process.env.VITE_DEV_CADDY_ENABLED) : false,
    })
  ],
}));
