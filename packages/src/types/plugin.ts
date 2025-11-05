import type { ConfigEnv, ViteDevServer } from "vite";

/* This is the main UI mode */
export type DevCaddyMode = 'client' | 'developer';

/*The plugin options for `DevCaddy` */
export interface DevCaddyPluginOptions {
  /*Whether or not `DevCaddy` is enabled */
  enabled: boolean;
  /** Vite dev server context */
  context: ConfigEnv;
}

export interface BuildOptions extends DevCaddyPluginOptions {
  server: ViteDevServer;
}