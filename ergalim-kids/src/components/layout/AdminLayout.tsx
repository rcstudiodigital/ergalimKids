import React, { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  BarChart2, Palette, Shield, CreditCard,
  Menu, X, LogOut, ChevronRight, Star, Settings, Truck,
  Megaphone, Mail
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const MENU = [
  // ── Visão geral
  { label: 'Dashboard',    href: '/admin',              icon: LayoutDashboard, desc: 'Resumo da loja' },
  // ── Loja
  { label: 'Produtos',     href: '/admin/products',     icon: Package,         desc: 'Adicionar / editar / remover' },
  { label: 'Pedidos',      href: '/admin/orders',       icon: ShoppingBag,     desc: 'Todos os pedidos' },
  { label: 'Clientes',     href: '/admin/customers',    icon: Users,           desc: 'Cadastros e histórico' },
  { label: 'E-mail Marketing', href: '/admin/marketing', icon: Megaphone,    desc: 'Promoções e novidades' },
  { label: 'Mensagens E-mail',  href: '/admin/email-messages', icon: Mail,     desc: 'Textos dos e-mails automáticos' },
  { label: 'Financeiro',   href: '/admin/financial',    icon: BarChart2,       desc: 'Receitas e relatórios' },
  // ── Site
  { label: 'Personalizar', href: '/admin/customize',    icon: Palette,         desc: 'Cores, textos, home' },
  { label: 'Entrega',      href: '/admin/shipping',     icon: Truck,           desc: 'Opções de envio' },
  { label: 'Configurações',href: '/admin/settings',     icon: Settings,        desc: 'Dados da loja + gateway' },
  // ── Acesso
  { label: 'Permissões',   href: '/admin/permissions',  icon: Shield,          desc: 'O que o dono pode fazer' },
  { label: 'Pagamento',    href: '/admin/payment',      icon: CreditCard,      desc: 'Mercado Pago / Stripe' },
]

export default function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!isAdmin) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace/>

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}/>
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800
        flex flex-col transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <Star size={18} fill="#FFD600" color="#FFD600"/>
            <span className="font-black text-white text-lg">ergalim <span className="text-brand-pink">kids</span></span>
          </Link>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={18}/>
          </button>
        </div>

        {/* User badge */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-white font-black">
              {user?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-black truncate">{user?.name}</p>
              <span className="text-[11px] font-black text-brand-pink bg-brand-pink/15 px-2 py-0.5 rounded-full">
                🔐 Admin
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {MENU.map(({ label, href, icon: Icon, desc }) => {
            const active = href === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(href)
            return (
              <Link key={href} to={href} className={`
                flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all
                ${active
                  ? 'bg-brand-pink text-white shadow-kid-sm'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              `}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-white/20' : 'bg-gray-800'}`}>
                  <Icon size={15}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black leading-none">{label}</p>
                  <p className={`text-[10px] mt-0.5 truncate ${active ? 'text-white/70' : 'text-gray-600'}`}>{desc}</p>
                </div>
                {active && <ChevronRight size={14} className="shrink-0"/>}
              </Link>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-white rounded-xl hover:bg-gray-800 transition-colors font-bold">
            ← Ver a loja pública
          </Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors w-full font-bold">
            <LogOut size={15}/> Sair
          </button>
        </div>
      </aside>

      {/* ── CONTEÚDO ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-5 gap-3">
          <button className="lg:hidden btn-ghost p-2 text-gray-400" onClick={() => setSidebarOpen(true)}>
            <Menu size={18}/>
          </button>
          <span className="text-gray-400 text-sm font-bold">Painel Admin</span>
          <div className="ml-auto">
            <span className="text-xs text-gray-600 font-mono bg-gray-800 px-3 py-1 rounded-lg">{user?.email}</span>
          </div>
        </div>
        <main className="flex-1 p-5 overflow-auto bg-gray-950 text-gray-100">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
