import React, { useState } from 'react'
import { TrendingUp, DollarSign, ShoppingBag, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { formatCurrency, formatDate } from '@/utils/security'

const MONTHS = ['Jul','Ago','Set','Out','Nov','Dez','Jan']
const REVENUE = [18200, 21500, 19800, 24300, 31200, 38500, 28540]
const maxRev = Math.max(...REVENUE)

export default function AdminFinancial() {
  const { orders } = useStore()
  const [period, setPeriod] = useState<'week'|'month'|'all'>('month')

  const paidOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'pending')
  const totalRevenue   = paidOrders.reduce((a,o) => a + o.total, 0)
  const currentMonth   = REVENUE[REVENUE.length - 1]
  const prevMonth      = REVENUE[REVENUE.length - 2]
  const growth         = ((currentMonth - prevMonth) / prevMonth * 100).toFixed(1)
  const avgTicket      = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

  const TOP_PRODUCTS = [
    { name: 'Conjunto Moletom "A" Rosa',    sales: 34, revenue: 6456.60 },
    { name: 'Conjunto STK Bege/Preto',      sales: 28, revenue: 5597.20 },
    { name: 'Moletom "R" Pink Neon',        sales: 22, revenue: 3737.80 },
    { name: 'Jaqueta "A" com Capuz',        sales: 19, revenue: 2278.10 },
    { name: 'Calça Jogger STK Preta',       sales: 15, revenue: 1498.50 },
  ]

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
          { label:'Receita Total (7 meses)', value: formatCurrency(totalRevenue + 181540), icon: DollarSign, color:'text-brand-pink', bg:'bg-brand-pink/10', change:'+12.4%', up:true },
          { label:'Mês Atual', value: formatCurrency(currentMonth), icon: TrendingUp, color:'text-green-400', bg:'bg-green-400/10', change:`${growth}% vs mês anterior`, up: Number(growth) >= 0 },
          { label:'Ticket Médio', value: formatCurrency(200.85), icon: ShoppingBag, color:'text-blue-400', bg:'bg-blue-400/10', change:`${orders.length} pedidos`, up:true },
          { label:'A Receber (Pendentes)', value: formatCurrency(orders.filter(o=>o.status==='pending').reduce((a,o)=>a+o.total,0)), icon: DollarSign, color:'text-amber-400', bg:'bg-amber-400/10', change:'Aguardando pagamento', up:false },
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
          {REVENUE.map((r, i) => (
            <div key={MONTHS[i]} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold">{formatCurrency(r).replace('R$\u00a0','R$')}</span>
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${i === REVENUE.length-1 ? 'bg-brand-pink' : 'bg-gray-700 hover:bg-gray-600'}`}
                style={{ height:`${(r/maxRev)*100}%`, minHeight:'8px' }}
                title={`${MONTHS[i]}: ${formatCurrency(r)}`}
              />
              <span className="text-xs text-gray-500 font-bold">{MONTHS[i]}</span>
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
            {orders.slice(0,5).map(o => (
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
            {TOP_PRODUCTS.map((p, i) => (
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
