import React, { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { OrderStatus } from '@/types'
import { formatCurrency, formatDate } from '@/utils/security'
import toast from 'react-hot-toast'

const STATUS_OPTS = [
  { value:'all', label:'Todos' },
  { value:'pending', label:'Pendente' },
  { value:'paid', label:'Pago' },
  { value:'processing', label:'Preparando' },
  { value:'shipped', label:'Enviado' },
  { value:'delivered', label:'Entregue' },
  { value:'cancelled', label:'Cancelado' },
]
const BADGE: Record<string,string> = { pending:'badge-amber', paid:'badge-navy', processing:'badge-navy', shipped:'badge-green', delivered:'badge-green', cancelled:'badge-red' }

export default function AdminOrders() {
  const { orders, updateOrder } = useStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [trackingInputs, setTrackingInputs] = useState<Record<string,string>>({})

  const filtered = orders.filter(o => {
    const ms = o.id.includes(search) || o.customerName.toLowerCase().includes(search.toLowerCase())
    const st = statusFilter === 'all' || o.status === statusFilter
    return ms && st
  })

  const handleStatus = (id: string, status: OrderStatus) => {
    updateOrder(id, { status })
    toast.success('Status atualizado! E-mail enviado ao cliente.')
  }

  const handleShipped = (id: string) => {
    const code = trackingInputs[id] || ''
    updateOrder(id, { status: 'shipped', trackingCode: code })
    toast.success(`Pedido marcado como enviado!${code ? ` Código: ${code}` : ''}`)
  }

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brand-navy">Pedidos</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} pedidos · {orders.filter(o=>o.status==='pending').length} pendentes</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar pedido ou cliente..." className="input-field pl-9 py-2"/>
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="input-field py-2 pr-8 appearance-none">
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-black text-brand-pink">{order.id}</p>
                <p className="text-sm font-bold text-brand-navy">{order.customerName}</p>
                <p className="text-xs text-gray-400">{order.customerEmail} · {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${BADGE[order.status] || 'badge-gray'}`}>{STATUS_OPTS.find(s=>s.value===order.status)?.label}</span>
                <span className="font-black text-brand-navy">{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {order.items.map((item,i) => (
                <div key={i} className="shrink-0 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5">
                  <img src={item.productImage} alt="" className="w-8 h-8 rounded-lg object-cover"/>
                  <div className="text-xs"><p className="font-bold text-brand-navy line-clamp-1 max-w-[100px]">{item.productName}</p><p className="text-gray-400">{item.size} · ×{item.quantity}</p></div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Mudar status */}
              <select value={order.status} onChange={e=>handleStatus(order.id, e.target.value as OrderStatus)}
                className="text-xs bg-white text-brand-navy border-2 border-gray-200 rounded-lg px-2 py-1.5 font-bold focus:border-brand-pink focus:outline-none">
                {STATUS_OPTS.filter(o=>o.value!=='all').map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* Marcar como enviado + código de rastreio */}
              {(order.status === 'paid' || order.status === 'processing') && (
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Código de rastreio (opcional)"
                    value={trackingInputs[order.id] || ''}
                    onChange={e=>setTrackingInputs(t=>({...t,[order.id]:e.target.value}))}
                    className="text-xs border-2 border-gray-200 rounded-lg px-3 py-1.5 focus:border-brand-pink focus:outline-none w-48"
                  />
                  <button onClick={()=>handleShipped(order.id)} className="btn-primary py-1.5 px-3 text-xs">✅ Marcar Enviado</button>
                </div>
              )}

              {order.trackingCode && (
                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-mono font-bold">
                  📦 {order.trackingCode}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
