import React, { useState, useEffect } from 'react'
import { Mail, Send, Users, Tag, Image as ImageIcon, Eye, Loader2, CheckCircle, Megaphone } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { sendMarketingCampaign } from '@/services/email'
import ImageUpload from '@/components/ui/ImageUpload'
import toast from 'react-hot-toast'

type Template = 'promo' | 'news' | 'coupon' | 'custom'

const TEMPLATES: Record<Template, { icon: string; label: string; subject: string; title: string; message: string; buttonText: string }> = {
  promo: {
    icon: '', label: 'Promoção',
    subject: ' Promoção especial na Ergalim Kids!',
    title: 'Promoção Imperdível! ',
    message: 'Preparamos ofertas especiais só para você! Aproveite descontos incríveis em peças selecionadas da nossa coleção. Corre que é por tempo limitado!',
    buttonText: 'Ver promoções',
  },
  news: {
    icon: '', label: 'Novidades',
    subject: ' Novidades chegando na Ergalim Kids!',
    title: 'Acabou de chegar! ',
    message: 'Temos novidades fresquinhas esperando por você! Confira os novos modelos que acabaram de chegar na nossa loja. Seu pequeno vai amar!',
    buttonText: 'Ver novidades',
  },
  coupon: {
    icon: '', label: 'Cupom de desconto',
    subject: ' Um presente especial para você!',
    title: 'Ganhe desconto na sua próxima compra! ',
    message: 'Como você é um cliente especial, preparamos um cupom de desconto exclusivo. Use na sua próxima compra e economize!',
    buttonText: 'Usar meu cupom',
  },
  custom: {
    icon: '', label: 'Personalizado',
    subject: '', title: '', message: '', buttonText: 'Visitar loja',
  },
}

export default function AdminMarketing() {
  const { coupons, firebaseEnabled } = useStore()
  const [template, setTemplate] = useState<Template>('promo')
  const [customers, setCustomers] = useState<{ email: string; name: string }[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)

  const [form, setForm] = useState({
    subject: TEMPLATES.promo.subject,
    title: TEMPLATES.promo.title,
    message: TEMPLATES.promo.message,
    couponCode: '',
    couponDiscount: 0,
    buttonText: TEMPLATES.promo.buttonText,
    buttonUrl: 'https://ergalimkids.com/shop',
    imageUrl: '',
  })

  // Carregar lista de clientes
  useEffect(() => {
    if (!firebaseEnabled) { setLoadingCustomers(false); return }
    import('@/services/firestore')
      .then(fb => fb.fbGetAllCustomers())
      .then(list => { setCustomers(list); setLoadingCustomers(false) })
      .catch(() => setLoadingCustomers(false))
  }, [firebaseEnabled])

  const applyTemplate = (t: Template) => {
    setTemplate(t)
    const tpl = TEMPLATES[t]
    setForm(f => ({ ...f, subject: tpl.subject, title: tpl.title, message: tpl.message, buttonText: tpl.buttonText }))
  }

  const handleSend = async () => {
    if (!form.subject.trim() || !form.title.trim() || !form.message.trim()) {
      toast.error('Preencha assunto, título e mensagem')
      return
    }
    if (customers.length === 0) {
      toast.error('Nenhum cliente cadastrado para enviar')
      return
    }
    if (!confirm(`Enviar esta campanha para ${customers.length} cliente(s)?`)) return

    setSending(true)
    setResult(null)
    try {
      const res = await sendMarketingCampaign(
        customers.map(c => c.email),
        {
          subject: form.subject, title: form.title, message: form.message,
          couponCode: form.couponCode || undefined,
          couponDiscount: form.couponDiscount || undefined,
          buttonText: form.buttonText, buttonUrl: form.buttonUrl,
          imageUrl: form.imageUrl || undefined,
        }
      )
      setResult(res)
      toast.success(`Campanha enviada! ${res.sent} e-mails enviados`)
    } catch {
      toast.error('Erro ao enviar campanha')
    } finally {
      setSending(false)
    }
  }

  const activeCoupons = coupons.filter(c => c.active)

  return (
    <div className="space-y-6 animate-fadeUp max-w-4xl"> {/* Header */}
      <div> <h1 className="text-2xl font-black text-white flex items-center gap-2"> <Megaphone size={22} className="text-brand-pink"/> E-mail Marketing
        </h1> <p className="text-sm text-gray-400 font-bold mt-1"> Envie promoções, novidades e cupons para seus clientes
        </p> </div> {/* Aviso clientes */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3"> <div className="w-10 h-10 rounded-xl bg-brand-pink/15 flex items-center justify-center"> <Users size={18} className="text-brand-pink"/> </div> <div className="flex-1"> {loadingCustomers ? (
            <p className="text-sm font-bold text-gray-400 flex items-center gap-2"> <Loader2 size={14} className="animate-spin"/> Carregando clientes...
            </p> ) : (
            <> <p className="text-sm font-black text-white">{customers.length} cliente(s) cadastrado(s)</p> <p className="text-xs text-gray-500 font-bold">A campanha será enviada para todos</p> </> )}
        </div> </div> {/* Templates */}
      <div> <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Escolha um modelo</label> <div className="grid grid-cols-2 md:grid-cols-4 gap-3"> {(Object.keys(TEMPLATES) as Template[]).map(t => (
            <button key={t} onClick={() => applyTemplate(t)}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${template===t ? 'border-brand-pink bg-brand-pink/10' : 'border-gray-700 hover:border-gray-500'}`}> <div className="text-2xl mb-1">{TEMPLATES[t].icon}</div> <p className={`text-xs font-black ${template===t ? 'text-brand-pink' : 'text-gray-300'}`}>{TEMPLATES[t].label}</p> </button> ))}
        </div> </div> {/* Formulário */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4"> <div> <label className="text-xs font-black text-gray-400 block mb-1">Assunto do e-mail *</label> <input value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))}
            className="input-field bg-gray-800 border-gray-700 text-white" placeholder=" Promoção especial!"/> </div> <div> <label className="text-xs font-black text-gray-400 block mb-1">Título (dentro do e-mail) *</label> <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
            className="input-field bg-gray-800 border-gray-700 text-white" placeholder="Promoção Imperdível!"/> </div> <div> <label className="text-xs font-black text-gray-400 block mb-1">Mensagem *</label> <textarea value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} rows={4}
            className="input-field bg-gray-800 border-gray-700 text-white resize-none" placeholder="Escreva sua mensagem aqui..."/> </div> {/* Cupom */}
        <div className="grid sm:grid-cols-2 gap-3"> <div> <label className="text-xs font-black text-gray-400 block mb-1">Cupom (opcional)</label> {activeCoupons.length > 0 ? (
              <select value={form.couponCode}
                onChange={e => {
                  const c = activeCoupons.find(x => x.code === e.target.value)
                  setForm(f=>({...f, couponCode: e.target.value, couponDiscount: c ? Math.round(c.discount*100) : 0}))
                }}
                className="input-field bg-gray-800 border-gray-700 text-white"> <option value="">Sem cupom</option> {activeCoupons.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({Math.round(c.discount*100)}% off)</option> ))}
              </select> ) : (
              <input value={form.couponCode} onChange={e => setForm(f=>({...f,couponCode:e.target.value.toUpperCase()}))}
                className="input-field bg-gray-800 border-gray-700 text-white" placeholder="ERGALIM10"/> )}
          </div> <div> <label className="text-xs font-black text-gray-400 block mb-1">Texto do botão</label> <input value={form.buttonText} onChange={e => setForm(f=>({...f,buttonText:e.target.value}))}
              className="input-field bg-gray-800 border-gray-700 text-white" placeholder="Ver promoções"/> </div> </div> {/* Imagem */}
        <div> <label className="text-xs font-black text-gray-400 block mb-1">Imagem de destaque (opcional)</label> <ImageUpload value={form.imageUrl} onChange={url => setForm(f=>({...f,imageUrl:url}))} folder="ergalim-kids/campaigns"/> </div> </div> {/* Resultado */}
      {result && (
        <div className="bg-green-900/30 border border-green-700 rounded-2xl p-4 flex items-center gap-3"> <CheckCircle size={20} className="text-green-400"/> <div> <p className="font-black text-green-300">Campanha enviada com sucesso!</p> <p className="text-xs text-green-400/70 font-bold">{result.sent} enviados · {result.failed} falharam</p> </div> </div> )}

      {/* Ações */}
      <div className="flex gap-3"> <button onClick={() => setShowPreview(!showPreview)} className="btn-outline border-gray-600 text-gray-300 flex items-center gap-2"> <Eye size={16}/> {showPreview ? 'Ocultar' : 'Pré-visualizar'}
        </button> <button onClick={handleSend} disabled={sending || customers.length === 0}
          className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5"> {sending
            ? <><Loader2 size={16} className="animate-spin"/> Enviando...</> : <><Send size={16}/> Enviar para {customers.length} cliente(s)</>}
        </button> </div> {/* Preview */}
      {showPreview && (
        <div className="bg-white rounded-2xl overflow-hidden border-4 border-gray-700"> <div className="bg-gradient-to-r from-brand-navy to-blue-800 p-8 text-center"> <div className="text-2xl font-black text-white"> ergalim <span className="text-brand-pink">kids</span></div> </div> {form.imageUrl && <img src={form.imageUrl} alt="" className="w-full max-h-48 object-cover"/>}
          <div className="p-6"> <h2 className="text-xl font-black text-brand-navy mb-3">{form.title || 'Título da campanha'}</h2> <p className="text-sm text-gray-600 leading-relaxed mb-4">{form.message || 'Sua mensagem aparecerá aqui...'}</p> {form.couponCode && (
              <div className="bg-bg-soft border-2 border-dashed border-brand-pink rounded-2xl p-4 text-center mb-4"> <p className="text-xs font-bold text-gray-400 uppercase">Seu cupom</p> <p className="text-2xl font-black text-brand-pink tracking-wider my-1">{form.couponCode}</p> {form.couponDiscount > 0 && <p className="text-sm font-bold text-brand-navy">{form.couponDiscount}% OFF! </p>}
              </div> )}
            <div className="text-center"> <span className="inline-block bg-brand-pink text-white font-black px-8 py-3 rounded-2xl">{form.buttonText} →</span> </div> </div> </div> )}
    </div> )
}
