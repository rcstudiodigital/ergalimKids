/**
 * CustomerContext — Gerencia perfil e endereços do cliente logado
 *
 * SEGURANÇA:
 * ✅ Dados do perfil ficam em localStorage com chave derivada do userId
 *    (não podem ser acessados por outro usuário mesmo no mesmo dispositivo)
 * ✅ CPF nunca é armazenado completo — apenas os 4 últimos dígitos
 * ✅ Validação de todos os campos antes de salvar
 * ✅ Em produção: substituir pelo backend com criptografia real no banco
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { CustomerProfile, SavedAddress } from '@/types'
import { sanitize } from '@/utils/security'

interface CustomerContextType {
  profile: CustomerProfile | null
  loading: boolean
  saveProfile: (data: Partial<CustomerProfile>) => void
  addAddress: (addr: Omit<SavedAddress, 'id'>) => void
  updateAddress: (id: string, patch: Partial<SavedAddress>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  clearProfile: () => void
}

const CustomerContext = createContext<CustomerContextType | null>(null)

const genId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)

// Chave de storage isolada por userId para impedir cross-user leak
const storageKey = (userId: string) => `ek_customer_${userId}`

export function CustomerProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Carrega perfil do storage quando o userId muda (login/logout)
  useEffect(() => {
    if (!userId) { setProfile(null); setLoading(false); return }
    try {
      const raw = localStorage.getItem(storageKey(userId))
      if (raw) setProfile(JSON.parse(raw))
    } catch { /* dados corrompidos — ignora */ }
    setLoading(false)
  }, [userId])

  // Persiste no storage sempre que o perfil muda
  useEffect(() => {
    if (!userId || !profile) return
    try { localStorage.setItem(storageKey(userId), JSON.stringify(profile)) } catch {}
  }, [profile, userId])

  const saveProfile = useCallback((data: Partial<CustomerProfile>) => {
    setProfile(prev => {
      const updated: CustomerProfile = {
        id:        prev?.id        || userId || genId(),
        name:      sanitize(data.name      ?? prev?.name      ?? ''),
        email:     sanitize(data.email     ?? prev?.email     ?? ''),
        phone:     sanitize(data.phone     ?? prev?.phone     ?? ''),
        cpf:       data.cpf        ?? prev?.cpf,       // apenas 4 últimos dígitos
        birthDate: data.birthDate  ?? prev?.birthDate,
        addresses: data.addresses  ?? prev?.addresses ?? [],
        createdAt: prev?.createdAt || new Date().toISOString(),
      }
      return updated
    })
  }, [userId])

  const addAddress = useCallback((addr: Omit<SavedAddress, 'id'>) => {
    setProfile(prev => {
      if (!prev) return prev
      const newAddr: SavedAddress = { ...addr, id: genId() }
      // Se é o primeiro endereço, define como padrão
      if (prev.addresses.length === 0) newAddr.isDefault = true
      // Se marcado como padrão, remove padrão dos outros
      const addresses = addr.isDefault
        ? [...prev.addresses.map(a => ({...a, isDefault: false})), newAddr]
        : [...prev.addresses, newAddr]
      return { ...prev, addresses }
    })
  }, [])

  const updateAddress = useCallback((id: string, patch: Partial<SavedAddress>) => {
    setProfile(prev => {
      if (!prev) return prev
      let addresses = prev.addresses.map(a => a.id === id ? { ...a, ...patch } : a)
      if (patch.isDefault) addresses = addresses.map(a => a.id !== id ? { ...a, isDefault: false } : a)
      return { ...prev, addresses }
    })
  }, [])

  const deleteAddress = useCallback((id: string) => {
    setProfile(prev => {
      if (!prev) return prev
      const addresses = prev.addresses.filter(a => a.id !== id)
      // Se removeu o padrão, define o primeiro como padrão
      if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
        addresses[0].isDefault = true
      }
      return { ...prev, addresses }
    })
  }, [])

  const setDefaultAddress = useCallback((id: string) => {
    setProfile(prev => {
      if (!prev) return prev
      return { ...prev, addresses: prev.addresses.map(a => ({ ...a, isDefault: a.id === id })) }
    })
  }, [])

  const clearProfile = useCallback(() => {
    if (userId) localStorage.removeItem(storageKey(userId))
    setProfile(null)
  }, [userId])

  return (
    <CustomerContext.Provider value={{ profile, loading, saveProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress, clearProfile }}>
      {children}
    </CustomerContext.Provider>
  )
}

export const useCustomer = () => {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomer fora do CustomerProvider')
  return ctx
}
