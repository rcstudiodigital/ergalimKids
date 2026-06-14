import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Product, Order, SiteSettings, OwnerPermissions, Coupon, ShippingOption } from '@/types'
import { INITIAL_PRODUCTS, INITIAL_ORDERS, DEFAULT_SETTINGS, DEFAULT_OWNER_PERMISSIONS, INITIAL_COUPONS } from '@/data/store'
import { genId } from '@/utils/security'

interface StoreContextType {
  products: Product[]
  orders: Order[]
  settings: SiteSettings
  ownerPermissions: OwnerPermissions
  coupons: Coupon[]
  // Products
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProduct: (p: Product) => void
  deleteProduct: (id: string) => void
  // Orders
  updateOrder: (id: string, patch: Partial<Order>) => void
  // Settings
  updateSettings: (s: Partial<SiteSettings>) => void
  // Shipping (subset of settings)
  addShippingOption: (opt: Omit<ShippingOption, 'id'>) => void
  updateShippingOption: (opt: ShippingOption) => void
  deleteShippingOption: (id: string) => void
  // Permissions (admin only)
  updateOwnerPermissions: (p: OwnerPermissions) => void
  // Coupons
  addCoupon: (c: Coupon) => void
  updateCoupon: (c: Coupon) => void
  deleteCoupon: (code: string) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [ownerPermissions, setOwnerPermissions] = useState<OwnerPermissions>(DEFAULT_OWNER_PERMISSIONS)
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS)

  const addProduct = useCallback((p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    setProducts(prev => [{ ...p, id: genId(), createdAt: now, updatedAt: now }, ...prev])
  }, [])

  const updateProduct = useCallback((p: Product) =>
    setProducts(prev => prev.map(x => x.id === p.id ? { ...p, updatedAt: new Date().toISOString() } : x)), [])

  const deleteProduct = useCallback((id: string) =>
    setProducts(prev => prev.filter(x => x.id !== id)), [])

  const updateOrder = useCallback((id: string, patch: Partial<Order>) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o)), [])

  const updateSettings = useCallback((s: Partial<SiteSettings>) =>
    setSettings(prev => ({ ...prev, ...s })), [])

  // Shipping helpers
  const addShippingOption = useCallback((opt: Omit<ShippingOption, 'id'>) =>
    setSettings(prev => ({
      ...prev,
      shippingOptions: [...prev.shippingOptions, { ...opt, id: genId() }]
    })), [])

  const updateShippingOption = useCallback((opt: ShippingOption) =>
    setSettings(prev => ({
      ...prev,
      shippingOptions: prev.shippingOptions.map(s => s.id === opt.id ? opt : s)
    })), [])

  const deleteShippingOption = useCallback((id: string) =>
    setSettings(prev => ({
      ...prev,
      shippingOptions: prev.shippingOptions.filter(s => s.id !== id)
    })), [])

  const updateOwnerPermissions = useCallback((p: OwnerPermissions) =>
    setOwnerPermissions(p), [])

  const addCoupon = useCallback((c: Coupon) =>
    setCoupons(prev => [c, ...prev]), [])

  const updateCoupon = useCallback((c: Coupon) =>
    setCoupons(prev => prev.map(x => x.code === c.code ? c : x)), [])

  const deleteCoupon = useCallback((code: string) =>
    setCoupons(prev => prev.filter(x => x.code !== code)), [])

  return (
    <StoreContext.Provider value={{
      products, orders, settings, ownerPermissions, coupons,
      addProduct, updateProduct, deleteProduct,
      updateOrder,
      updateSettings, addShippingOption, updateShippingOption, deleteShippingOption,
      updateOwnerPermissions,
      addCoupon, updateCoupon, deleteCoupon,
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
