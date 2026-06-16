/**
 * Serverless — Webhook do Mercado Pago
 *
 * O Mercado Pago chama esta URL automaticamente quando o status de um
 * pagamento muda. Quando o pagamento é APROVADO, atualizamos o pedido
 * no Firestore para status 'paid'.
 *
 * Fluxo:
 * 1. Cliente paga no checkout do MP (cartão/pix)
 * 2. MP processa e chama este webhook
 * 3. Buscamos o pagamento no MP para confirmar que está aprovado
 * 4. Atualizamos o pedido no Firestore → status 'paid'
 * 5. O painel do Gabriel mostra o pedido como Pago automaticamente
 */

export default async function handler(req, res) {
  // O MP envia POST com a notificação
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true }) // responde 200 para qualquer método
  }

  const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!MP_ACCESS_TOKEN) {
    return res.status(200).json({ ok: true })
  }

  try {
    // O MP manda { type, data: { id } } — id é o ID do pagamento
    const { type, data } = req.body || {}

    // Só processa notificações de pagamento
    if (type !== 'payment' || !data?.id) {
      return res.status(200).json({ ok: true })
    }

    // 1. Buscar os detalhes do pagamento no Mercado Pago
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    })

    if (!payRes.ok) {
      console.error('Erro ao buscar pagamento MP:', data.id)
      return res.status(200).json({ ok: true })
    }

    const payment = await payRes.json()
    const orderId = payment.external_reference  // ID do nosso pedido
    const status = payment.status               // approved, pending, rejected, etc

    console.log(`Webhook MP: pedido ${orderId} → pagamento ${status}`)

    if (!orderId) return res.status(200).json({ ok: true })

    // 2. Mapear status do MP → status do nosso pedido
    let novoStatus = null
    if (status === 'approved')  novoStatus = 'paid'
    else if (status === 'rejected' || status === 'cancelled') novoStatus = 'cancelled'
    // pending/in_process → deixa como está (pending)

    if (!novoStatus) return res.status(200).json({ ok: true })

    // 3. Atualizar o pedido no Firestore via REST API
    const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'ergalim-kids'
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders/${orderId}?updateMask.fieldPaths=status&updateMask.fieldPaths=paymentId&updateMask.fieldPaths=updatedAt`

    const updateRes = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          status:    { stringValue: novoStatus },
          paymentId: { stringValue: String(data.id) },
          updatedAt: { timestampValue: new Date().toISOString() },
        },
      }),
    })

    if (!updateRes.ok) {
      const err = await updateRes.text()
      console.error('Erro ao atualizar pedido no Firestore:', err)
    } else {
      console.log(`✅ Pedido ${orderId} atualizado para ${novoStatus}`)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Erro no webhook:', err)
    // Sempre responde 200 para o MP não ficar reenviando
    return res.status(200).json({ ok: true })
  }
}
