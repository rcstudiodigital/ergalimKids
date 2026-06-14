import React, { useState } from 'react'
import { Shield, Save, Info } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import type { OwnerPermissions } from '@/types'
import toast from 'react-hot-toast'

const PERM_LABELS: { key: keyof OwnerPermissions; label: string; desc: string }[] = [
  { key:'canManageProducts',    label:'Gerenciar produtos',       desc:'Adicionar, editar e remover produtos' },
  { key:'canManagePromotions',  label:'Gerenciar promoções',      desc:'Criar e editar cupons e promoções' },
  { key:'canViewOrders',        label:'Ver pedidos',              desc:'Visualizar lista de pedidos' },
  { key:'canUpdateOrderStatus', label:'Atualizar status de pedido', desc:'Alterar status e adicionar código de rastreio' },
  { key:'canViewFinancial',     label:'Ver financeiro',           desc:'Acessar relatórios e receitas' },
  { key:'canEditSiteContent',   label:'Editar conteúdo do site',  desc:'Alterar textos do hero e configurações visuais' },
  { key:'canManageShipping',    label:'Gerenciar entregas',       desc:'Adicionar e editar opções de envio' },
  { key:'canManagePaymentGateway', label:'Gerenciar pagamentos',  desc:'Configurar gateway de pagamento (Stripe/MP)' },
]

export default function AdminPermissions() {
  const { ownerPermissions, updateOwnerPermissions } = useStore()
  const [perms, setPerms] = useState<OwnerPermissions>({ ...ownerPermissions })

  const toggle = (key: keyof OwnerPermissions) =>
    setPerms(p => ({ ...p, [key]: !p[key] }))

  const save = () => {
    updateOwnerPermissions(perms)
    toast.success('Permissões do dono atualizadas!')
  }

  const enableAll  = () => setPerms(Object.fromEntries(PERM_LABELS.map(p => [p.key, true])) as OwnerPermissions)
  const disableAll = () => setPerms(Object.fromEntries(PERM_LABELS.map(p => [p.key, false])) as OwnerPermissions)

  return (
    <div className="space-y-6 animate-fadeUp max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-navy flex items-center gap-2"><Shield size={22} className="text-pink"/> Permissões do Dono</h1>
        <p className="text-sm text-gray-500 mt-1">Configure o que o proprietário da loja pode acessar e modificar.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 text-sm text-blue-700">
        <Info size={18} className="shrink-0 mt-0.5"/>
        <p>Somente você (Admin) pode alterar essas permissões. O dono verá apenas o que você liberar no painel dele.</p>
      </div>

      <div className="card divide-y divide-gray-100">
        {PERM_LABELS.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between px-5 py-4 gap-4">
            <div className="flex-1">
              <p className="font-bold text-navy text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${perms[key] ? 'bg-pink' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${perms[key] ? 'left-6' : 'left-0.5'}`}/>
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={disableAll} className="btn-outline flex-1">Desabilitar tudo</button>
        <button onClick={enableAll} className="btn-outline flex-1">Habilitar tudo</button>
        <button onClick={save} className="btn-pink flex-1 flex items-center justify-center gap-2">
          <Save size={16}/> Salvar permissões
        </button>
      </div>
    </div>
  )
}
