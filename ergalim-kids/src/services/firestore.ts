/**
 * Firestore Service — CRUD para todas as coleções
 *
 * Coleções:
 *   /products    → produtos da loja
 *   /orders      → pedidos
 *   /settings    → configuração única da loja (doc "main")
 *   /coupons     → cupons de desconto
 *   /customers   → perfil dos clientes (sincronizado via Firebase Auth)
 */
import {
  collection, doc, getDocs, getDoc, addDoc, setDoc,
  updateDoc, deleteDoc, onSnapshot, query, orderBy,
  serverTimestamp, Unsubscribe
} from 'firebase/firestore'
import { db, ensureAuth } from '@/lib/firebase'
import type { Product, Order, SiteSettings, Coupon, CustomerProfile } from '@/types'

/**
 * Remove campos undefined de um objeto (o Firestore rejeita undefined).
 * Percorre objetos e arrays recursivamente.
 */
function clean<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) {
    return obj.map(v => clean(v)) as unknown as T
  }
  if (typeof obj === 'object') {
    const result: any = {}
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value === undefined) continue
      result[key] = clean(value)
    }
    return result
  }
  return obj
}

// ── PRODUTOS ────────────────────────────────────────────────────────────────
export const productsRef = () => collection(db, 'products')

export async function fbGetProducts(): Promise<Product[]> {
  const snap = await getDocs(query(productsRef(), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
}

export async function fbAddProduct(p: Omit<Product, 'id'>): Promise<string> {
  await ensureAuth()
  const ref = await addDoc(productsRef(), clean({ ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }))
  return ref.id
}

export async function fbUpdateProduct(id: string, p: Partial<Product>) {
  await ensureAuth()
  await updateDoc(doc(db, 'products', id), clean({ ...p, updatedAt: serverTimestamp() }))
}

export async function fbDeleteProduct(id: string) {
  await ensureAuth()
  await deleteDoc(doc(db, 'products', id))
}

export function fbWatchProducts(cb: (products: Product[]) => void): Unsubscribe {
  return onSnapshot(
    query(productsRef(), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))),
    err => console.warn('Watch produtos:', err.code)
  )
}

// ── PEDIDOS ─────────────────────────────────────────────────────────────────
export const ordersRef = () => collection(db, 'orders')

export async function fbGetOrders(): Promise<Order[]> {
  const snap = await getDocs(query(ordersRef(), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
}

export async function fbAddOrder(o: Omit<Order, 'id'>): Promise<string> {
  await ensureAuth()
  // Usa o id e createdAt que já vêm do contexto (string ISO previsível).
  // Não usa serverTimestamp para evitar datas nulas durante o snapshot.
  const id = (o as any).id || `EK-${Date.now().toString().slice(-6)}`
  await setDoc(doc(db, 'orders', id), clean({ ...o }))
  return id
}

export async function fbUpdateOrder(id: string, patch: Partial<Order>) {
  await ensureAuth()
  await updateDoc(doc(db, 'orders', id), clean({ ...patch, updatedAt: serverTimestamp() }))
}

export function fbWatchOrders(cb: (orders: Order[]) => void): Unsubscribe {
  return onSnapshot(
    query(ordersRef(), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))),
    err => console.warn('Watch pedidos (normal se nao logado):', err.code)
  )
}

// ── CONFIGURAÇÕES ────────────────────────────────────────────────────────────
export async function fbGetSettings(): Promise<Partial<SiteSettings>> {
  const snap = await getDoc(doc(db, 'settings', 'main'))
  return snap.exists() ? (snap.data() as Partial<SiteSettings>) : {}
}

export async function fbUpdateSettings(patch: Partial<SiteSettings>) {
  await ensureAuth()
  await setDoc(doc(db, 'settings', 'main'), clean(patch), { merge: true })
}

// ✅ NOVO: Watch de settings em tempo real — qualquer mudança no admin
//    aparece em todos os dispositivos sem precisar recarregar
export function fbWatchSettings(cb: (s: Partial<SiteSettings>) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'settings', 'main'),
    snap => { if (snap.exists()) cb(snap.data() as Partial<SiteSettings>) },
    err => console.warn('Watch settings:', err.code)
  )
}

// ── CUPONS ───────────────────────────────────────────────────────────────────
export const couponsRef = () => collection(db, 'coupons')

export async function fbGetCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(couponsRef())
  return snap.docs.map(d => ({ ...d.data() } as Coupon))
}

export async function fbAddCoupon(c: Coupon) {
  await ensureAuth()
  await setDoc(doc(db, 'coupons', c.code), clean(c))
}

export async function fbUpdateCoupon(code: string, patch: Partial<Coupon>) {
  await ensureAuth()
  await updateDoc(doc(db, 'coupons', code), clean(patch))
}

export async function fbDeleteCoupon(code: string) {
  await ensureAuth()
  await deleteDoc(doc(db, 'coupons', code))
}

// ✅ NOVO: Watch de cupons em tempo real
export function fbWatchCoupons(cb: (coupons: Coupon[]) => void): Unsubscribe {
  return onSnapshot(
    couponsRef(),
    snap => cb(snap.docs.map(d => ({ ...d.data() } as Coupon)))
  )
}

// ── PERFIL DO CLIENTE ────────────────────────────────────────────────────────
// ✅ Agora os clientes são salvos no Firestore (coleção /customers)
//    em vez de localStorage — funcionando em qualquer dispositivo

export async function fbGetCustomer(userId: string): Promise<CustomerProfile | null> {
  const snap = await getDoc(doc(db, 'customers', userId))
  return snap.exists() ? (snap.data() as CustomerProfile) : null
}

export async function fbSaveCustomer(userId: string, data: Partial<CustomerProfile>) {
  await setDoc(doc(db, 'customers', userId), clean({ ...data, updatedAt: serverTimestamp() }), { merge: true })
}

// ✅ NOVO: Watch do perfil do cliente em tempo real
export function fbWatchCustomer(userId: string, cb: (profile: CustomerProfile | null) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'customers', userId),
    snap => cb(snap.exists() ? (snap.data() as CustomerProfile) : null)
  )
}

// ── LISTAR CLIENTES (para email marketing) ───────────────────────────────────
export async function fbGetAllCustomers(): Promise<{ email: string; name: string }[]> {
  const snap = await getDocs(collection(db, 'customers'))
  return snap.docs
    .map(d => d.data())
    .filter(c => c.email)
    .map(c => ({ email: c.email as string, name: (c.name as string) || 'Cliente' }))
}
