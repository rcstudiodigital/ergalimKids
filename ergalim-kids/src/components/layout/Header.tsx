import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Search, Menu, X, User, ChevronDown, Package, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'

const STAR_SVG = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 2L17.5 10.5L26.5 11.5L20 17.5L22 26.5L14 22L6 26.5L8 17.5L1.5 11.5L10.5 10.5L14 2Z"
      fill="#FF3D9A" stroke="#1A2B6B" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M14 5L16.8 11.8L24 12.6L18.8 17.4L20.4 24.6L14 21L7.6 24.6L9.2 17.4L4 12.6L11.2 11.8L14 5Z"
      fill="#FFD600"/>
  </svg>
)

const NAV = [
  { label: '🏠 Início',     href: '/' },
  { label: '👦 Meninos',   href: '/shop?category=Masculino' },
  { label: '👧 Meninas',   href: '/shop?category=Feminino' },
  { label: '✨ Novidades',  href: '/shop?new=true' },
  { label: '🏷️ Promoções', href: '/shop?sale=true', hot: true },
]

export default function Header() {
  const { user, logout, isAdmin, isOwner } = useAuth()
  const { itemCount } = useCart()
  const { settings } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mob, setMob]           = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMob(false); setUserMenu(false) }, [location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) { navigate(`/shop?q=${encodeURIComponent(q.trim())}`); setSearchOpen(false); setQ('') }
  }

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>

      {/* ── FAIXA TOPO ──────────────────────────────────────────────── */}
      <div className="bg-brand-navy text-white text-xs text-center py-2 font-bold tracking-wide">
        🚀 Frete grátis acima de R$299 · Use <span className="text-brand-yellow font-black">ERGALIM10</span> e ganhe 10% OFF! 🎁
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────────────── */}
      <div className={`bg-white border-b-3 border-brand-pink transition-all duration-300`}
           style={{borderBottomWidth:'3px', borderBottomColor:'#FF3D9A'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Mobile burger */}
            <button onClick={() => setMob(!mob)} className="btn-ghost p-2 lg:hidden">
              {mob ? <X size={22}/> : <Menu size={22}/>}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="group-hover:animate-wiggle">
                <STAR_SVG/>
              </div>
              <div className="leading-none">
                <span className="font-black text-xl text-brand-navy tracking-tight">ergalim</span>
                <span className="font-black text-xl text-brand-pink"> kids</span>
                <div className="text-[10px] font-bold text-brand-pink/70 tracking-widest">MODA INFANTIL</div>
              </div>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map(link => (
                <Link key={link.href} to={link.href}
                  className={`px-3 py-2 rounded-2xl text-sm font-black transition-all hover:bg-bg-soft hover:scale-105
                    ${link.hot ? 'text-brand-pink' : 'text-brand-navy'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Ações */}
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} className="btn-ghost p-2.5">
                <Search size={19}/>
              </button>

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-1.5 bg-bg-soft px-3 py-2 rounded-2xl font-black text-sm text-brand-navy hover:bg-bg-blue transition-colors">
                    <div className="w-6 h-6 rounded-full bg-brand-pink flex items-center justify-center text-white text-xs font-black">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={13} className={`transition-transform ${userMenu ? 'rotate-180' : ''}`}/>
                  </button>
                  {userMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-3xl border-2 border-gray-100 shadow-kid-lg py-2 z-50 animate-pop">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-400 font-bold">Olá, {user.name.split(' ')[0]}! 👋</p>
                        <p className="text-xs text-brand-navy font-black truncate">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-bg-soft rounded-2xl mx-1">
                          <Settings size={15} className="text-brand-pink"/> Painel Admin
                        </Link>
                      )}
                      {isOwner && !isAdmin && (
                        <Link to="/owner" className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-bg-soft rounded-2xl mx-1">
                          <Package size={15} className="text-brand-pink"/> Painel da Loja
                        </Link>
                      )}
                      <Link to="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-bg-soft rounded-2xl mx-1">
                        <Package size={15} className="text-brand-pink"/> Meus Pedidos
                      </Link>
                      <button onClick={logout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl mx-1 border-t border-gray-100 mt-1">
                        <LogOut size={15}/> Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login"
                  className="hidden sm:flex btn-ghost p-2.5">
                  <User size={19}/>
                </Link>
              )}

              {/* Carrinho */}
              <Link to="/cart" className="relative">
                <div className="btn-primary px-4 py-2.5 !text-xs gap-1.5">
                  <ShoppingBag size={17}/>
                  <span className="hidden sm:block">Carrinho</span>
                  {itemCount > 0 && (
                    <span className="w-5 h-5 bg-brand-yellow text-brand-navy rounded-full text-[10px] font-black flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ─────────────────────────────────────────────── */}
      {mob && (
        <div className="lg:hidden bg-white border-b-3 py-3 px-4 space-y-1 animate-fadeUp"
             style={{borderBottomWidth:'3px', borderBottomColor:'#FF3D9A'}}>
          {NAV.map(link => (
            <Link key={link.href} to={link.href}
              className={`flex items-center px-4 py-3 rounded-2xl text-sm font-black transition-colors ${link.hot ? 'text-brand-pink bg-bg-soft' : 'text-brand-navy hover:bg-bg-soft'}`}>
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link to="/login" className="btn-primary w-full justify-center mt-3">Entrar / Criar conta</Link>
          )}
        </div>
      )}

      {/* ── BUSCA MODAL ─────────────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-20 px-4"
             onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-lg bg-white rounded-4xl shadow-2xl p-6 animate-pop"
               onClick={e => e.stopPropagation()}>
            <p className="text-center font-black text-brand-navy text-lg mb-4">🔍 O que você procura?</p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input autoFocus type="search" placeholder="Buscar produtos..." value={q}
                onChange={e => setQ(e.target.value)}
                className="input-field flex-1"/>
              <button type="submit" className="btn-primary px-4">Buscar</button>
            </form>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Conjunto', 'Jaqueta', 'Calça', 'Moletom', 'Meninas', 'Meninos'].map(tag => (
                <button key={tag}
                  onClick={() => { navigate(`/shop?q=${tag}`); setSearchOpen(false) }}
                  className="px-3 py-1.5 text-xs border-2 border-gray-200 rounded-full font-bold text-brand-navy hover:border-brand-pink hover:text-brand-pink transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
