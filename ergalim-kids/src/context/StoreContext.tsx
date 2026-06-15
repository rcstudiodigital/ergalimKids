/**
 * StoreContext — com Firebase Firestore
 *
 * Se Firebase configurado: dados na nuvem em tempo real (todos os dispositivos sincronizados)
 * Se não configurado: dados no localStorage (modo local/dev)
 *
 * ✅ Produtos     → Firebase (watch em tempo real)
 * ✅ Pedidos      → Firebase (watch em tempo real)
 * ✅ Settings     → Firebase (watch em tempo real) ← CORRIGIDO
 * ✅ Cupons       → Firebase (watch em tempo real) ← CORRIGIDO
 */
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { Product, Order, SiteSettings, OwnerPermissions, Coupon, ShippingOption } from '@/types'
import { INITIAL_PRODUCTS, INITIAL_ORDERS, DEFAULT_SETTINGS, DEFAULT_OWNER_PERMISSIONS, INITIAL_COUPONS } from '@/data/store'
import { genId } from '@/utils/security'

// Detecta se Firebase está configurado
const FIREBASE_ENABLED = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
)

interface StoreContextType {
  products:           Product[]
  orders:             Order[]
  settings:           SiteSettings
  ownerPermissions:   OwnerPermissions
  coupons:            Coupon[]
  firebaseEnabled:    boolean
  addProduct:         (p: Omit<Product,'id'|'createdAt'|'updatedAt'>) => Promise<void>
  updateProduct:      (p: Product) => Promise<void>
  deleteProduct:      (id: string) => Promise<void>
  addOrder:           (o: Omit<Order,'id'|'createdAt'|'updatedAt'>) => string
  updateOrder:        (id: string, patch: Partial<Order>) => Promise<void>
  updateSettings:     (patch: Partial<SiteSettings>) => Promise<void>
  updateOwnerPermissions: (p: OwnerPermissions) => void
  addCoupon:          (c: Coupon) => Promise<void>
  updateCoupon:       (code: string, patch: Partial<Coupon>) => Promise<void>
  deleteCoupon:       (code: string) => Promise<void>
  addShippingOption:    (opt: Omit<ShippingOption,'id'>) => void
  updateShippingOption: (id: string, patch: Partial<ShippingOption>) => void
  deleteShippingOption: (id: string) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

function load<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback }
  catch { return fallback }
}
function save(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products,         setProducts]         = useState<Product[]>(() => load('ek_products', INITIAL_PRODUCTS))
  const [orders,           setOrders]           = useState<Order[]>(() => load('ek_orders', INITIAL_ORDERS))
  const [settings,         setSettings]         = useState<SiteSettings>(() => ({ ...DEFAULT_SETTINGS, ...load('ek_settings', {}) }))
  const [ownerPermissions, setOwnerPermissions] = useState<OwnerPermissions>(() => load('ek_permissions', DEFAULT_OWNER_PERMISSIONS))
  const [coupons,          setCoupons]          = useState<Coupon[]>(() => load('ek_coupons', INITIAL_COUPONS))
  const [fbLoaded,         setFbLoaded]         = useState(!FIREBASE_ENABLED)

  // ── Firebase: watch em tempo real de tudo ──────────────────────────────
  useEffect(() => {
    if (!FIREBASE_ENABLED) return
    let unsub1: any, unsub2: any, unsub3: any, unsub4: any, unsubAuth: any

    import('@/services/firestore').then(async fb => {
      // PÚBLICO (não precisa de login): produtos, settings, cupons
      unsub1 = fb.fbWatchProducts(p => {
        setProducts(p)
        save('ek_products', p)
      })

      unsub3 = fb.fbWatchSettings((s: any) => {
        // Restaurar permissões do dono se vierem do Firebase
        if (s.ownerPermissions) {
          setOwnerPermissions(s.ownerPermissions)
          save('ek_permissions', s.ownerPermissions)
          const { ownerPermissions: _, ...rest } = s
          s = rest
        }
        setSettings(prev => {
          const merged = { ...prev, ...s }
          save('ek_settings', merged)
          return merged
        })
      })

      unsub4 = fb.fbWatchCoupons(c => {
        setCoupons(c)
        save('ek_coupons', c)
      })

      // PRIVADO (só logado): pedidos. Observa apenas quando há sessão Firebase
      // autenticada, evitando "permission-denied" para visitantes da loja.
      const { auth } = await import('@/lib/firebase')
      const { onAuthStateChanged } = await import('firebase/auth')
      unsubAuth = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          // Há usuário Firebase autenticado (anônimo=staff ou real=cliente)
          if (!unsub2) {
            unsub2 = fb.fbWatchOrders(o => {
              setOrders(o)
              save('ek_orders', o)
            })
          }
        } else {
          unsub2?.()
          unsub2 = null
        }
      })

      setFbLoaded(true)
    }).catch(() => setFbLoaded(true))

    return () => {
      unsubAuth?.()
      unsub1?.()
      unsub2?.()
      unsub3?.()
      unsub4?.()
    }
  }, [])

  // ── Persistência localStorage (fallback quando Firebase desligado) ──────
  useEffect(() => { if (!FIREBASE_ENABLED) save('ek_products', products) }, [products])
  useEffect(() => { if (!FIREBASE_ENABLED) save('ek_orders', orders) }, [orders])
  useEffect(() => { if (!FIREBASE_ENABLED) save('ek_settings', settings) }, [settings])
  useEffect(() => { save('ek_permissions', ownerPermissions) }, [ownerPermissions])
  useEffect(() => { if (!FIREBASE_ENABLED) save('ek_coupons', coupons) }, [coupons])

  // ── Produtos ───────────────────────────────────────────────────────────
  const addProduct = useCallback(async (p: Omit<Product,'id'|'createdAt'|'updatedAt'>) => {
    const now = new Date().toISOString()
    if (FIREBASE_ENABLED) {
      const fb = await import('@/services/firestore')
      await fb.fbAddProduct({ ...p, createdAt: now, updatedAt: now })
      // O watch acima (unsub1) já vai atualizar o estado automaticamente
    } else {
      setProducts(prev => [{ ...p, id: genId(), createdAt: now, updatedAt: now }, ...prev])
    }
  }, [])

  const updateProduct = useCallback(async (p: Product) => {
    if (FIREBASE_ENABLED) {
      const fb = await import('@/services/firestore')
      await fb.fbUpdateProduct(p.id, p)
      // O watch acima já vai atualizar o estado automaticamente
    } else {
      setProducts(prev => prev.map(x => x.id === p.id ? { ...p, updatedAt: new Date().toISOString() } : x))
    }
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    if (FIREBASE_ENABLED) {
      const fb = await import('@/services/firestore')
      await fb.fbDeleteProduct(id)
      // O watch acima já vai atualizar o estado automaticamente
    } else {
      setProducts(prev => prev.filter(p => p.id !== id))
    }
  }, [])

  // ── Pedidos ────────────────────────────────────────────────────────────
  const addOrder = useCallback((o: Omit<Order,'id'|'createdAt'|'updatedAt'>): string => {
    const id  = `EK-${Date.now().toString().slice(-6)}`
    const now = new Date().toISOString()
    if (FIREBASE_ENABLED) {
      import('@/services/firestore').then(fb => fb.fbAddOrder({ ...o, id, createdAt: now, updatedAt: now }))
      // O watch acima já vai atualizar o estado automaticamente
    } else {
      setOrders(prev => [{ ...o, id, createdAt: now, updatedAt: now }, ...prev])
    }
    return id
  }, [])

  const updateOrder = useCallback(async (id: string, patch: Partial<Order>) => {
    if (FIREBASE_ENABLED) {
      const fb = await import('@/services/firestore')
      await fb.fbUpdateOrder(id, patch)
      // O watch acima já vai atualizar o estado automaticamente
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o))
    }
  }, [])

  // ── Settings ───────────────────────────────────────────────────────────
  const updateSettings = useCallback(async (patch: Partial<SiteSettings>) => {
    // Atualiza local imediatamente para UI não travar
    setSettings(prev => ({ ...prev, ...patch }))
    if (FIREBASE_ENABLED) {
      const fb = await import('@/services/firestore')
      // Salva no Firebase — o watch (unsub3) vai propagar para todos os dispositivos
      await fb.fbUpdateSettings(patch)
    }
  }, [])

  const updateOwnerPermissions = useCallback(async (p: OwnerPermissions) => {
    setOwnerPermissions(p)
    save('ek_permissions', p)
    if (FIREBASE_ENABLED) {
      const fb = await import('@/services/firestore')
      await fb.fbUpdateSettings({ ownerPermissions: p } as any)
    }
  }, [])

  // ── Cupons ─────────────────────────────────────────────────────────────
  const addCoupon = useCallback(async (c: Coupon) => {
    if (FIREBASE_ENABLED) {
      const fb = await import('@/services/firestore')
      await fb.fbAddCoupon(c)
      // O watch (unsub4) já vai atualizar o estado automaticamente
    } else {
      setCoupons(prev => [...prev, c])
    }
  }, [])

  const updateCoupon = useCallback(async (code: string, patch: Partial<Coupon>) => {
    if (FIREBASE_ENABLED) {
      const fb = await import('@/services/firestore')
      await fb.fbUpdateCoupon(code, patch)
      // O watch (unsub4) já vai atualizar o estado automaticamente
    } else {
      setCoupons(prev => prev.map(c => c.code === code ? { ...c, ...patch } : c))
    }
  }, [])

  const deleteCoupon = useCallback(async (code: string) => {
    if (FIREBASE_ENABLED) {
      const fb = await import('@/services/firestore')
      await fb.fbDeleteCoupon(code)
      // O watch (unsub4) já vai atualizar o estado automaticamente
    } else {
      setCoupons(prev => prev.filter(c => c.code !== code))
    }
  }, [])

  // ── Entrega (via updateSettings → Firebase) ────────────────────────────
  const addShippingOption = useCallback((opt: Omit<ShippingOption,'id'>) =>
    updateSettings({ shippingOptions: [...(settings.shippingOptions || []), { ...opt, id: genId() }] }),
  [settings, updateSettings])

  const updateShippingOption = useCallback((id: string, patch: Partial<ShippingOption>) =>
    updateSettings({ shippingOptions: (settings.shippingOptions || []).map(s => s.id === id ? { ...s, ...patch } : s) }),
  [settings, updateSettings])

  const deleteShippingOption = useCallback((id: string) =>
    updateSettings({ shippingOptions: (settings.shippingOptions || []).filter(s => s.id !== id) }),
  [settings, updateSettings])

  return (
    <StoreContext.Provider value={{
      products, orders, settings, ownerPermissions, coupons,
      firebaseEnabled: FIREBASE_ENABLED,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateOrder,
      updateSettings, updateOwnerPermissions,
      addCoupon, updateCoupon, deleteCoupon,
      addShippingOption, updateShippingOption, deleteShippingOption,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore fora do StoreProvider')
  return ctx
}
