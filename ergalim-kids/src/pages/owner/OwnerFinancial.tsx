import React, { useState } from 'react'
import { TrendingUp, DollarSign, ShoppingBag, Clock, ArrowUpRight, Download } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { formatCurrency, formatDate } from '@/utils/security'

const MONTH_NAMES: Record<string, string> = {
  '01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun',
  '07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez',
}

const STATUS_LABEL: Record<string, string> = {
  pending:'⏳ Pendente', paid:'✅ Pago', processing:'🔄 Preparando',
  shipped:'🚚 Enviado', delivered:'📦 Entregue', cancelled:'❌ Cancelado',
}

export default function OwnerFinancial() {
  const { orders } = useStore()
  const [period, setPeriod] = useState<'week'|'month'|'all'>('month')

  const paid    = orders.filter(o => ['paid','processing','shipped','delivered'].includes(o.status))
  const revenue = paid.reduce((a, o) => a + o.total, 0)
  const avgTicket = paid.length ? revenue / paid.length : 0
  const pending   = orders.filter(o => o.status === 'pending').reduce((a, o) => a + o.total, 0)
  const cancelled = orders.filter(o => o.status === 'cancelled').length

  // Receita por mês (últimos 6 meses)
  const byMonth: Record<string, number> = {}
  paid.forEach(o => {
    const m = o.createdAt.slice(0, 7)
    byMonth[m] = (byMonth[m] || 0) + o.total
  })
  // Preencher os últimos 6 meses (zero se não houve venda)
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    if (!byMonth[key]) byMonth[key] = 0
  }
  const months = Object.entries(byMonth).sort().slice(-6)
  const maxRev = Math.max(...months.map(([, v]) => v), 1)

  // Top produtos vendidos
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {}
  paid.forEach(o => o.items.forEach(item => {
    if (!productSales[item.productId]) productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0 }
    productSales[item.productId].qty     += item.quantity
    productSales[item.productId].revenue += item.price * item.quantity
  }))
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brand-navy">💰 Financeiro</h1>
          <p className="text-sm text-gray-400 font-bold mt-0.5">Receitas e relatórios da Ergalim Kids</p>
        </div>
        <button className="btn-outline flex items-center gap-2 text-sm py-2.5">
          <Download size={15}/> Exportar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Receita Total',
            value: formatCurrency(revenue),
            sub: `${paid.length} pedidos pagos`,
            icon: '💰',
            bg: 'bg-bg-soft border-brand-pink/20',
            change: null
          },
          {
            label: 'Mês Atual',
            value: formatCurrency(months[months.length-1]?.[1] || 0),
            sub: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            icon: '📈',
            bg: 'bg-bg-blue border-brand-sky/20',
            change: null
          },
          {
            label: 'Ticket Médio',
            value: formatCurrency(avgTicket),
            sub: 'Por pedido',
            icon: '🛍️',
            bg: 'bg-bg-mint border-brand-mint/20',
            change: null
          },
          {
            label: 'A Receber',
            value: formatCurrency(pending),
            sub: `${orders.filter(o=>o.status==='pending').length} pedidos pendentes`,
            icon: '⏳',
            bg: 'bg-amber-50 border-amber-200',
            change: null
          },
        ].map(kpi => (
          <div key={kpi.label} className={`card-kid p-5 border-2 ${kpi.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{kpi.icon}</span>
              {kpi.change && (
                <span className="text-xs font-black text-green-600 flex items-center gap-0.5">
                  <ArrowUpRight size={12}/> {kpi.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-brand-navy">{kpi.value}</p>
            <p className="text-xs text-gray-400 font-bold mt-1">{kpi.label}</p>
            <p className="text-[10px] text-gray-400 font-bold">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de barras */}
      <div className="card-kid p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-brand-navy text-lg">📊 Receita por Mês</h2>
          <div className="flex gap-2">
            {(['week','month','all'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${period===p ? 'bg-brand-pink text-white shadow-kid-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {p==='week' ? 'Semana' : p==='month' ? 'Mês' : 'Tudo'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-3 h-44">
          {months.map(([key, val], i) => {
            const [, month] = key.split('-')
            const pct = (val / maxRev) * 100
            const isLast = i === months.length - 1
            return (
              <div key={key} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-gray-400">{formatCurrency(val).replace('R$\u00a0','R$')}</span>
                <div className="w-full relative group" style={{height:`${pct}%`, minHeight:'8px'}}>
                  <div className={`w-full h-full rounded-t-xl transition-all duration-500 ${isLast ? 'bg-brand-pink shadow-kid-sm' : 'bg-gray-200 group-hover:bg-brand-pink/40'}`}/>
                </div>
                <span className="text-[10px] font-black text-gray-500">{MONTH_NAMES[month]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top produtos + Pedidos recentes */}
      <div className="grid xl:grid-cols-2 gap-5">

        {/* Top produtos */}
        <div className="card-kid overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-gray-100">
            <h2 className="font-black text-brand-navy">🏆 Produtos Mais Vendidos</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-3xl mb-2">📦</p>
                <p className="text-sm font-bold text-gray-400">Nenhuma venda ainda</p>
                <p className="text-xs text-gray-400 mt-1">Os produtos mais vendidos aparecem aqui</p>
              </div>
            ) : topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black
                    ${i===0 ? 'bg-brand-yellow text-brand-navy' : 'bg-gray-100 text-gray-500'}`}>{i+1}</span>
                  <div>
                    <p className="text-sm font-black text-brand-navy line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400 font-bold">{p.qty} vendas</p>
                  </div>
                </div>
                <span className="font-black text-brand-pink text-sm">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos pedidos */}
        <div className="card-kid overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-gray-100">
            <h2 className="font-black text-brand-navy">📋 Últimos Pedidos</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 6).map(o => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-black text-brand-pink">{o.id}</p>
                  <p className="text-xs font-bold text-brand-navy">{o.customerName}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{formatDate(o.createdAt)} · {STATUS_LABEL[o.status] || o.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-brand-navy">{formatCurrency(o.total)}</p>
                  <p className="text-xs text-gray-400 font-bold">{o.paymentMethod === 'pix' ? '🔵 Pix' : '💳 Cartão'}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="px-5 py-10 text-center text-gray-400">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-sm font-bold">Nenhum pedido ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumo rápido */}
      <div className="card-kid p-5">
        <h2 className="font-black text-brand-navy mb-4">📌 Resumo Geral</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total de pedidos',   value: String(orders.length), icon: '🛍️' },
            { label: 'Pedidos pagos',      value: String(paid.length),    icon: '✅' },
            { label: 'Em andamento',       value: String(orders.filter(o=>['paid','processing','shipped'].includes(o.status)).length), icon: '🔄' },
            { label: 'Cancelados',         value: String(cancelled),            icon: '❌' },
          ].map(item => (
            <div key={item.label} className="bg-bg-page rounded-2xl p-4 text-center border-2 border-gray-100">
              <p className="text-2xl mb-1">{item.icon}</p>
              <p className="text-2xl font-black text-brand-navy">{item.value}</p>
              <p className="text-xs text-gray-400 font-bold mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
