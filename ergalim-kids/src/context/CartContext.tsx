import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { CartItem, Product } from '@/types'
import { INITIAL_COUPONS } from '@/data/store'

interface CartContextType {
  items: CartItem[]; addItem: (p: Product, size: string, color: string, qty?: number) => void
  removeItem: (id: string, size: string, color: string) => void
  updateQty: (id: string, size: string, color: string, qty: number) => void
  clearCart: () => void; total: number; subtotal: number; itemCount: number
  shipping: number; discount: number; coupon: string | null
  selectedShippingId: string | null; setSelectedShippingId: (id: string | null) => void
  applyCoupon: (code: string) => boolean; removeCoupon: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [coupon, setCoupon] = useState<string | null>(null)
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null)

  useEffect(() => {
    const s = localStorage.getItem('ek_cart')
    if (s) try { setItems(JSON.parse(s)) } catch {}
    const c = localStorage.getItem('ek_coupon')
    if (c) setCoupon(c)
  }, [])

  useEffect(() => { localStorage.setItem('ek_cart', JSON.stringify(items)) }, [items])

  const addItem = useCallback((product: Product, selectedSize: string, selectedColor: string, qty = 1) => {
    setItems(prev => {
      const ex = prev.find(i => i.product.id === product.id && i.selectedSize === selectedSize && i.selectedColor === selectedColor)
      if (ex) return prev.map(i => i.product.id === product.id && i.selectedSize === selectedSize && i.selectedColor === selectedColor ? { ...i, quantity: i.quantity + qty } : i)
      return [...prev, { product, quantity: qty, selectedSize, selectedColor }]
    })
  }, [])

  const removeItem = useCallback((id: string, size: string, color: string) =>
    setItems(prev => prev.filter(i => !(i.product.id === id && i.selectedSize === size && i.selectedColor === color))), [])

  const updateQty = useCallback((id: string, size: string, color: string, qty: number) => {
    if (qty < 1) { removeItem(id, size, color); return }
    setItems(prev => prev.map(i => i.product.id === id && i.selectedSize === size && i.selectedColor === color ? { ...i, quantity: qty } : i))
  }, [removeItem])

  const clearCart = useCallback(() => { setItems([]); localStorage.removeItem('ek_cart') }, [])

  const subtotal = items.reduce((a, i) => a + i.product.price * i.quantity, 0)
  const couponObj = coupon ? INITIAL_COUPONS.find(c => c.code === coupon) : null
  const discount = couponObj ? subtotal * couponObj.discount : 0
  const shipping = 0 // será calculado no checkout baseado na opção selecionada
  const total = subtotal - discount + shipping
  const itemCount = items.reduce((a, i) => a + i.quantity, 0)

  const applyCoupon = useCallback((code: string): boolean => {
    const found = INITIAL_COUPONS.find(c => c.code === code.toUpperCase() && c.active)
    if (!found) return false
    if (found.minValue && subtotal < found.minValue) return false
    setCoupon(found.code); localStorage.setItem('ek_coupon', found.code); return true
  }, [subtotal])

  const removeCoupon = useCallback(() => { setCoupon(null); localStorage.removeItem('ek_coupon') }, [])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, subtotal, itemCount, shipping, discount, coupon, selectedShippingId, setSelectedShippingId, applyCoupon, removeCoupon }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart fora do CartProvider')
  return ctx
}
