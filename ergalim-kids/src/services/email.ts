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

const STORE_EMAIL = import.meta.env.VITE_STORE_EMAIL    || 'contato@ergalimkids.com.br'
const STORE_NAME  = 'Ergalim Kids'
const IS_DEV      = import.meta.env.DEV

interface SendEmailParams {
  to:      string
  subject: string
  html:    string
}

async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  // Em dev local: apenas simula e loga no console (não envia de verdade)
  if (IS_DEV) {
    console.group(`📧 [EMAIL SIMULADO - dev local]`)
    console.log(`Para: ${to}`)
    console.log(`Assunto: ${subject}`)
    console.groupEnd()
    return true
  }

  // Em produção: chama a função serverless da Vercel (segura, sem expor chave)
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        html,
        // remetente decidido pela função serverless (EMAIL_FROM ou padrão de teste)
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
      <p>WhatsApp: (21) 99211-0726 · ${STORE_EMAIL}</p>
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
    <a href="https://wa.me/5521992110726" class="btn">Falar no WhatsApp</a>`)

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
    <a href="https://wa.me/5521992110726" class="btn">WhatsApp (21) 99211-0726</a>`)

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
    <a href="https://wa.me/5521992110726" class="btn">Falar no WhatsApp</a>`)

  return sendEmail({ to: data.customerEmail, subject: `Pedido ${data.orderId} entregue! ✅ Ergalim Kids`, html })
}

// 5. Pagamento confirmado → para o CLIENTE
export async function sendOrderPaidToCustomer(data: {
  customerName: string
  customerEmail: string
  orderId: string
  total: number
  items: { productName: string; quantity: number; size: string }[]
  customMessage?: string
}): Promise<boolean> {
  const itemsList = data.items.map(i =>
    `<div style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
      <strong>${i.productName}</strong> — Tam: ${i.size} · Qtd: ${i.quantity}
    </div>`
  ).join('')
  const html = baseTemplate(`
    <h1>Pagamento confirmado! ✅</h1>
    <p>Olá, <strong>${data.customerName}</strong>! Recebemos seu pagamento e seu pedido <strong>${data.orderId}</strong> está confirmado.</p>
    <div class="box">
      <p style="margin:0 0 12px;font-weight:900;color:#1B2D5E;">Itens do pedido:</p>
      ${itemsList}
      <p style="margin:12px 0 0;font-size:16px;font-weight:900;color:#E91E8C;">Total: ${formatCurrencyEmail(data.total)}</p>
    </div>
    <p style="font-size:13px;color:#555;">Agora vamos separar suas peças com muito carinho! Em breve você receberá mais atualizações. 💕</p>
    <a href="https://wa.me/5521992110726" class="btn">Falar no WhatsApp</a>`)
  return sendEmail({ to: data.customerEmail, subject: `✅ Pagamento confirmado — Pedido ${data.orderId} | Ergalim Kids`, html })
}

// 6. Em separação → para o CLIENTE
export async function sendOrderProcessingToCustomer(data: {
  customerName: string
  customerEmail: string
  orderId: string
  customMessage?: string
}): Promise<boolean> {
  const html = baseTemplate(`
    <h1>Seu pedido está sendo separado! 📦</h1>
    <p>Olá, <strong>${data.customerName}</strong>! Ótima notícia: seu pedido <strong>${data.orderId}</strong> está sendo preparado com muito carinho pela nossa equipe.</p>
    <div class="box">
      <p style="margin:0;font-size:15px;">📦 Status atual: <strong>Em Separação</strong></p>
      <p style="margin:8px 0 0;font-size:13px;color:#888;">${data.customMessage || 'Em breve seu pedido será enviado e você receberá o código de rastreio.'}</p>
    </div>
    <p style="font-size:13px;color:#555;">Dúvidas sobre seu pedido? Fale com a gente:</p>
    <a href="https://wa.me/5521992110726" class="btn">WhatsApp (21) 99211-0726</a>`)
  return sendEmail({ to: data.customerEmail, subject: `📦 Pedido ${data.orderId} em separação | Ergalim Kids`, html })
}

// Helper interno para formatar moeda nos templates
function formatCurrencyEmail(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

// ════════════════════════════════════════════════════════════════════════
// E-MAIL MARKETING — Promoções, novidades e descontos para clientes
// ════════════════════════════════════════════════════════════════════════

/**
 * Envia um e-mail de campanha para uma lista de clientes
 * 
 * @param recipients - lista de e-mails dos clientes
 * @param campaign   - dados da campanha (título, mensagem, cupom opcional)
 */
export async function sendMarketingCampaign(
  recipients: string[],
  campaign: {
    subject:     string
    title:       string
    message:     string
    couponCode?: string
    couponDiscount?: number
    buttonText?: string
    buttonUrl?:  string
    imageUrl?:   string
  }
): Promise<{ sent: number; failed: number }> {
  const html = buildMarketingHtml(campaign)
  let sent = 0, failed = 0

  // Envia em lotes para não sobrecarregar
  for (const email of recipients) {
    const ok = await sendEmail({ to: email, subject: campaign.subject, html })
    if (ok) sent++; else failed++
    // Pequeno delay entre envios (evita rate limit)
    await new Promise(r => setTimeout(r, 100))
  }

  return { sent, failed }
}

function buildMarketingHtml(c: {
  title: string; message: string; couponCode?: string; couponDiscount?: number
  buttonText?: string; buttonUrl?: string; imageUrl?: string
}): string {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#FFF9F5;font-family:Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF9F5;padding:20px 0">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">

          <!-- Header -->
          <tr><td style="background:linear-gradient(135deg,#1A2B6B,#2A3F9E);padding:32px;text-align:center">
            <div style="font-size:28px;font-weight:900;color:#fff">⭐ ergalim <span style="color:#FF3D9A">kids</span></div>
            <div style="font-size:12px;color:rgba(255,255,255,.6);letter-spacing:2px;margin-top:4px">MODA INFANTIL</div>
          </td></tr>

          ${c.imageUrl ? `<tr><td><img src="${c.imageUrl}" width="600" style="width:100%;display:block"></td></tr>` : ''}

          <!-- Conteúdo -->
          <tr><td style="padding:32px">
            <h1 style="font-size:26px;font-weight:900;color:#1A2B6B;margin:0 0 16px">${c.title}</h1>
            <p style="font-size:15px;line-height:1.7;color:#555;margin:0 0 24px">${c.message}</p>

            ${c.couponCode ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
              <tr><td style="background:#FFF0F8;border:2px dashed #FF3D9A;border-radius:16px;padding:20px;text-align:center">
                <div style="font-size:12px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px">Seu cupom de desconto</div>
                <div style="font-size:32px;font-weight:900;color:#FF3D9A;margin:8px 0;letter-spacing:2px">${c.couponCode}</div>
                ${c.couponDiscount ? `<div style="font-size:14px;font-weight:700;color:#1A2B6B">${c.couponDiscount}% OFF na sua compra! 🎉</div>` : ''}
              </td></tr>
            </table>` : ''}

            ${c.buttonText ? `
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
              <a href="${c.buttonUrl || 'https://ergalimkids.com'}" style="display:inline-block;background:#FF3D9A;color:#fff;font-size:16px;font-weight:900;text-decoration:none;padding:16px 40px;border-radius:16px">${c.buttonText} →</a>
            </td></tr></table>` : ''}
          </td></tr>

          <!-- Footer -->
          <tr><td style="background:#1A2B6B;padding:24px;text-align:center">
            <p style="font-size:12px;color:rgba(255,255,255,.6);margin:0 0 8px">Ergalim Kids · Moda infantil com estilo 💖</p>
            <p style="font-size:11px;color:rgba(255,255,255,.4);margin:0">
              Você recebeu este e-mail porque é cliente da Ergalim Kids.
            </p>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </body>
  </html>`
}
