import { useMemo } from 'react';
import type { DevCaddyMode } from '../../../types';

/**
 * Hook to detect the DevCaddy UI mode from global window variable
 *
 * Reads the __DEV_CADDY_UI_MODE__ global variable that is injected
 * by the Vite plugin during build/serve.
 *
 * @returns The current UI mode ('client' | 'developer') or null if disabled
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const uiMode = useDevCaddyMode();
 *
 *   if (!uiMode) {
 *     return null; // DevCaddy is disabled
 *   }
 *
 *   return uiMode === 'developer' ? <DeveloperUI /> : <ClientUI />;
 * }
 * ```
 */
export function useDevCaddyMode(): DevCaddyMode | null {
  return useMemo(() => {
    return typeof window !== 'undefined'
      ? window.__DEV_CADDY_UI_MODE__ ?? null
      : null;
  }, []);
}
