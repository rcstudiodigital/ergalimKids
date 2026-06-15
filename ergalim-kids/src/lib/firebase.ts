/**
 * Firebase — configuração central
 * 
 * Para configurar:
 * 1. Acesse console.firebase.google.com
 * 2. Crie um projeto → Adicionar app Web
 * 3. Copie as configs e coloque no .env.local
 */
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const db   = getFirestore(app)
export const auth = getAuth(app)

/**
 * Garante que há um usuário autenticado no Firebase antes de escrever.
 * Admin e dono usam login próprio (JWT), então precisam de auth anônimo
 * para o Firestore aceitar suas escritas.
 * 
 * Esta função aguarda a autenticação completar antes de retornar,
 * evitando o erro "permission-denied" por race condition.
 */
export async function ensureAuth(): Promise<void> {
  if (auth.currentUser) return  // já autenticado

  const { signInAnonymously, onAuthStateChanged } = await import('firebase/auth')

  // Tenta login anônimo e aguarda completar
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout na autenticação')), 10000)

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        clearTimeout(timeout)
        unsub()
        resolve()
      }
    })

    signInAnonymously(auth).catch((err) => {
      clearTimeout(timeout)
      unsub()
      reject(err)
    })
  })
}

export default app
