/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JWT_SECRET: string
  readonly VITE_ADMIN_EMAIL: string
  readonly VITE_ADMIN_PASS: string
  readonly VITE_OWNER_EMAIL: string
  readonly VITE_OWNER_PASS: string
  readonly VITE_STORE_EMAIL: string
  readonly VITE_MERCADOPAGO_PUBLIC_KEY: string
  readonly VITE_RESEND_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
