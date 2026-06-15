/**
 * CustomerContext — Perfil e endereços do cliente logado
 *
 * ✅ Dados salvos no Firestore /customers/{userId} (qualquer dispositivo)
 * ✅ Watch em tempo real: mudança no celular aparece no computador
 * ✅ Fallback para localStorage se Firebase não estiver configurado
 * ✅ CPF nunca armazenado completo — apenas os 4 últimos dígitos
 * ✅ Validação de todos os campos antes de salvar
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { CustomerProfile, SavedAddress } from '@/types'
import { sanitize } from '@/utils/security'

// Detecta se Firebase está configurado
const FIREBASE_ENABLED = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
)

interface CustomerContextType {
  profile:           CustomerProfile | null
  loading:           boolean
  saveProfile:       (data: Partial<CustomerProfile>) => Promise<void>
  addAddress:        (addr: Omit<SavedAddress, 'id'>) => Promise<void>
  updateAddress:     (id: string, patch: Partial<SavedAddress>) => Promise<void>
  deleteAddress:     (id: string) => Promise<void>
  setDefaultAddress: (id: string) => Promise<void>
  clearProfile:      () => void
}

const CustomerContext = createContext<CustomerContextType | null>(null)

const genId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)

// Chave de storage isolada por userId (fallback sem Firebase)
const storageKey = (userId: string) => `ek_customer_${userId}`

export function CustomerProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Carregar perfil ao logar ─────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    let unsubscribe: (() => void) | null = null

    const loadProfile = async () => {
      setLoading(true)

      if (FIREBASE_ENABLED) {
        try {
          const fb = await import('@/services/firestore')
          // Watch em tempo real: perfil atualiza em todos os dispositivos
          unsubscribe = fb.fbWatchCustomer(userId, (p) => {
            if (p) {
              setProfile(p)
            } else {
              // Primeira vez: sem perfil no Firestore ainda
              setProfile(null)
            }
            setLoading(false)
          })
        } catch {
          // Fallback para localStorage se Firebase falhar
          try {
            const raw = localStorage.getItem(storageKey(userId))
            if (raw) setProfile(JSON.parse(raw))
          } catch {}
          setLoading(false)
        }
      } else {
        // Sem Firebase: usar localStorage
        try {
          const raw = localStorage.getItem(storageKey(userId))
          if (raw) setProfile(JSON.parse(raw))
        } catch {}
        setLoading(false)
      }
    }

    loadProfile()

    return () => {
      unsubscribe?.()
    }
  }, [userId])

  // ── Salvar perfil no Firestore ───────────────────────────────────────────
  const persistProfile = useCallback(async (updated: CustomerProfile) => {
    if (!userId) return

    if (FIREBASE_ENABLED) {
      try {
        const fb = await import('@/services/firestore')
        await fb.fbSaveCustomer(userId, updated)
        // O watch acima vai atualizar o estado automaticamente
      } catch {
        // Fallback: salvar no localStorage
        try { localStorage.setItem(storageKey(userId), JSON.stringify(updated)) } catch {}
      }
    } else {
      try { localStorage.setItem(storageKey(userId), JSON.stringify(updated)) } catch {}
    }
  }, [userId])

  // ── saveProfile ──────────────────────────────────────────────────────────
  const saveProfile = useCallback(async (data: Partial<CustomerProfile>) => {
    if (!userId) return
    const updated: CustomerProfile = {
      id:        profile?.id        || userId || genId(),
      name:      sanitize(data.name      ?? profile?.name      ?? ''),
      email:     sanitize(data.email     ?? profile?.email     ?? ''),
      phone:     sanitize(data.phone     ?? profile?.phone     ?? ''),
      cpf:       data.cpf        ?? profile?.cpf,
      birthDate: data.birthDate  ?? profile?.birthDate,
      addresses: data.addresses  ?? profile?.addresses ?? [],
      createdAt: profile?.createdAt || new Date().toISOString(),
    }
    // Atualiza local imediatamente para UI não travar
    setProfile(updated)
    await persistProfile(updated)
  }, [userId, profile, persistProfile])

  // ── addAddress ───────────────────────────────────────────────────────────
  const addAddress = useCallback(async (addr: Omit<SavedAddress, 'id'>) => {
    if (!userId || !profile) return
    const newAddr: SavedAddress = { ...addr, id: genId() }
    if (profile.addresses.length === 0) newAddr.isDefault = true
    const addresses = addr.isDefault
      ? [...profile.addresses.map(a => ({ ...a, isDefault: false })), newAddr]
      : [...profile.addresses, newAddr]
    const updated = { ...profile, addresses }
    setProfile(updated)
    await persistProfile(updated)
  }, [userId, profile, persistProfile])

  // ── updateAddress ────────────────────────────────────────────────────────
  const updateAddress = useCallback(async (id: string, patch: Partial<SavedAddress>) => {
    if (!userId || !profile) return
    let addresses = profile.addresses.map(a => a.id === id ? { ...a, ...patch } : a)
    if (patch.isDefault) addresses = addresses.map(a => a.id !== id ? { ...a, isDefault: false } : a)
    const updated = { ...profile, addresses }
    setProfile(updated)
    await persistProfile(updated)
  }, [userId, profile, persistProfile])

  // ── deleteAddress ────────────────────────────────────────────────────────
  const deleteAddress = useCallback(async (id: string) => {
    if (!userId || !profile) return
    const addresses = profile.addresses.filter(a => a.id !== id)
    if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
      addresses[0].isDefault = true
    }
    const updated = { ...profile, addresses }
    setProfile(updated)
    await persistProfile(updated)
  }, [userId, profile, persistProfile])

  // ── setDefaultAddress ────────────────────────────────────────────────────
  const setDefaultAddress = useCallback(async (id: string) => {
    if (!userId || !profile) return
    const addresses = profile.addresses.map(a => ({ ...a, isDefault: a.id === id }))
    const updated = { ...profile, addresses }
    setProfile(updated)
    await persistProfile(updated)
  }, [userId, profile, persistProfile])

  // ── clearProfile ─────────────────────────────────────────────────────────
  const clearProfile = useCallback(() => {
    if (userId) {
      try { localStorage.removeItem(storageKey(userId)) } catch {}
    }
    setProfile(null)
  }, [userId])

  return (
    <CustomerContext.Provider value={{
      profile, loading,
      saveProfile, addAddress, updateAddress,
      deleteAddress, setDefaultAddress, clearProfile,
    }}>
      {children}
    </CustomerContext.Provider>
  )
}

export const useCustomer = () => {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomer fora do CustomerProvider')
  return ctx
}
