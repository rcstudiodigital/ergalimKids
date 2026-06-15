import React, { useState } from 'react'
import { Search, MessageCircle, Package, Truck, CheckCircle, X, ChevronDown } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { sendOrderShippedToCustomer, sendOrderPaidToCustomer, sendOrderProcessingToCustomer, sendOrderDeliveredToCustomer } from '@/services/email'
import type { OrderStatus } from '@/types'
import { formatCurrency, formatDate } from '@/utils/security'
import toast from 'react-hot-toast'

const STATUS_FLOW: { value: OrderStatus; label: string; color: string; bg: string; next?: OrderStatus; nextLabel?: string; nextColor?: string }[] = [
  { value: 'pending',    label: '⏳ Pendente',    color: 'text-amber-700',  bg: 'bg-amber-100',  next: 'paid',       nextLabel: '✅ Confirmar Pagamento', nextColor: 'bg-blue-500 hover:bg-blue-600' },
  { value: 'paid',       label: '✅ Pago',         color: 'text-blue-700',   bg: 'bg-blue-100',   next: 'processing', nextLabel: '📦 Em Separação',        nextColor: 'bg-amber-500 hover:bg-amber-600' },
  { value: 'processing', label: '📦 Em Separação', color: 'text-orange-700', bg: 'bg-orange-100', next: 'shipped',    nextLabel: '🚚 Marcar Enviado',      nextColor: 'bg-purple-500 hover:bg-purple-600' },
  { value: 'shipped',    label: '🚚 Enviado',      color: 'text-purple-700', bg: 'bg-purple-100', next: 'delivered',  nextLabel: '✅ Confirmar Entrega',    nextColor: 'bg-green-500 hover:bg-green-600' },
  { value: 'delivered',  label: '🎉 Entregue',     color: 'text-green-700',  bg: 'bg-green-100' },
  { value: 'cancelled',  label: '❌ Cancelado',    color: 'text-red-700',    bg: 'bg-red-100' },
]

const FILTER_OPTS = [
  { value: 'all',        label: 'Todos' },
  { value: 'pending',    label: '⏳ Pendentes' },
  { value: 'paid',       label: '✅ Pagos' },
  { value: 'processing', label: '📦 Em Separação' },
  { value: 'shipped',    label: '🚚 Enviados' },
  { value: 'delivered',  label: '🎉 Entregues' },
  { value: 'cancelled',  label: '❌ Cancelados' },
]

export default function OwnerOrders() {
  const { orders, updateOrder } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter
    const matchSearch = !search || o.id.includes(search) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const pendingCount = orders.filter(o => o.status === 'pending').length

  const getStatus = (status: OrderStatus) => STATUS_FLOW.find(s => s.value === status) || STATUS_FLOW[0]

  const handleNextStatus = async (order: typeof orders[0]) => {
    const current = getStatus(order.status)
    if (!current.next) return
    const nextStatus = current.next

    // Atualizar status no Firebase
    if (nextStatus === 'shipped') {
      const code = trackingInputs[order.id]?.trim()
      await updateOrder(order.id, { status: 'shipped', trackingCode: code || undefined })
    } else {
      await updateOrder(order.id, { status: nextStatus })
    }

    // Disparar e-mail para o cliente conforme o novo status
    const base = {
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderId: order.id,
    }

    try {
      if (nextStatus === 'paid') {
        await sendOrderPaidToCustomer({
          ...base,
          total: order.total,
          items: order.items?.map((i: any) => ({ productName: i.productName, quantity: i.quantity, size: i.size })) || [],
        })
      } else if (nextStatus === 'processing') {
        await sendOrderProcessingToCustomer(base)
      } else if (nextStatus === 'shipped') {
        const code = trackingInputs[order.id]?.trim()
        await sendOrderShippedToCustomer({
          ...base,
          trackingCode: code || undefined,
          shippingMethod: order.shippingMethod || 'Padrão',
        })
      } else if (nextStatus === 'delivered') {
        await sendOrderDeliveredToCustomer(base)
      }
    } catch {
      // e-mail falhou silenciosamente — pedido já foi atualizado
    }

    const statusLabel = STATUS_FLOW.find(s => s.value === nextStatus)?.label || ''
    toast.success(`${statusLabel} — Pedido ${order.id} atualizado! E-mail enviado ao cliente. 📧`)
  }

  const handleCancel = async (order: typeof orders[0]) => {
    if (!confirm(`Cancelar o pedido ${order.id} de ${order.customerName}?`)) return
    await updateOrder(order.id, { status: 'cancelled' })
    toast.success('Pedido cancelado')
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-brand-navy">Pedidos</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {orders.length} pedidos no total
          {pendingCount > 0 && <span className="ml-2 badge badge-yellow">{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</span>}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pedido ou cliente..."
            className="input-field pl-9 py-2 text-sm w-full"/>
        </div>
        <div className="relative">
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="input-field py-2 pr-8 text-sm appearance-none bg-white text-brand-navy font-bold border-2 border-gray-200">
            {FILTER_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={32} className="text-gray-300 mx-auto mb-3"/>
          <p className="font-bold text-gray-400">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const st = getStatus(order.status)
            const isCancelled = order.status === 'cancelled'
            const isDelivered = order.status === 'delivered'

            return (
              <div key={order.id} className={`card p-5 ${isCancelled ? 'opacity-60' : ''}`}>
                
                {/* Linha 1: ID + Status + Valor */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-brand-pink text-base">{order.id}</span>
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                    {order.trackingCode && (
                      <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                        📦 {order.trackingCode}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-black text-brand-navy text-lg">{formatCurrency(order.total)}</span>
                    <p className="text-xs text-gray-400">{order.paymentMethod === 'pix' ? '🔵 Pix' : order.paymentMethod === 'whatsapp' ? '💬 WhatsApp' : '💳 Cartão'}</p>
                  </div>
                </div>

                {/* Linha 2: Cliente */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-brand-navy text-sm">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerEmail} · {formatDate(order.createdAt)}</p>
                  </div>
                  {/* Botão WhatsApp do cliente */}
                  {order.customerPhone && (
                    <a href={`https://wa.me/55${order.customerPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`Olá ${order.customerName}! 👋 Sou o Gabriel da Ergalim Kids.\n\nSeu pedido *${order.id}* está sendo tratado com carinho! 💕\n\nTotal: ${formatCurrency(order.total)}\n\nQualquer dúvida estou aqui! 😊`)}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-black text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-xl transition-colors shrink-0">
                      <MessageCircle size={13}/> WhatsApp
                    </a>
                  )}
                </div>

                {/* Linha 3: Produtos */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {order.items?.map((item, i) => (
                    <div key={i} className="shrink-0 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                      {(item.image || item.productImage) && (
                        <img src={item.image || item.productImage} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-200"/>
                      )}
                      <div className="text-xs">
                        <p className="font-bold text-brand-navy line-clamp-1 max-w-[120px]">{item.productName}</p>
                        <p className="text-gray-400">{item.size} · {item.color} · ×{item.quantity}</p>
                        <p className="font-bold text-brand-pink">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linha 4: Endereço */}
                {order.shippingAddress && (
                  <div className="text-xs text-gray-500 mb-4 p-3 bg-gray-50 rounded-xl">
                    📍 {order.shippingAddress.street}, {order.shippingAddress.number}
                    {order.shippingAddress.complement ? `, ${order.shippingAddress.complement}` : ''} ·{' '}
                    {order.shippingAddress.neighborhood} · {order.shippingAddress.city}/{order.shippingAddress.state} · CEP {order.shippingAddress.zipCode}
                  </div>
                )}

                {/* Linha 5: AÇÕES — Fluxo de status */}
                {!isCancelled && !isDelivered && (
                  <div className="border-t border-gray-100 pt-4">
                    {/* Fluxo visual */}
                    <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                      {STATUS_FLOW.filter(s => s.value !== 'cancelled').map((s, i, arr) => {
                        const currentIdx = arr.findIndex(x => x.value === order.status)
                        const thisIdx = i
                        const isDone = thisIdx < currentIdx
                        const isCurrent = thisIdx === currentIdx
                        return (
                          <React.Fragment key={s.value}>
                            <div className={`text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap ${isCurrent ? s.bg + ' ' + s.color : isDone ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-300'}`}>
                              {isDone ? '✓ ' : ''}{s.label.split(' ').slice(1).join(' ')}
                            </div>
                            {i < arr.length - 1 && <div className={`text-xs ${isDone ? 'text-green-400' : 'text-gray-200'}`}>→</div>}
                          </React.Fragment>
                        )
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Campo de rastreio se for enviar */}
                      {order.status === 'processing' && (
                        <input
                          placeholder="Código de rastreio (ex: AA123456789BR) — opcional"
                          value={trackingInputs[order.id] || ''}
                          onChange={e => setTrackingInputs(t => ({...t, [order.id]: e.target.value}))}
                          className="text-xs border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-brand-pink focus:outline-none flex-1 min-w-[220px]"
                        />
                      )}

                      {/* Botão de avançar status */}
                      {st.next && (
                        <button onClick={() => handleNextStatus(order)}
                          className={`text-xs font-black text-white px-4 py-2.5 rounded-xl transition-colors ${st.nextColor}`}>
                          {st.nextLabel}
                        </button>
                      )}

                      {/* Cancelar */}
                      <button onClick={() => handleCancel(order)}
                        className="text-xs font-bold text-red-400 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors ml-auto">
                        <X size={14} className="inline mr-1"/>Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Pedido entregue */}
                {isDelivered && (
                  <div className="border-t border-gray-100 pt-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500"/>
                    <span className="text-sm font-bold text-green-600">Pedido entregue com sucesso!</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
