import type { ConfigEnv } from "vite";
import type { DevCaddyMode } from "../../types";

/**
 * Determines the DevCaddy UI mode based on Vite configuration environment
 *
 * **Mode Detection Logic:**
 * - `mode: 'development'` + `command: 'serve'` → **'developer'** (local development)
 * - `mode: 'production'` + `command: 'serve'` → **'client'** (staging/preview)
 * - All other cases → **null** (DevCaddy disabled)
 *
 * **Note:** DevCaddy only activates during `serve` command (dev server or preview).
 * It never activates during `build` command to prevent accidental production inclusion.
 *
 * @param config - Vite configuration environment containing `mode` and `command`
 * @returns The UI mode ('developer' | 'client') or null if DevCaddy should be disabled
 *
 * @example
 * ```typescript
 * // Local development: vite serve (mode: 'development')
 * getUIMode({ mode: 'development', command: 'serve' }) // 'developer'
 *
 * // Staging preview: vite preview (mode: 'production')
 * getUIMode({ mode: 'production', command: 'serve' }) // 'client'
 *
 * // Production build: vite build (mode: 'production')
 * getUIMode({ mode: 'production', command: 'build' }) // null
 * ```
 */
export function getUIMode(config: ConfigEnv): DevCaddyMode | null {
  // Only activate during serve command (dev or preview)
  if (config.command !== 'serve') {
    return null;
  }

  // Developer mode: local development environment
  if (config.mode === 'development') {
    return 'developer';
  }

  // Client mode: staging/preview environment
  if (config.mode === 'production') {
    return 'client';
  }

  // Default: disable DevCaddy for unknown configurations
  return null;
}