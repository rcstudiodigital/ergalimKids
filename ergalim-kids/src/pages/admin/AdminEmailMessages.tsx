import React, { useState } from 'react'
import { Mail, Save, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import toast from 'react-hot-toast'

const DEFAULT_MESSAGES = {
  orderConfirmation: 'Recebemos seu pedido e já estamos cuidando dele com muito carinho! Em breve você receberá atualizações sobre o status da entrega. 💕',
  orderPaid: 'Ótima notícia! Seu pagamento foi confirmado e seu pedido entrou na fila de separação. Vamos preparar tudo com muito cuidado para você! 🎉',
  orderProcessing: 'Seu pedido está sendo separado e embalado pela nossa equipe com todo o cuidado. Em breve será enviado!',
  orderShipped: 'Seu pedido saiu para entrega! Acompanhe pelo código de rastreio acima. Qualquer dúvida, fale com a gente pelo WhatsApp. 🚚',
  orderDelivered: 'Esperamos que você e a criançada tenham amado as peças! Se quiser, nos marca no Instagram @ergalimkids. Até a próxima! 💕',
}

const STATUS_INFO = [
  { key: 'orderConfirmation' as const, icon: '🛒', label: 'Pedido realizado',       subject: 'Pedido recebido! 🛒 Ergalim Kids',           when: 'Quando o cliente finaliza o pedido' },
  { key: 'orderPaid'         as const, icon: '✅', label: 'Pagamento confirmado',    subject: '✅ Pagamento confirmado — Ergalim Kids',       when: 'Quando o Gabriel clica em "Confirmar Pagamento"' },
  { key: 'orderProcessing'   as const, icon: '📦', label: 'Em separação',            subject: '📦 Pedido em separação | Ergalim Kids',        when: 'Quando o Gabriel clica em "Em Separação"' },
  { key: 'orderShipped'      as const, icon: '🚚', label: 'Pedido enviado',          subject: '🚚 Seu pedido está a caminho! | Ergalim Kids', when: 'Quando o Gabriel clica em "Marcar Enviado"' },
  { key: 'orderDelivered'    as const, icon: '🎉', label: 'Pedido entregue',         subject: '🎉 Pedido entregue! | Ergalim Kids',           when: 'Quando o Gabriel clica em "Confirmar Entrega"' },
]

export default function AdminEmailMessages() {
  const { settings, updateSettings } = useStore()
  const [messages, setMessages] = useState({ ...DEFAULT_MESSAGES, ...settings.emailMessages })
  const [saving, setSaving] = useState(false)
  const [previewing, setPreviewing] = useState<string | null>(null)

  const save = async () => {
    setSaving(true)
    await updateSettings({ emailMessages: messages })
    setSaving(false)
    toast.success('Mensagens salvas! ✅')
  }

  const resetAll = () => {
    if (!confirm('Restaurar todas as mensagens para o padrão?')) return
    setMessages({ ...DEFAULT_MESSAGES })
    toast('Mensagens restauradas', { icon: '↩️' })
  }

  const update = (key: keyof typeof messages, value: string) =>
    setMessages(m => ({ ...m, [key]: value }))

  return (
    <div className="space-y-6 animate-fadeUp max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Mail size={22} className="text-brand-pink"/> Mensagens dos E-mails
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Personalize o texto que os clientes recebem em cada etapa do pedido.
        </p>
      </div>

      <div className="p-4 bg-blue-900/20 border border-blue-800/40 rounded-2xl text-xs text-blue-300 font-bold">
        💡 Além da sua mensagem, o e-mail sempre inclui: número do pedido, itens comprados, endereço de entrega e link do WhatsApp.
      </div>

      <div className="space-y-4">
        {STATUS_INFO.map(({ key, icon, label, subject, when }) => (
          <div key={key} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white flex items-center gap-2">
                  <span>{icon}</span> {label}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">📅 {when}</p>
                <p className="text-xs text-gray-600 mt-0.5">Assunto: <span className="text-gray-400">{subject}</span></p>
              </div>
              <button
                onClick={() => setPreviewing(previewing === key ? null : key)}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 shrink-0">
                {previewing === key ? <EyeOff size={13}/> : <Eye size={13}/>}
                {previewing === key ? 'Fechar' : 'Preview'}
              </button>
            </div>

            <div>
              <label className="text-xs font-black text-gray-400 block mb-1">Mensagem personalizada</label>
              <textarea
                value={messages[key]}
                onChange={e => update(key, e.target.value)}
                rows={3}
                className="input-field bg-gray-800 border-gray-700 text-white text-sm resize-none w-full"
                placeholder={DEFAULT_MESSAGES[key]}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-600">{messages[key].length} caracteres</p>
                <button
                  onClick={() => update(key, DEFAULT_MESSAGES[key])}
                  className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
                  <RotateCcw size={11}/> Padrão
                </button>
              </div>
            </div>

            {/* Preview do e-mail */}
            {previewing === key && (
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                {/* Header do email */}
                <div className="bg-gradient-to-r from-[#1A2B6B] to-[#2A3F9E] p-5 text-center">
                  <p className="text-xl font-black text-white">⭐ ergalim <span className="text-[#FF3D9A]">kids</span></p>
                </div>
                {/* Conteúdo */}
                <div className="p-5">
                  <h2 className="text-lg font-black text-[#1A2B6B] mb-2">{icon} {label}</h2>
                  <p className="text-sm text-gray-600 mb-3">Olá, <strong>Cliente</strong>! Seu pedido <strong>EK-XXXXX</strong>:</p>
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-sm text-gray-600 italic">"{messages[key]}"</p>
                  </div>
                  <p className="text-xs text-gray-400">+ detalhes do pedido, endereço e link do WhatsApp</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={resetAll} className="btn-outline border-gray-600 text-gray-400 flex items-center gap-2">
          <RotateCcw size={15}/> Restaurar padrões
        </button>
        <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 py-4">
          {saving
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Salvando...</>
            : <><Save size={16}/> Salvar mensagens</>}
        </button>
      </div>
    </div>
  )
}
