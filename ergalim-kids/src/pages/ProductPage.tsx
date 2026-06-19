// ProductPage.tsx
import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, Minus, Plus, ChevronRight, Truck, RotateCcw, Shield } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/utils/security'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const { products, settings } = useStore()
  const { addItem } = useCart()
  const product = products.find(p => p.id === id)
  const [img, setImg] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
      <p className="text-lg font-bold mb-4">Produto não encontrado</p>
      <Link to="/shop" className="btn-navy">Ver todos os produtos</Link>
    </div>
  )

  const colors = [...new Set(product.variants.map(v => v.color))]
  const sizes = [...new Set(product.variants.filter(v => !color || v.color === color).map(v => v.size))]
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  const handleAdd = () => {
    if (!size || !color) { toast.error('Selecione tamanho e cor'); return }
    addItem(product, size, color, qty)
    toast.success('Adicionado ao carrinho')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link to="/" className="hover:text-brand-navy">Início</Link><ChevronRight size={12} />
        <Link to="/shop" className="hover:text-brand-navy">Loja</Link><ChevronRight size={12} />
        <Link to={`/shop?category=${product.category}`} className="hover:text-brand-navy">{product.category}</Link><ChevronRight size={12} />
        <span className="text-gray-700 font-semibold truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Imagens */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-2">
            {product.images.map((src, i) => (
              <button key={i} onClick={() => setImg(i)} className={`w-14 h-16 rounded-xl overflow-hidden border-2 transition-colors ${img===i?'border-brand-pink':'border-transparent'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
            <img src={product.images[img]} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs text-brand-pink font-black tracking-widest uppercase mb-2">{product.category} · {product.subcategory}</p>
          <h1 className="font-display font-black text-3xl text-brand-navy mb-3">{product.name}</h1>
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-2xl font-black text-brand-navy">{formatCurrency(product.price)}</span>
            {product.originalPrice && <>
              <span className="text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
              <span className="badge badge-pink">-{discount}%</span>
            </>}
          </div>
          <p className="text-gray-600 leading-relaxed mb-6 text-sm">{product.description}</p>

          {/* Cor */}
          <div className="mb-5">
            <p className="text-sm font-bold text-gray-700 mb-2">Cor: <span className="text-brand-navy">{color || 'Selecione'}</span></p>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button key={c} onClick={() => { setColor(c); setSize(null) }} className={`px-4 py-2 text-sm font-bold border-2 rounded-xl transition-colors ${color===c?'bg-brand-navy text-white border-brand-navy':'border-gray-200 text-gray-700 hover:border-brand-navy'}`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Tamanho */}
          <div className="mb-6">
            <p className="text-sm font-bold text-gray-700 mb-2">Tamanho: <span className="text-brand-navy">{size || 'Selecione'}</span></p>
            <div className="flex flex-wrap gap-2">
              {sizes.map(s => {
                const v = product.variants.find(v => v.size === s && v.color === (color || colors[0]))
                const out = v && v.stock === 0
                return (
                  <button key={s} disabled={!!out} onClick={() => !out && setSize(s)} className={`w-12 h-10 text-sm font-bold border-2 rounded-xl transition-colors ${size===s?'bg-brand-navy text-white border-brand-navy':out?'border-gray-100 text-gray-300 cursor-not-allowed line-through':'border-gray-200 text-gray-700 hover:border-brand-navy'}`}>{s}</button>
                )
              })}
            </div>
          </div>

          {/* Qtd */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1,q-1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"><Minus size={14}/></button>
              <span className="w-10 text-center text-sm font-black">{qty}</span>
              <button onClick={() => setQty(q => Math.min(10,q+1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"><Plus size={14}/></button>
            </div>
          </div>

          <button onClick={handleAdd} className="btn-primary w-full py-4 text-base mb-4">
            <ShoppingBag size={18} /> Adicionar ao carrinho
          </button>

          <div className="border-2 border-gray-100 rounded-2xl p-4 space-y-3">
            {[
              { icon: Truck, text: `Frete grátis nas compras acima de ${formatCurrency(settings.freeShippingAbove)}` },
              { icon: RotateCcw, text: '30 dias para trocar ou devolver' },
              { icon: Shield, text: 'Pagamento 100% seguro' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                <Icon size={16} className="text-brand-pink shrink-0" />{text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
