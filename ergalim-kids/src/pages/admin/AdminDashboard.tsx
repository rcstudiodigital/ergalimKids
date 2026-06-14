import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ShoppingBag, Users, Package, AlertCircle, ArrowUpRight } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { formatCurrency, formatDate } from '@/utils/security'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:'badge-amber',paid:'badge-navy',processing:'badge-navy',shipped:'badge-green',delivered:'badge-green',cancelled:'badge-red'
}

export default function AdminDashboard() {
  const { products, orders } = useStore()
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((a,o) => a+o.total, 0)
  const lowStock = products.filter(p => p.variants.some(v => v.stock <= 2) && p.active)

  return (
    <div className="space-y-6 animate-fadeUp">
      <div>
        <h1 className="text-2xl font-black text-navy">Dashboard Admin</h1>
        <p className="text-sm text-gray-400 mt-0.5">Visão completa da Ergalim Kids</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label:'Receita Total', value: formatCurrency(totalRevenue), icon:TrendingUp, color:'text-pink', bg:'bg-pink/10', change:'+12%' },
          { label:'Pedidos', value: String(orders.length), icon:ShoppingBag, color:'text-navy', bg:'bg-navy/10', change:`${orders.filter(o=>o.status==='pending').length} pendentes` },
          { label:'Produtos Ativos', value: String(products.filter(p=>p.active).length), icon:Package, color:'text-green-600', bg:'bg-green-50', change:`${lowStock.length} estoque baixo` },
          { label:'Clientes', value: '1.043', icon:Users, color:'text-purple-600', bg:'bg-purple-50', change:'+24 este mês' },
        ].map(({ label, value, icon:Icon, color, bg, change }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}><Icon size={18} className={color}/></div>
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-0.5"><ArrowUpRight size={12}/>{change}</span>
            </div>
            <p className="text-2xl font-black text-navy">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-black text-navy">Pedidos Recentes</h2>
            <Link to="/admin/orders" className="text-xs text-pink hover:underline font-bold">Ver todos →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-400 font-bold border-b border-gray-50">
                <th className="text-left px-5 py-3">Pedido</th><th className="text-left px-5 py-3">Cliente</th>
                <th className="text-left px-5 py-3">Status</th><th className="text-right px-5 py-3">Total</th>
              </tr></thead>
              <tbody>
                {orders.slice(0,5).map(o => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-black text-pink">{o.id}</td>
                    <td className="px-5 py-3 font-semibold text-gray-700">{o.customerName}</td>
                    <td className="px-5 py-3"><span className={`badge ${STATUS_LABELS[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                    <td className="px-5 py-3 text-right font-black text-navy">{formatCurrency(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 p-5 border-b border-gray-100">
            <AlertCircle size={16} className="text-amber-500"/>
            <h2 className="font-black text-navy">Estoque Baixo</h2>
          </div>
          <div className="p-4 space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">✅ Tudo em ordem!</p>
            ) : lowStock.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-navy truncate">{p.name}</p>
                  <p className="text-xs text-amber-600 mt-0.5">{p.variants.filter(v=>v.stock<=2).map(v=>`${v.size}: ${v.stock}un`).join(' · ')}</p>
                </div>
              </div>
            ))}
            <Link to="/admin/products" className="btn-ghost w-full justify-center text-xs mt-2">Gerenciar estoque</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
