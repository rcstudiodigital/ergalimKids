/**
 * Serverless — Cria preferência de pagamento no Mercado Pago
 * Usa o ACCESS TOKEN secreto (nunca exposto no browser)
 *
 * O webhook (notification_url) faz o MP avisar quando o pagamento for aprovado.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Mercado Pago não configurado (falta MERCADOPAGO_ACCESS_TOKEN)' })
  }

  try {
    const { orderId, amount, items, method, customerEmail, customerName } = req.body
    const SITE_URL = process.env.SITE_URL || 'https://ergalimkids.com'

    // Monta os itens para o Mercado Pago
    const mpItems = (items || []).map((i) => ({
      title: i.productName || 'Produto',
      quantity: i.quantity || 1,
      unit_price: Number(i.price) || 0,
      currency_id: 'BRL',
    }))

    // Se não tiver itens detalhados, usa o total como item único
    if (mpItems.length === 0) {
      mpItems.push({
        title: `Pedido ${orderId}`,
        quantity: 1,
        unit_price: Number(amount) || 0,
        currency_id: 'BRL',
      })
    }

    const preference = {
      items: mpItems,
      payer: {
        email: customerEmail || '',
        name: customerName || '',
      },
      // external_reference = ID do pedido (o webhook usa isso para achar o pedido)
      external_reference: orderId,
      // URLs de retorno após o pagamento
      back_urls: {
        success: `${SITE_URL}/order-success?id=${orderId}&status=approved`,
        pending: `${SITE_URL}/order-success?id=${orderId}&status=pending`,
        failure: `${SITE_URL}/order-success?id=${orderId}&status=failure`,
      },
      auto_return: 'approved',
      // Webhook — o MP chama esta URL quando o status do pagamento muda
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
      init_point: data.init_point,           // URL do checkout do Mercado Pago
      preference_id: data.id,
    })
  } catch (err) {
    console.error('Erro ao criar pagamento:', err)
    return res.status(500).json({ error: err.message })
  }
}
