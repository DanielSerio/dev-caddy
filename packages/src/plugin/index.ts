import type { PluginOption } from 'vite';
import type { DevCaddyPluginOptions } from "../types";
import { constructedLog, getUIMode } from './utility';
import { configureBuild, configureServe } from './configure';

/** Main `DevCaddy` plugin */
export function DevCaddyPlugin(options: DevCaddyPluginOptions): PluginOption {
  const isEnabled = options.enabled;
  const uiMode = getUIMode(options.context);

  return {
    name: 'dev-caddy',
    buildStart() {
      constructedLog({
        value: `ENABLED: ${isEnabled}`,
        colors: {
          tag: 'blue',
          line: options.enabled ? 'green' : 'red'
        }
      });
      if (isEnabled) {
        constructedLog({
          value: `ENV COMMAND: ${options.context.command}`,
          colors: {
            tag: 'blue'
          }
        });
        constructedLog({
          value: `ENV MODE: ${options.context.mode}`,
          colors: {
            tag: 'blue'
          }
        });
        if (uiMode) {
          constructedLog({
            value: `UI MODE: ${uiMode}`,
            colors: {
              tag: 'blue'
            }
          });
        }
      }
    },
    configureServer(server) {
      const buildOptions = {
        ...options,
        server
      };

      // build mode
      if (options.context.command === 'build') {
        configureBuild(buildOptions);

        return;
      }
      // serve mode
      configureServe(buildOptions);
      return;
    }
  };
}
