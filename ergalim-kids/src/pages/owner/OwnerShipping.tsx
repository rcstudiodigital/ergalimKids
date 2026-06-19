import React, { useState } from 'react'
import { Truck, Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { ShippingOption } from '@/types'
import { formatCurrency, genId } from '@/utils/security'
import toast from 'react-hot-toast'

const EMPTY: Omit<ShippingOption, 'id'> = {
  name: '', description: '', price: 0, estimatedDays: '', active: true,
}

export default function OwnerShipping() {
  const { settings, addShippingOption, updateShippingOption, deleteShippingOption, updateSettings } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<ShippingOption, 'id'>>(EMPTY)
  const [editForm, setEditForm] = useState<ShippingOption | null>(null)
  const [freeAbove, setFreeAbove] = useState(String(settings.freeShippingAbove))

  const { shippingOptions } = settings

  const handleAdd = () => {
    if (!form.name.trim()) { toast.error('Nome da opção é obrigatório'); return }
    if (!form.estimatedDays.trim()) { toast.error('Informe o prazo de entrega'); return }
    addShippingOption(form)
    setForm(EMPTY)
    setShowForm(false)
    toast.success('Opção de entrega adicionada!')
  }

  const handleUpdate = () => {
    if (!editForm) return
    if (!editForm.name.trim()) { toast.error('Nome é obrigatório'); return }
    updateShippingOption(editForm.id, editForm)
    setEditingId(null)
    setEditForm(null)
    toast.success('Opção de entrega salva!')
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Remover "${name}"?`)) return
    deleteShippingOption(id)
    toast.success('Opção removida')
  }

  const handleToggle = (opt: ShippingOption) => {
    updateShippingOption(opt.id, { active: !opt.active })
    toast.success(opt.active ? 'Opção desativada' : 'Opção ativada')
  }

  const handleSaveFreeAbove = () => {
    const val = parseFloat(freeAbove)
    if (isNaN(val) || val < 0) { toast.error('Valor inválido'); return }
    updateSettings({ freeShippingAbove: val })
    toast.success('Frete grátis atualizado!')
  }

  return (
    <div className="space-y-6 animate-fadeUp max-w-3xl"> {/* Header */}
      <div> <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2"> <Truck size={24} className="text-brand-pink" /> Opções de Entrega
        </h1> <p className="text-sm text-gray-500 mt-1">Configure os métodos de envio disponíveis para seus clientes.</p> </div> {/* Frete grátis acima de */}
      <div className="card p-5"> <h2 className="font-bold text-brand-navy mb-1">Frete Grátis</h2> <p className="text-sm text-gray-500 mb-4">Defina o valor mínimo para o frete ser grátis automaticamente.</p> <div className="flex items-center gap-3"> <div className="relative flex-1 max-w-xs"> <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">R$</span> <input
              type="number" min="0" step="1" value={freeAbove}
              onChange={e => setFreeAbove(e.target.value)}
              className="input-field pl-9 py-2.5" placeholder="299" /> </div> <button onClick={handleSaveFreeAbove} className="btn-navy">Salvar</button> </div> <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"> <AlertCircle size={12} /> Atual: frete grátis nas compras acima de {formatCurrency(settings.freeShippingAbove)}
        </p> </div> {/* Lista de opções */}
      <div className="card overflow-hidden"> <div className="flex items-center justify-between p-5 border-b border-gray-100"> <div> <h2 className="font-bold text-brand-navy">Métodos de Envio</h2> <p className="text-xs text-gray-400 mt-0.5">{shippingOptions.length} opções cadastradas · {shippingOptions.filter(s => s.active).length} ativas</p> </div> <button onClick={() => { setShowForm(true); setForm(EMPTY) }} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"> <Plus size={16} /> Nova opção
          </button> </div> <div className="divide-y divide-gray-50"> {shippingOptions.map(opt => (
            <div key={opt.id} className="px-5 py-4"> {editingId === opt.id && editForm ? (
                /* Formulário de edição inline */
                <div className="space-y-3 animate-fadeUp"> <div className="grid sm:grid-cols-2 gap-3"> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Nome da opção *</label> <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="input-field py-2 text-sm" placeholder="Ex: PAC, SEDEX, Motoboy..." /> </div> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Prazo estimado *</label> <input value={editForm.estimatedDays} onChange={e => setEditForm({ ...editForm, estimatedDays: e.target.value })} className="input-field py-2 text-sm" placeholder="Ex: 5 a 10 dias úteis" /> </div> </div> <div className="grid sm:grid-cols-2 gap-3"> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Preço (0 = grátis)</label> <div className="relative"> <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span> <input type="number" min="0" step="0.01" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })} className="input-field py-2 text-sm pl-9" /> </div> </div> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Descrição / Observação</label> <input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="input-field py-2 text-sm" placeholder="Ex: Apenas para Volta Redonda" /> </div> </div> <div className="flex gap-2 pt-1"> <button onClick={handleUpdate} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5"><Check size={14} /> Salvar</button> <button onClick={() => { setEditingId(null); setEditForm(null) }} className="btn-outline py-2 px-4 text-sm flex items-center gap-1.5"><X size={14} /> Cancelar</button> </div> </div> ) : (
                /* Visualização */
                <div className="flex items-center justify-between gap-4"> <div className="flex items-start gap-3 flex-1 min-w-0"> <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${opt.active ? 'bg-brand-navy/10' : 'bg-gray-100'}`}> <Truck size={16} className={opt.active ? 'text-brand-navy' : 'text-gray-400'} /> </div> <div className="flex-1 min-w-0"> <div className="flex items-center gap-2 flex-wrap"> <p className={`font-bold text-sm ${opt.active ? 'text-brand-navy' : 'text-gray-400'}`}>{opt.name}</p> {!opt.active && <span className="badge badge-gray text-[10px]">Inativo</span>}
                        {opt.price === 0 && opt.active && <span className="badge badge-green text-[10px]">Grátis</span>}
                      </div> <p className="text-xs text-gray-500 mt-0.5">{opt.estimatedDays}</p> {opt.description && <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>}
                    </div> </div> <div className="flex items-center gap-3 shrink-0"> <span className={`text-sm font-bold ${opt.price === 0 ? 'text-green-600' : 'text-brand-navy'}`}> {opt.price === 0 ? 'Grátis' : formatCurrency(opt.price)}
                    </span> <div className="flex items-center gap-1"> <button onClick={() => handleToggle(opt)} className="btn-ghost p-1.5 text-gray-400" title={opt.active ? 'Desativar' : 'Ativar'}> {opt.active ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                      </button> <button onClick={() => { setEditingId(opt.id); setEditForm({ ...opt }) }} className="btn-ghost p-1.5" title="Editar"> <Pencil size={15} /> </button> <button onClick={() => handleDelete(opt.id, opt.name)} className="btn-ghost p-1.5 hover:text-red-500" title="Remover"> <Trash2 size={15} /> </button> </div> </div> </div> )}
            </div> ))}

          {shippingOptions.length === 0 && (
            <div className="py-12 text-center text-gray-400"> <Truck size={32} className="mx-auto mb-3 opacity-30" /> <p className="text-sm">Nenhuma opção de entrega cadastrada.</p> <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-sm py-2">Adicionar primeira opção</button> </div> )}
        </div> {/* Formulário de adição */}
        {showForm && (
          <div className="border-t border-gray-100 p-5 bg-gray-50 animate-fadeUp"> <h3 className="font-bold text-brand-navy mb-4 flex items-center gap-2"><Plus size={16} /> Nova opção de entrega</h3> <div className="space-y-3"> <div className="grid sm:grid-cols-2 gap-3"> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Nome da opção *</label> <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field py-2 text-sm" placeholder="Ex: PAC, SEDEX, Motoboy, Retirada..." /> </div> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Prazo estimado *</label> <input value={form.estimatedDays} onChange={e => setForm({ ...form, estimatedDays: e.target.value })} className="input-field py-2 text-sm" placeholder="Ex: 5 a 10 dias úteis" /> </div> </div> <div className="grid sm:grid-cols-2 gap-3"> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Preço (0 para grátis)</label> <div className="relative"> <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span> <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="input-field py-2 text-sm pl-9" /> </div> </div> <div> <label className="text-xs font-bold text-gray-500 block mb-1">Descrição / Restrição</label> <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field py-2 text-sm" placeholder="Ex: Apenas para região de Volta Redonda" /> </div> </div> <div className="flex gap-2 pt-1"> <button onClick={handleAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5"><Check size={14} /> Adicionar</button> <button onClick={() => setShowForm(false)} className="btn-outline py-2 px-4 text-sm flex items-center gap-1.5"><X size={14} /> Cancelar</button> </div> </div> </div> )}
      </div> {/* Dica */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700"> <p className="font-bold mb-1"> Dica</p> <p>Opções com preço <strong>R$0,00</strong> aparecem como "Grátis" para o cliente. Você pode desativar temporariamente uma opção sem precisar excluí-la.</p> </div> </div> )
}
