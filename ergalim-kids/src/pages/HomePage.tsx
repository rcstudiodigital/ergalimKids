import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/utils/security'
import toast from 'react-hot-toast'

// ── Carrossel da Home ───────────────────────────────────────────────────────
function HomeCarousel() {
  const { settings } = useStore()
  const carousel = settings.carousel
  const slides = carousel?.slides || []
  const interval = carousel?.intervalMs || 5000
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length])
  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length)

  useEffect(() => {
    if (!carousel?.enabled || slides.length <= 1) return
    const t = setInterval(next, interval)
    return () => clearInterval(t)
  }, [carousel?.enabled, slides.length, interval, next])

  if (!carousel?.enabled || slides.length === 0) return null

  return (
    <section className="relative w-full bg-bg-soft">
      <div className="relative max-w-7xl mx-auto">
        <div className="relative h-[60vh] max-h-[460px] sm:h-auto sm:aspect-[3/1] sm:max-h-none overflow-hidden sm:rounded-b-4xl">
          {slides.map((slide, i) => (
            <div key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <img src={slide.imageUrl} alt={slide.title || ''} className="w-full h-full object-cover"/>
              {(slide.title || slide.subtitle || slide.buttonText) && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-brand-ink/25 to-brand-ink/10 sm:bg-gradient-to-r sm:from-brand-ink/55 sm:via-brand-ink/20 sm:to-transparent"/>
                  <div className="absolute inset-0 flex items-end sm:items-center">
                    <div className="px-5 pb-8 sm:px-12 sm:pb-0 max-w-lg">
                      {slide.title && (
                        <h2 className="font-display font-extrabold text-white text-2xl sm:text-4xl leading-tight mb-2 drop-shadow">
                          {slide.title}
                        </h2>
                      )}
                      {slide.subtitle && (
                        <p className="text-white/85 text-sm sm:text-lg font-medium mb-5 drop-shadow">
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.buttonText && (
                        <Link to={slide.buttonUrl || '/shop'} className="btn-primary">
                          {slide.buttonText} <ArrowRight size={16}/>
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Setas */}
          {slides.length > 1 && (
            <>
              <button onClick={prev} aria-label="Anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white shadow-soft flex items-center justify-center text-brand-ink transition-colors">
                <ChevronLeft size={20}/>
              </button>
              <button onClick={next} aria-label="Próximo"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white shadow-soft flex items-center justify-center text-brand-ink transition-colors">
                <ChevronRight size={20}/>
              </button>
            </>
          )}

          {/* Indicadores */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i+1}`}
                  className={`h-2 rounded-full transition-all ${i === current ? 'w-7 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'}`}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Product Card ───────────────────────────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart()
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  return (
    <article className="product-card group">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-[3/4] bg-bg-soft overflow-hidden relative">
          <img src={product.images[0]} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && <span className="badge badge-coral">-{discount}%</span>}
            {product.featured && <span className="badge badge-yellow">Destaque</span>}
          </div>

          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={e => {
                e.preventDefault()
                const v = product.variants[0]
                if (v) { addItem(product, v.size, v.color); toast.success('Adicionado ao carrinho') }
              }}
              className="w-full btn-primary rounded-none py-3 gap-2 text-sm justify-center">
              <ShoppingBag size={15}/> Adicionar
            </button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${product.category === 'Feminino' ? 'bg-brand-pink/10 text-brand-pink' : 'bg-brand-blue/10 text-brand-blue'}`}>
          {product.category}
        </span>
        <Link to={`/product/${product.id}`}
          className="text-sm font-bold text-brand-ink hover:text-brand-pink transition-colors line-clamp-2 block leading-tight mt-2">
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-extrabold text-brand-ink text-base">{formatCurrency(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through font-medium">{formatCurrency(product.originalPrice)}</span>
          )}
        </div>
        {product.originalPrice && (
          <p className="text-2xs text-brand-mint font-bold mt-1">
            ou 12x de {formatCurrency(product.price / 12)}
          </p>
        )}
      </div>
    </article>
  )
}

// ── Categorias ─────────────────────────────────────────────────────────────
const CATS = [
  { name: 'Meninas',   key: 'meninas',   href: '/shop?category=Feminino',  img: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&q=80' },
  { name: 'Meninos',   key: 'meninos',   href: '/shop?category=Masculino', img: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&q=80' },
  { name: 'Conjuntos', key: 'conjuntos', href: '/shop?category=Unissex',   img: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&q=80' },
  { name: 'Novidades', key: 'novidades', href: '/shop?new=true',           img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80' },
]

// ── Vitrine com filtros (abaixo do carrossel) ───────────────────────────────
const FILTERS = [
  { label: 'Todos',     value: 'all' },
  { label: 'Meninos',   value: 'Masculino' },
  { label: 'Meninas',   value: 'Feminino' },
  { label: 'Conjuntos', value: 'Unissex' },
]

function ProductShowcase() {
  const { products, loading } = useStore()
  const [filter, setFilter] = useState('all')

  const active = products.filter(p => p.active)
  const shown = filter === 'all' ? active : active.filter(p => p.category === filter)

  // Enquanto carrega do banco, mostra um indicador (evita "piscar" vazio)
  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <div className="inline-block w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin"/>
        <p className="text-sm text-gray-400 mt-3 font-medium">Carregando produtos...</p>
      </section>
    )
  }

  if (active.length === 0) return null

  return (
    <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <span className="eyebrow">Nossa loja</span>
        <h2 className="section-title text-2xl md:text-3xl mt-1">Todos os produtos</h2>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              filter === f.value
                ? 'bg-brand-pink text-white shadow-soft'
                : 'bg-white text-brand-navy border border-line hover:border-brand-pink'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grade de produtos */}
      {shown.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {shown.map(p => <ProductCard key={p.id} product={p}/>)}
        </div>
      ) : (
        <p className="text-center text-gray-400 font-medium py-10">
          Nenhum produto nesta categoria ainda.
        </p>
      )}
    </section>
  )
}

export default function HomePage() {
  const { products, settings } = useStore()
  const { homeSections, categoryImages } = settings

  const featured = products.filter(p => p.featured && p.active).slice(0, 8)
  const isVisible = (id: string) => {
    const s = homeSections?.find(s => s.id === id)
    return !s || s.visible !== false
  }
  const promoSection = homeSections?.find(s => s.id === 'promo')
  const featuredSection = homeSections?.find(s => s.id === 'featured')

  return (
    <div className="pb-4">

      {/* ── CARROSSEL ──────────────────────────────────────────────────── */}
      <HomeCarousel/>

      {/* ── VITRINE COM FILTROS (todos os produtos) ────────────────────── */}
      <ProductShowcase/>

      {/* ── DESTAQUES ──────────────────────────────────────────────────── */}
      {isVisible('featured') && featured.length > 0 && (
        <section className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow">Seleção da loja</span>
              <h2 className="section-title text-2xl md:text-3xl mt-1">{featuredSection?.title || 'Destaques'}</h2>
            </div>
            <Link to="/shop" className="btn-outline hidden sm:flex items-center gap-2 text-sm">
              Ver todos <ArrowRight size={15}/>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p}/>)}
          </div>

          <Link to="/shop" className="btn-primary mt-6 w-full sm:hidden flex justify-center">
            Ver todos os produtos
          </Link>
        </section>
      )}

      {/* ── BANNER PROMO ───────────────────────────────────────────────── */}
      {isVisible('promo') && (
        <section className="px-4 sm:px-6 py-10 max-w-7xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden min-h-[240px] flex items-center bg-brand-navy">
            {promoSection?.imageUrl && (
              <img src={promoSection.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35"/>
            )}
            <div className="relative px-8 md:px-14 py-12 max-w-xl">
              <span className="inline-block text-2xs font-bold tracking-[0.18em] uppercase text-brand-yellow mb-3">
                Oferta especial
              </span>
              <h2 className="font-display font-extrabold text-white text-2xl md:text-3xl leading-tight mb-5">
                {promoSection?.promoText || 'Até 30% OFF na coleção de inverno'}
              </h2>
              <Link to="/shop?sale=true" className="btn-yellow flex items-center gap-2 w-fit">
                {promoSection?.promoButtonText || 'Aproveitar agora'} <ArrowRight size={16}/>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── WHATSAPP FLUTUANTE ─────────────────────────────────────────── */}
      <a href={`https://wa.me/${settings.storeWhatsapp}`} target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-card-lg hover:scale-105 transition-transform"
        style={{background:'#25D366'}}
        aria-label="Fale pelo WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="text-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

    </div>
  )
}
