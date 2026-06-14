import React, { useState } from 'react'
import { Search, ChevronDown, Package } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { OrderStatus } from '@/types'
import { formatCurrency, formatDate } from '@/utils/security'
import { sendOrderShippedToCustomer, sendOrderDeliveredToCustomer } from '@/services/email'
import toast from 'react-hot-toast'

const STATUS_OPTS = [
  { value:'all',         label:'Todos',       cls:'' },
  { value:'pending',     label:'Pendente',    cls:'badge-amber' },
  { value:'paid',        label:'Pago',        cls:'badge-navy' },
  { value:'processing',  label:'Preparando',  cls:'badge-navy' },
  { value:'shipped',     label:'Enviado',     cls:'badge-green' },
  { value:'delivered',   label:'Entregue',    cls:'badge-green' },
  { value:'cancelled',   label:'Cancelado',   cls:'badge-red' },
]

export default function OwnerOrders() {
  const { orders, updateOrder } = useStore()
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [trackingInputs, setTrackingInputs] = useState<Record<string,string>>({})

  const filtered = orders.filter(o => {
    const ms = o.id.includes(search) || o.customerName.toLowerCase().includes(search.toLowerCase())
    const st = statusFilter === 'all' || o.status === statusFilter
    return ms && st
  })

  const handleShipped = async (order: typeof orders[0]) => {
    const code = trackingInputs[order.id]?.trim() || ''
    updateOrder(order.id, { status: 'shipped', trackingCode: code || undefined })

    // Dispara e-mail automático para o cliente
    const ok = await sendOrderShippedToCustomer({
      customerName:  order.customerName,
      customerEmail: order.customerEmail,
      orderId:       order.id,
      trackingCode:  code || undefined,
      shippingMethod: 'Correios',
    })

    if (ok) toast.success(`✅ Pedido ${order.id} marcado como enviado! E-mail enviado para ${order.customerEmail}`)
    else    toast.success(`✅ Pedido ${order.id} marcado como enviado!`)
  }

  const handleDelivered = async (order: typeof orders[0]) => {
    updateOrder(order.id, { status: 'delivered' })

    const ok = await sendOrderDeliveredToCustomer({
      customerName:  order.customerName,
      customerEmail: order.customerEmail,
      orderId:       order.id,
    })

    if (ok) toast.success(`✅ Pedido ${order.id} marcado como entregue! E-mail enviado ao cliente`)
    else    toast.success(`✅ Pedido ${order.id} marcado como entregue!`)
  }

  const cancelOrder = (order: typeof orders[0]) => {
    if (!confirm(`Cancelar o pedido ${order.id}? Esta ação não pode ser desfeita.`)) return
    updateOrder(order.id, { status: 'cancelled' })
    toast.success('Pedido cancelado')
  }

  const pending = orders.filter(o => o.status === 'pending').length
  const shipped  = orders.filter(o => o.status === 'shipped').length

  return (
    <div className="space-y-6 animate-fadeUp">
      <div>
        <h1 className="text-2xl font-black text-brand-navy">Pedidos</h1>
        <div className="flex gap-4 mt-2">
          <span className="text-sm text-gray-500">{orders.length} pedidos no total</span>
          {pending > 0 && <span className="badge badge-amber">{pending} pendente{pending > 1 ? 's' : ''}</span>}
          {shipped > 0 && <span className="badge badge-navy">{shipped} em trânsito</span>}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pedido ou cliente..." className="input-field pl-9 py-2"/>
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field py-2 pr-8 appearance-none">
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        </div>
      </div>

      {/* Lista de pedidos */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-20"/>
          <p className="font-semibold">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const st = STATUS_OPTS.find(s => s.value === order.status)
            return (
              <div key={order.id} className="card p-5">
                {/* Cabeçalho */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-brand-pink">{order.id}</p>
                      {st && <span className={`badge ${st.cls}`}>{st.label}</span>}
                    </div>
                    <p className="text-sm font-bold text-brand-navy mt-0.5">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerEmail} · {order.customerPhone}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-brand-navy text-lg">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-gray-400">{order.paymentMethod === 'pix' ? '🔵 Pix' : '💳 Cartão'}</p>
                  </div>
                </div>

                {/* Itens */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="shrink-0 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <img src={item.productImage} alt="" className="w-9 h-9 rounded-lg object-cover"/>
                      <div className="text-xs">
                        <p className="font-bold text-brand-navy line-clamp-1 max-w-[120px]">{item.productName}</p>
                        <p className="text-gray-400">{item.size} · {item.color} · ×{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Endereço */}
                <div className="text-xs text-gray-500 mb-4 p-3 bg-gray-50 rounded-xl">
                  📍 {order.shippingAddress.street}, {order.shippingAddress.number} · {order.shippingAddress.neighborhood} · {order.shippingAddress.city}/{order.shippingAddress.state} · CEP {order.shippingAddress.zipCode}
                </div>

                {/* Ações */}
                <div className="flex flex-wrap gap-2 items-center">

                  {/* Pago → marcar enviado */}
                  {(order.status === 'paid' || order.status === 'processing') && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        placeholder="Código de rastreio (ex: AA123456789BR)"
                        value={trackingInputs[order.id] || ''}
                        onChange={e => setTrackingInputs(t => ({...t, [order.id]: e.target.value}))}
                        className="text-xs border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-brand-pink focus:outline-none w-56"
                      />
                      <button onClick={() => handleShipped(order)} className="btn-navy text-xs py-2 px-4">
                        🚚 Marcar como Enviado
                      </button>
                    </div>
                  )}

                  {/* Enviado → marcar entregue */}
                  {order.status === 'shipped' && (
                    <button onClick={() => handleDelivered(order)} className="btn-navy text-xs py-2 px-4">
                      ✅ Confirmar Entrega
                    </button>
                  )}

                  {/* Código de rastreio */}
                  {order.trackingCode && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-xl font-mono font-bold border border-blue-200">
                      📦 {order.trackingCode}
                    </span>
                  )}

                  {/* Cancelar (só para pendentes/pagos) */}
                  {['pending','paid','processing'].includes(order.status) && (
                    <button onClick={() => cancelOrder(order)} className="text-xs text-red-400 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors ml-auto">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
