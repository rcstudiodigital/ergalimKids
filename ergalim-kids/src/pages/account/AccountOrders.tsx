import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Package, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useStore } from '@/context/StoreContext'
import { formatCurrency, formatDate } from '@/utils/security'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Pendente',     cls: 'badge-amber' },
  paid:       { label: 'Pago',         cls: 'badge-navy' },
  processing: { label: 'Preparando',   cls: 'badge-navy' },
  shipped:    { label: ' Enviado',   cls: 'badge-green' },
  delivered:  { label: ' Entregue',  cls: 'badge-green' },
  cancelled:  { label: 'Cancelado',    cls: 'badge-red'   },
}

export default function AccountOrders() {
  const { user } = useAuth()
  const { orders } = useStore()

  if (!user) return <Navigate to="/login?redirect=/account/orders" replace /> // Filtra pedidos do cliente logado (mock: mostra todos para demo)
  const myOrders = orders.filter(o => o.customerId === user.id || o.customerEmail === user.email || user.role !== 'customer')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10"> <h1 className="text-2xl font-black text-brand-navy mb-6">Meus Pedidos</h1> {myOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-400"> <Package size={48} className="mx-auto mb-4 opacity-20" /> <p className="text-lg font-semibold mb-2">Nenhum pedido ainda</p> <p className="text-sm mb-6">Explore nossa coleção e faça seu primeiro pedido!</p> <Link to="/shop" className="btn-primary">Ver coleção</Link> </div> ) : (
        <div className="space-y-4"> {myOrders.map(order => {
            const st = STATUS_LABELS[order.status] || { label: order.status, cls: 'badge-gray' }
            return (
              <div key={order.id} className="card p-5"> <div className="flex items-start justify-between gap-3 mb-3"> <div> <p className="font-black text-brand-navy text-sm">Pedido {order.id}</p> <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p> </div> <span className={st.cls + ' badge'}>{st.label}</span> </div> <div className="flex gap-2 mb-3 overflow-x-auto pb-1"> {order.items.map((item, i) => {
                    const imgSrc = item.image || item.productImage || ''
                    return (
                      <div key={i} className="shrink-0 flex items-center gap-2 bg-gray-50 rounded-xl px-2 py-1.5 border border-gray-100"> <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center"> {imgSrc ? (
                            <img src={imgSrc} alt={item.productName} className="w-full h-full object-cover" /> ) : (
                            <span className="text-lg"></span> )}
                        </div> <div className="text-xs pr-1"> <p className="font-bold text-brand-navy line-clamp-1 max-w-[100px]">{item.productName}</p> <p className="text-gray-400">{item.size} · {item.color} · ×{item.quantity}</p> </div> </div> )
                  })}
                </div> <div className="flex items-center justify-between"> <div> <p className="text-xs text-gray-500">{order.items.length} {order.items.length === 1 ? 'item' : 'itens'}</p> <p className="font-black text-brand-navy">{formatCurrency(order.total)}</p> </div> {order.trackingCode && (
                    <div className="text-right"> <p className="text-xs text-gray-400">Código de rastreio</p> <p className="text-xs font-bold text-brand-navy font-mono">{order.trackingCode}</p> </div> )}
                </div> {order.status === 'shipped' && order.trackingCode && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-semibold"> Seu pedido foi enviado! Rastreie em rastreamento.correios.com.br com o código <span className="font-mono">{order.trackingCode}</span> </div> )}
              </div> )
          })}
        </div> )}
    </div> )
}
