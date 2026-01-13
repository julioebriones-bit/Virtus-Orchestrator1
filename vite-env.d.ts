// Fix: Removed reference to vite/client as it was causing a "Cannot find" error in this environment
// Essential types are manually defined below.

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_NAME: string;
}

// Fix: Removed redundant ImportMeta declaration that was causing type conflicts with 'vite/client'.
// Vite's built-in types already provide declarations for import.meta.env and import.meta.hot.