import type { ConfigEnv, ViteDevServer } from "vite";

/**
 * DevCaddy UI mode
 * - 'client': Reviewer mode with limited permissions (magic link access)
 * - 'developer': Full access mode for development
 * - null: DevCaddy is disabled or not initialized
 */
export type DevCaddyMode = 'client' | 'developer' | null;

/**
 * Plugin options for DevCaddy Vite plugin
 */
export interface DevCaddyPluginOptions {
  /** Whether or not DevCaddy is enabled */
  enabled: boolean;
  /** Vite dev server context */
  context: ConfigEnv;
  /** Enable verbose logging for debugging */
  debug?: boolean;
}

/**
 * Build options extending plugin options with Vite dev server instance
 */
export interface BuildOptions extends DevCaddyPluginOptions {
  /** Vite development server instance */
  server: ViteDevServer;
}