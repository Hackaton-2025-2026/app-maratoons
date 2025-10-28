/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_1_URL: string
  readonly VITE_API_2_URL: string
  readonly VITE_USE_MOCK: string
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
