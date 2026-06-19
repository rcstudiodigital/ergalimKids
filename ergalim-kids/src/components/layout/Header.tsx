import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Search, Menu, X, User, ChevronDown, Package, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'

const NAV = [
  { label: 'Início',     href: '/' },
  { label: 'Meninos',    href: '/shop?category=Masculino' },
  { label: 'Meninas',    href: '/shop?category=Feminino' },
  { label: 'Novidades',  href: '/shop?new=true' },
  { label: 'Promoções',  href: '/shop?sale=true', hot: true },
]

// Logomarca limpa — círculo arredondado com a inicial, sem estrela
const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 group shrink-0">
    <div className="w-9 h-9 rounded-2xl bg-brand-pink flex items-center justify-center shadow-soft transition-transform group-hover:scale-105">
      <span className="text-white font-display font-extrabold text-lg leading-none">e</span>
    </div>
    <div className="leading-none">
      <span className="font-display font-extrabold text-xl text-brand-ink tracking-tight">ergalim</span>
      <span className="font-display font-extrabold text-xl text-brand-pink"> kids</span>
      <div className="text-[10px] font-bold text-gray-400 tracking-[0.18em] mt-0.5">MODA INFANTIL</div>
    </div>
  </Link>
)

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
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMob(false); setUserMenu(false) }, [location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) { navigate(`/shop?q=${encodeURIComponent(q.trim())}`); setSearchOpen(false); setQ('') }
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50">

      {/* ── FAIXA TOPO ──────────────────────────────────────────────── */}
      <div className="bg-brand-navy text-white text-xs text-center py-2 font-semibold tracking-wide px-4">
        Frete grátis acima de R$299 · Use <span className="text-brand-yellow font-bold">ERGALIM10</span> e ganhe 10% OFF
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────────────── */}
      <div className={`bg-white/95 backdrop-blur border-b border-line transition-shadow duration-300 ${scrolled ? 'shadow-soft' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Mobile burger */}
            <button onClick={() => setMob(!mob)} className="btn-ghost p-2 lg:hidden -ml-2" aria-label="Menu">
              {mob ? <X size={22}/> : <Menu size={22}/>}
            </button>

            <Logo/>

            {/* Nav desktop */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV.map(link => (
                <Link key={link.href} to={link.href}
                  className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors hover:bg-bg-soft
                    ${link.hot ? 'text-brand-pink' : 'text-brand-navy'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Ações */}
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} className="btn-ghost p-2.5" aria-label="Buscar">
                <Search size={19}/>
              </button>

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-1.5 bg-bg-soft px-2.5 py-2 rounded-full font-semibold text-sm text-brand-navy hover:bg-line transition-colors">
                    <div className="w-6 h-6 rounded-full bg-brand-pink flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={13} className={`transition-transform ${userMenu ? 'rotate-180' : ''}`}/>
                  </button>
                  {userMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-line shadow-card-lg py-2 z-50 animate-pop">
                      <div className="px-4 py-2 border-b border-line mb-1">
                        <p className="text-xs text-gray-400 font-medium">Olá, {user.name.split(' ')[0]}</p>
                        <p className="text-xs text-brand-ink font-bold truncate">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-brand-navy hover:bg-bg-soft rounded-xl mx-1">
                          <Settings size={15} className="text-brand-blue"/> Painel Admin
                        </Link>
                      )}
                      {isOwner && !isAdmin && (
                        <Link to="/owner" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-brand-navy hover:bg-bg-soft rounded-xl mx-1">
                          <Package size={15} className="text-brand-blue"/> Painel da Loja
                        </Link>
                      )}
                      <Link to="/account" className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-brand-navy hover:bg-bg-soft rounded-xl mx-1">
                        <Package size={15} className="text-brand-blue"/> Meus Pedidos
                      </Link>
                      <button onClick={logout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl mx-1 border-t border-line mt-1">
                        <LogOut size={15}/> Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex btn-ghost p-2.5" aria-label="Entrar">
                  <User size={19}/>
                </Link>
              )}

              {/* Carrinho */}
              <Link to="/cart" className="relative ml-1">
                <div className="btn-primary px-4 py-2.5 !text-xs gap-1.5">
                  <ShoppingBag size={17}/>
                  <span className="hidden sm:block">Carrinho</span>
                  {itemCount > 0 && (
                    <span className="w-5 h-5 bg-brand-yellow text-brand-ink rounded-full text-[10px] font-bold flex items-center justify-center">
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
        <div className="lg:hidden bg-white border-b border-line py-3 px-4 space-y-1 animate-fadeUp">
          {NAV.map(link => (
            <Link key={link.href} to={link.href}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${link.hot ? 'text-brand-pink bg-bg-warm' : 'text-brand-navy hover:bg-bg-soft'}`}>
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
        <div className="fixed inset-0 bg-brand-ink/40 backdrop-blur-sm z-[60] flex items-start justify-center pt-20 px-4"
             onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-card-lg p-6 animate-pop"
               onClick={e => e.stopPropagation()}>
            <p className="font-display font-extrabold text-brand-ink text-lg mb-4">O que você procura?</p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input autoFocus type="search" placeholder="Buscar produtos..." value={q}
                onChange={e => setQ(e.target.value)}
                className="input-field flex-1"/>
              <button type="submit" className="btn-primary px-5">Buscar</button>
            </form>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Conjunto', 'Jaqueta', 'Calça', 'Moletom', 'Meninas', 'Meninos'].map(tag => (
                <button key={tag}
                  onClick={() => { navigate(`/shop?q=${tag}`); setSearchOpen(false) }}
                  className="px-3 py-1.5 text-xs border border-line rounded-full font-medium text-brand-navy hover:border-brand-blue hover:text-brand-blue transition-colors">
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
