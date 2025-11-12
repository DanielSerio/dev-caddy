import type { PluginOption } from 'vite';
import type { DevCaddyPluginOptions } from "../types";
import { constructedLog, getUIMode } from './utility';
import { configureServe } from './configure';

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
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!isEnabled) return html;

        const isDevelopment = options.context.mode === 'development';

        const script = `<script>
  // DevCaddy global variables - set before app initialization
  (function() {
    // Check for query parameter override (development only)
    function getDevCaddyMode() {
      const isDev = ${isDevelopment};
      const baseMode = '${uiMode}';

      // Only allow override in development mode for security
      if (isDev && typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const override = params.get('devCaddyMode');

        if (override === 'client' || override === 'developer') {
          console.log('[DevCaddy] Mode overridden via query parameter:', override);
          return override;
        }
      }

      return baseMode;
    }

    window.__DEV_CADDY_ENABLED__ = ${isEnabled};
    window.__DEV_CADDY_UI_MODE__ = getDevCaddyMode();
  })();
</script>`;

        return html.replace('<head>', `<head>\n${script}`);
      }
    },
    configureServer(server) {
      if (!isEnabled) return;

      const buildOptions = {
        ...options,
        server
      };

      configureServe(buildOptions);
    }
  };
}
