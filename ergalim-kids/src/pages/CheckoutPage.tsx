import React, { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Shield, CreditCard, QrCode, ChevronRight, Truck, Lock, Copy, CheckCircle, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useStore } from '@/context/StoreContext'
import { formatCurrency, isValidCEP } from '@/utils/security'
import { createMercadoPagoPreference } from '@/services/payment'
import { sendOrderConfirmationToCustomer, sendNewOrderToOwner } from '@/services/email'
import toast from 'react-hot-toast'

type Step = 'address' | 'shipping' | 'payment' | 'confirm'
type PayMethod = 'pix' | 'card'

const UF = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, total, subtotal, discount, clearCart } = useCart()
  const { settings, updateOrder } = useStore()
  const navigate = useNavigate()

  const [step, setStep]               = useState<Step>('address')
  const [payMethod, setPayMethod]     = useState<PayMethod>('pix')
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [pixCode, setPixCode]         = useState('')
  const [pixQR, setPixQR]             = useState('')
  const [pixPaid, setPixPaid]         = useState(false)
  const [copiedPix, setCopiedPix]     = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState('')

  const [address, setAddress] = useState({
    name: user?.name || '', street: '', number: '',
    complement: '', neighborhood: '', city: '', state: '', zipCode: '', phone: '',
  })

  if (!user)            return <Navigate to="/login?redirect=/checkout" replace />
  if (items.length===0) return <Navigate to="/cart" replace />

  const activeShipping  = (settings.shippingOptions || []).filter(s => s.active)
  const chosenShipping  = activeShipping.find(s => s.id === selectedShipping)
  const shippingCost    = chosenShipping ? chosenShipping.price : (subtotal >= settings.freeShippingAbove ? 0 : 19.90)
  const finalTotal      = subtotal - discount + shippingCost

  const STEPS = [
    { key: 'address' as Step,  label: 'Endereço'  },
    { key: 'shipping' as Step, label: 'Entrega'   },
    { key: 'payment' as Step,  label: 'Pagamento' },
    { key: 'confirm' as Step,  label: 'Confirmar' },
  ]
  const stepIdx = STEPS.findIndex(s => s.key === step)

  const genOrderId = () => `EK-${Date.now().toString().slice(-6)}`

  // ─── FINALIZAR PEDIDO ─────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setLoading(true)
    const orderId = genOrderId()
    setCurrentOrderId(orderId)

    try {
      const orderData = {
        id:            orderId,
        customerId:    user.id,
        customerName:  address.name,
        customerEmail: user.email,
        customerPhone: address.phone,
        items: items.map(i => ({
          productId:    i.product.id,
          productName:  i.product.name,
          productImage: i.product.images[0],
          price:        i.product.price,
          quantity:     i.quantity,
          size:         i.selectedSize,
          color:        i.selectedColor,
        })),
        subtotal,
        shipping:      shippingCost,
        discount,
        total:         finalTotal,
        status:        'pending' as const,
        paymentMethod: payMethod === 'pix' ? 'pix' as const : 'stripe' as const,
        shippingAddress: address,
        createdAt:     new Date().toISOString(),
        updatedAt:     new Date().toISOString(),
      }

      // 1. Criar preferência de pagamento no Mercado Pago
      const payResult = await createMercadoPagoPreference({
        orderId,
        items: items.map(i => ({
          id:       i.product.id,
          title:    `${i.product.name} (${i.selectedSize} · ${i.selectedColor})`,
          quantity: i.quantity,
          price:    i.product.price,
          picture:  i.product.images[0],
        })),
        total:         finalTotal,
        customerEmail: user.email,
        customerName:  address.name,
        successUrl:    `${window.location.origin}/order-success?id=${orderId}`,
        failureUrl:    `${window.location.origin}/checkout?error=payment_failed`,
        pendingUrl:    `${window.location.origin}/order-success?id=${orderId}&status=pending`,
      }, payMethod)

      if (!payResult.success) {
        toast.error('Erro ao processar pagamento. Tente novamente.')
        setLoading(false)
        return
      }

      // 2. Enviar e-mails automáticos (em paralelo)
      Promise.all([
        sendOrderConfirmationToCustomer({
          ...orderData,
          shippingAddress: {
            street:   address.street,
            number:   address.number,
            city:     address.city,
            state:    address.state,
            zipCode:  address.zipCode,
          },
        }),
        sendNewOrderToOwner({
          id:            orderId,
          customerName:  address.name,
          customerEmail: user.email,
          customerPhone: address.phone,
          total:         finalTotal,
          items:         items.map(i => ({ productName: i.product.name, quantity: i.quantity, size: i.selectedSize })),
          paymentMethod: payMethod,
        }),
      ]).then(([sentClient, sentOwner]) => {
        if (sentClient) console.log('✅ E-mail de confirmação enviado ao cliente')
        if (sentOwner)  console.log('✅ E-mail de novo pedido enviado ao dono')
      })

      // 3. Pix: mostrar QR code na tela
      if (payMethod === 'pix' && payResult.pixCode) {
        setPixCode(payResult.pixCode)
        setPixQR(payResult.pixQR || '')
        clearCart()
        setLoading(false)
        return
      }

      // 4. Cartão: redirecionar para Mercado Pago
      if (payMethod === 'card' && payResult.initPoint) {
        clearCart()
        window.location.href = payResult.initPoint
        return
      }

      clearCart()
      navigate(`/order-success?id=${orderId}`)
    } catch (err) {
      toast.error('Erro inesperado. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode)
    setCopiedPix(true)
    toast.success('Código Pix copiado!')
    setTimeout(() => setCopiedPix(false), 3000)
  }

  // ─── TELA PIX ─────────────────────────────────────────────────────────────
  if (pixCode) return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <div className="card p-8">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <QrCode size={32} className="text-blue-600"/>
        </div>
        <h1 className="font-black text-2xl text-navy mb-2">Pague com Pix</h1>
        <p className="text-gray-500 text-sm mb-6">Pedido <strong className="text-navy">{currentOrderId}</strong> — {formatCurrency(finalTotal)}</p>

        {pixQR && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <img src={pixQR} alt="QR Code Pix" className="w-44 h-44 mx-auto"/>
          </div>
        )}

        <p className="text-xs text-gray-400 mb-2">Ou copie o código:</p>
        <div className="flex gap-2 mb-6">
          <input readOnly value={pixCode} className="input-field text-xs font-mono flex-1 bg-gray-50"/>
          <button onClick={copyPix} className={`btn-navy px-4 shrink-0 ${copiedPix ? 'bg-green-600' : ''}`}>
            {copiedPix ? <CheckCircle size={16}/> : <Copy size={16}/>}
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 text-left mb-6">
          <p className="font-bold mb-1">⏱️ Válido por 30 minutos</p>
          <p>Após o pagamento, você receberá a confirmação por e-mail automaticamente.</p>
        </div>

        {pixPaid ? (
          <Link to={`/order-success?id=${currentOrderId}`} className="btn-pink w-full justify-center">
            Ver confirmação do pedido <ArrowRight size={16}/>
          </Link>
        ) : (
          <button
            onClick={() => { setPixPaid(true); navigate(`/order-success?id=${currentOrderId}`) }}
            className="btn-outline w-full justify-center text-sm"
          >
            Já paguei ✓
          </button>
        )}

        <p className="text-xs text-gray-400 mt-4">
          Dúvidas? <a href={`https://wa.me/${settings.storeWhatsapp}`} className="text-green-600 font-bold hover:underline">WhatsApp {settings.storePhone}</a>
        </p>
      </div>
    </div>
  )

  // ─── CHECKOUT PRINCIPAL ───────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black text-navy mb-6">Finalizar Pedido</h1>

      {/* Steps */}
      <div className="flex items-center mb-8">
        {STEPS.map(({ key, label }, i) => (
          <React.Fragment key={key}>
            <div className={`flex items-center gap-2 text-sm ${i <= stepIdx ? 'text-pink' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black
                ${i < stepIdx ? 'bg-pink text-white' : i === stepIdx ? 'border-2 border-pink text-pink' : 'border-2 border-gray-200 text-gray-300'}`}>
                {i < stepIdx ? '✓' : i + 1}
              </div>
              <span className="hidden sm:block font-bold">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < stepIdx ? 'bg-pink' : 'bg-gray-200'}`}/>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">

          {/* ENDEREÇO */}
          {step === 'address' && (
            <form onSubmit={e => {
              e.preventDefault()
              if (!isValidCEP(address.zipCode)) { toast.error('CEP inválido'); return }
              if (!address.phone.trim())         { toast.error('Informe seu telefone'); return }
              setStep('shipping')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }} className="card p-6 space-y-4">
              <h2 className="font-black text-navy text-lg">Endereço de Entrega</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 block mb-1">Nome completo *</label>
                  <input required value={address.name} onChange={e=>setAddress(a=>({...a,name:e.target.value}))} className="input-field"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">CEP *</label>
                  <input required value={address.zipCode} onChange={e=>setAddress(a=>({...a,zipCode:e.target.value}))} placeholder="00000-000" className="input-field"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">WhatsApp/Telefone *</label>
                  <input required value={address.phone} onChange={e=>setAddress(a=>({...a,phone:e.target.value}))} placeholder="(99) 9 9999-9999" className="input-field"/>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 block mb-1">Rua/Avenida *</label>
                  <input required value={address.street} onChange={e=>setAddress(a=>({...a,street:e.target.value}))} className="input-field"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Número *</label>
                  <input required value={address.number} onChange={e=>setAddress(a=>({...a,number:e.target.value}))} className="input-field"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Complemento</label>
                  <input value={address.complement} onChange={e=>setAddress(a=>({...a,complement:e.target.value}))} placeholder="Apto, bloco..." className="input-field"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Bairro *</label>
                  <input required value={address.neighborhood} onChange={e=>setAddress(a=>({...a,neighborhood:e.target.value}))} className="input-field"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Cidade *</label>
                  <input required value={address.city} onChange={e=>setAddress(a=>({...a,city:e.target.value}))} className="input-field"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Estado *</label>
                  <select required value={address.state} onChange={e=>setAddress(a=>({...a,state:e.target.value}))} className="input-field">
                    <option value="">Selecione</option>
                    {UF.map(uf => <option key={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-pink w-full py-3 mt-2">
                Continuar para Entrega <ChevronRight size={16}/>
              </button>
            </form>
          )}

          {/* ENTREGA */}
          {step === 'shipping' && (
            <div className="card p-6 space-y-4">
              <h2 className="font-black text-navy text-lg flex items-center gap-2">
                <Truck size={20} className="text-pink"/> Opção de Entrega
              </h2>
              <div className="space-y-3">
                {activeShipping.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Truck size={32} className="mx-auto mb-3 opacity-30"/>
                    <p className="text-sm">Nenhuma opção de entrega cadastrada ainda.</p>
                    <p className="text-xs mt-1">O dono da loja precisa cadastrar as opções em <strong>Painel → Entrega</strong>.</p>
                  </div>
                ) : activeShipping.map(opt => (
                  <label key={opt.id} className={`flex items-center justify-between gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all
                    ${selectedShipping === opt.id ? 'border-pink bg-pink/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" value={opt.id}
                        checked={selectedShipping === opt.id}
                        onChange={() => setSelectedShipping(opt.id)}
                        className="accent-pink w-4 h-4"/>
                      <div>
                        <p className="font-bold text-navy text-sm">{opt.name}</p>
                        <p className="text-xs text-gray-500">{opt.estimatedDays}</p>
                        {opt.description && <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>}
                      </div>
                    </div>
                    <span className={`font-black text-sm shrink-0 ${opt.price === 0 ? 'text-green-600' : 'text-navy'}`}>
                      {opt.price === 0 ? 'Grátis' : formatCurrency(opt.price)}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('address')} className="btn-outline flex-1">← Voltar</button>
                <button
                  onClick={() => {
                    if (!selectedShipping && activeShipping.length > 0) { toast.error('Selecione uma opção de entrega'); return }
                    setStep('payment')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="btn-pink flex-1">
                  Continuar <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}

          {/* PAGAMENTO */}
          {step === 'payment' && (
            <div className="card p-6 space-y-5">
              <h2 className="font-black text-navy text-lg flex items-center gap-2">
                <CreditCard size={20} className="text-pink"/> Forma de Pagamento
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPayMethod('pix')}
                  className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${payMethod==='pix' ? 'border-pink bg-pink/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <QrCode size={28} className={payMethod==='pix' ? 'text-pink' : 'text-gray-400'}/>
                  <div className="text-center">
                    <p className="font-black text-navy text-sm">Pix</p>
                    <p className="text-xs text-gray-400">Aprovação imediata</p>
                  </div>
                  {payMethod==='pix' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">✓ Selecionado</span>}
                </button>

                <button onClick={() => setPayMethod('card')}
                  className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${payMethod==='card' ? 'border-pink bg-pink/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <CreditCard size={28} className={payMethod==='card' ? 'text-pink' : 'text-gray-400'}/>
                  <div className="text-center">
                    <p className="font-black text-navy text-sm">Cartão</p>
                    <p className="text-xs text-gray-400">Crédito / Débito</p>
                  </div>
                  {payMethod==='card' && <span className="text-xs bg-pink/20 text-pink px-2 py-0.5 rounded-full font-bold">✓ Selecionado</span>}
                </button>
              </div>

              {payMethod === 'pix' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-700">
                  <p className="font-bold mb-1">🔵 Como funciona o Pix</p>
                  <p className="text-xs">Após confirmar, você receberá um QR Code e código Pix. O pagamento é confirmado na hora.</p>
                </div>
              )}

              {payMethod === 'card' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-sm text-purple-700">
                  <p className="font-bold mb-1">💳 Pagamento via Mercado Pago</p>
                  <p className="text-xs">Você será redirecionado para o checkout seguro do Mercado Pago para inserir os dados do cartão. 100% seguro.</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Lock size={12}/> Pagamento processado com segurança pelo Mercado Pago
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('shipping')} className="btn-outline flex-1">← Voltar</button>
                <button onClick={() => { setStep('confirm'); window.scrollTo({ top:0, behavior:'smooth' }) }} className="btn-pink flex-1">
                  Revisar pedido <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}

          {/* CONFIRMAR */}
          {step === 'confirm' && (
            <div className="card p-6 space-y-4">
              <h2 className="font-black text-navy text-lg">Revisar e Confirmar</h2>

              <div className="space-y-2">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">📍 Entrega</p>
                  <p className="text-sm font-semibold">{address.name}</p>
                  <p className="text-sm text-gray-600">{address.street}, {address.number} {address.complement && `· ${address.complement}`}</p>
                  <p className="text-sm text-gray-600">{address.neighborhood}, {address.city} – {address.state} · CEP {address.zipCode}</p>
                  <p className="text-sm text-gray-500 mt-1">📱 {address.phone}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🚚 Método de Envio</p>
                  <p className="text-sm font-semibold">{chosenShipping?.name || 'Padrão'}</p>
                  <p className="text-xs text-gray-500">{chosenShipping?.estimatedDays}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">💳 Pagamento</p>
                  <p className="text-sm font-semibold">{payMethod === 'pix' ? '🔵 Pix (aprovação imediata)' : '💳 Cartão via Mercado Pago'}</p>
                </div>

                <div className="p-4 bg-navy/5 rounded-xl border border-navy/10">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">📦 Itens ({items.length})</p>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={item.product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100"/>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-navy line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-gray-400">{item.selectedSize} · {item.selectedColor} · ×{item.quantity}</p>
                        </div>
                        <p className="text-xs font-black">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('payment')} className="btn-outline flex-1">← Voltar</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-pink flex-1 py-4 text-base">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      Processando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Shield size={16}/>
                      {payMethod === 'pix' ? `Gerar Pix — ${formatCurrency(finalTotal)}` : `Pagar ${formatCurrency(finalTotal)} — Mercado Pago`}
                    </span>
                  )}
                </button>
              </div>

              <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                <Lock size={11}/> Compra 100% segura · SSL · Mercado Pago
              </p>
            </div>
          )}
        </div>

        {/* Resumo lateral */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-black text-navy mb-4 text-sm">Resumo do Pedido</h3>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-14 object-cover rounded-xl bg-gray-100 shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold line-clamp-1 text-navy">{item.product.name}</p>
                  <p className="text-xs text-gray-400">{item.selectedSize} · ×{item.quantity}</p>
                  <p className="text-xs font-black mt-0.5">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600 font-semibold"><span>Desconto</span><span>-{formatCurrency(discount)}</span></div>}
            <div className="flex justify-between text-gray-500">
              <span>Frete</span>
              <span>{shippingCost === 0 ? <span className="text-green-600 font-bold">Grátis</span> : formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-black text-navy text-base pt-2 border-t border-gray-100">
              <span>Total</span><span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
