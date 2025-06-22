/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_OMDB_API_KEY: string;
  readonly VITE_WATCHMODE_API_KEY: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_YOUTUBE_API_KEY: string;
  // add more keys here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

