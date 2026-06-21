import React, { useState } from 'react'
import { CreditCard, Save, Check, Smartphone, MessageCircle, Banknote, ExternalLink } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import ImageUpload from '@/components/ui/ImageUpload'
import toast from 'react-hot-toast'

export default function AdminPayment() {
  const { settings, updateSettings } = useStore()
  const [saving, setSaving] = useState(false)

  const pm = settings.paymentMethods || {}
  const [methods, setMethods] = useState({
    mercadopago: { enabled: pm.mercadopago?.enabled ?? false, publicKey: pm.mercadopago?.publicKey || settings.mercadopagoPublicKey || '' },
    pix:         { enabled: pm.pix?.enabled ?? false, key: pm.pix?.key || '', keyType: pm.pix?.keyType || 'cpf', holderName: pm.pix?.holderName || '', qrCodeUrl: pm.pix?.qrCodeUrl || '' },
    whatsapp:    { enabled: pm.whatsapp?.enabled ?? true },
    stripe:      { enabled: pm.stripe?.enabled ?? false, publicKey: pm.stripe?.publicKey || settings.stripePublicKey || '' },
    pagarme:     { enabled: pm.pagarme?.enabled ?? false, publicKey: pm.pagarme?.publicKey || '' },
  })

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    updateSettings({ paymentMethods: methods })
    setSaving(false)
    toast.success('Formas de pagamento salvas! ')
  }

  const activeCount = Object.values(methods).filter((m: any) => m.enabled).length

  return (
    <div className="space-y-6 animate-fadeUp max-w-3xl"> <div> <h1 className="text-2xl font-black text-white flex items-center gap-2"> <CreditCard size={22} className="text-brand-pink"/> Formas de Pagamento
        </h1> <p className="text-sm text-gray-400 mt-1"> Escolha como seus clientes podem pagar. {activeCount} método(s) ativo(s).
        </p> </div> {/* WhatsApp */}
      <PaymentCard
        icon={<MessageCircle size={20} className="text-green-400"/>}
        title="Finalizar pelo WhatsApp" description="Cliente envia o pedido pelo WhatsApp e você combina o pagamento direto. Simples, sem taxas." enabled={methods.whatsapp.enabled}
        onToggle={v => setMethods(m => ({...m, whatsapp: { enabled: v }}))}
        badge="Recomendado para começar" badgeColor="bg-green-500/20 text-green-400" /> {/* PIX manual */}
      <PaymentCard
        icon={<Banknote size={20} className="text-teal-400"/>}
        title="PIX (chave manual)" description="Mostra sua chave PIX no checkout. Cliente paga e envia o comprovante. Sem taxas." enabled={methods.pix.enabled}
        onToggle={v => setMethods(m => ({...m, pix: {...m.pix, enabled: v}}))}
      > {methods.pix.enabled && (
          <div className="space-y-3 pt-3 border-t border-gray-700"> <div className="grid sm:grid-cols-2 gap-3"> <div> <label className="text-xs font-black text-gray-400 block mb-1">Tipo de chave</label> <select value={methods.pix.keyType} onChange={e=>setMethods(m=>({...m, pix:{...m.pix, keyType:e.target.value}}))}
                  className="input-field bg-gray-800 border-gray-700 text-white"> <option value="cpf">CPF</option> <option value="cnpj">CNPJ</option> <option value="email">E-mail</option> <option value="phone">Telefone</option> <option value="random">Chave aleatória</option> </select> </div> <div> <label className="text-xs font-black text-gray-400 block mb-1">Chave PIX</label> <input value={methods.pix.key} onChange={e=>setMethods(m=>({...m, pix:{...m.pix, key:e.target.value}}))}
                  className="input-field bg-gray-800 border-gray-700 text-white" placeholder="Sua chave PIX"/> </div> </div> <div> <label className="text-xs font-black text-gray-400 block mb-1">Nome do titular</label> <input value={methods.pix.holderName} onChange={e=>setMethods(m=>({...m, pix:{...m.pix, holderName:e.target.value}}))}
                className="input-field bg-gray-800 border-gray-700 text-white" placeholder="Nome que aparece no PIX"/> </div> <div> <label className="text-xs font-black text-gray-400 block mb-1">QR Code do PIX (opcional)</label> <p className="text-2xs text-gray-500 mb-2">Suba a imagem do seu QR Code para o cliente escanear direto.</p> <ImageUpload value={methods.pix.qrCodeUrl} onChange={url => setMethods(m => ({...m, pix:{...m.pix, qrCodeUrl: url}}))}/> </div> </div> )}
      </PaymentCard> {/* Mercado Pago */}
      <PaymentCard
        icon={<Smartphone size={20} className="text-blue-400"/>}
        title="Mercado Pago" description="Cartão, PIX e boleto automáticos. O dinheiro cai na sua conta Mercado Pago. Taxa por venda." enabled={methods.mercadopago.enabled}
        onToggle={v => setMethods(m => ({...m, mercadopago: {...m.mercadopago, enabled: v}}))}
      > {methods.mercadopago.enabled && (
          <div className="space-y-3 pt-3 border-t border-gray-700"> <div> <label className="text-xs font-black text-gray-400 block mb-1">Public Key (produção)</label> <input value={methods.mercadopago.publicKey} onChange={e=>setMethods(m=>({...m, mercadopago:{...m.mercadopago, publicKey:e.target.value}}))}
                className="input-field bg-gray-800 border-gray-700 text-white font-mono text-sm" placeholder="APP_USR-..."/> </div> <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-black text-blue-400 hover:underline"> Pegar minha Public Key <ExternalLink size={12}/> </a> </div> )}
      </PaymentCard> {/* Stripe */}
      <PaymentCard
        icon={<CreditCard size={20} className="text-purple-400"/>}
        title="Stripe" description="Cartão internacional. Bom para vendas fora do Brasil. Taxa por venda." enabled={methods.stripe.enabled}
        onToggle={v => setMethods(m => ({...m, stripe: {...m.stripe, enabled: v}}))}
      > {methods.stripe.enabled && (
          <div className="space-y-3 pt-3 border-t border-gray-700"> <div> <label className="text-xs font-black text-gray-400 block mb-1">Publishable Key</label> <input value={methods.stripe.publicKey} onChange={e=>setMethods(m=>({...m, stripe:{...m.stripe, publicKey:e.target.value}}))}
                className="input-field bg-gray-800 border-gray-700 text-white font-mono text-sm" placeholder="pk_live_..."/> </div> </div> )}
      </PaymentCard> {/* Botão salvar */}
      <button onClick={save} disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"> {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Salvando...</> : <><Save size={18}/> Salvar formas de pagamento</>}
      </button> <div className="p-4 bg-blue-900/20 border border-blue-800/40 rounded-2xl text-xs text-blue-300 font-bold"> Dica: Para começar rápido e sem taxas, ative <strong>WhatsApp</strong> e <strong>PIX manual</strong>.
        Quando quiser pagamento automático com cartão, ative o <strong>Mercado Pago</strong>.
      </div> </div> )
}

// Componente de cartão de método de pagamento
function PaymentCard({ icon, title, description, enabled, onToggle, badge, badgeColor, children }: {
  icon: React.ReactNode; title: string; description: string
  enabled: boolean; onToggle: (v: boolean) => void
  badge?: string; badgeColor?: string; children?: React.ReactNode
}) {
  return (
    <div className={`bg-gray-900 border-2 rounded-2xl p-5 transition-all ${enabled ? 'border-brand-pink/50' : 'border-gray-800'}`}> <div className="flex items-start gap-4"> <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">{icon}</div> <div className="flex-1 min-w-0"> <div className="flex items-center gap-2 flex-wrap"> <h3 className="font-black text-white">{title}</h3> {badge && <span className={`text-xs font-black px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>}
          </div> <p className="text-sm text-gray-400 mt-1">{description}</p> </div> <button onClick={() => onToggle(!enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${enabled ? 'bg-brand-pink' : 'bg-gray-700'}`}> <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'left-6' : 'left-0.5'}`}/> </button> </div> {children && <div className="mt-4">{children}</div>}
    </div> )
}
