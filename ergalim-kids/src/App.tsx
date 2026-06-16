import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { useStore } from '@/context/StoreContext'
import { CartProvider } from '@/context/CartContext'
import { StoreProvider } from '@/context/StoreContext'
import { CustomerProvider } from '@/context/CustomerContext'
import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/layout/AdminLayout'
import OwnerLayout from '@/components/layout/OwnerLayout'

// ── Loja pública ──────────────────────────────────────────────────────────
const HomePage         = lazy(() => import('@/pages/HomePage'))
const ShopPage         = lazy(() => import('@/pages/ShopPage'))
const ProductPage      = lazy(() => import('@/pages/ProductPage'))
const CartPage         = lazy(() => import('@/pages/CartPage'))
const CheckoutPage     = lazy(() => import('@/pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'))
const NotFoundPage     = lazy(() => import('@/pages/NotFoundPage'))

// ── Auth ──────────────────────────────────────────────────────────────────
const LoginPage        = lazy(() => import('@/pages/LoginPage'))
const RegisterPage     = lazy(() => import('@/pages/auth/RegisterPage'))

// ── Conta do cliente ──────────────────────────────────────────────────────
const AccountPage      = lazy(() => import('@/pages/account/AccountPage'))
const AccountOrders    = lazy(() => import('@/pages/account/AccountOrders'))

// ── Admin ─────────────────────────────────────────────────────────────────
const AdminDashboard   = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminProducts    = lazy(() => import('@/pages/admin/AdminProducts'))
const AdminOrders      = lazy(() => import('@/pages/admin/AdminOrders'))
const AdminCustomers   = lazy(() => import('@/pages/admin/AdminCustomers'))
const AdminFinancial   = lazy(() => import('@/pages/admin/AdminFinancial'))
const AdminCustomize   = lazy(() => import('@/pages/admin/AdminCustomize'))
const AdminShipping    = lazy(() => import('@/pages/admin/AdminShipping'))
const AdminSettings    = lazy(() => import('@/pages/admin/AdminSettings'))
const AdminPermissions = lazy(() => import('@/pages/admin/AdminPermissions'))
const AdminPayment     = lazy(() => import('@/pages/admin/AdminPayment'))
const AdminMarketing   = lazy(() => import('@/pages/admin/AdminMarketing'))
const AdminEmailMessages = lazy(() => import('@/pages/admin/AdminEmailMessages'))

// ── Dono ──────────────────────────────────────────────────────────────────
const OwnerDashboard   = lazy(() => import('@/pages/owner/OwnerDashboard'))
const OwnerProducts    = lazy(() => import('@/pages/owner/OwnerProducts'))
const OwnerOrders      = lazy(() => import('@/pages/owner/OwnerOrders'))
const OwnerFinancial   = lazy(() => import('@/pages/owner/OwnerFinancial'))
const OwnerPromotions  = lazy(() => import('@/pages/owner/OwnerPromotions'))
const OwnerShipping    = lazy(() => import('@/pages/owner/OwnerShipping'))

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-page">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-[3px] border-brand-pink border-t-transparent rounded-full animate-spin"/>
      <p className="text-sm text-gray-400 font-black">Carregando...</p>
    </div>
  </div>
)

// CustomerProvider precisa do userId do contexto Auth
function AppWithCustomer({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return <CustomerProvider userId={user?.id}>{children}</CustomerProvider>
}

// CartWithCoupons injeta os cupons do Firebase no CartProvider
function CartWithCoupons({ children }: { children: React.ReactNode }) {
  const { coupons } = useStore()
  return <CartProvider coupons={coupons}>{children}</CartProvider>
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AuthProvider>
          <AppWithCustomer>
            <CartWithCoupons>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: { borderRadius:'16px', fontSize:'14px', fontWeight:'800', fontFamily:'Nunito, sans-serif' }
                }}
              />
              <Suspense fallback={<Loading/>}>
                <Routes>
                  {/* ── LOJA PÚBLICA ─────────────────────────────── */}
                  <Route element={<Layout/>}>
                    <Route index              element={<HomePage/>}/>
                    <Route path="shop"        element={<ShopPage/>}/>
                    <Route path="product/:id" element={<ProductPage/>}/>
                    <Route path="cart"        element={<CartPage/>}/>
                    <Route path="checkout"    element={<CheckoutPage/>}/>
                    <Route path="order-success" element={<OrderSuccessPage/>}/>
                    {/* Conta do cliente */}
                    <Route path="account"         element={<AccountPage/>}/>
                    <Route path="account/orders"  element={<AccountOrders/>}/>
                    <Route path="*"           element={<NotFoundPage/>}/>
                  </Route>

                  {/* ── AUTH ─────────────────────────────────────── */}
                  <Route path="login"    element={<LoginPage/>}/>
                  <Route path="register" element={<RegisterPage/>}/>

                  {/* ── ADMIN ────────────────────────────────────── */}
                  <Route path="admin" element={<AdminLayout/>}>
                    <Route index               element={<AdminDashboard/>}/>
                    <Route path="products"     element={<AdminProducts/>}/>
                    <Route path="orders"       element={<AdminOrders/>}/>
                    <Route path="customers"    element={<AdminCustomers/>}/>
                    <Route path="financial"    element={<AdminFinancial/>}/>
                    <Route path="customize"    element={<AdminCustomize/>}/>
                    <Route path="shipping"     element={<AdminShipping/>}/>
                    <Route path="settings"     element={<AdminSettings/>}/>
                    <Route path="permissions"  element={<AdminPermissions/>}/>
                    <Route path="payment"      element={<AdminPayment/>}/>
                    <Route path="marketing"    element={<AdminMarketing/>}/>
                    <Route path="email-messages" element={<AdminEmailMessages/>}/>
                  </Route>

                  {/* ── DONO ─────────────────────────────────────── */}
                  <Route path="owner" element={<OwnerLayout/>}>
                    <Route index               element={<OwnerDashboard/>}/>
                    <Route path="products"     element={<OwnerProducts/>}/>
                    <Route path="orders"       element={<OwnerOrders/>}/>
                    <Route path="financial"    element={<OwnerFinancial/>}/>
                    <Route path="promotions"   element={<OwnerPromotions/>}/>
                    <Route path="shipping"     element={<OwnerShipping/>}/>
                  </Route>
                </Routes>
              </Suspense>
            </CartWithCoupons>
          </AppWithCustomer>
        </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  )
}
