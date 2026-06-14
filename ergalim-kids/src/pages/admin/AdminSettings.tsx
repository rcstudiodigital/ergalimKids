import React, { useState } from 'react'
import { Settings, CreditCard, Save, ExternalLink, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import toast from 'react-hot-toast'

const GATEWAYS = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    logo: '🟡',
    desc: 'Mais popular no Brasil. Aceita Pix, cartão, boleto. Taxa: ~4,99% por venda.',
    recommended: true,
    link: 'https://www.mercadopago.com.br/developers',
    fields: [{ key: 'mercadopagoPublicKey', label: 'Chave Pública', placeholder: 'APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', hint: 'Painel MP → Credenciais → Produção → Public key' }]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: '🟣',
    desc: 'Ótimo para cartão internacional. Taxa: 3,4% + R$0,40 por transação.',
    recommended: false,
    link: 'https://dashboard.stripe.com/apikeys',
    fields: [{ key: 'stripePublicKey', label: 'Chave Pública', placeholder: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxx', hint: 'Dashboard Stripe → API Keys → Publishable key' }]
  },
  {
    id: 'pagseguro',
    name: 'PagSeguro',
    logo: '🟢',
    desc: 'Popular no Brasil, aceita todos os meios. Taxa: varia por plano.',
    recommended: false,
    link: 'https://dev.pagseguro.uol.com.br',
    fields: [{ key: 'stripePublicKey', label: 'Token de Integração', placeholder: 'seu-token-pagseguro', hint: 'Painel PagSeguro → Integrações → Token' }]
  },
]

export default function AdminSettings() {
  const { settings, updateSettings } = useStore()
  const [form, setForm] = useState({ ...settings })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    updateSettings(form)
    setSaving(false)
    toast.success('Configurações salvas com sucesso!')
  }

  const activeGateway = GATEWAYS.find(g => g.id === form.paymentGateway)

  return (
    <div className="space-y-6 animate-fadeUp max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings size={22} className="text-pink"/> Configurações Globais (Admin)
        </h1>
        <p className="text-sm text-gray-400 mt-1">Somente você (admin) vê e edita esta área.</p>
      </div>

      {/* GATEWAY DE PAGAMENTO — Cashout */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink/10 flex items-center justify-center">
            <CreditCard size={16} className="text-pink"/>
          </div>
          <div>
            <h2 className="font-black text-white">Gateway de Pagamento</h2>
            <p className="text-xs text-gray-400">Escolha como os clientes vão pagar</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Seleção de gateway */}
          <div className="grid gap-3">
            {GATEWAYS.map(gw => (
              <label key={gw.id} className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${form.paymentGateway === gw.id ? 'border-pink bg-pink/5' : 'border-gray-700 hover:border-gray-600'}`}>
                <input
                  type="radio"
                  name="gateway"
                  value={gw.id}
                  checked={form.paymentGateway === gw.id}
                  onChange={() => setForm(f => ({ ...f, paymentGateway: gw.id as any }))}
                  className="mt-1 accent-pink"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{gw.logo}</span>
                    <span className="font-black text-white text-sm">{gw.name}</span>
                    {gw.recommended && (
                      <span className="text-[10px] bg-green-900 text-green-400 px-2 py-0.5 rounded-full font-bold">✓ Recomendado</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{gw.desc}</p>
                  <a href={gw.link} target="_blank" rel="noreferrer"
                    className="text-xs text-pink hover:underline flex items-center gap-1 mt-1 font-semibold w-fit">
                    Como configurar <ExternalLink size={10}/>
                  </a>
                </div>
              </label>
            ))}
          </div>

          {/* Campo de chave do gateway ativo */}
          {activeGateway && activeGateway.fields.map(field => (
            <div key={field.key} className="mt-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
              <label className="text-xs font-bold text-gray-300 block mb-1">{field.label} — {activeGateway.name}</label>
              <input
                value={(form as any)[field.key] || ''}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                className="input-field bg-gray-900 border-gray-600 text-white font-mono text-xs placeholder-gray-600 mt-1"
                placeholder={field.placeholder}
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <AlertCircle size={11}/> {field.hint}
              </p>
            </div>
          ))}

          <div className="p-4 bg-amber-900/20 border border-amber-800/50 rounded-xl">
            <p className="text-xs text-amber-400 font-bold flex items-center gap-2 mb-1">
              <Zap size={14}/> Como funciona o cashout (recebimento)
            </p>
            <ul className="text-xs text-amber-300/80 space-y-1">
              <li>• <strong>Mercado Pago:</strong> saldo disponível em 14 dias (D+14) para cartão ou na hora para Pix</li>
              <li>• <strong>Stripe:</strong> transferência automática para conta bancária em 2-7 dias úteis</li>
              <li>• <strong>PagSeguro:</strong> disponível conforme plano escolhido (antecipação disponível)</li>
              <li>• A chave <strong>secreta</strong> (sk_/access_token) fica só no backend — nunca no site</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modo Manutenção */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <h2 className="font-black text-white">Modo Manutenção</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => setForm(f => ({ ...f, maintenanceMode: !f.maintenanceMode }))}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${form.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.maintenanceMode ? 'left-6' : 'left-0.5'}`}/>
          </button>
          <span className={`text-sm font-bold ${form.maintenanceMode ? 'text-red-400' : 'text-gray-300'}`}>
            {form.maintenanceMode ? '🔴 Loja em manutenção (offline para clientes)' : '🟢 Loja online'}
          </span>
        </label>
      </div>

      {/* E-mails automáticos */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <h2 className="font-black text-white">Notificações por E-mail</h2>
        <p className="text-xs text-gray-400">Configure com Resend.com (grátis até 3.000 e-mails/mês)</p>
        {[
          { key:'emailNotifyOwner',    label:'Receber e-mail quando chegar novo pedido' },
          { key:'emailNotifyCustomer', label:'Enviar e-mail ao cliente quando pedido for confirmado e enviado' },
        ].map(item => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
            <button
              onClick={() => setForm(f => ({ ...f, [item.key]: !(f as any)[item.key] }))}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${(form as any)[item.key] ? 'bg-pink' : 'bg-gray-700'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(form as any)[item.key] ? 'left-5' : 'left-0.5'}`}/>
            </button>
            <span className="text-sm text-gray-300 font-semibold">{item.label}</span>
          </label>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="btn-pink w-full flex items-center justify-center gap-2 py-4 text-base">
        {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Salvando...</> : <><Save size={18}/> Salvar todas as configurações</>}
      </button>
    </div>
  )
}
