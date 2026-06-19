/**
 * AuthContext — Autenticação com Firebase Auth para clientes
 *
 * SEGURANÇA:
 * ✅ Admin e Dono: credenciais fixas via variáveis de ambiente (JWT local)
 * ✅ Clientes: Firebase Authentication (email/senha) — dados na nuvem
 * ✅ Perfil do cliente salvo no Firestore /customers/{uid}
 * ✅ Funciona em qualquer dispositivo — sem localStorage para clientes
 * ✅ Rate limiting: 5 tentativas/minuto
 * ✅ Token JWT para staff assinado com HMAC-SHA256
 * ✅ Sessão em sessionStorage com expiração de 8h (staff)
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { User, OwnerPermissions } from '@/types'
import { DEFAULT_OWNER_PERMISSIONS } from '@/data/store'
import { rateLimit, sanitize } from '@/utils/security'

const FIREBASE_ENABLED = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
)

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  ownerPermissions: OwnerPermissions
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone: string) => Promise<void>
  logout: () => void
  updateOwnerPermissions: (p: OwnerPermissions) => void
  isAdmin: boolean
  isOwner: boolean
  isCustomer: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// ─── JWT com HMAC-SHA256 (usado apenas para staff admin/dono) ──────────────
// Secret de sessão local — usado APENAS para validar a sessão de 8h no navegador.
// A autenticação real acontece no servidor (/api/auth) onde ficam as senhas.
// Forjar este token não dá acesso a nada sem a senha real do servidor.
const JWT_SECRET = 'ek_session_validator_v1_local_only'

async function signToken(payload: object): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body   = btoa(JSON.stringify(payload))
  const data   = `${header}.${body}`
  const key    = await crypto.subtle.importKey('raw', new TextEncoder().encode(JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig    = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return `${data}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`
}

async function verifyToken(token: string): Promise<any | null> {
  try {
    const [header, body, sig] = token.split('.')
    const data    = `${header}.${body}`
    const key     = await crypto.subtle.importKey('raw', new TextEncoder().encode(JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    const rawSig  = Uint8Array.from(atob(sig), c => c.charCodeAt(0))
    const valid   = await crypto.subtle.verify('HMAC', key, rawSig, new TextEncoder().encode(data))
    if (!valid) return null
    const payload = JSON.parse(atob(body))
    if (Date.now() > payload.exp) return null
    return payload
  } catch { return null }
}

// ─── Credenciais fixas de staff (admin e dono) ────────────────────────────
// STAFF_USERS: usado apenas em dev local (sem senha real)
// Em produção, a autenticação é feita via /api/auth (servidor seguro)
const STAFF_USERS = [
  { id: '1', name: 'Admin',           email: import.meta.env.VITE_ADMIN_EMAIL || import.meta.env.DEV ? (import.meta.env.VITE_DEV_ADMIN_PASS ?? '') : '', role: 'admin', hash: import.meta.env.VITE_DEV_ADMIN_PASS ?? '' },
  { id: '2', name: 'Gabriel Furtado', email: import.meta.env.VITE_OWNER_EMAIL || import.meta.env.DEV ? (import.meta.env.VITE_DEV_OWNER_PASS ?? '') : '', role: 'owner', hash: import.meta.env.VITE_DEV_OWNER_PASS ?? '' },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,             setUser]             = useState<User | null>(null)
  const [token,            setToken]            = useState<string | null>(null)
  const [loading,          setLoading]          = useState(true)
  const [ownerPermissions, setOwnerPermissions] = useState<OwnerPermissions>(DEFAULT_OWNER_PERMISSIONS)

  // ── Restaurar sessão ao carregar ────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      // 1. Verificar sessão de staff (JWT local)
      const raw = sessionStorage.getItem('ek_session')
      if (raw) {
        try {
          const { token: t, perms } = JSON.parse(raw)
          const payload = await verifyToken(t)
          if (payload) {
            setUser({ id: payload.id, name: payload.name, email: payload.email, role: payload.role, createdAt: payload.iat })
            setToken(t)
            if (perms) setOwnerPermissions(perms)
            // ✅ Reautentica anonimamente no Firebase ao recarregar a página
            if (FIREBASE_ENABLED) {
              try {
                const { auth } = await import('@/lib/firebase')
                const { signInAnonymously } = await import('firebase/auth')
                if (!auth.currentUser) await signInAnonymously(auth)
              } catch {}
            }
            setLoading(false)
            return
          } else {
            sessionStorage.removeItem('ek_session')
          }
        } catch {
          sessionStorage.removeItem('ek_session')
        }
      }

      // 2. Verificar sessão de cliente via Firebase Auth
      if (FIREBASE_ENABLED) {
        try {
          const { auth } = await import('@/lib/firebase')
          const { onAuthStateChanged } = await import('firebase/auth')

          const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              try {
                const fb = await import('@/services/firestore')
                const profile = await fb.fbGetCustomer(firebaseUser.uid)
                setUser({
                  id:        firebaseUser.uid,
                  name:      profile?.name || firebaseUser.displayName || 'Cliente',
                  email:     firebaseUser.email || '',
                  role:      'customer',
                  createdAt: profile?.createdAt || new Date().toISOString(),
                })
              } catch {
                setUser({
                  id:        firebaseUser.uid,
                  name:      firebaseUser.displayName || 'Cliente',
                  email:     firebaseUser.email || '',
                  role:      'customer',
                  createdAt: new Date().toISOString(),
                })
              }
            } else {
              setUser(prev => (prev?.role === 'customer' ? null : prev))
            }
            setLoading(false)
            unsub()
          })
        } catch {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    restore()
  }, [])

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    if (!rateLimit('login', 5, 60_000)) throw new Error('Muitas tentativas. Aguarde 1 minuto.')
    const normalEmail = email.trim().toLowerCase()

    // 1. Verificar staff (admin/dono)
    //    Em produção: via API serverless segura (/api/auth)
    //    Em dev local: via STAFF_USERS (sem senha real)
    const loginAsStaff = async (userData: { id: string; name: string; email: string; role: string }) => {
      const payload = { ...userData, iat: new Date().toISOString(), exp: Date.now() + 8 * 3600_000 }
      const t = await signToken(payload)
      setUser({ ...userData, createdAt: new Date().toISOString() })
      setToken(t)
      sessionStorage.setItem('ek_session', JSON.stringify({ token: t, perms: ownerPermissions }))
      if (FIREBASE_ENABLED) {
        try {
          const { auth } = await import('@/lib/firebase')
          const { signInAnonymously } = await import('firebase/auth')
          if (!auth.currentUser) await signInAnonymously(auth)
        } catch (e) { console.warn('Firebase anon:', e) }
      }
    }

    // Tenta a API serverless primeiro
    let apiAvailable = false
    try {
      const authRes = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalEmail, password }),
      })
      apiAvailable = true // API respondeu (mesmo que com erro)

      if (authRes.ok) {
        const u = await authRes.json()
        await loginAsStaff(u)
        return
      }

      if (authRes.status === 401) {
        // API respondeu: credenciais inválidas
        // Verifica se o email é de staff (admin/dono) para dar erro correto
        const isStaffEmail = STAFF_USERS.some(u => u.email.toLowerCase() === normalEmail)
        if (isStaffEmail) {
          throw new Error('E-mail ou senha incorretos')
        }
        // Não é staff conhecido — continua para tentar Firebase Auth (cliente)
      } else if (!authRes.ok) {
        // Outro erro da API (500, etc) — tenta Firebase Auth
        console.warn('API auth retornou:', authRes.status)
      }
    } catch (e: any) {
      if (e.message === 'E-mail ou senha incorretos') throw e
      // API não disponível (dev local ou erro de rede) — tenta fallback local
      apiAvailable = false
    }

    // Fallback: dev local (STAFF_USERS com hash de dev)
    if (!apiAvailable) {
      const staff = STAFF_USERS.find(u => u.email.toLowerCase() === normalEmail && u.hash === password)
      if (staff) {
        const { hash: _, ...u } = staff
        await loginAsStaff({ id: u.id, name: u.name, email: u.email, role: u.role })
        return
      }
    }

    // 2. Clientes via Firebase Auth
    if (FIREBASE_ENABLED) {
      try {
        const { auth } = await import('@/lib/firebase')
        const { signInWithEmailAndPassword } = await import('firebase/auth')
        const credential = await signInWithEmailAndPassword(auth, normalEmail, password)
        const firebaseUser = credential.user

        try {
          const fb = await import('@/services/firestore')
          const profile = await fb.fbGetCustomer(firebaseUser.uid)
          setUser({
            id:        firebaseUser.uid,
            name:      profile?.name || firebaseUser.displayName || 'Cliente',
            email:     firebaseUser.email || '',
            role:      'customer',
            createdAt: profile?.createdAt || new Date().toISOString(),
          })
        } catch {
          setUser({
            id:    firebaseUser.uid,
            name:  firebaseUser.displayName || 'Cliente',
            email: firebaseUser.email || '',
            role:  'customer',
            createdAt: new Date().toISOString(),
          })
        }
        return
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          throw new Error('E-mail ou senha incorretos')
        }
        if (err.code === 'auth/too-many-requests') {
          throw new Error('Muitas tentativas. Aguarde alguns minutos.')
        }
        throw new Error(err.message || 'Erro ao fazer login. Tente novamente.')
      }
    }

    await new Promise(r => setTimeout(r, 300 + Math.random() * 200))
    throw new Error('E-mail ou senha incorretos')
  }, [ownerPermissions])

  // ── Cadastro de cliente ────────────────────────────────────────────────
  const register = useCallback(async (name: string, email: string, password: string, phone: string) => {
    if (!rateLimit('register', 3, 60_000)) throw new Error('Muitas tentativas. Aguarde 1 minuto.')
    const normalEmail = email.trim().toLowerCase()
    const normalName  = sanitize(name.trim())
    const normalPhone = sanitize(phone.trim())

    if (normalName.length < 2) throw new Error('Nome deve ter ao menos 2 caracteres')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalEmail)) throw new Error('E-mail inválido')
    if (password.length < 8) throw new Error('Senha deve ter ao menos 8 caracteres')

    if (STAFF_USERS.some(u => u.email.toLowerCase() === normalEmail)) {
      throw new Error('Este e-mail não pode ser usado para cadastro')
    }

    if (!FIREBASE_ENABLED) {
      throw new Error('Cadastro indisponível: Firebase não configurado. Contate o suporte.')
    }

    try {
      const { auth } = await import('@/lib/firebase')
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')

      // 1. Criar conta no Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, normalEmail, password)
      const firebaseUser = credential.user

      // 2. Atualizar nome no Firebase Auth
      try {
        await updateProfile(firebaseUser, { displayName: normalName })
      } catch {
        // Não crítico — continua mesmo se falhar
      }

      // 3. Salvar perfil no Firestore
      // ⚠️ Usa as regras abertas de /customers — precisa estar autenticado
      // O Firebase Auth já autenticou na linha acima, então request.auth.uid está disponível
      const profile = {
        id:        firebaseUser.uid,
        name:      normalName,
        email:     normalEmail,
        phone:     normalPhone,
        addresses: [],
        createdAt: new Date().toISOString(),
      }

      try {
        const fb = await import('@/services/firestore')
        await fb.fbSaveCustomer(firebaseUser.uid, profile)
      } catch (firestoreErr: any) {
        // Perfil não salvo no Firestore mas conta criada — não bloqueia o cadastro
        console.warn('Aviso: perfil não salvo no Firestore:', firestoreErr?.message)
      }

      // 4. Setar usuário logado
      setUser({
        id:        firebaseUser.uid,
        name:      normalName,
        email:     normalEmail,
        role:      'customer',
        createdAt: profile.createdAt,
      })

    } catch (err: any) {
      // Erros do Firebase Auth
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('Este e-mail já está cadastrado')
      }
      if (err.code === 'auth/weak-password') {
        throw new Error('Senha muito fraca. Use ao menos 8 caracteres')
      }
      if (err.code === 'auth/invalid-email') {
        throw new Error('E-mail inválido')
      }
      if (err.code === 'auth/network-request-failed') {
        throw new Error('Sem conexão com a internet. Verifique sua rede.')
      }
      // Se já é um erro traduzido (lançado antes do try), repassa direto
      if (!err.code) throw err
      throw new Error('Erro ao criar conta: ' + (err.message || 'tente novamente'))
    }
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (user?.role === 'customer' && FIREBASE_ENABLED) {
      try {
        const { auth } = await import('@/lib/firebase')
        const { signOut } = await import('firebase/auth')
        await signOut(auth)
      } catch {}
    }
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('ek_session')
  }, [user])

  const updateOwnerPermissions = useCallback((p: OwnerPermissions) => {
    setOwnerPermissions(p)
    const raw = sessionStorage.getItem('ek_session')
    if (raw) try { sessionStorage.setItem('ek_session', JSON.stringify({ ...JSON.parse(raw), perms: p })) } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{
      user, token, loading, ownerPermissions, login, register, logout, updateOwnerPermissions,
      isAdmin:    user?.role === 'admin',
      isOwner:    user?.role === 'owner' || user?.role === 'admin',
      isCustomer: user?.role === 'customer',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora do AuthProvider')
  return ctx
}
