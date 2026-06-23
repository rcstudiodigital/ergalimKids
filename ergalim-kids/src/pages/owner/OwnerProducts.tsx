import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Star, Package, X } from 'lucide-react'
import ImageUpload from '@/components/ui/ImageUpload'
import { useStore } from '@/context/StoreContext'
import type { Product, ProductVariant } from '@/types'
import { formatCurrency } from '@/utils/security'
import toast from 'react-hot-toast'

const EMPTY: Omit<Product, 'id'|'createdAt'|'updatedAt'> = {
  name: '', description: '', price: 0, originalPrice: undefined,
  images: [''], category: 'Feminino', subcategory: '',
  variants: [{ size: '4', color: 'Rosa', stock: 0, sku: '' }],
  tags: [], featured: false, active: true,
}

type FormState = typeof EMPTY

export default function OwnerProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore()
  const [search, setSearch]       = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editProduct, setEdit]    = useState<Product | null>(null)
  const [form, setForm]           = useState<FormState>({ ...EMPTY })
  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'variants'>('info')

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEdit(null)
    setForm({ ...EMPTY, images: [''], variants: [{ size: '4', color: 'Rosa', stock: 0, sku: '' }] })
    setActiveTab('info')
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEdit(p)
    // Se o produto está em promoção (tem originalPrice), converte de volta:
    // no banco price=promocional e originalPrice=normal. No form mostramos
    // price=normal (o cheio) e promoPrice=promocional.
    const emPromocao = p.originalPrice !== undefined && p.originalPrice > p.price
    setForm({
      name: p.name, description: p.description,
      price: emPromocao ? (p.originalPrice as number) : p.price,
      originalPrice: emPromocao ? p.originalPrice : undefined,
      promoPrice: emPromocao ? p.price : undefined,
      images: [...p.images],
      category: p.category, subcategory: p.subcategory || '',
      variants: p.variants.map(v => ({...v})),
      tags: [...p.tags], featured: p.featured, active: p.active,
    } as any)
    setActiveTab('info')
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.name.trim())       { toast.error('Nome é obrigatório'); setActiveTab('info'); return }
    if (form.price <= 0)         { toast.error('Preço deve ser maior que zero'); setActiveTab('info'); return }
    if (!form.images[0]?.trim()) { toast.error('Adicione pelo menos uma imagem'); setActiveTab('images'); return }

    // Validar variantes: pelo menos uma com tamanho E cor preenchidos
    const validVariants = form.variants.filter(v => v.size.trim() && v.color.trim())
    if (validVariants.length === 0) {
      toast.error('Adicione pelo menos um tamanho e cor na aba "Tamanhos & Estoque"')
      setActiveTab('variants'); return
    }

    // Converter promoção para o modelo real (price = o que paga, originalPrice = riscado)
    // form.price = preço normal digitado; (form as any).promoPrice = preço com desconto
    const emPromocao = form.originalPrice !== undefined
    const promoPrice = (form as any).promoPrice
    let finalPrice = form.price
    let finalOriginal: number | undefined = undefined

    if (emPromocao && promoPrice && promoPrice > 0 && promoPrice < form.price) {
      finalPrice = promoPrice        // cliente paga o promocional
      finalOriginal = form.price     // preço normal vira o "de" (riscado)
    }

    // Limpar imagens e variantes vazias
    const cleanForm = {
      ...form,
      price: finalPrice,
      originalPrice: finalOriginal,
      images: form.images.filter(im => im.trim()),
      variants: validVariants,
    }
    delete (cleanForm as any).promoPrice  // campo auxiliar, não vai pro banco

    if (editProduct) {
      updateProduct({ ...editProduct, ...cleanForm, updatedAt: new Date().toISOString() })
      toast.success('Produto atualizado! ')
    } else {
      addProduct(cleanForm)
      toast.success('Produto adicionado! ')
    }
    setShowForm(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Remover "${name}"? Esta ação não pode ser desfeita.`)) return
    deleteProduct(id)
    toast.success('Produto removido')
  }

  const toggleActive   = (p: Product) => { updateProduct({...p, active: !p.active}); toast.success(p.active ? 'Desativado' : 'Ativado') }
  const toggleFeatured = (p: Product) => { updateProduct({...p, featured: !p.featured}); toast.success(p.featured ? 'Removido dos destaques' : 'Adicionado aos destaques ') }

  // Variantes helpers
  const addVariant = () => setForm(f => ({ ...f, variants: [...f.variants, { size: '', color: '', stock: 0, sku: '' }] }))
  const removeVariant = (i: number) => setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))
  const updateVariant = (i: number, patch: Partial<ProductVariant>) => setForm(f => ({ ...f, variants: f.variants.map((v, idx) => idx === i ? {...v, ...patch} : v) }))

  // Imagens helpers
  const addImage = () => setForm(f => ({ ...f, images: [...f.images, ''] }))
  const removeImage = (i: number) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  const updateImage = (i: number, url: string) => setForm(f => ({ ...f, images: f.images.map((img, idx) => idx === i ? url : img) }))

  return (
    <div className="space-y-5 animate-fadeUp"> {/* Header */}
      <div className="flex items-center justify-between"> <div> <h1 className="text-2xl font-black text-brand-navy">Produtos</h1> <p className="text-sm text-gray-400 mt-0.5">{products.length} produtos · {products.filter(p=>p.active).length} ativos</p> </div> <button onClick={openAdd} className="btn-primary flex items-center gap-2"> <Plus size={16}/> Novo produto
        </button> </div> {/* Busca */}
      <div className="relative max-w-sm"> <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/> <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." className="input-field pl-9 py-2"/> </div> {/* Tabela */}
      <div className="card overflow-hidden"> <div className="overflow-x-auto"> <table className="w-full text-sm"> <thead className="bg-gray-50"> <tr className="text-xs text-gray-500 font-bold border-b border-gray-100"> <th className="text-left px-4 py-3">Produto</th> <th className="text-left px-4 py-3 hidden md:table-cell">Categoria</th> <th className="text-left px-4 py-3">Preço</th> <th className="text-left px-4 py-3 hidden sm:table-cell">Estoque</th> <th className="text-left px-4 py-3 hidden sm:table-cell">Status</th> <th className="text-right px-4 py-3">Ações</th> </tr> </thead> <tbody> {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400"> <Package size={32} className="mx-auto mb-2 opacity-30"/> <p className="font-semibold">Nenhum produto encontrado</p> </td></tr> ) : filtered.map(p => {
                const totalStock = p.variants.reduce((a,v) => a+v.stock, 0)
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors"> <td className="px-4 py-3"> <div className="flex items-center gap-3"> <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0"/> <div> <p className="font-bold text-brand-navy text-sm line-clamp-1">{p.name}</p> <p className="text-xs text-gray-400">{p.variants.length} variante{p.variants.length !== 1 ? 's' : ''}</p> </div> </div> </td> <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{p.category}</td> <td className="px-4 py-3"> <span className="font-black text-brand-navy">{formatCurrency(p.price)}</span> {p.originalPrice && <span className="block text-xs text-gray-400 line-through">{formatCurrency(p.originalPrice)}</span>}
                    </td> <td className="px-4 py-3 hidden sm:table-cell"> <span className={`font-bold text-sm ${totalStock===0?'text-red-500':totalStock<=5?'text-amber-500':'text-green-600'}`}>{totalStock} un.</span> </td> <td className="px-4 py-3 hidden sm:table-cell"> <span className={`badge ${p.active?'badge-green':'badge-gray'}`}>{p.active?'Ativo':'Inativo'}</span> </td> <td className="px-4 py-3"> <div className="flex items-center justify-end gap-1"> <button onClick={() => toggleFeatured(p)} className={`btn-ghost p-1.5 ${p.featured?'text-amber-500':''}`} title="Destaque"> <Star size={14} fill={p.featured?'currentColor':'none'}/> </button> <button onClick={() => toggleActive(p)} className="btn-ghost p-1.5" title={p.active?'Desativar':'Ativar'}> {p.active ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button> <button onClick={() => openEdit(p)} className="btn-ghost p-1.5 text-brand-navy" title="Editar"> <Pencil size={14}/> </button> <button onClick={() => handleDelete(p.id, p.name)} className="btn-ghost p-1.5 hover:text-red-500" title="Excluir"> <Trash2 size={14}/> </button> </div> </td> </tr> )
              })}
            </tbody> </table> </div> </div> {/* ── MODAL DE PRODUTO (via portal, fora do <main> com overflow) ──── */}
      {showForm && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-3"> <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-fadeUp max-h-[90vh] flex flex-col"> {/* Header modal */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100"> <h2 className="font-black text-brand-navy text-lg">{editProduct ? 'Editar produto' : 'Novo produto'}</h2> <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 p-1"><X size={20}/></button> </div> {/* Tabs do modal */}
            <div className="flex border-b border-gray-100"> {([['info','Informações'],['images','Imagens'],['variants','Tamanhos & Estoque']] as const).map(([t, label]) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab===t ? 'border-b-2 border-brand-pink text-brand-pink' : 'text-gray-400 hover:text-gray-600'}`}> {label}
                </button> ))}
            </div> <div className="p-5 overflow-y-auto flex-1"> {/* ── INFORMAÇÕES ──────────────────────────────────────── */}
              {activeTab === 'info' && (
                <div className="space-y-4"> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Nome do produto *</label> <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className="input-field" placeholder="Ex: Conjunto Moletom Feminino Rosa"/> </div> <div className="grid grid-cols-2 gap-3"> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Preço normal (R$) *</label> <input type="number" step="0.01" min="0" value={form.price||''} onChange={e => setForm(f=>({...f,price:parseFloat(e.target.value)||0}))} className="input-field" placeholder="189,90"/> </div> <div> <label className="text-xs font-bold text-gray-500 block mb-1 flex items-center gap-2"><input type="checkbox" checked={form.originalPrice !== undefined} onChange={e => setForm(f=>({...f, originalPrice: e.target.checked ? f.price : undefined, promoPrice: e.target.checked ? (f as any).promoPrice : undefined}))} className="rounded accent-pink w-4 h-4"/> Em promoção</label> {form.originalPrice !== undefined ? (<input type="number" step="0.01" min="0" value={(form as any).promoPrice||''} onChange={e => { const promo = parseFloat(e.target.value)||0; setForm(f=>({...f, promoPrice: promo} as any)) }} className="input-field border-pink-300" placeholder="Preço promocional (por)"/>) : (<p className="text-2xs text-gray-400 mt-2">Marque para fazer uma promoção</p>)} </div> </div> <div className="grid grid-cols-2 gap-3"> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Categoria *</label> <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value as any}))} className="input-field"> <option value="Feminino">Feminino</option><option value="Masculino">Masculino</option><option value="Unissex">Conjuntos</option> </select> </div> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Subcategoria</label> <input value={form.subcategory} onChange={e => setForm(f=>({...f,subcategory:e.target.value}))} className="input-field" placeholder="Ex: Conjuntos, Moletons..."/> </div> </div> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Descrição</label> <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={4} className="input-field resize-none" placeholder="Descreva o produto detalhadamente..."/> </div> <div className="flex items-center gap-5"> <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700"> <input type="checkbox" checked={form.featured} onChange={e => setForm(f=>({...f,featured:e.target.checked}))} className="rounded accent-pink w-4 h-4"/> Produto em destaque
                    </label> <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700"> <input type="checkbox" checked={form.active} onChange={e => setForm(f=>({...f,active:e.target.checked}))} className="rounded accent-pink w-4 h-4"/> Produto ativo (visível na loja)
                    </label> </div> </div> )}

              {/* ── IMAGENS ──────────────────────────────────────────── */}
              {activeTab === 'images' && (
                <div className="space-y-4"> <p className="text-sm text-gray-500 font-bold"> Adicione até 5 imagens. A <strong>primeira</strong> é a capa do produto.
                  </p> {form.images.map((url, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-2xl border border-gray-200"> <div className="flex items-center justify-between mb-2"> <span className="text-xs font-black text-gray-500"> {i === 0 ? ' Imagem principal (capa)' : ` Imagem ${i + 1}`}
                        </span> {form.images.length > 1 && (
                          <button onClick={() => removeImage(i)}
                            className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1"> <X size={12}/> Remover
                          </button> )}
                      </div> <ImageUpload
                        value={url}
                        onChange={newUrl => updateImage(i, newUrl)}
                      /> </div> ))}
                  {form.images.length < 5 && (
                    <button onClick={addImage}
                      className="btn-outline w-full justify-center text-sm py-3"> <Plus size={15}/> Adicionar mais imagem
                    </button> )}
                </div> )}

              {/* ── VARIANTES ────────────────────────────────────────── */}
              {activeTab === 'variants' && (
                <div className="space-y-4"> <p className="text-sm text-gray-500">Adicione os tamanhos, cores e quantidades em estoque.</p> {/* Cabeçalho da tabela */}
                  <div className="grid grid-cols-4 gap-2 text-xs font-bold text-gray-400 px-1"> <span>Tamanho *</span><span>Cor *</span><span>Estoque</span><span></span> </div> {form.variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 items-center p-3 bg-gray-50 rounded-xl"> <input value={v.size} onChange={e => updateVariant(i, {size: e.target.value})}
                        className="input-field text-sm py-2" placeholder="Ex: 4, P, M"/> <input value={v.color} onChange={e => updateVariant(i, {color: e.target.value})}
                        className="input-field text-sm py-2" placeholder="Ex: Rosa"/> <input type="number" min="0" value={v.stock}
                        onChange={e => updateVariant(i, {stock: parseInt(e.target.value)||0})}
                        className="input-field text-sm py-2"/> <button onClick={() => removeVariant(i)} disabled={form.variants.length === 1}
                        className="text-red-400 hover:text-red-600 disabled:opacity-20 p-1 justify-self-center"> <X size={16}/> </button> </div> ))}

                  <button onClick={addVariant} className="btn-outline w-full flex items-center justify-center gap-2 text-sm"> <Plus size={15}/> Adicionar tamanho / cor
                  </button> {/* Atalhos de tamanhos */}
                  <div className="p-3 bg-gray-50 rounded-xl"> <p className="text-xs font-bold text-gray-500 mb-2">Atalhos de tamanho:</p> <div className="flex flex-wrap gap-2"> {[['Roupas infantis','2,4,6,8,10,12'],['PP,P,M,G,GG','PP,P,M,G,GG']].map(([label,sizes]) => (
                        <button key={label} onClick={() => {
                          const news = sizes.split(',').map(s => ({ size: s.trim(), color: 'A definir', stock: 0, sku: '' }))
                          setForm(f => ({...f, variants: news}))
                        }} className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-600 hover:border-brand-navy hover:text-brand-navy transition-colors"> {label}
                        </button> ))}
                    </div> </div> </div> )}
            </div> {/* Footer modal */}
            <div className="flex gap-3 p-5 border-t border-gray-100"> <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancelar</button> <button onClick={handleSave} className="btn-primary flex-1"> {editProduct ? 'Salvar alterações' : 'Adicionar produto'}
              </button> </div> </div> </div>,
        document.body
      )}
    </div> )
}
