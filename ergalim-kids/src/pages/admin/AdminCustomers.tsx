import React, { useState } from 'react'
import { Search, User, Mail, Phone, ShoppingBag } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { formatCurrency, formatDate } from '@/utils/security'

// Mock de clientes baseado nos pedidos
const MOCK_CUSTOMERS = [
  { id:'c1', name:'Maria Silva',    email:'maria@email.com',  phone:'(24) 99999-0001', totalOrders:2, totalSpent:429.90,  lastOrder:'2025-01-20', city:'Volta Redonda/RJ' },
  { id:'c2', name:'João Pereira',   email:'joao@email.com',   phone:'(24) 98888-0002', totalOrders:1, totalSpent:269.82,  lastOrder:'2025-01-19', city:'Barra Mansa/RJ' },
  { id:'c3', name:'Ana Costa',      email:'ana@email.com',    phone:'(24) 97777-0003', totalOrders:3, totalSpent:679.60,  lastOrder:'2025-01-20', city:'Resende/RJ' },
  { id:'c4', name:'Carla Mendes',   email:'carla@email.com',  phone:'(11) 96666-0004', totalOrders:1, totalSpent:189.90,  lastOrder:'2025-01-18', city:'São Paulo/SP' },
  { id:'c5', name:'Fernanda Lima',  email:'fernandalima@email.com', phone:'(21) 95555-0005', totalOrders:4, totalSpent:1050.60, lastOrder:'2025-01-17', city:'Rio de Janeiro/RJ' },
]

export default function AdminCustomers() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = MOCK_CUSTOMERS.reduce((a,c) => a+c.totalSpent, 0)
  const totalOrders  = MOCK_CUSTOMERS.reduce((a,c) => a+c.totalOrders, 0)

  return (
    <div className="space-y-6 animate-fadeUp">
      <div>
        <h1 className="text-2xl font-black text-white">Clientes</h1>
        <p className="text-sm text-gray-400 mt-0.5">{MOCK_CUSTOMERS.length} clientes cadastrados · {formatCurrency(totalRevenue)} em compras</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-white">{MOCK_CUSTOMERS.length}</p>
          <p className="text-xs text-gray-500 mt-1">Clientes cadastrados</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-pink">{totalOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Pedidos totais</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-green-400">{formatCurrency(totalRevenue/MOCK_CUSTOMERS.length)}</p>
          <p className="text-xs text-gray-500 mt-1">Ticket médio por cliente</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente..." className="input-field pl-9 py-2 bg-gray-900 border-gray-700 text-white placeholder-gray-500"/>
      </div>

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
                      <div className="w-9 h-9 rounded-full bg-pink/20 flex items-center justify-center text-pink font-black text-sm">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{c.name}</p>
                        <p className="text-xs text-gray-500">Último pedido: {formatDate(c.lastOrder)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-gray-300 text-xs flex items-center gap-1"><Mail size={11}/> {c.email}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><Phone size={11}/> {c.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{c.city}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <ShoppingBag size={14} className="text-pink"/> {c.totalOrders}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-black text-pink">{formatCurrency(c.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
