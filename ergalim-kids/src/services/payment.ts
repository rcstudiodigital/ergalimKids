/**
 * Serviço de Pagamento — Mercado Pago (Checkout Pro)
 *
 * COMO FUNCIONA:
 * - Em DEV local: simula o pagamento sem precisar de conta (modo sandbox)
 * - Em PRODUÇÃO: cria uma preference no backend e redireciona para o MP
 *
 * FLUXO REAL:
 * 1. Frontend chama POST /api/payment/create (no seu backend Node.js)
 * 2. Backend cria a preference no Mercado Pago com a chave SECRET
 * 3. Backend retorna o init_point (URL do checkout do MP)
 * 4. Frontend redireciona o cliente para essa URL
 * 5. Cliente paga no site do Mercado Pago
 * 6. MP redireciona de volta para /order-success ou /payment-failed
 * 7. MP também envia webhook para o backend confirmar o pagamento
 *
 * EM DEMO (sem backend): simula esse fluxo localmente
 */

const IS_DEV = import.meta.env.DEV
const MP_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || ''

export interface PaymentItem {
  id:       string
  title:    string
  quantity: number
  price:    number
  picture?: string
}

export interface PaymentPreference {
  items:          PaymentItem[]
  total:          number
  orderId:        string
  customerEmail:  string
  customerName:   string
  successUrl:     string
  failureUrl:     string
  pendingUrl:     string
}

export interface PaymentResult {
  success:    boolean
  initPoint?: string  // URL do checkout MP (produção)
  pixCode?:   string  // Código Pix copia-e-cola
  pixQR?:     string  // QR code base64
  error?:     string
  orderId:    string
}

// ─── Modo Demonstração (sem backend) ────────────────────────────────────────
function simulatePayment(pref: PaymentPreference, method: 'pix' | 'card'): PaymentResult {
  console.group('💳 [PAGAMENTO SIMULADO]')
  console.log('Pedido:', pref.orderId)
  console.log('Total:', `R$ ${pref.total.toFixed(2)}`)
  console.log('Método:', method)
  console.log('Itens:', pref.items)
  console.groupEnd()

  if (method === 'pix') {
    return {
      success:  true,
      orderId:  pref.orderId,
      pixCode:  '00020126580014BR.GOV.BCB.PIX0136' + pref.orderId + '520400005303986540' + pref.total.toFixed(2) + '5802BR5913Ergalim Kids6009Sao Paulo62070503***6304',
      pixQR:    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzFCMkQ1RSI+UVIgUElYPC90ZXh0Pjwvc3ZnPg==',
    }
  }

  return {
    success:   true,
    orderId:   pref.orderId,
    initPoint: `${window.location.origin}/order-success?id=${pref.orderId}&demo=true`,
  }
}

// ─── Criar preferência no Mercado Pago (via backend) ────────────────────────
export async function createMercadoPagoPreference(
  pref: PaymentPreference,
  method: 'pix' | 'card' = 'card'
): Promise<PaymentResult> {

  // Modo demo: não tem backend rodando
  if (IS_DEV && !MP_PUBLIC_KEY) {
    await new Promise(r => setTimeout(r, 1200)) // simula latência
    return simulatePayment(pref, method)
  }

  try {
    // Em produção: chama seu backend
    // O backend usa a CHAVE SECRETA do MP para criar a preference
    const res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pref, method }),
    })

    if (!res.ok) throw new Error('Erro ao criar pagamento')
    const data = await res.json()

    return {
      success:   true,
      orderId:   pref.orderId,
      initPoint: data.init_point,      // URL checkout MP (cartão)
      pixCode:   data.pix_code,        // Código Pix
      pixQR:     data.pix_qr_base64,   // QR code
    }
  } catch (err: any) {
    return { success: false, orderId: pref.orderId, error: err.message }
  }
}

// ─── Verificar status do pagamento ──────────────────────────────────────────
export async function checkPaymentStatus(orderId: string): Promise<'pending' | 'paid' | 'failed'> {
  if (IS_DEV) return 'paid' // demo: sempre aprovado

  try {
    const res = await fetch(`/api/payment/status/${orderId}`)
    const data = await res.json()
    return data.status
  } catch {
    return 'pending'
  }
}
