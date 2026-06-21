import React, { useState, useEffect } from 'react'
import { Star, Mail, MessageSquare, Inbox } from 'lucide-react'
import { fbWatchFeedbacks, fbMarkFeedbackRead } from '@/services/firestore'
import type { Feedback } from '@/types'

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    const unsub = fbWatchFeedbacks(list => { setFeedbacks(list); setLoading(false) })
    return () => unsub()
  }, [])

  const shown = filter === 'unread' ? feedbacks.filter(f => !f.read) : feedbacks
  const unreadCount = feedbacks.filter(f => !f.read).length
  const avg = feedbacks.length > 0
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—'

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }) }
    catch { return d }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-white flex items-center gap-2">
          <MessageSquare size={22} className="text-brand-pink"/> Feedbacks dos clientes
        </h1>
        <p className="text-sm text-gray-400 mt-1">Avaliações enviadas pelos clientes após a compra.</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-400 font-bold">Total</p>
          <p className="text-2xl font-black text-white">{feedbacks.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-400 font-bold">Nota média</p>
          <p className="text-2xl font-black text-brand-yellow flex items-center gap-1">
            {avg} {avg !== '—' && <Star size={18} className="fill-brand-yellow text-brand-yellow"/>}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-400 font-bold">Não lidos</p>
          <p className="text-2xl font-black text-brand-pink">{unreadCount}</p>
        </div>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              filter === f ? 'bg-brand-pink text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}>
            {f === 'all' ? 'Todos' : `Não lidos (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-gray-400 text-center py-10">Carregando...</p>
      ) : shown.length === 0 ? (
        <div className="text-center py-16">
          <Inbox size={48} className="text-gray-700 mx-auto mb-3"/>
          <p className="text-gray-400 font-bold">Nenhum feedback ainda</p>
          <p className="text-gray-600 text-sm">As avaliações dos clientes vão aparecer aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map(f => (
            <div key={f.id}
              onClick={() => !f.read && fbMarkFeedbackRead(f.id)}
              className={`bg-gray-900 border rounded-2xl p-5 transition-colors cursor-pointer ${
                f.read ? 'border-gray-800' : 'border-brand-pink/40 bg-brand-pink/5'
              }`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{f.customerName}</p>
                    {!f.read && <span className="text-2xs bg-brand-pink text-white px-2 py-0.5 rounded-full font-bold">Novo</span>}
                  </div>
                  {f.customerEmail && (
                    <a href={`mailto:${f.customerEmail}`} className="text-xs text-gray-400 hover:text-brand-blue flex items-center gap-1 mt-0.5">
                      <Mail size={11}/> {f.customerEmail}
                    </a>
                  )}
                </div>
                <div className="flex gap-0.5 shrink-0">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={16}
                      className={n <= f.rating ? 'fill-brand-yellow text-brand-yellow' : 'text-gray-700'}/>
                  ))}
                </div>
              </div>
              {f.comment && (
                <p className="text-sm text-gray-300 italic mt-2 leading-relaxed">"{f.comment}"</p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                <span className="text-2xs text-gray-500">{fmtDate(f.createdAt)}</span>
                {f.orderId && <span className="text-2xs text-gray-500">Pedido {f.orderId}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
