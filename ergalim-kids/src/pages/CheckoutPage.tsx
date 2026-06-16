import React, { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Shield, CreditCard, QrCode, ChevronRight, Truck, Lock, Copy, CheckCircle, ArrowRight, Loader2, MapPin } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCustomer } from '@/context/CustomerContext'
import { useAuth } from '@/context/AuthContext'
import { useStore } from '@/context/StoreContext'
import { formatCurrency } from '@/utils/security'
import { createMercadoPagoPreference } from '@/services/payment'
import { sendOrderConfirmationToCustomer, sendNewOrderToOwner } from '@/services/email'
import { useCep } from '@/hooks/useCep'
import { useShippingCalc } from '@/hooks/useShippingCalc'
import toast from 'react-hot-toast'

type Step = 'address' | 'shipping' | 'payment' | 'confirm'
type PayMethod = 'pix' | 'card'

const UF = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

const STEPS = [
  { key: 'address'  as Step, label: 'Endereço'  },
  { key: 'shipping' as Step, label: 'Entrega'   },
  { key: 'payment'  as Step, label: 'Pagamento' },
  { key: 'confirm'  as Step, label: 'Confirmar' },
]

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, total, subtotal, discount, clearCart } = useCart()
  const { settings, addOrder } = useStore()
  const { profile } = useCustomer()
  const addresses = profile?.addresses || []
  const navigate = useNavigate()

  const [step, setStep]           = useState<Step>('address')
  const [payMethod, setPayMethod] = useState<PayMethod>('pix')
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [pixCode, setPixCode]     = useState('')
  const [pixQR,   setPixQR]       = useState('')
  const [showManualPix, setShowManualPix] = useState(false)
  const [copied,  setCopied]      = useState(false)
  const [orderId, setOrderId]     = useState('')

  const defaultAddress = addresses?.find(a => a.isDefault)
  const [address, setAddress] = useState({
    name: user?.name || '', phone: '',
    street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '', zipCode: '',
  })

  // Pré-preencher quando o perfil e endereços carregarem do Firebase
  const [addressPreFilled, setAddressPreFilled] = useState(false)
  React.useEffect(() => {
    if (addressPreFilled) return
    if (!profile && !addresses?.length) return
    setAddressPreFilled(true)
    const def = addresses?.find(a => a.isDefault)
    setAddress(prev => ({
      ...prev,
      name:         def?.name         || profile?.name  || prev.name,
      phone:        def?.phone        || profile?.phone || prev.phone,
      zipCode:      def?.zipCode      || prev.zipCode,
      street:       def?.street       || prev.street,
      number:       def?.number       || prev.number,
      complement:   def?.complement   || prev.complement,
      neighborhood: def?.neighborhood || prev.neighborhood,
      city:         def?.city         || prev.city,
      state:        def?.state        || prev.state,
    }))
  }, [profile, addresses, addressPreFilled])

  // Hook de CEP automático
  const { cepLoading, cepError, handleCepChange } = useCep(address, setAddress)
  const { melhorEnvioOptions, calculating: calcShipping, calcularFrete } = useShippingCalc()

  if (!user)            return <Navigate to="/login?redirect=/checkout" replace/>
  if (items.length===0) return <Navigate to="/cart" replace/>

  // Combina métodos manuais com opções do Melhor Envio (se disponíveis)
  const manualShipping = (settings.shippingOptions || []).filter(s => s.active)
  const activeShipping = melhorEnvioOptions.length > 0
    ? [...melhorEnvioOptions, ...manualShipping.filter(s => s.price === 0)] // ME + opções grátis (retirada)
    : manualShipping
  const chosenShipping = activeShipping.find(s => s.id === selectedShipping)
  const shippingCost   = chosenShipping ? chosenShipping.price : (subtotal >= settings.freeShippingAbove ? 0 : 19.90)
  const finalTotal     = subtotal - discount + shippingCost
  const stepIdx        = STEPS.findIndex(s => s.key === step)

  const goNext = (next: Step) => { setStep(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const handlePlaceOrder = async () => {
    setLoading(true)
    const oid = `EK-${Date.now().toString().slice(-6)}`
    setOrderId(oid)
    try {
      // 1. SALVA O PEDIDO no banco (sempre, independente da forma de pagamento)
      addOrder({
        customerId: user.id,
        customerName: address.name,
        customerEmail: user.email,
        customerPhone: address.phone,
        items: items.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.quantity,
          size: i.selectedSize,
          color: i.selectedColor,
          price: i.product.price,
          productImage: i.product.images?.[0] || '',
          image: i.product.images?.[0] || '',
        })),
        subtotal, shipping: shippingCost, discount, total: finalTotal,
        status: 'pending',
        paymentMethod: payMethod,
        shippingMethod: chosenShipping?.name || 'Padrão',
        shippingAddress: {
          name: address.name, phone: address.phone,
          street: address.street, number: address.number, complement: address.complement,
          neighborhood: address.neighborhood, city: address.city, state: address.state, zipCode: address.zipCode,
        },
      } as any)

      // 2. E-mails automáticos (cliente + dono)
      Promise.all([
        sendOrderConfirmationToCustomer({
          id: oid, customerName: address.name, customerEmail: user.email,
          items: items.map(i => ({ productName: i.product.name, quantity: i.quantity, size: i.selectedSize, color: i.selectedColor, price: i.product.price })),
          subtotal, shipping: shippingCost, discount, total: finalTotal, paymentMethod: payMethod,
          shippingAddress: { street: address.street, number: address.number, city: address.city, state: address.state, zipCode: address.zipCode },
        }),
        sendNewOrderToOwner({
          id: oid, customerName: address.name, customerEmail: user.email,
          customerPhone: address.phone, total: finalTotal,
          items: items.map(i => ({ productName: i.product.name, quantity: i.quantity, size: i.selectedSize })),
          paymentMethod: payMethod,
        }),
      ]).catch(() => {})

      // 3. Verifica se Mercado Pago está configurado
      const mpConfig = settings.paymentMethods?.mercadopago
      const mpEnabled = mpConfig?.enabled && mpConfig?.publicKey?.startsWith('APP_USR')

      if (mpEnabled && (payMethod === 'pix' || payMethod === 'card')) {
        // Mercado Pago configurado → usa o gateway
        try {
          const payResult = await createMercadoPagoPreference({
            orderId: oid,
            items: items.map(i => ({ id: i.product.id, title: `${i.product.name} (${i.selectedSize} · ${i.selectedColor})`, quantity: i.quantity, price: i.product.price })),
            total: finalTotal, customerEmail: user.email, customerName: address.name,
            successUrl: `${window.location.origin}/order-success?id=${oid}`,
            failureUrl: `${window.location.origin}/checkout?error=payment_failed`,
            pendingUrl: `${window.location.origin}/order-success?id=${oid}&status=pending`,
          }, payMethod)

          if (payResult.success && payMethod === 'pix' && payResult.pixCode) {
            setPixCode(payResult.pixCode); setPixQR(payResult.pixQR || ''); clearCart(); return
          }
          if (payResult.success && payMethod === 'card' && payResult.initPoint) {
            clearCart(); window.location.href = payResult.initPoint; return
          }
        } catch { /* cai no fluxo manual abaixo */ }
      }

      // 4. PIX manual configurado pelo Gabriel → mostra a chave PIX
      const pixManual = settings.paymentMethods?.pix
      if (payMethod === 'pix' && pixManual?.enabled && pixManual?.key) {
        setOrderId(oid)
        setShowManualPix(true)
        clearCart()
        return
      }

      // 5. Sem gateway → finaliza direto (pagamento combinado via WhatsApp)
      clearCart()
      navigate(`/order-success?id=${oid}`)
    } catch (e) {
      console.error('Erro ao finalizar pedido:', e)
      toast.error('Erro ao finalizar pedido. Tente novamente.')
    }
    finally { setLoading(false) }
  }

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode)
    setCopied(true)
    toast.success('Código Pix copiado!')
    setTimeout(() => setCopied(false), 3000)
  }

  // ── TELA PIX MANUAL (chave do Gabriel) ──────────────────────────────────
  if (showManualPix) {
    const pixData = settings.paymentMethods?.pix
    const keyTypeLabels: Record<string, string> = {
      cpf: 'CPF', cnpj: 'CNPJ', email: 'E-mail', phone: 'Telefone', random: 'Chave aleatória'
    }
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center">
        <div className="card-kid p-8">
          <div className="text-5xl mb-3">🔵</div>
          <h1 className="font-black text-2xl text-brand-navy mb-2">Pague com Pix</h1>
          <p className="text-sm font-bold text-gray-500 mb-6">
            Pedido <strong className="text-brand-navy">{orderId}</strong> — {formatCurrency(finalTotal)}
          </p>

          <div className="bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200 rounded-2xl p-5 mb-5 text-left">
            <p className="text-xs font-black text-gray-500 mb-1">Chave Pix ({keyTypeLabels[pixData?.keyType || 'cpf']})</p>
            <div className="flex gap-2 items-center mb-3">
              <input readOnly value={pixData?.key || ''} className="input-field text-sm font-mono flex-1 bg-white select-all py-2"/>
              <button onClick={() => { navigator.clipboard.writeText(pixData?.key || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success('Chave Pix copiada!') }}
                className={`btn-navy px-4 shrink-0 py-2 ${copied ? '!bg-green-600' : ''}`}>
                {copied ? <CheckCircle size={16}/> : <Copy size={16}/>}
              </button>
            </div>
            {pixData?.holderName && (
              <p className="text-xs text-gray-600"><strong>Titular:</strong> {pixData.holderName}</p>
            )}
            <p className="text-lg font-black text-brand-navy mt-2">Valor: {formatCurrency(finalTotal)}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-700 text-left mb-5">
            <p className="font-black mb-1">📱 Como pagar:</p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>Abra o app do seu banco</li>
              <li>Escolha pagar com Pix → Copia e Cola (ou a chave acima)</li>
              <li>Confira o valor e confirme</li>
              <li>Envie o comprovante pelo WhatsApp</li>
            </ol>
          </div>

          <a href={`https://wa.me/${(settings.storeWhatsapp || '').replace(/\D/g,'')}?text=${encodeURIComponent(`Olá! Acabei de fazer o pedido ${orderId} e vou enviar o comprovante do Pix 📄`)}`}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-2xl mb-3 transition-colors">
            <span>💬</span> Enviar comprovante no WhatsApp
          </a>

          <button onClick={() => navigate(`/order-success?id=${orderId}`)}
            className="btn-outline w-full justify-center text-sm">
            ✓ Já enviei o comprovante
          </button>
        </div>
      </div>
    )
  }

  // ── TELA PIX ────────────────────────────────────────────────────────────
  if (pixCode) return (
    <div className="max-w-md mx-auto px-4 py-10 text-center">
      <div className="card-kid p-8">
        <div className="text-5xl mb-3">🔵</div>
        <h1 className="font-black text-2xl text-brand-navy mb-2">Pague com Pix</h1>
        <p className="text-sm font-bold text-gray-500 mb-6">
          Pedido <strong className="text-brand-navy">{orderId}</strong> — {formatCurrency(finalTotal)}
        </p>
        {pixQR && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex justify-center">
            <img src={pixQR} alt="QR Code Pix" className="w-44 h-44"/>
          </div>
        )}
        <p className="text-xs text-gray-400 font-bold mb-2">Ou copie o código Pix:</p>
        <div className="flex gap-2 mb-5">
          <input readOnly value={pixCode} className="input-field text-xs font-mono flex-1 bg-gray-50 select-all"/>
          <button onClick={copyPix} className={`btn-navy px-4 shrink-0 ${copied ? '!bg-green-600' : ''}`}>
            {copied ? <CheckCircle size={16}/> : <Copy size={16}/>}
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-700 text-left mb-5">
          <p className="font-black mb-1">⏱️ Válido por 30 minutos</p>
          <p className="font-bold">Após pagar você receberá a confirmação por e-mail.</p>
        </div>
        <button onClick={() => navigate(`/order-success?id=${orderId}`)}
          className="btn-outline w-full justify-center text-sm">
          ✓ Já paguei
        </button>
        <p className="text-xs text-gray-400 font-bold mt-4">
          Dúvidas? <a href={`https://wa.me/${settings.storeWhatsapp}`} className="text-green-600 font-black">WhatsApp</a>
        </p>
      </div>
    </div>
  )

  // ── CHECKOUT ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="font-black text-2xl text-brand-navy mb-5">Finalizar Pedido</h1>

      {/* Steps */}
      <div className="flex items-center mb-6 overflow-x-auto pb-1">
        {STEPS.map(({ key, label }, i) => (
          <React.Fragment key={key}>
            <div className={`flex items-center gap-1.5 shrink-0 text-sm ${i <= stepIdx ? 'text-brand-pink' : 'text-gray-300'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black
                ${i < stepIdx ? 'bg-brand-pink text-white' : i === stepIdx ? 'border-2 border-brand-pink text-brand-pink' : 'border-2 border-gray-200 text-gray-300'}`}>
                {i < stepIdx ? '✓' : i + 1}
              </div>
              <span className="font-black hidden sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < stepIdx ? 'bg-brand-pink' : 'bg-gray-200'}`}/>}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">

          {/* ── ENDEREÇO ─────────────────────────────────────────────── */}
          {step === 'address' && (
            <form onSubmit={e => {
              e.preventDefault()
              if (!address.phone.trim()) { toast.error('Informe seu telefone'); return }
              if (!address.zipCode || address.zipCode.replace(/\D/g,'').length < 8) { toast.error('CEP inválido'); return }
      // Calcular frete via Melhor Envio (silencioso — complementa as opções manuais)
      calcularFrete(address.zipCode, subtotal)
              if (!address.street.trim()) { toast.error('Informe a rua'); return }
              if (!address.number.trim()) { toast.error('Informe o número'); return }
              if (!address.city.trim())   { toast.error('Informe a cidade'); return }
              if (!address.state)         { toast.error('Selecione o estado'); return }
              goNext('shipping')
            }} className="card-kid p-5 space-y-4">
              <h2 className="font-black text-brand-navy text-lg">📍 Endereço de Entrega</h2>

              <div className="grid sm:grid-cols-2 gap-3">
                {/* Nome */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-black text-gray-500 block mb-1">👤 Nome completo *</label>
                  <input required value={address.name}
                    onChange={e => setAddress(a => ({...a, name: e.target.value}))}
                    className="input-field" placeholder="Nome do destinatário"/>
                </div>

                {/* Telefone */}
                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1">📱 WhatsApp *</label>
                  <input required value={address.phone} type="tel"
                    onChange={e => setAddress(a => ({...a, phone: e.target.value}))}
                    className="input-field" placeholder="(99) 9 9999-9999"/>
                </div>

                {/* CEP com busca automática */}
                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1">
                    📮 CEP *
                    {cepLoading && <span className="ml-2 text-brand-pink">buscando...</span>}
                  </label>
                  <div className="relative">
                    <input required value={address.zipCode}
                      onChange={e => handleCepChange(e.target.value)}
                      placeholder="00000-000" maxLength={9}
                      className={`input-field pr-9 ${cepError ? 'border-red-400' : ''}`}/>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {cepLoading
                        ? <Loader2 size={15} className="text-brand-pink animate-spin"/>
                        : address.city
                          ? <CheckCircle size={15} className="text-green-500"/>
                          : <MapPin size={15} className="text-gray-400"/>
                      }
                    </div>
                  </div>
                  {cepError && <p className="text-xs text-red-500 font-bold mt-1">{cepError}</p>}
                  {address.city && !cepLoading && (
                    <p className="text-xs text-green-600 font-bold mt-1">
                      ✓ {address.city}/{address.state}
                    </p>
                  )}
                </div>

                {/* Rua — preenchida automaticamente */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-black text-gray-500 block mb-1">Rua / Avenida *</label>
                  <input required value={address.street}
                    onChange={e => setAddress(a => ({...a, street: e.target.value}))}
                    className="input-field" placeholder="Preenchido pelo CEP"/>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1">Número *</label>
                  <input required value={address.number}
                    onChange={e => setAddress(a => ({...a, number: e.target.value}))}
                    className="input-field" placeholder="123"/>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1">Complemento</label>
                  <input value={address.complement}
                    onChange={e => setAddress(a => ({...a, complement: e.target.value}))}
                    className="input-field" placeholder="Apto, bloco..."/>
                </div>

                {/* Bairro — preenchido automaticamente */}
                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1">Bairro *</label>
                  <input required value={address.neighborhood}
                    onChange={e => setAddress(a => ({...a, neighborhood: e.target.value}))}
                    className="input-field" placeholder="Preenchido pelo CEP"/>
                </div>

                {/* Cidade — preenchida automaticamente */}
                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1">Cidade *</label>
                  <input required value={address.city}
                    onChange={e => setAddress(a => ({...a, city: e.target.value}))}
                    className="input-field" placeholder="Preenchida pelo CEP"/>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 block mb-1">Estado *</label>
                  <select required value={address.state}
                    onChange={e => setAddress(a => ({...a, state: e.target.value}))}
                    className="input-field">
                    <option value="">Selecione</option>
                    {UF.map(uf => <option key={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3.5 justify-center">
                Continuar para Entrega <ChevronRight size={16}/>
              </button>
            </form>
          )}

          {/* ── ENTREGA ──────────────────────────────────────────────── */}
          {step === 'shipping' && (
            <div className="card-kid p-5 space-y-4">
              <h2 className="font-black text-brand-navy text-lg flex items-center gap-2">
                <Truck size={20} className="text-brand-pink"/> Opção de Entrega
              </h2>
              <div className="space-y-3">
                {activeShipping.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Truck size={32} className="mx-auto mb-2 opacity-30"/>
                    <p className="text-sm font-bold">Nenhuma opção cadastrada ainda.</p>
                  </div>
                ) : activeShipping.map(opt => (
                  <label key={opt.id} className={`flex items-center justify-between gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all
                    ${selectedShipping === opt.id ? 'border-brand-pink bg-bg-soft' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" value={opt.id}
                        checked={selectedShipping === opt.id}
                        onChange={() => setSelectedShipping(opt.id)}
                        className="accent-pink w-4 h-4"/>
                      <div>
                        <p className="font-black text-brand-navy text-sm">
                          {opt.company && opt.company !== opt.name ? `${opt.company} · ` : ''}{opt.name}
                        </p>
                        <p className="text-xs text-gray-500 font-bold">{opt.estimatedDays}</p>
                      </div>
                    </div>
                    <span className={`font-black text-sm ${opt.price === 0 ? 'text-green-600' : 'text-brand-navy'}`}>
                      {opt.price === 0 ? '🚚 Grátis' : formatCurrency(opt.price)}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => goNext('address')} className="btn-outline flex-1">← Voltar</button>
                <button onClick={() => {
                  if (!selectedShipping && activeShipping.length > 0) { toast.error('Selecione uma opção de entrega'); return }
                  goNext('payment')
                }} className="btn-primary flex-1">Continuar <ChevronRight size={16}/></button>
              </div>
            </div>
          )}

          {/* ── PAGAMENTO ────────────────────────────────────────────── */}
          {step === 'payment' && (() => {
            // Monta as opções de pagamento disponíveis conforme a configuração do Gabriel
            const mpOk = settings.paymentMethods?.mercadopago?.enabled && settings.paymentMethods?.mercadopago?.publicKey?.startsWith('APP_USR')
            const pixManualOk = settings.paymentMethods?.pix?.enabled && settings.paymentMethods?.pix?.key
            const payOptions: { key: PayMethod; icon: string; name: string; sub: string }[] = []

            // PIX aparece se: Mercado Pago ativo (PIX automático) OU PIX manual configurado
            if (mpOk || pixManualOk) {
              payOptions.push({ key:'pix', icon:'🔵', name:'Pix', sub: mpOk ? 'Aprovação imediata' : 'Chave Pix' })
            }
            // Cartão aparece SOMENTE se o Mercado Pago estiver configurado
            if (mpOk) {
              payOptions.push({ key:'card', icon:'💳', name:'Cartão', sub:'Crédito / Débito' })
            }

            // Se nenhuma forma configurada → finaliza via WhatsApp
            const noPaymentConfigured = payOptions.length === 0

            // Garante que payMethod seja válido
            if (payOptions.length > 0 && !payOptions.some(o => o.key === payMethod)) {
              setPayMethod(payOptions[0].key)
            }

            return (
              <div className="card-kid p-5 space-y-5">
                <h2 className="font-black text-brand-navy text-lg flex items-center gap-2">
                  <CreditCard size={20} className="text-brand-pink"/> Forma de Pagamento
                </h2>

                {noPaymentConfigured ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="font-black text-brand-navy mb-1">Pagamento via WhatsApp</p>
                    <p className="text-xs text-gray-500">Após confirmar o pedido, combine o pagamento direto com a loja pelo WhatsApp.</p>
                  </div>
                ) : (
                  <>
                    <div className={`grid ${payOptions.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                      {payOptions.map(opt => (
                        <button key={opt.key} onClick={() => setPayMethod(opt.key)}
                          className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${payMethod===opt.key ? 'border-brand-pink bg-bg-soft' : 'border-gray-200 hover:border-gray-300'}`}>
                          <span className="text-3xl">{opt.icon}</span>
                          <p className="font-black text-brand-navy text-sm">{opt.name}</p>
                          <p className="text-xs text-gray-400 font-bold">{opt.sub}</p>
                          {payMethod===opt.key && <span className="text-[10px] bg-brand-pink text-white px-2 py-0.5 rounded-full font-black">✓ Selecionado</span>}
                        </button>
                      ))}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs font-bold ${payMethod==='pix' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {payMethod === 'pix'
                        ? (mpOk ? '🔵 Após confirmar, você recebe o QR Code e código Pix. Aprovação instantânea!' : '🔵 Após confirmar, você verá a chave Pix para pagar e enviar o comprovante.')
                        : '💳 Você será redirecionado para o Mercado Pago para inserir os dados do cartão com segurança.'}
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <button onClick={() => goNext('shipping')} className="btn-outline flex-1">← Voltar</button>
                  <button onClick={() => goNext('confirm')} className="btn-primary flex-1">Revisar <ChevronRight size={16}/></button>
                </div>
              </div>
            )
          })()}

          {/* ── CONFIRMAR ────────────────────────────────────────────── */}
          {step === 'confirm' && (
            <div className="card-kid p-5 space-y-4">
              <h2 className="font-black text-brand-navy text-lg">Revisar e Confirmar</h2>
              <div className="space-y-2">
                <div className="p-4 bg-bg-page rounded-2xl">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">📍 Entrega</p>
                  <p className="font-black text-brand-navy text-sm">{address.name}</p>
                  <p className="text-sm text-gray-600 font-bold">{address.street}, {address.number} {address.complement && `· ${address.complement}`}</p>
                  <p className="text-sm text-gray-500 font-bold">{address.neighborhood}, {address.city} – {address.state} · {address.zipCode}</p>
                  <p className="text-xs text-gray-400 font-bold mt-1">📱 {address.phone}</p>
                </div>
                <div className="p-4 bg-bg-page rounded-2xl">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">🚚 Envio</p>
                  <p className="font-black text-brand-navy text-sm">{chosenShipping?.name || 'Padrão'} — {chosenShipping?.estimatedDays}</p>
                </div>
                <div className="p-4 bg-bg-page rounded-2xl">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">💳 Pagamento</p>
                  <p className="font-black text-brand-navy text-sm">{payMethod === 'pix' ? '🔵 Pix' : '💳 Cartão via Mercado Pago'}</p>
                </div>
                <div className="p-4 bg-bg-page rounded-2xl">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">🛍️ Itens</p>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={item.product.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-brand-navy line-clamp-1">{item.product.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{item.selectedSize} · {item.selectedColor} · ×{item.quantity}</p>
                        </div>
                        <p className="text-xs font-black text-brand-navy shrink-0">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => goNext('payment')} className="btn-outline flex-1">← Voltar</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 py-4 text-base">
                  {loading
                    ? <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin"/> Processando...</span>
                    : <span className="flex items-center gap-2"><Shield size={16}/> {(() => {
                        const mpOn = settings.paymentMethods?.mercadopago?.enabled && settings.paymentMethods?.mercadopago?.publicKey?.startsWith('APP_USR')
                        if (mpOn && payMethod === 'pix') return `Gerar Pix — ${formatCurrency(finalTotal)}`
                        if (mpOn && payMethod === 'card') return `Pagar ${formatCurrency(finalTotal)}`
                        return `Confirmar Pedido — ${formatCurrency(finalTotal)}`
                      })()}</span>
                  }
                </button>
              </div>
              <p className="text-xs text-center text-gray-400 font-bold flex items-center justify-center gap-1">
                <Lock size={11}/> Compra 100% segura · SSL · Mercado Pago
              </p>
            </div>
          )}
        </div>

        {/* ── RESUMO LATERAL ─────────────────────────────────────────── */}
        <div className="card-kid p-5 h-fit lg:sticky lg:top-24">
          <h3 className="font-black text-brand-navy mb-4">Resumo</h3>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <img src={item.product.images[0]} alt="" className="w-12 h-14 object-cover rounded-xl bg-gray-100 shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-brand-navy line-clamp-1">{item.product.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{item.selectedSize} · ×{item.quantity}</p>
                  <p className="text-xs font-black mt-0.5">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-gray-100 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500 font-bold"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600 font-black"><span>Desconto</span><span>-{formatCurrency(discount)}</span></div>}
            <div className="flex justify-between text-gray-500 font-bold">
              <span>Frete</span>
              <span>{shippingCost === 0 ? <span className="text-green-600 font-black">Grátis</span> : formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-black text-brand-navy text-base pt-2 border-t-2 border-gray-100">
              <span>Total</span><span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
