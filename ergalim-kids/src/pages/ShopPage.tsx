// ShopPage.tsx
import React, { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, ShoppingBag } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/utils/security'
import toast from 'react-hot-toast'

function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart()
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  return (
    <article className="product-card animate-fadeUp">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          {discount > 0 && <span className="absolute top-3 left-3 badge badge-pink">-{discount}%</span>}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-gray-400 font-semibold mb-0.5">{product.category}</p>
        <Link to={`/product/${product.id}`} className="text-sm font-bold text-gray-800 hover:text-brand-navy transition-colors line-clamp-2 block">{product.name}</Link>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-black text-brand-navy">{formatCurrency(product.price)}</span>
          {product.originalPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>}
        </div>
        <button onClick={() => { const v = product.variants[0]; if(v){addItem(product,v.size,v.color);toast.success('Adicionado ao carrinho')}}} className="btn-navy w-full mt-3 py-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          Adicionar
        </button>
      </div>
    </article>
  )
}

export default function ShopPage() {
  const { products, loading } = useStore()
  const [params] = useSearchParams()
  const [sort, setSort] = useState('featured')
  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const sale = params.get('sale') === 'true'
  const isNew = params.get('new') === 'true'

  const filtered = useMemo(() => {
    let list = products.filter(p => p.active)
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.tags.some(t => t.includes(q.toLowerCase())))
    if (category) list = list.filter(p => p.category === category)
    if (sale) list = list.filter(p => p.originalPrice)
    if (isNew) list = list.slice().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (sort === 'price-asc') list = [...list].sort((a,b) => a.price - b.price)
    else if (sort === 'price-desc') list = [...list].sort((a,b) => b.price - a.price)
    else list = [...list].sort((a,b) => (b.featured?1:0)-(a.featured?1:0))
    return list
  }, [products, q, category, sale, isNew, sort])

  const pageTitle = q ? `"${q}"` : sale ? 'Promoções' : isNew ? 'Novidades' : category || 'Toda a coleção'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title text-2xl md:text-3xl">{pageTitle}</h1>
          <p className="text-sm text-gray-400 mt-1">{filtered.length} produtos encontrados</p>
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="input-field py-2 w-auto text-xs">
          <option value="featured">Destaque</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[['Todos','/shop'],['Masculino','/shop?category=Masculino'],['Feminino','/shop?category=Feminino'],['Promoções','/shop?sale=true'],['Novidades','/shop?new=true']].map(([l,h]) => (
          <Link key={h} to={h} className={`px-4 py-1.5 text-xs font-bold rounded-full border-2 transition-colors ${(category && h.includes(category)) || (sale && h.includes('sale')) || (!category && !sale && !isNew && h === '/shop') ? 'bg-brand-navy text-white border-brand-navy' : 'border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy'}`}>{l}</Link>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin"/>
          <p className="text-sm text-gray-400 mt-3 font-medium">Carregando produtos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBag size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-bold mb-2">Nenhum produto encontrado</p>
          <Link to="/shop" className="btn-navy mt-4">Ver todos os produtos</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
