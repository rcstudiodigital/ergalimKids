/**
 * StoreContext — Gerencia produtos, pedidos, configurações e cupons
 *
 * PERSISTÊNCIA LOCAL:
 * - Produtos, pedidos, configurações e cupons são salvos no localStorage
 * - Ao recarregar a página, os dados são restaurados
 * - Para banco de dados real, substituir as chamadas de localStorage por API calls
 */
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { Product, Order, SiteSettings, OwnerPermissions, Coupon, ShippingOption } from '@/types'
import { INITIAL_PRODUCTS, INITIAL_ORDERS, DEFAULT_SETTINGS, DEFAULT_OWNER_PERMISSIONS, INITIAL_COUPONS } from '@/data/store'
import { genId } from '@/utils/security'

interface StoreContextType {
  products:         Product[]
  orders:           Order[]
  settings:         SiteSettings
  ownerPermissions: OwnerPermissions
  coupons:          Coupon[]
  addProduct:       (p: Omit<Product,'id'|'createdAt'|'updatedAt'>) => void
  updateProduct:    (p: Product) => void
  deleteProduct:    (id: string) => void
  addOrder:         (o: Omit<Order,'id'|'createdAt'|'updatedAt'>) => string
  updateOrder:      (id: string, patch: Partial<Order>) => void
  updateSettings:   (patch: Partial<SiteSettings>) => void
  updateOwnerPermissions: (p: OwnerPermissions) => void
  addCoupon:        (c: Coupon) => void
  updateCoupon:     (code: string, patch: Partial<Coupon>) => void
  deleteCoupon:     (code: string) => void
  addShippingOption:    (opt: Omit<ShippingOption,'id'>) => void
  updateShippingOption: (id: string, patch: Partial<ShippingOption>) => void
  deleteShippingOption: (id: string) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

// ── Helpers de localStorage ──────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products,         setProducts]         = useState<Product[]>(() => load('ek_products', INITIAL_PRODUCTS))
  const [orders,           setOrders]           = useState<Order[]>(() => load('ek_orders', INITIAL_ORDERS))
  const [settings,         setSettings]         = useState<SiteSettings>(() => {
    const saved = load<Partial<SiteSettings>>('ek_settings', {})
    return { ...DEFAULT_SETTINGS, ...saved }
  })
  const [ownerPermissions, setOwnerPermissions] = useState<OwnerPermissions>(() => load('ek_permissions', DEFAULT_OWNER_PERMISSIONS))
  const [coupons,          setCoupons]          = useState<Coupon[]>(() => load('ek_coupons', INITIAL_COUPONS))

  // Persistir sempre que mudar
  useEffect(() => save('ek_products',    products),         [products])
  useEffect(() => save('ek_orders',      orders),           [orders])
  useEffect(() => save('ek_settings',    settings),         [settings])
  useEffect(() => save('ek_permissions', ownerPermissions), [ownerPermissions])
  useEffect(() => save('ek_coupons',     coupons),          [coupons])

  // ── Produtos ─────────────────────────────────────────────────────────
  const addProduct = useCallback((p: Omit<Product,'id'|'createdAt'|'updatedAt'>) => {
    const now = new Date().toISOString()
    setProducts(prev => [{ ...p, id: genId(), createdAt: now, updatedAt: now }, ...prev])
  }, [])

  const updateProduct = useCallback((p: Product) => {
    setProducts(prev => prev.map(x => x.id === p.id ? { ...p, updatedAt: new Date().toISOString() } : x))
  }, [])

  const deleteProduct = useCallback((id: string) =>
    setProducts(prev => prev.filter(p => p.id !== id)), [])

  // ── Pedidos ───────────────────────────────────────────────────────────
  const addOrder = useCallback((o: Omit<Order,'id'|'createdAt'|'updatedAt'>): string => {
    const now = new Date().toISOString()
    const id = `EK-${Date.now().toString().slice(-6)}`
    setOrders(prev => [{ ...o, id, createdAt: now, updatedAt: now }, ...prev])
    return id
  }, [])

  const updateOrder = useCallback((id: string, patch: Partial<Order>) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o)), [])

  // ── Configurações ─────────────────────────────────────────────────────
  const updateSettings = useCallback((patch: Partial<SiteSettings>) =>
    setSettings(prev => ({ ...prev, ...patch })), [])

  const updateOwnerPermissions = useCallback((p: OwnerPermissions) =>
    setOwnerPermissions(p), [])

  // ── Cupons ────────────────────────────────────────────────────────────
  const addCoupon    = useCallback((c: Coupon) => setCoupons(prev => [...prev, c]), [])
  const updateCoupon = useCallback((code: string, patch: Partial<Coupon>) =>
    setCoupons(prev => prev.map(c => c.code === code ? { ...c, ...patch } : c)), [])
  const deleteCoupon = useCallback((code: string) =>
    setCoupons(prev => prev.filter(c => c.code !== code)), [])

  // ── Entrega ───────────────────────────────────────────────────────────
  const addShippingOption = useCallback((opt: Omit<ShippingOption,'id'>) =>
    updateSettings({ shippingOptions: [...(settings.shippingOptions || []), { ...opt, id: genId() }] }), [settings, updateSettings])

  const updateShippingOption = useCallback((id: string, patch: Partial<ShippingOption>) =>
    updateSettings({ shippingOptions: (settings.shippingOptions || []).map(s => s.id === id ? { ...s, ...patch } : s) }), [settings, updateSettings])

  const deleteShippingOption = useCallback((id: string) =>
    updateSettings({ shippingOptions: (settings.shippingOptions || []).filter(s => s.id !== id) }), [settings, updateSettings])

  return (
    <StoreContext.Provider value={{
      products, orders, settings, ownerPermissions, coupons,
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
