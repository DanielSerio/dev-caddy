import type { BuildOptions } from "../../types";

/**
 * Configure build-time options
 *
 * Currently a no-op as DevCaddy is disabled in production builds.
 * Reserved for future build-time optimizations.
 */
export function configureBuild(options: BuildOptions): void {
  // No-op: DevCaddy is disabled in production builds
  void options;
}