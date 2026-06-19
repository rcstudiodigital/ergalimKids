import React, { useState } from 'react'
import { Save, Store, Mail, Phone, MapPin, Globe, Bell } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import toast from 'react-hot-toast'

export default function OwnerSettings() {
  const { settings, updateSettings } = useStore()
  const [form, setForm] = useState({ ...settings })

  const save = () => {
    updateSettings(form)
    toast.success('Configurações salvas!')
  }

  const F = (label: string, key: keyof typeof form, placeholder?: string, type = 'text') => (
    <div> <label className="text-xs font-bold text-gray-500 block mb-1">{label}</label> <input type={type} value={String(form[key])} placeholder={placeholder}
        onChange={e => setForm({ ...form, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
        className="input-field" /> </div> )

  return (
    <div className="space-y-6 animate-fadeUp max-w-2xl"> <h1 className="text-2xl font-black text-brand-navy flex items-center gap-2"><Store size={22} className="text-brand-pink" /> Configurações da Loja</h1> <div className="card p-5 space-y-4"> <h2 className="font-bold text-brand-navy flex items-center gap-2"><Store size={16} /> Informações Básicas</h2> {F('Nome da loja', 'storeName')}
        {F('E-mail de contato', 'storeEmail', 'email@loja.com', 'email')}
        {F('Endereço da loja', 'storeAddress')}
      </div> {/* ── REDES SOCIAIS ─────────────────────────────────────────── */}
      <div className="card p-5 space-y-4"> <h2 className="font-bold text-brand-navy flex items-center gap-2"> Redes Sociais & Contato
        </h2> {/* Instagram */}
        <div> <label className="text-xs font-black text-gray-500 block mb-1"> Instagram</label> <div className="relative"> <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span> <input
              value={form.storeInstagram.replace('@', '')}
              onChange={e => setForm({ ...form, storeInstagram: '@' + e.target.value.replace('@', '') })}
              className="input-field pl-8" placeholder="ergalimkids" /> </div> {form.storeInstagram && (
            <a
              href={`https://instagram.com/${form.storeInstagram.replace('@', '')}`}
              target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs font-black text-brand-pink hover:underline"> instagram.com/{form.storeInstagram.replace('@', '')} ↗
            </a> )}
        </div> {/* WhatsApp */}
        <div> <label className="text-xs font-black text-gray-500 block mb-1"> WhatsApp</label> <div className="grid sm:grid-cols-2 gap-3"> <div> <input
                value={form.storePhone}
                onChange={e => setForm({ ...form, storePhone: e.target.value })}
                className="input-field" placeholder="(24) 99239-1998" /> <p className="text-xs text-gray-400 font-bold mt-1">Exibido na loja</p> </div> <div> <input
                value={form.storeWhatsapp}
                onChange={e => setForm({ ...form, storeWhatsapp: e.target.value.replace(/\D/g, '') })}
                className="input-field font-mono" placeholder="5524992391998" /> <p className="text-xs text-gray-400 font-bold mt-1">Só números (DDI+DDD+número)</p> </div> </div> {form.storeWhatsapp && (
            <a
              href={`https://wa.me/${form.storeWhatsapp}`}
              target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs font-black text-green-600 hover:underline"> wa.me/{form.storeWhatsapp} ↗
            </a> )}
        </div> <div className="p-3 bg-bg-soft border border-blue-200 rounded-xl text-xs text-gray-500 font-bold"> Após salvar, o botão do WhatsApp e o link do Instagram já atualizam em toda a loja.
        </div> </div> <div className="card p-5 space-y-4"> <h2 className="font-bold text-brand-navy flex items-center gap-2"><Globe size={16} /> Conteúdo do Site</h2> {F('Título do hero (banner principal)', 'heroTitle')}
        {F('Subtítulo do hero', 'heroSubtitle')}
      </div> <div className="card p-5 space-y-4"> <h2 className="font-bold text-brand-navy flex items-center gap-2"><Bell size={16} /> Notificações por E-mail</h2> <label className="flex items-center gap-3 cursor-pointer"> <input type="checkbox" checked={form.emailNotifyOwner} onChange={e => setForm({ ...form, emailNotifyOwner: e.target.checked })} className="rounded w-4 h-4" /> <span className="text-sm font-semibold">Receber e-mail quando chegar novo pedido</span> </label> <label className="flex items-center gap-3 cursor-pointer"> <input type="checkbox" checked={form.emailNotifyCustomer} onChange={e => setForm({ ...form, emailNotifyCustomer: e.target.checked })} className="rounded w-4 h-4" /> <span className="text-sm font-semibold">Enviar e-mail para o cliente ao confirmar pedido/envio</span> </label> <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700"> Em produção, integre com <strong>Resend</strong> ou <strong>SendGrid</strong> para e-mails automáticos reais.
        </div> </div> <button onClick={save} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"> <Save size={18} /> Salvar configurações
      </button> </div> )
}
