declare global {
  interface Window {
    __DEV_CADDY_ENABLED__: boolean;
    __DEV_CADDY_UI_MODE__: 'client' | 'developer' | null;
  }
}

export {};
