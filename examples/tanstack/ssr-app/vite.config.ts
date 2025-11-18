import { defineConfig, type PluginOption } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { DevCaddyPlugin } from 'dev-caddy'

const config = defineConfig((context) => ({
  plugins: [
    devtools(),
    nitro(),
    // DevCaddy plugin for in-app annotations
    // Type assertion needed for monorepo workspace compatibility
    DevCaddyPlugin({
      context,
      enabled: process.env.VITE_DEVCADDY_ENABLED !== 'false',
    }) as PluginOption,
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
}))

export default config
