import React, { useState } from 'react'
import { TrendingUp, DollarSign, ShoppingBag, ArrowUpRight, ArrowDownRight, Download, Package } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { formatCurrency, formatDate } from '@/utils/security'

export default function AdminFinancial() {
  const { orders } = useStore()

  const paidOrders   = orders.filter(o => o.status !== 'cancelled' && o.status !== 'pending')
  const totalRevenue = paidOrders.reduce((a,o) => a + o.total, 0)
  const avgTicket    = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0
  const pending      = orders.filter(o => o.status === 'pending').reduce((a,o) => a + o.total, 0)

  // Receita dos últimos 7 meses (real)
  const now = new Date()
  const byMonth: Record<string, number> = {}
  paidOrders.forEach(o => {
    const m = (o.createdAt || '').slice(0, 7)
    if (m) byMonth[m] = (byMonth[m] || 0) + o.total
  })
  const monthsData: { label: string; value: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    monthsData.push({
      label: d.toLocaleDateString('pt-BR', { month: 'short' }),
      value: byMonth[key] || 0,
    })
  }
  const maxRev       = Math.max(...monthsData.map(m => m.value), 1)
  const currentMonth = monthsData[monthsData.length - 1].value
  const prevMonth    = monthsData[monthsData.length - 2].value
  const growth       = prevMonth > 0 ? ((currentMonth - prevMonth) / prevMonth * 100).toFixed(1) : null

  // Top produtos (real, baseado nos pedidos)
  const productSales: Record<string, { name: string; sales: number; revenue: number }> = {}
  paidOrders.forEach(o => o.items?.forEach(item => {
    const key = item.productId || item.productName
    if (!productSales[key]) productSales[key] = { name: item.productName, sales: 0, revenue: 0 }
    productSales[key].sales   += item.quantity
    productSales[key].revenue += item.price * item.quantity
  }))
  const topProducts = Object.values(productSales).sort((a,b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Financeiro</h1>
          <p className="text-sm text-gray-400 mt-0.5">Visão completa de receitas e vendas</p>
        </div>
        <button className="btn-ghost text-gray-400 hover:text-white text-sm flex items-center gap-2 border border-gray-700 rounded-xl px-4 py-2">
          <Download size={15}/> Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label:'Receita Total', value: formatCurrency(totalRevenue), icon: DollarSign, color:'text-brand-pink', bg:'bg-brand-pink/10', change:`${paidOrders.length} vendas`, up:true },
          { label:'Mês Atual', value: formatCurrency(currentMonth), icon: TrendingUp, color:'text-green-400', bg:'bg-green-400/10', change: growth !== null ? `${growth}% vs mês anterior` : 'sem comparação', up: growth === null || Number(growth) >= 0 },
          { label:'Ticket Médio', value: formatCurrency(avgTicket), icon: ShoppingBag, color:'text-blue-400', bg:'bg-blue-400/10', change:`${orders.length} pedidos`, up:true },
          { label:'A Receber (Pendentes)', value: formatCurrency(pending), icon: DollarSign, color:'text-amber-400', bg:'bg-amber-400/10', change:'Aguardando pagamento', up:false },
        ].map(({ label, value, icon:Icon, color, bg, change, up }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color}/>
              </div>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${up ? 'text-green-400' : 'text-amber-400'}`}>
                {up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {change}
              </span>
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de barras */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="font-black text-white mb-6">Receita Mensal</h2>
        <div className="flex items-end gap-3 h-44">
          {monthsData.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold">{formatCurrency(m.value).replace('R$\u00a0','R$')}</span>
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${i === monthsData.length-1 ? 'bg-brand-pink' : 'bg-gray-700 hover:bg-gray-600'}`}
                style={{ height:`${(m.value/maxRev)*100}%`, minHeight:'8px' }}
                title={`${m.label}: ${formatCurrency(m.value)}`}
              />
              <span className="text-xs text-gray-500 font-bold">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pedidos recentes e top produtos */}
      <div className="grid xl:grid-cols-2 gap-6">
        {/* Pedidos recentes */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <h2 className="font-black text-white">Últimos Pedidos</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {orders.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Package size={28} className="text-gray-600 mx-auto mb-2"/>
                <p className="text-sm font-bold text-gray-400">Nenhum pedido ainda</p>
              </div>
            ) : orders.slice(0,5).map(o => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-bold text-brand-pink">{o.id}</p>
                  <p className="text-xs text-gray-400">{o.customerName} · {formatDate(o.createdAt)}</p>
                </div>
                <span className="font-black text-white">{formatCurrency(o.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top produtos */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-800">
            <h2 className="font-black text-white">Top Produtos</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {topProducts.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Package size={28} className="text-gray-600 mx-auto mb-2"/>
                <p className="text-sm font-bold text-gray-400">Nenhuma venda ainda</p>
              </div>
            ) : topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-brand-pink text-white' : 'bg-gray-800 text-gray-400'}`}>{i+1}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.sales} vendas</p>
                  </div>
                </div>
                <span className="font-black text-brand-pink">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
