import React, { useState, useEffect } from 'react'
import { Search, Mail, Phone, ShoppingBag, Users, Loader2 } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { formatCurrency, formatDate } from '@/utils/security'

interface CustomerRow {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  city: string
}

export default function AdminCustomers() {
  const { orders, firebaseEnabled } = useStore()
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)

  // Carrega clientes reais do Firebase e cruza com os pedidos
  useEffect(() => {
    const build = async () => {
      let registered: { email: string; name: string }[] = []
      if (firebaseEnabled) {
        try {
          const fb = await import('@/services/firestore')
          registered = await fb.fbGetAllCustomers()
        } catch { /* sem firebase */ }
      }

      // Agrupa pedidos por cliente (email)
      const byEmail: Record<string, CustomerRow> = {}

      // Primeiro adiciona os clientes cadastrados
      registered.forEach(c => {
        byEmail[c.email] = {
          id: c.email, name: c.name, email: c.email, phone: '',
          totalOrders: 0, totalSpent: 0, lastOrder: '', city: '',
        }
      })

      // Cruza com os pedidos
      orders.forEach(o => {
        const email = o.customerEmail || 'sem-email'
        if (!byEmail[email]) {
          byEmail[email] = {
            id: email, name: o.customerName || 'Cliente', email,
            phone: o.shippingAddress?.phone || '',
            totalOrders: 0, totalSpent: 0, lastOrder: o.createdAt,
            city: o.shippingAddress ? `${o.shippingAddress.city}/${o.shippingAddress.state}` : '',
          }
        }
        const row = byEmail[email]
        row.totalOrders += 1
        row.totalSpent += o.total || 0
        if (o.shippingAddress?.phone) row.phone = o.shippingAddress.phone
        if (o.shippingAddress) row.city = `${o.shippingAddress.city}/${o.shippingAddress.state}`
        if (!row.lastOrder || o.createdAt > row.lastOrder) row.lastOrder = o.createdAt
      })

      setCustomers(Object.values(byEmail))
      setLoading(false)
    }
    build()
  }, [orders, firebaseEnabled])

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = customers.reduce((a,c) => a+c.totalSpent, 0)
  const totalOrders  = customers.reduce((a,c) => a+c.totalOrders, 0)

  return (
    <div className="space-y-6 animate-fadeUp">
      <div>
        <h1 className="text-2xl font-black text-white">Clientes</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {customers.length} cliente(s) cadastrado(s) · {formatCurrency(totalRevenue)} em compras
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-white">{customers.length}</p>
          <p className="text-xs text-gray-500 mt-1">Clientes cadastrados</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-brand-pink">{totalOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Pedidos totais</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-green-400">
            {customers.length ? formatCurrency(totalRevenue/customers.length) : 'R$ 0,00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Ticket médio por cliente</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente..."
          className="input-field pl-9 py-2 bg-gray-900 border-gray-700 text-white placeholder-gray-500"/>
      </div>

      {loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <Loader2 size={28} className="text-brand-pink animate-spin mx-auto mb-2"/>
          <p className="text-sm text-gray-400 font-bold">Carregando clientes...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <Users size={32} className="text-gray-600 mx-auto mb-3"/>
          <p className="font-black text-white mb-1">Nenhum cliente ainda</p>
          <p className="text-sm text-gray-500">Quando alguém se cadastrar ou fizer um pedido, aparece aqui.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-xs text-gray-500 font-bold">
                  <th className="text-left px-5 py-3">Cliente</th>
                  <th className="text-left px-5 py-3">Contato</th>
                  <th className="text-left px-5 py-3">Cidade</th>
                  <th className="text-left px-5 py-3">Pedidos</th>
                  <th className="text-right px-5 py-3">Total gasto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-pink/20 flex items-center justify-center text-brand-pink font-black text-sm">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{c.name}</p>
                          {c.lastOrder && <p className="text-xs text-gray-500">Último pedido: {formatDate(c.lastOrder)}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-300 text-xs flex items-center gap-1"><Mail size={11}/> {c.email}</p>
                      {c.phone && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><Phone size={11}/> {c.phone}</p>}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{c.city || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-gray-300">
                        <ShoppingBag size={14} className="text-brand-pink"/> {c.totalOrders}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-black text-brand-pink">{formatCurrency(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
