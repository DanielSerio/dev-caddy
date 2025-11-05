import type { ConfigEnv } from "vite";
import type { DevCaddyMode } from "../../types";

/**
 * The function `getUIMode` determines the UI mode based on the configuration environment and
 * development mode.
 * @param {ConfigEnv} config - The `config` parameter is an object of type `ConfigEnv`, which likely
 * contains information about the environment configuration such as the mode (production or
 * development) and the command being executed (serve or build).
 * @param {DevCaddyMode | null} [developmentMode=null] - The `developmentMode` parameter is an optional
 * parameter of type `DevCaddyMode`. It is used to specify a specific UI mode for development purposes.
 * If a `developmentMode` is provided, the function will return this mode. Otherwise, it will determine
 * the UI mode based on the `config
 * @returns The function `getUIMode` returns either the `developmentMode` if it is provided, or
 * 'client' if the `config.mode` is 'production' and `config.command` is 'serve', or 'developer' if the
 * `config.mode` is 'development' and `config.command` is 'serve'. If none of these conditions are met,
 * it returns `null`.
 */
export function getUIMode(config: ConfigEnv, developmentMode: DevCaddyMode | null = null) {
  if (developmentMode) {
    return developmentMode;
  }

  if (config.mode === 'production' && config.command === 'serve') {
    return 'client';
  }

  if (config.mode === 'development' && config.command === 'serve') {
    return 'developer';
  }

  return null;
}