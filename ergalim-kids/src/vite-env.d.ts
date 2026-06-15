/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Auth
  readonly VITE_JWT_SECRET:          string
  readonly VITE_ADMIN_EMAIL:         string
  readonly VITE_ADMIN_PASS:          string
  readonly VITE_OWNER_EMAIL:         string
  readonly VITE_OWNER_PASS:          string
  readonly VITE_STORE_EMAIL:         string
  // Firebase
  readonly VITE_FIREBASE_API_KEY:            string
  readonly VITE_FIREBASE_AUTH_DOMAIN:        string
  readonly VITE_FIREBASE_PROJECT_ID:         string
  readonly VITE_FIREBASE_STORAGE_BUCKET:     string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID:string
  readonly VITE_FIREBASE_APP_ID:             string
  // Cloudinary
  readonly VITE_CLOUDINARY_CLOUD_NAME:    string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  // Pagamentos
  readonly VITE_MERCADOPAGO_PUBLIC_KEY: string
  readonly VITE_RESEND_API_KEY:         string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
