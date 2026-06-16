import React, { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { CreditCard, LayoutDashboard, Package, ShoppingBag,
  BarChart2, Tag, Truck, Menu, X, LogOut, ChevronRight, Star
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useStore } from '@/context/StoreContext'

// Menu do dono: Dashboard → Produtos → Pedidos → Financeiro (+ extras se habilitados)
const BASE_MENU = [
  { label: 'Dashboard',  href: '/owner',            icon: LayoutDashboard, permKey: null,                    desc: 'Resumo da loja' },
  { label: 'Produtos',   href: '/owner/products',   icon: Package,         permKey: 'canManageProducts',     desc: 'Add, editar, remover' },
  { label: 'Pedidos',    href: '/owner/orders',      icon: ShoppingBag,     permKey: 'canViewOrders',         desc: 'Ver e atualizar status' },
  { label: 'Financeiro', href: '/owner/financial',   icon: BarChart2,       permKey: 'canViewFinancial',      desc: 'Receitas e relatórios' },
  { label: 'Promoções',  href: '/owner/promotions',  icon: Tag,             permKey: 'canManagePromotions',   desc: 'Cupons e descontos' },
  { label: 'Entrega',    href: '/owner/shipping',    icon: Truck,           permKey: 'canManageShipping',     desc: 'Opções de envio' },
  { label: 'Pagamento',  href: '/owner/payment',     icon: CreditCard,      permKey: 'canManagePaymentGateway',     desc: 'Mercado Pago / PIX' },
  { label: 'Transportadoras', href: '/owner/freight', icon: Truck,          permKey: 'canManageShipping',     desc: 'Frete e envio' },
] as const

export default function OwnerLayout() {
  const { user, isOwner, loading, logout } = useAuth()
  const { ownerPermissions } = useStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page">
      <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!isOwner) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace/>

  // Filtra conforme permissões liberadas pelo admin
  const visibleMenu = BASE_MENU.filter(item => {
    if (!item.permKey) return true
    return (ownerPermissions as any)[item.permKey] !== false
  })

  return (
    <div className="min-h-screen bg-bg-page flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}/>
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-60 bg-white border-r-2 border-gray-100
        flex flex-col transform transition-transform duration-200 shadow-kid
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b-2 border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <Star size={18} fill="#FFD600" color="#FFD600"/>
            <span className="font-black text-brand-navy text-lg">ergalim <span className="text-brand-pink">kids</span></span>
          </Link>
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
            <X size={18}/>
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b-2 border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-black">
              {user?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-brand-navy text-sm font-black truncate">{user?.name}</p>
              <span className="text-[11px] font-black text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded-full">
                🏪 Proprietário
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {visibleMenu.map(({ label, href, icon: Icon, permKey, desc }) => {
            const active = href === '/owner'
              ? location.pathname === '/owner'
              : location.pathname.startsWith(href)
            return (
              <Link key={href} to={href} className={`
                flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all
                ${active
                  ? 'bg-brand-navy text-white shadow-kid-sm'
                  : 'text-gray-500 hover:bg-bg-soft hover:text-brand-navy'}
              `}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <Icon size={15}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black leading-none">{label}</p>
                  <p className={`text-[10px] mt-0.5 truncate ${active ? 'text-white/60' : 'text-gray-400'}`}>{desc}</p>
                </div>
                {active && <ChevronRight size={14} className="shrink-0"/>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t-2 border-gray-100 space-y-1">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-brand-navy rounded-xl hover:bg-bg-soft transition-colors font-bold">
            ← Ver a loja
          </Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors w-full font-bold">
            <LogOut size={15}/> Sair
          </button>
        </div>
      </aside>

      {/* ── CONTEÚDO ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 bg-white border-b-2 border-gray-100 flex items-center px-5 gap-3">
          <button className="lg:hidden btn-ghost p-2 mr-1" onClick={() => setSidebarOpen(true)}>
            <Menu size={18}/>
          </button>
          <span className="font-black text-brand-navy">Painel da Loja</span>
        </div>
        <main className="flex-1 p-5 overflow-auto">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
