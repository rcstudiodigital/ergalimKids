import React, { useState } from 'react'
import { CreditCard, Save, ExternalLink, Banknote, MessageCircle, Smartphone, Info } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import ImageUpload from '@/components/ui/ImageUpload'
import toast from 'react-hot-toast'

export default function OwnerPayment() {
  const { settings, updateSettings } = useStore()
  const [saving, setSaving] = useState(false)

  const pm = settings.paymentMethods || {}
  const [methods, setMethods] = useState({
    whatsapp:    { enabled: pm.whatsapp?.enabled    ?? true },
    pix:         { enabled: pm.pix?.enabled         ?? false, key: pm.pix?.key || '', keyType: pm.pix?.keyType || 'cpf', holderName: pm.pix?.holderName || '', qrCodeUrl: pm.pix?.qrCodeUrl || '' },
    mercadopago: { enabled: pm.mercadopago?.enabled ?? false, publicKey: pm.mercadopago?.publicKey || '' },
  })

  const save = async () => {
    setSaving(true)
    await updateSettings({ paymentMethods: { ...pm, ...methods } })
    setSaving(false)
    toast.success('Formas de pagamento salvas! ')
  }

  return (
    <div className="space-y-6 animate-fadeUp max-w-2xl"> <div> <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2"> <CreditCard size={22} className="text-brand-pink"/> Formas de Pagamento
        </h1> <p className="text-sm text-gray-500 mt-1">Configure como seus clientes vão pagar.</p> </div> {/* WhatsApp */}
      <div className={`card p-5 border-2 ${methods.whatsapp.enabled ? 'border-green-300' : 'border-gray-200'}`}> <div className="flex items-center justify-between gap-3"> <div className="flex items-center gap-3"> <div className="w-11 h-11 rounded-2xl bg-green-100 flex items-center justify-center"> <MessageCircle size={20} className="text-green-600"/> </div> <div> <p className="font-black text-brand-navy">WhatsApp</p> <p className="text-xs text-gray-500">Cliente faz o pedido e você combina o pagamento. Sem taxas.</p> </div> </div> <button onClick={() => setMethods(m => ({...m, whatsapp: { enabled: !m.whatsapp.enabled }}))}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${methods.whatsapp.enabled ? 'bg-green-500' : 'bg-gray-300'}`}> <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${methods.whatsapp.enabled ? 'left-6' : 'left-0.5'}`}/> </button> </div> {methods.whatsapp.enabled && (
          <div className="mt-3 p-3 bg-green-50 rounded-xl text-xs text-green-700 font-bold"> Ativo — clientes verão o botão "Finalizar pelo WhatsApp" no checkout
          </div> )}
      </div> {/* PIX */}
      <div className={`card p-5 border-2 ${methods.pix.enabled ? 'border-brand-pink/40' : 'border-gray-200'}`}> <div className="flex items-center justify-between gap-3 mb-3"> <div className="flex items-center gap-3"> <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center"> <Banknote size={20} className="text-teal-600"/> </div> <div> <p className="font-black text-brand-navy">PIX manual</p> <p className="text-xs text-gray-500">Mostra sua chave PIX. Cliente paga e envia comprovante. Sem taxas.</p> </div> </div> <button onClick={() => setMethods(m => ({...m, pix: {...m.pix, enabled: !m.pix.enabled}}))}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${methods.pix.enabled ? 'bg-brand-pink' : 'bg-gray-300'}`}> <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${methods.pix.enabled ? 'left-6' : 'left-0.5'}`}/> </button> </div> {methods.pix.enabled && (
          <div className="space-y-3 pt-3 border-t border-gray-100"> <div className="grid grid-cols-2 gap-3"> <div> <label className="text-xs font-black text-gray-500 block mb-1">Tipo de chave</label> <select value={methods.pix.keyType} onChange={e => setMethods(m => ({...m, pix:{...m.pix, keyType: e.target.value}}))}
                  className="input-field text-sm py-2"> <option value="cpf">CPF</option> <option value="cnpj">CNPJ</option> <option value="email">E-mail</option> <option value="phone">Telefone</option> <option value="random">Chave aleatória</option> </select> </div> <div> <label className="text-xs font-black text-gray-500 block mb-1">Sua chave PIX</label> <input value={methods.pix.key} onChange={e => setMethods(m => ({...m, pix:{...m.pix, key: e.target.value}}))}
                  className="input-field text-sm py-2" placeholder="Digite sua chave PIX"/> </div> </div> <div> <label className="text-xs font-black text-gray-500 block mb-1">Nome do titular</label> <input value={methods.pix.holderName} onChange={e => setMethods(m => ({...m, pix:{...m.pix, holderName: e.target.value}}))}
                className="input-field text-sm py-2" placeholder="Nome que aparece no PIX"/> </div> <div> <label className="text-xs font-black text-gray-500 block mb-1">QR Code do PIX (opcional)</label> <p className="text-2xs text-gray-400 mb-2">Suba a imagem do seu QR Code para o cliente escanear direto.</p> <ImageUpload value={methods.pix.qrCodeUrl} onChange={url => setMethods(m => ({...m, pix:{...m.pix, qrCodeUrl: url}}))}/> </div> </div> )}
      </div> {/* Mercado Pago */}
      <div className={`card p-5 border-2 ${methods.mercadopago.enabled ? 'border-blue-300' : 'border-gray-200'}`}> <div className="flex items-center justify-between gap-3 mb-3"> <div className="flex items-center gap-3"> <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center"> <Smartphone size={20} className="text-blue-600"/> </div> <div> <p className="font-black text-brand-navy">Mercado Pago</p> <p className="text-xs text-gray-500">Cartão, PIX e boleto automáticos. Taxa ~4,99% por venda.</p> </div> </div> <button onClick={() => setMethods(m => ({...m, mercadopago: {...m.mercadopago, enabled: !m.mercadopago.enabled}}))}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${methods.mercadopago.enabled ? 'bg-blue-500' : 'bg-gray-300'}`}> <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${methods.mercadopago.enabled ? 'left-6' : 'left-0.5'}`}/> </button> </div> {/* Guia de configuração */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2"> <p className="text-xs font-black text-blue-800 flex items-center gap-1"><Info size={12}/> Como configurar</p> <ol className="text-xs text-blue-700 space-y-1 pl-3 list-decimal"> <li>Acesse <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noreferrer" className="underline font-bold">mercadopago.com.br/developers</a></li> <li>Crie um aplicativo → vá em <strong>Credenciais de produção</strong></li> <li>Copie a <strong>Public Key</strong> (começa com APP_USR-)</li> <li>Cole abaixo e salve</li> </ol> <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:underline mt-1"> Abrir painel do Mercado Pago <ExternalLink size={11}/> </a> </div> {methods.mercadopago.enabled && (
          <div className="mt-3 pt-3 border-t border-gray-100"> <label className="text-xs font-black text-gray-500 block mb-1">Public Key de produção</label> <input value={methods.mercadopago.publicKey}
              onChange={e => setMethods(m => ({...m, mercadopago:{...m.mercadopago, publicKey: e.target.value}}))}
              className="input-field text-sm py-2 font-mono" placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/> {methods.mercadopago.publicKey && !methods.mercadopago.publicKey.startsWith('APP_USR') && (
              <p className="text-xs text-amber-600 font-bold mt-1"> A chave deve começar com APP_USR-</p> )}
            {methods.mercadopago.publicKey?.startsWith('APP_USR') && (
              <p className="text-xs text-green-600 font-bold mt-1"> Chave válida!</p> )}
          </div> )}
      </div> <button onClick={save} disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4"> {saving
          ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Salvando...</> : <><Save size={16}/> Salvar formas de pagamento</>}
      </button> <div className="card p-4 bg-gray-50"> <p className="text-xs font-black text-gray-500 mb-2"> Dica</p> <p className="text-xs text-gray-500">Para começar sem taxas: ative <strong>WhatsApp</strong> e <strong>PIX manual</strong>. Quando quiser cartão automático, ative o <strong>Mercado Pago</strong>.</p> </div> </div> )
}
