import type { BuildOptions } from "../../types";
import { constructedLog } from "../utility";

/**
 * Configure the Vite dev server for DevCaddy
 *
 * Adds helpful logging and potential middleware for dev server
 */
export function configureServe(options: BuildOptions) {
  const isDevelopment = options.context.mode === 'development';
  const currentMode = options.context.mode === 'development' ? 'developer' : 'client';
  const alternateMode = currentMode === 'developer' ? 'client' : 'developer';

  // Log mode switching information in development
  if (isDevelopment) {
    constructedLog({
      value: `To test ${alternateMode} mode, add: ?devCaddyMode=${alternateMode}`,
      colors: {
        tag: 'blue',
        line: 'yellow'
      }
    });
  }
}