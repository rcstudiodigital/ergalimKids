import React, { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Star, Send, CheckCircle } from 'lucide-react'
import { fbAddFeedback } from '@/services/firestore'
import { sendFeedbackToOwner } from '@/services/email'
import toast from 'react-hot-toast'

export default function FeedbackPage() {
  const [params] = useSearchParams()
  const orderId = params.get('order') || ''
  const prefillName = params.get('name') || ''
  const prefillEmail = params.get('email') || ''

  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [name, setName]       = useState(prefillName)
  const [email, setEmail]     = useState(prefillEmail)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  const submit = async () => {
    if (rating === 0) { toast.error('Escolha uma nota de 1 a 5 estrelas'); return }
    if (!name.trim()) { toast.error('Digite seu nome'); return }

    setSending(true)
    try {
      // Salva no Firebase (aparece no painel admin)
      await fbAddFeedback({
        orderId, customerName: name.trim(), customerEmail: email.trim(),
        rating, comment: comment.trim(), createdAt: new Date().toISOString(), read: false,
      })
      // Envia email pro dono (Gabriel) — não bloqueia se falhar
      sendFeedbackToOwner({ customerName: name.trim(), customerEmail: email.trim(), rating, comment: comment.trim(), orderId }).catch(() => {})
      setSent(true)
    } catch (err: any) {
      console.error('Erro ao enviar feedback:', err?.code, err?.message)
      toast.error('Não foi possível enviar agora. Tente novamente em instantes.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-brand-mint/15 flex items-center justify-center animate-pop">
          <CheckCircle size={32} className="text-brand-mint"/>
        </div>
        <h1 className="font-display font-extrabold text-2xl text-brand-ink mb-2">Obrigado pelo seu feedback!</h1>
        <p className="text-gray-500 font-medium mb-8">Sua opinião nos ajuda a melhorar cada vez mais. 💜</p>
        <Link to="/" className="btn-primary">Voltar para a loja</Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="card-kid p-7">
        <div className="text-center mb-6">
          <span className="eyebrow">Sua opinião importa</span>
          <h1 className="section-title text-2xl mt-1">Como foi sua experiência?</h1>
          <p className="text-sm text-gray-500 font-medium mt-2">
            Conta pra gente o que achou da Ergalim Kids. Leva só um minutinho!
          </p>
        </div>

        {/* Estrelas */}
        <div className="flex justify-center gap-2 mb-6">
          {[1,2,3,4,5].map(n => (
            <button key={n}
              onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="transition-transform hover:scale-110">
              <Star size={40}
                className={`${(hover || rating) >= n ? 'text-brand-yellow fill-brand-yellow' : 'text-gray-200 fill-gray-200'} transition-colors`}/>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-sm font-bold text-brand-navy mb-5">
            {['', 'Muito ruim', 'Ruim', 'Ok', 'Bom', 'Excelente!'][rating]}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-gray-500 block mb-1">Seu nome *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="input-field" placeholder="Como podemos te chamar"/>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 block mb-1">E-mail (opcional)</label>
            <input value={email} type="email" onChange={e => setEmail(e.target.value)}
              className="input-field" placeholder="seu@email.com"/>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 block mb-1">Seu comentário</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
              className="input-field resize-none" placeholder="O que você mais gostou? O que podemos melhorar?"/>
          </div>

          <button onClick={submit} disabled={sending}
            className="btn-primary w-full justify-center gap-2">
            <Send size={16}/> {sending ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </div>
      </div>
    </div>
  )
}
