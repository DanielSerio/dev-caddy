/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_CADDY_ENABLED: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}