/**
 * Serviço de E-mail — Resend.com
 *
 * COMO FUNCIONA:
 * - Em DEV local: simula o envio e loga no console (não precisa de conta)
 * - Em PRODUÇÃO: chama a API do Resend com sua chave real
 *
 * CONFIGURAR:
 * 1. Crie conta grátis em resend.com (3.000 e-mails/mês grátis)
 * 2. Crie uma API key no painel deles
 * 3. Adicione VITE_RESEND_API_KEY no .env.local
 *
 * IMPORTANTE: Em produção real, o envio deve estar no BACKEND (Node.js)
 * para não expor a chave no frontend. Esta implementação é para demonstração.
 */

const RESEND_KEY  = import.meta.env.VITE_RESEND_API_KEY || ''
const STORE_EMAIL = import.meta.env.VITE_STORE_EMAIL    || 'contato@ergalimkids.com.br'
const STORE_NAME  = 'Ergalim Kids'
const IS_DEV      = import.meta.env.DEV

interface SendEmailParams {
  to:      string
  subject: string
  html:    string
}

async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  // Em dev sem chave: apenas simula
  if (IS_DEV && !RESEND_KEY) {
    console.group(`📧 [EMAIL SIMULADO]`)
    console.log(`Para: ${to}`)
    console.log(`Assunto: ${subject}`)
    console.log(`Conteúdo HTML:`, html.replace(/<[^>]*>/g, '').slice(0, 200) + '...')
    console.groupEnd()
    return true
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${STORE_NAME} <noreply@ergalimkids.com.br>`,
        to,
        subject,
        html,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err)
    return false
  }
}

// ─── Templates de E-mail ────────────────────────────────────────────────────

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f7f8fc; margin: 0; padding: 20px; }
    .card { max-width: 580px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: #1B2D5E; padding: 28px 32px; text-align: center; }
    .logo { color: #fff; font-size: 28px; font-weight: 900; letter-spacing: 1px; margin: 0; }
    .logo span { color: #E91E8C; }
    .body { padding: 32px; }
    h1 { color: #1B2D5E; font-size: 22px; margin: 0 0 12px; }
    p { color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 12px; }
    .box { background: #f7f8fc; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
    .box-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #333; border-bottom: 1px solid #e8e5e0; }
    .box-row:last-child { border: none; font-weight: 700; font-size: 15px; color: #1B2D5E; }
    .btn { display: inline-block; background: #E91E8C; color: #fff !important; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 16px 0; }
    .tag { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .tag-green { background: #dcfce7; color: #16a34a; }
    .tag-blue  { background: #dbeafe; color: #2563eb; }
    .footer { background: #f7f8fc; padding: 20px 32px; text-align: center; font-size: 12px; color: #aaa; }
    .divider { height: 1px; background: #f0ede8; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p class="logo">ergalim <span>kids</span></p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>Ergalim Kids · Rua Dom João Braga, 236 · Alto da Serra</p>
      <p>WhatsApp: (24) 99239-1998 · ${STORE_EMAIL}</p>
      <p style="margin-top:8px; color:#ccc">Este é um e-mail automático, por favor não responda.</p>
    </div>
  </div>
</body>
</html>`

// 1. Confirmação de pedido → para o CLIENTE
export async function sendOrderConfirmationToCustomer(order: {
  id: string
  customerName: string
  customerEmail: string
  items: { productName: string; quantity: number; size: string; color: string; price: number }[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  paymentMethod: string
  shippingAddress: { street: string; number: string; city: string; state: string; zipCode: string }
}): Promise<boolean> {
  const itemsHtml = order.items.map(i => `
    <div class="box-row">
      <span>${i.productName} (${i.size} · ${i.color}) ×${i.quantity}</span>
      <span>R$ ${(i.price * i.quantity).toFixed(2).replace('.', ',')}</span>
    </div>`).join('')

  const html = baseTemplate(`
    <h1>Pedido confirmado! 🎉</h1>
    <p>Olá, <strong>${order.customerName}</strong>! Recebemos seu pedido e já estamos preparando tudo com carinho.</p>
    <div class="box">
      <div class="box-row"><span>Número do pedido</span><span><strong>${order.id}</strong></span></div>
      <div class="box-row"><span>Pagamento</span><span>${order.paymentMethod === 'pix' ? '🔵 Pix' : '💳 Cartão'}</span></div>
    </div>
    <p><strong>Itens do pedido:</strong></p>
    <div class="box">
      ${itemsHtml}
      <div class="box-row"><span>Subtotal</span><span>R$ ${order.subtotal.toFixed(2).replace('.', ',')}</span></div>
      ${order.discount > 0 ? `<div class="box-row"><span>Desconto</span><span>- R$ ${order.discount.toFixed(2).replace('.', ',')}</span></div>` : ''}
      <div class="box-row"><span>Frete</span><span>${order.shipping === 0 ? 'Grátis' : `R$ ${order.shipping.toFixed(2).replace('.', ',')}`}</span></div>
      <div class="box-row"><span>Total</span><span>R$ ${order.total.toFixed(2).replace('.', ',')}</span></div>
    </div>
    <p><strong>Entrega para:</strong></p>
    <div class="box">
      <p style="margin:0;font-size:14px;">${order.shippingAddress.street}, ${order.shippingAddress.number} · ${order.shippingAddress.city}/${order.shippingAddress.state} · CEP ${order.shippingAddress.zipCode}</p>
    </div>
    <p style="font-size:13px;color:#888">Prazo de entrega: conforme opção escolhida. Você receberá outro e-mail quando o pedido for enviado.</p>
    <a href="https://wa.me/5524992391998" class="btn">Falar no WhatsApp</a>`)

  return sendEmail({ to: order.customerEmail, subject: `Pedido ${order.id} confirmado — Ergalim Kids 🌟`, html })
}

// 2. Novo pedido → para o DONO DA LOJA
export async function sendNewOrderToOwner(order: {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  total: number
  items: { productName: string; quantity: number; size: string }[]
  paymentMethod: string
}): Promise<boolean> {
  const html = baseTemplate(`
    <h1>🛍️ Novo pedido recebido!</h1>
    <p>Um novo pedido chegou na Ergalim Kids.</p>
    <div class="box">
      <div class="box-row"><span>Pedido</span><span><strong>${order.id}</strong></span></div>
      <div class="box-row"><span>Cliente</span><span>${order.customerName}</span></div>
      <div class="box-row"><span>E-mail</span><span>${order.customerEmail}</span></div>
      <div class="box-row"><span>WhatsApp</span><span>${order.customerPhone}</span></div>
      <div class="box-row"><span>Pagamento</span><span>${order.paymentMethod === 'pix' ? '🔵 Pix' : '💳 Cartão'}</span></div>
      <div class="box-row"><span>Total</span><span><strong>R$ ${order.total.toFixed(2).replace('.', ',')}</strong></span></div>
    </div>
    <p><strong>Itens:</strong></p>
    <div class="box">
      ${order.items.map(i => `<div class="box-row"><span>${i.productName}</span><span>${i.size} · ×${i.quantity}</span></div>`).join('')}
    </div>
    <a href="https://ergalimkids.vercel.app/owner/orders" class="btn">Ver no painel da loja</a>`)

  return sendEmail({ to: STORE_EMAIL, subject: `🆕 Novo pedido ${order.id} — R$ ${order.total.toFixed(2).replace('.', ',')}`, html })
}

// 3. Pedido enviado → para o CLIENTE
export async function sendOrderShippedToCustomer(data: {
  customerName: string
  customerEmail: string
  orderId: string
  trackingCode?: string
  shippingMethod: string
}): Promise<boolean> {
  const html = baseTemplate(`
    <h1>Seu pedido está a caminho! 🚚</h1>
    <p>Olá, <strong>${data.customerName}</strong>! Seu pedido <strong>${data.orderId}</strong> foi enviado.</p>
    ${data.trackingCode ? `
    <div class="box">
      <p style="margin:0 0 8px;font-size:13px;color:#888;">Código de rastreamento</p>
      <p style="margin:0;font-size:22px;font-weight:900;color:#1B2D5E;letter-spacing:2px;font-family:monospace;">${data.trackingCode}</p>
      <p style="margin:8px 0 0;font-size:12px;color:#aaa;">${data.shippingMethod}</p>
    </div>
    <a href="https://www.linkcorreios.com.br/?id=${data.trackingCode}" class="btn">Rastrear encomenda</a>` : `
    <div class="box">
      <p style="margin:0;color:#555;">Método de envio: <strong>${data.shippingMethod}</strong></p>
      <p style="margin:8px 0 0;font-size:13px;color:#888;">O código de rastreamento será disponibilizado em breve.</p>
    </div>`}
    <div class="divider"></div>
    <p style="font-size:13px;">Dúvidas? Fale com a gente pelo WhatsApp:</p>
    <a href="https://wa.me/5524992391998" class="btn">WhatsApp (24) 99239-1998</a>`)

  return sendEmail({ to: data.customerEmail, subject: `Pedido ${data.orderId} enviado! 🚚 Ergalim Kids`, html })
}

// 4. Pedido entregue → para o CLIENTE
export async function sendOrderDeliveredToCustomer(data: {
  customerName: string
  customerEmail: string
  orderId: string
}): Promise<boolean> {
  const html = baseTemplate(`
    <h1>Pedido entregue! ✅</h1>
    <p>Olá, <strong>${data.customerName}</strong>! Seu pedido <strong>${data.orderId}</strong> foi marcado como entregue.</p>
    <p>Esperamos que você e a criançada tenham amado as peças! 🌟</p>
    <div class="box">
      <p style="margin:0;font-size:14px;">Gostou? Conta pra gente no Instagram: <a href="https://instagram.com/ergalimkids" style="color:#E91E8C;">@ergalimkids</a></p>
    </div>
    <a href="https://wa.me/5524992391998" class="btn">Falar no WhatsApp</a>`)

  return sendEmail({ to: data.customerEmail, subject: `Pedido ${data.orderId} entregue! ✅ Ergalim Kids`, html })
}
