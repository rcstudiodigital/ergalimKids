import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, RotateCcw, Shield, MessageCircle, Star, Zap } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/utils/security'
import toast from 'react-hot-toast'

// ── Product Card ───────────────────────────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart()
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-[3/4] bg-bg-soft overflow-hidden relative">
          <img src={product.images[0]} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"/>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="badge badge-pink shadow-kid-sm">🏷️ -{discount}%</span>
            )}
            {product.featured && (
              <span className="badge badge-yellow shadow-kid-sm">⭐ Destaque</span>
            )}
          </div>

          {/* Botão adicionar hover */}
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={e => {
                e.preventDefault()
                const v = product.variants[0]
                if (v) { addItem(product, v.size, v.color); toast.success('Adicionado ao carrinho! 🛍️') }
              }}
              className="w-full btn-primary rounded-none rounded-b-3xl py-3.5 gap-2 text-sm justify-center">
              <ShoppingBag size={15}/> Adicionar ao carrinho
            </button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-1">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${product.category === 'Feminino' ? 'bg-bg-soft text-brand-pink' : 'bg-bg-blue text-brand-navy'}`}>
            {product.category === 'Feminino' ? '👧' : '👦'} {product.category}
          </span>
        </div>
        <Link to={`/product/${product.id}`}
          className="text-sm font-black text-brand-navy hover:text-brand-pink transition-colors line-clamp-2 block leading-tight">
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-black text-brand-navy text-base">{formatCurrency(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through font-bold">{formatCurrency(product.originalPrice)}</span>
          )}
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {[...new Set(product.variants.map((v: any) => v.size))].slice(0,5).map((s: any) => (
            <span key={s} className="text-[10px] font-black border-2 border-gray-200 rounded-lg px-1.5 py-0.5 text-gray-500">{s}</span>
          ))}
        </div>
      </div>
    </article>
  )
}

// ── Importar ShoppingBag para o botão ─────────────────────────────────────
import { ShoppingBag } from 'lucide-react'

// ── Categorias ─────────────────────────────────────────────────────────────
const CATS = [
  { name: 'Meninas',   emoji: '👧', color: 'from-brand-pink to-brand-lilac',   href: '/shop?category=Feminino',  img: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&q=80' },
  { name: 'Meninos',   emoji: '👦', color: 'from-brand-navy to-brand-sky',     href: '/shop?category=Masculino', img: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&q=80' },
  { name: 'Conjuntos', emoji: '👕', color: 'from-brand-mint to-brand-sky',     href: '/shop?category=Unissex',   img: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&q=80' },
  { name: 'Novidades', emoji: '✨', color: 'from-brand-yellow to-brand-orange', href: '/shop?new=true',           img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80' },
]

const BENEFITS = [
  { icon: '🚚', title: 'Frete Grátis',       desc: 'Compras acima de R$299',  bg: 'bg-bg-blue' },
  { icon: '🔄', title: 'Troca Fácil',         desc: '30 dias sem perguntas',   bg: 'bg-bg-soft' },
  { icon: '🔒', title: 'Compra Segura',       desc: 'SSL + Mercado Pago',      bg: 'bg-bg-mint' },
  { icon: '💬', title: 'Atendimento',         desc: 'WhatsApp na hora',        bg: 'bg-bg-soft' },
]

export default function HomePage() {
  const { products, settings } = useStore()
  const { hero, homeSections } = settings

  const featured = products.filter(p => p.featured && p.active).slice(0, 4)
  const isVisible = (id: string) => {
    const s = homeSections?.find(s => s.id === id)
    return !s || s.visible !== false
  }
  const promoSection = homeSections?.find(s => s.id === 'promo')
  const featuredSection = homeSections?.find(s => s.id === 'featured')

  return (
    <div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO                                                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center"
               style={{background:'linear-gradient(135deg, #1A2B6B 0%, #2A3F9E 50%, #1A2B6B 100%)'}}>

        {/* Padrão de pontos de fundo */}
        <div className="absolute inset-0 dot-pattern opacity-40"/>

        {/* Bolhas decorativas */}
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-10"
             style={{background:'radial-gradient(circle, #FF3D9A, transparent)'}}/>
        <div className="absolute bottom-20 left-5 w-40 h-40 rounded-full opacity-10"
             style={{background:'radial-gradient(circle, #FFD600, transparent)'}}/>

        {/* Estrelas decorativas animadas */}
        {[
          {top:'8%', right:'6%',  size:48, color:'#FFD600', delay:'0s'},
          {top:'70%',right:'12%', size:32, color:'#FF3D9A', delay:'1s'},
          {top:'15%',left:'6%',   size:28, color:'#00C9A7', delay:'0.5s'},
          {top:'85%',left:'15%',  size:40, color:'#4FC3F7', delay:'1.5s'},
        ].map((s, i) => (
          <div key={i} className="absolute pointer-events-none select-none animate-float"
               style={{top:s.top, right:(s as any).right, left:(s as any).left, animationDelay:s.delay}}>
            <Star size={s.size} fill={s.color} color={s.color} opacity={0.6}/>
          </div>
        ))}

        {/* Imagem de fundo */}
        <div className="absolute inset-0">
          <img src={hero?.imageUrl || 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1400&q=80'}
            alt="" className="w-full h-full object-cover"
            style={{opacity: (hero?.overlayOpacity ?? 75) / 100 * 0.22}}/>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="max-w-2xl">
            {/* Tag topo */}
            <div className="inline-flex items-center gap-2 bg-brand-yellow text-brand-navy text-xs font-black px-4 py-2 rounded-full shadow-kid mb-6 animate-pop">
              ✨ NOVA COLEÇÃO 2025 ✨
            </div>

            {/* Título */}
            <h1 className="font-black text-white leading-[1.05] mb-6"
                style={{fontSize:'clamp(2.2rem, 6vw, 4rem)'}}>
              {hero?.title || 'Para Pequenos\nGrandes Sonhadores'}
              <span className="text-brand-yellow"> ⭐</span>
            </h1>

            <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-lg font-bold">
              {hero?.subtitle || 'Moda infantil com estilo, conforto e aventura. Roupinhas que as crianças adoram usar! 💕'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={hero?.buttonUrl || '/shop'}
                className="btn-primary text-base px-8 py-4 shadow-kid-lg animate-pop"
                style={{animationDelay:'0.2s'}}>
                {hero?.buttonText || '🛍️ Explorar coleção'} <ArrowRight size={18}/>
              </Link>
              <Link to="/shop?sale=true"
                className="btn-yellow text-base px-8 py-4 animate-pop"
                style={{animationDelay:'0.3s'}}>
                🏷️ Ver promoções
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex gap-6 mt-10">
              {[
                { num: '500+', label: 'Peças exclusivas' },
                { num: '2mil+', label: 'Clientes felizes' },
                { num: '4.9⭐', label: 'Avaliação' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-brand-yellow font-black text-xl">{stat.num}</p>
                  <p className="text-white/60 text-xs font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full h-12 md:h-16">
            <path d="M0 80L60 68C120 56 240 32 360 26.7C480 21 600 35 720 42.7C840 50 960 50 1080 42.7C1200 35 1320 21 1380 13.3L1440 6V80H0Z"
              fill="#FFF9F5"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* BENEFÍCIOS                                                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isVisible('benefits') && (
        <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={b.title}
                className={`${b.bg} rounded-3xl p-5 text-center border-2 border-white shadow-kid-sm hover:-translate-y-1 transition-transform animate-fadeUp`}
                style={{animationDelay:`${i*0.1}s`}}>
                <div className="text-3xl mb-2">{b.icon}</div>
                <p className="font-black text-brand-navy text-sm">{b.title}</p>
                <p className="text-xs text-gray-500 font-bold mt-0.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* CATEGORIAS                                                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isVisible('categories') && (
        <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-pink/10 text-brand-pink text-xs font-black px-4 py-1.5 rounded-full mb-3">
              🏷️ CATEGORIAS
            </div>
            <h2 className="section-title text-3xl md:text-4xl">Escolha pelo estilo! 🎨</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATS.map((cat, i) => (
              <Link key={cat.name} to={cat.href}
                className="group relative aspect-[3/4] rounded-4xl overflow-hidden shadow-kid hover:-translate-y-2 hover:shadow-kid-lg transition-all duration-300 animate-fadeUp"
                style={{animationDelay:`${i*0.1}s`}}>
                <img src={cat.img} alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60`}/>

                {/* Conteúdo */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-5 text-center">
                  <div className="text-4xl mb-2 drop-shadow-lg group-hover:animate-bounce2">
                    {cat.emoji}
                  </div>
                  <p className="text-white font-black text-lg drop-shadow-lg">{cat.name}</p>
                  <div className="mt-2 bg-white/20 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver tudo <ArrowRight size={10}/>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* DESTAQUES                                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isVisible('featured') && featured.length > 0 && (
        <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
          {/* Fundo colorido na seção */}
          <div className="bg-bg-soft rounded-4xl p-8 relative overflow-hidden">
            {/* Decorações */}
            <div className="absolute top-4 right-6 text-5xl opacity-20 animate-float">🌟</div>
            <div className="absolute bottom-4 left-6 text-4xl opacity-20 animate-float" style={{animationDelay:'1s'}}>💫</div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-brand-pink text-white text-xs font-black px-4 py-1.5 rounded-full mb-3 shadow-kid-sm">
                  ⭐ DESTAQUES
                </div>
                <h2 className="section-title text-3xl">{featuredSection?.title || 'Mais Amados! 💖'}</h2>
              </div>
              <Link to="/shop"
                className="btn-navy hidden sm:flex items-center gap-2 text-sm">
                Ver todos <ArrowRight size={15}/>
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>

            <Link to="/shop" className="btn-primary mt-6 w-full sm:hidden flex justify-center">
              🛍️ Ver todos os produtos
            </Link>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* BANNER PROMO                                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isVisible('promo') && (
        <section className="px-4 sm:px-6 pb-14 max-w-7xl mx-auto">
          <div className="relative rounded-4xl overflow-hidden min-h-[280px] flex items-center shadow-kid-lg"
               style={{background:'linear-gradient(135deg, #1A2B6B 0%, #FF3D9A 100%)'}}>
            {/* Padrão */}
            <div className="absolute inset-0 dot-pattern opacity-20"/>

            {/* Estrelas */}
            {['top-5 right-10','bottom-5 right-20','top-10 right-40'].map((pos, i) => (
              <div key={i} className={`absolute ${pos} text-2xl opacity-40 animate-float`}
                   style={{animationDelay:`${i*0.5}s`}}>⭐</div>
            ))}

            {promoSection?.imageUrl && (
              <img src={promoSection.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"/>
            )}

            <div className="relative px-8 md:px-14 py-12 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-brand-yellow text-brand-navy text-xs font-black px-4 py-1.5 rounded-full mb-4 shadow-kid-sm">
                🎉 OFERTA ESPECIAL
              </div>
              <h2 className="font-black text-white text-3xl md:text-4xl leading-tight mb-4">
                {promoSection?.promoText || 'Até 30% OFF na coleção de inverno! ❄️'}
              </h2>
              <Link to="/shop?sale=true" className="btn-yellow flex items-center gap-2 w-fit shadow-kid">
                {promoSection?.promoButtonText || 'Aproveitar agora'} <ArrowRight size={16}/>
              </Link>
            </div>

            {/* Emoji decorativo grande */}
            <div className="absolute right-8 bottom-0 text-9xl opacity-20 select-none pointer-events-none">
              🎁
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* WHATSAPP FLUTUANTE                                             */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <a href={`https://wa.me/${settings.storeWhatsapp}`} target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-kid-lg hover:-translate-y-1 hover:shadow-kid-lg transition-all"
        style={{background:'#25D366'}}
        aria-label="Fale pelo WhatsApp">
        <MessageCircle size={26} className="text-white fill-white"/>
        {/* Ping animation */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{background:'#25D366'}}/>
      </a>

    </div>
  )
}
