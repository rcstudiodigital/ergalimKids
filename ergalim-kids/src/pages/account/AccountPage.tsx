import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { User, MapPin, Package, Edit3, Plus, Trash2, Phone, Mail, Save, X, Shield, Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCustomer } from '@/context/CustomerContext'
import { useStore } from '@/context/StoreContext'
import { formatCurrency, formatDate, isValidCEP, sanitize } from '@/utils/security'
import { formatCep } from '@/services/cep'
import type { SavedAddress } from '@/types'
import toast from 'react-hot-toast'

type Tab = 'profile' | 'addresses' | 'orders'

const UF = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

const STATUS_INFO: Record<string, { label: string; color: string; icon: string }> = {
  pending:    { label: 'Aguardando pagamento', color: 'text-amber-600',  icon: '⏳' },
  paid:       { label: 'Pago — preparando',    color: 'text-blue-600',   icon: '✅' },
  processing: { label: 'Preparando pedido',     color: 'text-blue-600',   icon: '🔄' },
  shipped:    { label: 'A caminho!',            color: 'text-green-600',  icon: '🚚' },
  delivered:  { label: 'Entregue',              color: 'text-green-700',  icon: '📦' },
  cancelled:  { label: 'Cancelado',             color: 'text-red-600',    icon: '❌' },
}

// Formulário de endereço
const EMPTY_ADDR: Omit<SavedAddress,'id'> = {
  label:'Casa', name:'', phone:'', street:'', number:'',
  complement:'', neighborhood:'', city:'', state:'', zipCode:'', isDefault:false
}

export default function AccountPage() {
  const { user, logout, isCustomer } = useAuth()
  const { profile, loading, saveProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useCustomer()
  const { orders } = useStore()

  const [tab, setTab] = useState<Tab>('profile')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name:'', phone:'' })
  const [addrForm, setAddrForm] = useState<Omit<SavedAddress,'id'>>({...EMPTY_ADDR})
  const [editingAddr, setEditingAddr] = useState<string | null>(null)
  const [showAddrForm, setShowAddrForm] = useState(false)

  if (!user) return <Navigate to="/login?redirect=/account" replace/>

  // Pedidos do cliente logado
  const myOrders = orders.filter(o => o.customerId === user.id)

  const startEditProfile = () => {
    setProfileForm({ name: profile?.name || user.name, phone: profile?.phone || '' })
    setEditingProfile(true)
  }

  const saveProfileData = () => {
    if (!profileForm.name.trim()) { toast.error('Nome é obrigatório'); return }
    saveProfile({ name: sanitize(profileForm.name.trim()), phone: sanitize(profileForm.phone.trim()), email: user.email })
    setEditingProfile(false)
    toast.success('Perfil atualizado! ✅')
  }

  const startEditAddr = (addr: SavedAddress) => {
    setAddrForm({ ...addr })
    setEditingAddr(addr.id)
    setShowAddrForm(true)
  }

  const handleSaveAddr = () => {
    if (!addrForm.name.trim())  { toast.error('Nome é obrigatório'); return }
    if (!addrForm.phone.trim()) { toast.error('Telefone é obrigatório'); return }
    if (!addrForm.street.trim()) { toast.error('Rua é obrigatória'); return }
    if (!addrForm.number.trim()) { toast.error('Número é obrigatório'); return }
    if (!isValidCEP(addrForm.zipCode)) { toast.error('CEP inválido (00000-000)'); return }
    if (!addrForm.city.trim()) { toast.error('Cidade é obrigatória'); return }
    if (!addrForm.state)       { toast.error('Selecione o estado'); return }

    if (editingAddr) {
      updateAddress(editingAddr, addrForm)
      toast.success('Endereço atualizado! ✅')
    } else {
      addAddress(addrForm)
      toast.success('Endereço adicionado! 🏠')
    }
    setShowAddrForm(false)
    setEditingAddr(null)
    setAddrForm({...EMPTY_ADDR})
  }

  const handleDeleteAddr = (id: string, label: string) => {
    if (!confirm(`Remover o endereço "${label}"?`)) return
    deleteAddress(id)
    toast.success('Endereço removido')
  }

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key:'profile',   label:'Meu Perfil',  icon:'👤' },
    { key:'addresses', label:'Endereços',   icon:'📍' },
    { key:'orders',    label:'Pedidos',     icon:'📦' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header do painel */}
      <div className="bg-gradient-to-r from-brand-navy to-blue-800 rounded-3xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-4 right-6 text-5xl opacity-15">🌟</div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-pink flex items-center justify-center text-white font-black text-2xl shadow-kid">
            {(profile?.name || user.name).charAt(0)}
          </div>
          <div>
            <p className="text-white/70 text-xs font-bold">Bem-vinda!</p>
            <h1 className="font-black text-xl text-white">{profile?.name || user.name}</h1>
            <p className="text-white/60 text-xs font-bold mt-0.5">{user.email}</p>
          </div>
          <button onClick={logout} className="ml-auto text-white/50 hover:text-white text-xs font-bold transition-colors">
            Sair →
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border-2 border-gray-100 shadow-sm">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${tab === t.key ? 'bg-brand-navy text-white shadow-kid-sm' : 'text-gray-400 hover:text-brand-navy'}`}>
            <span>{t.icon}</span>
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── PERFIL ──────────────────────────────────────────────────────── */}
      {tab === 'profile' && (
        <div className="space-y-4 animate-fadeUp">
          <div className="card-kid p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-brand-navy text-lg flex items-center gap-2">
                <User size={18} className="text-brand-pink"/> Meus dados
              </h2>
              {!editingProfile ? (
                <button onClick={startEditProfile} className="btn-outline py-2 px-4 text-sm flex items-center gap-1.5">
                  <Edit3 size={14}/> Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditingProfile(false)} className="btn-ghost p-2"><X size={16}/></button>
                  <button onClick={saveProfileData} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
                    <Save size={14}/> Salvar
                  </button>
                </div>
              )}
            </div>

            {editingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1.5">👤 Nome completo</label>
                  <input value={profileForm.name} onChange={e => setProfileForm(f=>({...f,name:e.target.value}))}
                    className="input-field" placeholder="Seu nome completo"/>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1.5">📱 WhatsApp / Telefone</label>
                  <input value={profileForm.phone} onChange={e => setProfileForm(f=>({...f,phone:e.target.value}))}
                    className="input-field" placeholder="(99) 9 9999-9999" type="tel"/>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1.5">📧 E-mail</label>
                  <input value={user.email} disabled className="input-field opacity-60 cursor-not-allowed bg-gray-50"/>
                  <p className="text-xs text-gray-400 font-bold mt-1">O e-mail não pode ser alterado aqui</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { icon:'👤', label:'Nome',     value: profile?.name || user.name },
                  { icon:'📧', label:'E-mail',   value: user.email },
                  { icon:'📱', label:'WhatsApp', value: profile?.phone || 'Não informado' },
                  { icon:'📅', label:'Membro desde', value: formatDate(user.createdAt) },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-bg-page rounded-xl">
                    <span className="text-lg w-8 text-center">{item.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-400">{item.label}</p>
                      <p className="text-sm font-black text-brand-navy">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Segurança */}
          <div className="card-kid p-5 bg-bg-blue border-2 border-brand-sky/20">
            <h3 className="font-black text-brand-navy flex items-center gap-2 mb-3">
              <Shield size={16} className="text-brand-sky"/> Segurança
            </h3>
            <div className="space-y-2 text-sm font-bold text-gray-500">
              <div className="flex items-center gap-2"><Check size={14} className="text-green-500"/> Senha criptografada com hash SHA-256</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-green-500"/> Sessão com JWT assinado (expira em 8h)</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-green-500"/> Dados armazenados de forma isolada</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-green-500"/> Conexão protegida por SSL</div>
            </div>
            <Link to="/login" onClick={() => { logout() }} className="inline-flex items-center gap-2 mt-4 text-xs text-brand-pink font-black hover:underline">
              🔒 Alterar senha (fazer logout e redefinir)
            </Link>
          </div>
        </div>
      )}

      {/* ── ENDEREÇOS ───────────────────────────────────────────────────── */}
      {tab === 'addresses' && (
        <div className="space-y-4 animate-fadeUp">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-brand-navy text-lg flex items-center gap-2">
              <MapPin size={18} className="text-brand-pink"/> Meus Endereços
            </h2>
            {!showAddrForm && (
              <button onClick={() => { setAddrForm({...EMPTY_ADDR}); setEditingAddr(null); setShowAddrForm(true) }}
                className="btn-primary py-2.5 px-4 text-sm flex items-center gap-1.5">
                <Plus size={15}/> Novo endereço
              </button>
            )}
          </div>

          {/* Formulário novo/editar endereço */}
          {showAddrForm && (
            <div className="card-kid p-5 border-2 border-brand-pink/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-brand-navy">{editingAddr ? 'Editar endereço' : '+ Novo endereço'}</h3>
                <button onClick={() => { setShowAddrForm(false); setEditingAddr(null) }} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
              </div>
              <div className="space-y-3">
                {/* Label */}
                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1.5">🏷️ Identificação</label>
                  <div className="flex gap-2">
                    {['Casa','Trabalho','Outro'].map(l => (
                      <button key={l} onClick={() => setAddrForm(f=>({...f,label:l}))}
                        className={`px-4 py-2 rounded-xl text-sm font-black border-2 transition-colors ${addrForm.label===l ? 'bg-brand-navy text-white border-brand-navy' : 'border-gray-200 text-gray-500 hover:border-brand-navy hover:text-brand-navy'}`}>
                        {l==='Casa'?'🏠':l==='Trabalho'?'💼':'📍'} {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-black text-gray-500 block mb-1.5">👤 Nome do destinatário *</label>
                    <input value={addrForm.name} onChange={e=>setAddrForm(f=>({...f,name:e.target.value}))} className="input-field" placeholder="Nome completo"/>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 block mb-1.5">📱 Telefone *</label>
                    <input value={addrForm.phone} onChange={e=>setAddrForm(f=>({...f,phone:e.target.value}))} className="input-field" placeholder="(99) 9 9999-9999" type="tel"/>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 block mb-1.5">📮 CEP *</label>
                    <input value={addrForm.zipCode} onChange={e=>setAddrForm(f=>({...f,zipCode:e.target.value}))} className="input-field" placeholder="00000-000"/>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-black text-gray-500 block mb-1.5">📍 Rua / Avenida *</label>
                    <input value={addrForm.street} onChange={e=>setAddrForm(f=>({...f,street:e.target.value}))} className="input-field" placeholder="Nome da rua"/>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 block mb-1.5">Número *</label>
                    <input value={addrForm.number} onChange={e=>setAddrForm(f=>({...f,number:e.target.value}))} className="input-field" placeholder="123"/>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 block mb-1.5">Complemento</label>
                    <input value={addrForm.complement||''} onChange={e=>setAddrForm(f=>({...f,complement:e.target.value}))} className="input-field" placeholder="Apto, bloco..."/>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 block mb-1.5">Bairro *</label>
                    <input value={addrForm.neighborhood} onChange={e=>setAddrForm(f=>({...f,neighborhood:e.target.value}))} className="input-field"/>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 block mb-1.5">Cidade *</label>
                    <input value={addrForm.city} onChange={e=>setAddrForm(f=>({...f,city:e.target.value}))} className="input-field"/>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 block mb-1.5">Estado *</label>
                    <select value={addrForm.state} onChange={e=>setAddrForm(f=>({...f,state:e.target.value}))} className="input-field">
                      <option value="">Selecione</option>
                      {UF.map(uf=><option key={uf}>{uf}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={addrForm.isDefault} onChange={e=>setAddrForm(f=>({...f,isDefault:e.target.checked}))} className="rounded accent-pink w-4 h-4"/>
                      <span className="text-sm font-black text-brand-navy">Definir como endereço padrão</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowAddrForm(false); setEditingAddr(null) }} className="btn-outline flex-1">Cancelar</button>
                  <button onClick={handleSaveAddr} className="btn-primary flex-1">
                    <Save size={15}/> {editingAddr ? 'Salvar alterações' : 'Adicionar endereço'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de endereços */}
          {!loading && (!profile?.addresses?.length) ? (
            <div className="card-kid p-10 text-center text-gray-400">
              <div className="text-4xl mb-3">🏠</div>
              <p className="font-black text-brand-navy mb-1">Nenhum endereço cadastrado</p>
              <p className="text-sm font-bold mb-4">Adicione um endereço para facilitar suas compras!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile?.addresses.map(addr => (
                <div key={addr.id} className={`card-kid p-5 border-2 transition-all ${addr.isDefault ? 'border-brand-pink/40 bg-bg-soft' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{addr.label==='Casa'?'🏠':addr.label==='Trabalho'?'💼':'📍'}</span>
                      <span className="font-black text-brand-navy text-sm">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-black bg-brand-pink text-white px-2 py-0.5 rounded-full">⭐ Padrão</span>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!addr.isDefault && (
                        <button onClick={() => setDefaultAddress(addr.id)}
                          className="text-xs text-gray-400 hover:text-brand-pink font-black px-2 py-1 rounded-lg hover:bg-bg-soft transition-colors">
                          Padrão
                        </button>
                      )}
                      <button onClick={() => startEditAddr(addr)} className="btn-ghost p-1.5 text-gray-400 hover:text-brand-navy">
                        <Edit3 size={14}/>
                      </button>
                      <button onClick={() => handleDeleteAddr(addr.id, addr.label)} className="btn-ghost p-1.5 text-gray-400 hover:text-red-500">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-brand-navy">{addr.name}</div>
                  <div className="text-xs font-bold text-gray-500 mt-0.5">
                    {addr.street}, {addr.number}{addr.complement ? ` · ${addr.complement}` : ''}
                  </div>
                  <div className="text-xs font-bold text-gray-500">
                    {addr.neighborhood}, {addr.city} — {addr.state} · CEP {addr.zipCode}
                  </div>
                  <div className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1">
                    <Phone size={11}/> {addr.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PEDIDOS ─────────────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <div className="space-y-4 animate-fadeUp">
          <h2 className="font-black text-brand-navy text-lg flex items-center gap-2">
            <Package size={18} className="text-brand-pink"/> Meus Pedidos
          </h2>
          {myOrders.length === 0 ? (
            <div className="card-kid p-12 text-center text-gray-400">
              <div className="text-5xl mb-3">🛍️</div>
              <p className="font-black text-brand-navy text-lg mb-1">Nenhum pedido ainda</p>
              <p className="text-sm font-bold mb-6">Que tal explorar nossa coleção?</p>
              <Link to="/shop" className="btn-primary">🛍️ Ver a loja</Link>
            </div>
          ) : (
            myOrders.map(order => {
              const st = STATUS_INFO[order.status] || { label: order.status, color:'text-gray-500', icon:'📋' }
              return (
                <div key={order.id} className="card-kid p-5">
                  {/* Header pedido */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-black text-brand-pink text-sm">{order.id}</p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">
                        {formatDate(order.createdAt)} · {order.paymentMethod === 'pix' ? '🔵 Pix' : '💳 Cartão'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-brand-navy">{formatCurrency(order.total)}</p>
                      <p className={`text-xs font-black mt-0.5 ${st.color}`}>{st.icon} {st.label}</p>
                    </div>
                  </div>
                  {/* Itens */}
                  <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="shrink-0 flex items-center gap-2 bg-bg-page rounded-xl px-3 py-2">
                        <img src={item.productImage} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-100"/>
                        <div>
                          <p className="text-xs font-black text-brand-navy line-clamp-1 max-w-[100px]">{item.productName}</p>
                          <p className="text-[10px] font-bold text-gray-400">{item.size} · {item.color} · ×{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Código de rastreio */}
                  {order.trackingCode && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                      <span className="text-base">📦</span>
                      <div>
                        <p className="font-black">Seu pedido foi enviado!</p>
                        <p className="font-bold">Rastreio: <span className="font-mono">{order.trackingCode}</span></p>
                      </div>
                    </div>
                  )}
                  {/* Endereço de entrega resumido */}
                  <div className="mt-3 text-xs font-bold text-gray-400 flex items-center gap-1.5">
                    <MapPin size={11}/> {order.shippingAddress.street}, {order.shippingAddress.number} · {order.shippingAddress.city}/{order.shippingAddress.state}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
