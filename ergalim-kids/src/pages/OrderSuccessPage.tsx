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
      {/* Animação de sucesso */}
      <div className="text-7xl mb-4 animate-pop">🎉</div>
      <h1 className="font-black text-3xl text-brand-navy mb-2">Pedido confirmado!</h1>
      <p className="text-gray-500 font-bold mb-1">
        Seu pedido <strong className="text-brand-navy">{orderId}</strong> foi recebido com sucesso.
      </p>
      <p className="text-gray-400 text-sm font-bold mb-8">Você receberá um e-mail de confirmação em breve 📧</p>

      {/* Info card */}
      <div className="card-kid p-6 text-left mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <p className="font-black text-brand-navy text-sm">Prazo de entrega</p>
            <p className="text-xs text-gray-500 font-bold">Conforme opção escolhida, após aprovação do pagamento</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <p className="font-black text-brand-navy text-sm">Dúvidas? WhatsApp</p>
            <a href={`https://wa.me/${settings.storeWhatsapp}`} target="_blank" rel="noreferrer"
              className="text-xs text-green-600 font-black hover:underline">{settings.storePhone}</a>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/account/orders" className="btn-outline flex-1 justify-center">📋 Meus pedidos</Link>
        <Link to="/shop" className="btn-primary flex-1 justify-center">
          🛍️ Continuar comprando <ArrowRight size={15}/>
        </Link>
      </div>
    </div>
  )
}
