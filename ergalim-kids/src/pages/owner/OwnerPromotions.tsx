import React, { useState } from 'react'
import { Plus, Trash2, Tag, ToggleRight, ToggleLeft } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { Coupon } from '@/types'
import toast from 'react-hot-toast'

export default function OwnerPromotions() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, products, updateProduct } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', discount: 10, minValue: 0, active: true })

  const handleAdd = () => {
    if (!form.code.trim()) { toast.error('Código é obrigatório'); return }
    if (coupons.find(c => c.code === form.code.toUpperCase())) { toast.error('Código já existe'); return }
    addCoupon({ ...form, code: form.code.toUpperCase(), discount: form.discount / 100 })
    setForm({ code: '', discount: 10, minValue: 0, active: true })
    setShowForm(false)
    toast.success('Cupom criado!')
  }

  const toggleCoupon = (c: Coupon) => {
    updateCoupon({ ...c, active: !c.active })
    toast.success(c.active ? 'Cupom desativado' : 'Cupom ativado')
  }

  const handleDelete = (code: string) => {
    if (!confirm(`Remover cupom ${code}?`)) return
    deleteCoupon(code)
    toast.success('Cupom removido')
  }

  const toggleSale = (p: typeof products[0]) => {
    updateProduct({ ...p, originalPrice: p.originalPrice ? undefined : p.price * 1.3 })
    toast.success(p.originalPrice ? 'Promoção removida' : 'Produto em promoção!')
  }

  return (
    <div className="space-y-6 animate-fadeUp max-w-3xl">
      <h1 className="text-2xl font-black text-navy flex items-center gap-2"><Tag size={22} className="text-pink" /> Promoções</h1>

      {/* Cupons */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-navy">Cupons de Desconto</h2>
            <p className="text-xs text-gray-400 mt-0.5">{coupons.length} cupons · {coupons.filter(c => c.active).length} ativos</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-pink flex items-center gap-2 py-2 px-4 text-sm"><Plus size={15} /> Novo cupom</button>
        </div>

        <div className="divide-y divide-gray-50">
          {coupons.map(c => (
            <div key={c.code} className="flex items-center justify-between px-5 py-4 gap-4">
              <div>
                <p className={`font-black text-lg font-mono ${c.active ? 'text-navy' : 'text-gray-300'}`}>{c.code}</p>
                <p className="text-xs text-gray-500">
                  {Math.round(c.discount * 100)}% de desconto
                  {c.minValue ? ` · mín. R$${c.minValue}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${c.active ? 'badge-green' : 'badge-gray'}`}>{c.active ? 'Ativo' : 'Inativo'}</span>
                <button onClick={() => toggleCoupon(c)} className="btn-ghost p-1.5" title="Ativar/Desativar">
                  {c.active ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => handleDelete(c.code)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="border-t border-gray-100 p-5 bg-gray-50 animate-fadeUp">
            <h3 className="font-bold text-navy mb-4">Novo Cupom</h3>
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Código *</label>
                <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="Ex: KIDS20" className="input-field py-2 font-mono text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Desconto (%)</label>
                <input type="number" min="1" max="90" value={form.discount} onChange={e => setForm({...form, discount: parseInt(e.target.value)||0})} className="input-field py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Pedido mínimo (R$)</label>
                <input type="number" min="0" value={form.minValue} onChange={e => setForm({...form, minValue: parseInt(e.target.value)||0})} className="input-field py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn-pink py-2 px-4 text-sm">Criar cupom</button>
              <button onClick={() => setShowForm(false)} className="btn-outline py-2 px-4 text-sm">Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Promoções por produto */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-navy">Promoções por Produto</h2>
          <p className="text-xs text-gray-400 mt-0.5">Ative ou desative o preço promocional em cada produto</p>
        </div>
        <div className="divide-y divide-gray-50">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3 gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">R${p.price.toFixed(2)}{p.originalPrice ? ` (era R$${p.originalPrice.toFixed(2)})` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.originalPrice && <span className="badge badge-pink text-[10px]">Em promoção</span>}
                <button onClick={() => toggleSale(p)} className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${p.originalPrice ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-pink text-white hover:bg-pink-dark'}`}>
                  {p.originalPrice ? 'Remover' : 'Colocar em promoção'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
