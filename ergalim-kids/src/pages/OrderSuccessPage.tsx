import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useStore } from '@/context/StoreContext'

export default function OrderSuccessPage() {
  const [params] = useSearchParams()
  const orderId = params.get('id') || 'EK-000'
  const { settings } = useStore()

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
      {/* Ícone de sucesso */}
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-brand-mint/15 flex items-center justify-center animate-pop">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-mint">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      </div>
      <h1 className="font-display font-extrabold text-3xl text-brand-ink mb-2">Pedido confirmado!</h1>
      <p className="text-gray-500 font-medium mb-1">
        Seu pedido <strong className="text-brand-ink">{orderId}</strong> foi recebido com sucesso.
      </p>
      <p className="text-gray-400 text-sm font-medium mb-8">Você receberá um e-mail de confirmação em breve.</p>

      {/* Info card */}
      <div className="card-kid p-6 text-left mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-brand-blue/10 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-brand-blue"><path d="M16.5 9.4 7.5 4.21M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></span>
          <div>
            <p className="font-black text-brand-navy text-sm">Prazo de entrega</p>
            <p className="text-xs text-gray-500 font-bold">Conforme opção escolhida, após aprovação do pagamento</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-brand-mint/10 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-brand-mint"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></span>
          <div>
            <p className="font-black text-brand-navy text-sm">Dúvidas? WhatsApp</p>
            <a href={`https://wa.me/${settings.storeWhatsapp}`} target="_blank" rel="noreferrer"
              className="text-xs text-green-600 font-black hover:underline">{settings.storePhone}</a>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/account/orders" className="btn-outline flex-1 justify-center">Meus pedidos</Link>
        <Link to="/shop" className="btn-primary flex-1 justify-center">
          Continuar comprando <ArrowRight size={15}/>
        </Link>
      </div>
    </div>
  )
}
