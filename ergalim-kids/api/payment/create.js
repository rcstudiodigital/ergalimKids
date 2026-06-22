/**
 * Serverless — Cria preferência de pagamento no Mercado Pago
 * Usa o ACCESS TOKEN secreto (nunca exposto no browser)
 *
 * SEGURANÇA: o preço de cada item é buscado no Firestore (fonte da verdade),
 * NÃO é confiado o valor que veio do navegador. Isso impede que alguém
 * altere o preço no DevTools antes de pagar.
 *
 * O webhook (notification_url) faz o MP avisar quando o pagamento for aprovado.
 */

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'ergalim-kids-novo'

// Busca o preço REAL do produto no Firestore via REST (products é leitura pública)
async function getRealProduct(productId) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products/${productId}`
  const res = await fetch(url)
  if (!res.ok) return null
  const doc = await res.json()
  if (!doc.fields) return null
  const price = Number(
    doc.fields.price?.doubleValue ??
    doc.fields.price?.integerValue ??
    0
  )
  return {
    name: doc.fields.name?.stringValue || 'Produto',
    price,
    active: doc.fields.active?.booleanValue !== false,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Mercado Pago não configurado (falta MERCADOPAGO_ACCESS_TOKEN)' })
  }

  try {
    const { orderId, items, shippingCost, customerEmail, customerName } = req.body
    const SITE_URL = process.env.SITE_URL || 'https://ergalimkids.com'

    // Monta os itens com PREÇO REAL do banco (ignora o preço enviado pelo cliente)
    const mpItems = []
    for (const i of (items || [])) {
      const productId = i.id || i.productId
      if (!productId) continue

      const real = await getRealProduct(productId)
      // Se o produto não existe ou está inativo, recusa
      if (!real || !real.active) {
        return res.status(400).json({ error: `Produto indisponível: ${i.title || productId}` })
      }

      const qty = Math.max(1, Number(i.quantity) || 1)
      mpItems.push({
        title: real.name,
        quantity: qty,
        unit_price: real.price,   // ← preço do banco, não o do navegador
        currency_id: 'BRL',
      })
    }

    if (mpItems.length === 0) {
      return res.status(400).json({ error: 'Nenhum item válido no pedido' })
    }

    // Frete como item separado (valor vem da cotação; idealmente revalidar, mas
    // ao menos não está embutido no preço dos produtos)
    const frete = Number(shippingCost) || 0
    if (frete > 0) {
      mpItems.push({ title: 'Frete', quantity: 1, unit_price: frete, currency_id: 'BRL' })
    }

    const preference = {
      items: mpItems,
      payer: {
        email: customerEmail || '',
        name: customerName || '',
      },
      external_reference: orderId,
      back_urls: {
        success: `${SITE_URL}/order-success?id=${orderId}&status=approved`,
        pending: `${SITE_URL}/order-success?id=${orderId}&status=pending`,
        failure: `${SITE_URL}/order-success?id=${orderId}&status=failure`,
      },
      auto_return: 'approved',
      notification_url: `${SITE_URL}/api/payment/webhook`,
      statement_descriptor: 'ERGALIM KIDS',
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Erro MP:', err)
      return res.status(500).json({ error: 'Erro ao criar preferência no Mercado Pago' })
    }

    const data = await response.json()

    return res.status(200).json({
      init_point: data.init_point,
      preference_id: data.id,
    })
  } catch (err) {
    console.error('Erro ao criar pagamento:', err)
    return res.status(500).json({ error: err.message })
  }
}
