import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Package, ShoppingBag, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate } from '@/utils/security'

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:    { label: ' Pendente',    cls: 'bg-amber-100 text-amber-700' },
  paid:       { label: ' Pago',         cls: 'bg-blue-100 text-blue-700' },
  processing: { label: ' Preparando',  cls: 'bg-blue-100 text-blue-700' },
  shipped:    { label: ' Enviado',      cls: 'bg-green-100 text-green-700' },
  delivered:  { label: ' Entregue',    cls: 'bg-green-100 text-green-700' },
  cancelled:  { label: ' Cancelado',   cls: 'bg-red-100 text-red-700' },
}

export default function OwnerDashboard() {
  const { user } = useAuth()
  const { orders, products } = useStore()

  const pending  = orders.filter(o => o.status === 'pending').length
  const shipped  = orders.filter(o => o.status === 'shipped').length
  const revenue  = orders.filter(o => ['paid','processing','shipped','delivered'].includes(o.status))
                         .reduce((a, o) => a + o.total, 0)
  const lowStock = products.filter(p => p.active && p.variants.some(v => v.stock <= 2))

  const recentOrders = [...orders].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4)

  return (
    <div className="space-y-6 animate-fadeUp"> {/* Saudação */}
      <div className="bg-gradient-to-r from-brand-navy to-blue-800 rounded-3xl p-6 text-white relative overflow-hidden"> <p className="text-white/70 text-sm font-bold mb-1">Bem-vindo de volta!</p> <h1 className="text-2xl font-black mb-4">Olá, {user?.name.split(' ')[0]}! </h1> <div className="flex flex-wrap gap-3"> <Link to="/owner/orders" className="btn-yellow text-sm py-2.5 shadow-soft"> Ver Pedidos
            {pending > 0 && <span className="ml-1 bg-brand-pink text-white px-2 py-0.5 rounded-full text-[10px] font-black">{pending}</span>}
          </Link> <Link to="/owner/products" className="btn-outline border-white text-white hover:bg-white hover:text-brand-navy text-sm py-2.5"> Gerenciar Produtos
          </Link> <Link to="/owner/financial" className="btn-outline border-white text-white hover:bg-white hover:text-brand-navy text-sm py-2.5"> Financeiro
          </Link> </div> </div> {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4"> <div className="card-kid p-5 bg-bg-soft border-2 border-brand-pink/20"> <p className="text-2xl font-black text-brand-navy">{formatCurrency(revenue)}</p> <p className="text-xs text-gray-400 font-bold mt-1">Receita total</p> </div> <div className="card-kid p-5 bg-bg-soft border-2 border-brand-blue/20"> <div className="flex items-center justify-between mb-2"> {pending > 0 && (
              <span className="bg-brand-pink text-white text-[10px] font-black px-2 py-0.5 rounded-full"> {pending} novos
              </span> )}
          </div> <p className="text-2xl font-black text-brand-navy">{orders.length}</p> <p className="text-xs text-gray-400 font-bold mt-1">Total de pedidos</p> </div> <div className="card-kid p-5 bg-bg-mint border-2 border-brand-mint/20 col-span-2 xl:col-span-1"> <p className="text-2xl font-black text-brand-navy">{products.filter(p=>p.active).length}</p> <p className="text-xs text-gray-400 font-bold mt-1">Produtos ativos</p> </div> </div> <div className="grid xl:grid-cols-3 gap-5"> {/* Pedidos recentes */}
        <div className="xl:col-span-2 card-kid overflow-hidden"> <div className="flex items-center justify-between px-5 py-4 border-b-2 border-gray-100"> <h2 className="font-black text-brand-navy"> Pedidos Recentes</h2> <Link to="/owner/orders" className="text-xs font-black text-brand-pink hover:underline flex items-center gap-1"> Ver todos <ArrowRight size={12}/> </Link> </div> <div className="divide-y divide-gray-50"> {recentOrders.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400"> <ShoppingBag size={32} className="mx-auto mb-2 opacity-30"/> <p className="text-sm font-bold">Nenhum pedido ainda</p> </div> ) : recentOrders.map(o => {
              const st = STATUS_BADGE[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600' }
              return (
                <div key={o.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-page transition-colors"> <div> <div className="flex items-center gap-2 flex-wrap"> <p className="text-sm font-black text-brand-pink">{o.id}</p> <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span> </div> <p className="text-xs font-bold text-brand-navy">{o.customerName}</p> <p className="text-[10px] text-gray-400 font-bold">{formatDate(o.createdAt)}</p> </div> <p className="font-black text-brand-navy">{formatCurrency(o.total)}</p> </div> )
            })}
          </div> {pending > 0 && (
            <div className="px-5 py-3 bg-amber-50 border-t-2 border-amber-200"> <Link to="/owner/orders" className="flex items-center gap-2 text-sm font-black text-amber-700 hover:underline"> <Clock size={14}/> {pending} pedido{pending > 1 ? 's' : ''} aguardando sua atenção <ArrowRight size={12}/> </Link> </div> )}
        </div> {/* Alertas rápidos */}
        <div className="space-y-4"> {/* Estoque baixo */}
          <div className="card-kid overflow-hidden"> <div className="flex items-center gap-2 px-5 py-4 border-b-2 border-gray-100"> <AlertCircle size={16} className="text-amber-500"/> <h2 className="font-black text-brand-navy text-sm"> Estoque Baixo</h2> </div> <div className="p-3 space-y-2 max-h-48 overflow-y-auto"> {lowStock.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 text-center py-3"> Tudo em ordem!</p> ) : lowStock.map(p => (
                <div key={p.id} className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-200"> <img src={p.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100 shrink-0"/> <div className="min-w-0"> <p className="text-xs font-black text-brand-navy truncate">{p.name}</p> <p className="text-[10px] font-bold text-amber-600"> {p.variants.filter(v=>v.stock<=2).map(v=>`${v.size}: ${v.stock}un`).join(' · ')}
                    </p> </div> </div> ))}
              {lowStock.length > 0 && (
                <Link to="/owner/products" className="btn-outline w-full justify-center text-xs py-2 mt-1"> Atualizar estoque
                </Link> )}
            </div> </div> {/* Atalhos */}
          <div className="card-kid p-4 space-y-2"> <h2 className="font-black text-brand-navy text-sm mb-3"> Ações Rápidas</h2> <Link to="/owner/products" className="flex items-center justify-between p-3 bg-bg-page rounded-2xl hover:bg-bg-soft transition-colors group"> <div className="flex items-center gap-2"> <span className="text-lg"></span> <span className="text-sm font-black text-brand-navy">Adicionar produto</span> </div> <ArrowRight size={14} className="text-gray-400 group-hover:text-brand-pink transition-colors"/> </Link> <Link to="/owner/promotions" className="flex items-center justify-between p-3 bg-bg-page rounded-2xl hover:bg-bg-soft transition-colors group"> <div className="flex items-center gap-2"> <span className="text-lg"></span> <span className="text-sm font-black text-brand-navy">Criar promoção</span> </div> <ArrowRight size={14} className="text-gray-400 group-hover:text-brand-pink transition-colors"/> </Link> <Link to="/owner/financial" className="flex items-center justify-between p-3 bg-bg-page rounded-2xl hover:bg-bg-soft transition-colors group"> <div className="flex items-center gap-2"> <span className="text-lg"></span> <span className="text-sm font-black text-brand-navy">Ver financeiro</span> </div> <ArrowRight size={14} className="text-gray-400 group-hover:text-brand-pink transition-colors"/> </Link> </div> </div> </div> </div> )
}
