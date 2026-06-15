/**
 * Firestore Service — CRUD para todas as coleções
 * 
 * Coleções:
 *   /products    → produtos da loja
 *   /orders      → pedidos
 *   /settings    → configuração única da loja (doc "main")
 *   /coupons     → cupons de desconto
 *   /customers   → perfil dos clientes
 */
import {
  collection, doc, getDocs, getDoc, addDoc, setDoc,
  updateDoc, deleteDoc, onSnapshot, query, orderBy,
  serverTimestamp, Unsubscribe
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Product, Order, SiteSettings, Coupon } from '@/types'

// ── PRODUTOS ────────────────────────────────────────────────────────────────
export const productsRef = () => collection(db, 'products')

export async function fbGetProducts(): Promise<Product[]> {
  const snap = await getDocs(query(productsRef(), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
}

export async function fbAddProduct(p: Omit<Product,'id'>): Promise<string> {
  const ref = await addDoc(productsRef(), { ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export async function fbUpdateProduct(id: string, p: Partial<Product>) {
  await updateDoc(doc(db, 'products', id), { ...p, updatedAt: serverTimestamp() })
}

export async function fbDeleteProduct(id: string) {
  await deleteDoc(doc(db, 'products', id))
}

export function fbWatchProducts(cb: (products: Product[]) => void): Unsubscribe {
  return onSnapshot(
    query(productsRef(), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)))
  )
}

// ── PEDIDOS ─────────────────────────────────────────────────────────────────
export const ordersRef = () => collection(db, 'orders')

export async function fbGetOrders(): Promise<Order[]> {
  const snap = await getDocs(query(ordersRef(), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
}

export async function fbAddOrder(o: Omit<Order,'id'>): Promise<string> {
  const id = `EK-${Date.now().toString().slice(-6)}`
  await setDoc(doc(db, 'orders', id), { ...o, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return id
}

export async function fbUpdateOrder(id: string, patch: Partial<Order>) {
  await updateDoc(doc(db, 'orders', id), { ...patch, updatedAt: serverTimestamp() })
}

export function fbWatchOrders(cb: (orders: Order[]) => void): Unsubscribe {
  return onSnapshot(
    query(ordersRef(), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)))
  )
}

// ── CONFIGURAÇÕES ────────────────────────────────────────────────────────────
export async function fbGetSettings(): Promise<Partial<SiteSettings>> {
  const snap = await getDoc(doc(db, 'settings', 'main'))
  return snap.exists() ? snap.data() as Partial<SiteSettings> : {}
}

export async function fbUpdateSettings(patch: Partial<SiteSettings>) {
  await setDoc(doc(db, 'settings', 'main'), patch, { merge: true })
}

// ── CUPONS ───────────────────────────────────────────────────────────────────
export const couponsRef = () => collection(db, 'coupons')

export async function fbGetCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(couponsRef())
  return snap.docs.map(d => ({ ...d.data() } as Coupon))
}

export async function fbAddCoupon(c: Coupon) {
  await setDoc(doc(db, 'coupons', c.code), c)
}

export async function fbUpdateCoupon(code: string, patch: Partial<Coupon>) {
  await updateDoc(doc(db, 'coupons', code), patch)
}

export async function fbDeleteCoupon(code: string) {
  await deleteDoc(doc(db, 'coupons', code))
}

// ── PERFIL DO CLIENTE ────────────────────────────────────────────────────────
export async function fbGetCustomer(userId: string) {
  const snap = await getDoc(doc(db, 'customers', userId))
  return snap.exists() ? snap.data() : null
}

export async function fbSaveCustomer(userId: string, data: object) {
  await setDoc(doc(db, 'customers', userId), data, { merge: true })
}
