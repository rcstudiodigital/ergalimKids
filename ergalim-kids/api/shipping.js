/**
 * Função serverless — Cálculo de frete via Melhor Envio
 * O token fica APENAS no servidor, nunca exposto no browser
 *
 * Docs: https://docs.melhorenvio.com.br/reference/calculando-frete
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const ME_TOKEN = process.env.MELHOR_ENVIO_TOKEN
  if (!ME_TOKEN) {
    // Sem token configurado — retorna array vazio para o checkout usar os métodos manuais
    return res.status(200).json({ options: [] })
  }

  try {
    const { cep_destino, produtos } = req.body
    const CEP_ORIGEM = process.env.CEP_ORIGEM || '25625018' // CEP da loja (Petrópolis)

    const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ME_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Ergalim Kids (contato@ergalimkids.com)',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        from: { postal_code: CEP_ORIGEM.replace(/\D/g, '') },
        to:   { postal_code: cep_destino.replace(/\D/g, '') },
        products: produtos?.length > 0 ? produtos : [
          {
            id: '1',
            width: 20, height: 15, length: 20,
            weight: 0.5,
            insurance_value: 0,
            quantity: 1,
          }
        ],
        // Sem filtro de services — retorna todas as transportadoras disponíveis na conta
        options: {
          receipt: false,
          own_hand: false,
          insurance_value: 0,
        }
      }),
    })

    if (!response.ok) {
      console.error('Melhor Envio erro:', response.status)
      return res.status(200).json({ options: [] })
    }

    const data = await response.json()

    // Log para debug (aparece nos logs da Vercel)
    console.log('Melhor Envio retornou', data?.length, 'opções')
    if (Array.isArray(data)) {
      data.forEach((s) => {
        if (s.error) console.log(`  ${s.name}: ERRO - ${s.error}`)
        else console.log(`  ${s.name}: R$ ${s.price} (${s.delivery_time} dias)`)
      })
    }

    // Formatar para o padrão da loja — SÓ Jadlog e SEDEX
    const PERMITIDAS = ['jadlog', 'sedex']
    const options = (Array.isArray(data) ? data : [])
      .filter((s) => !s.error && s.price && parseFloat(s.price) > 0)
      .filter((s) => {
        const nome = (s.name || '').toLowerCase()
        const empresa = (s.company?.name || '').toLowerCase()
        // Mantém se o nome do serviço OU a transportadora for Jadlog ou SEDEX
        return PERMITIDAS.some(p => nome.includes(p) || empresa.includes(p))
      })
      .map((s) => ({
        id: `me_${s.id}`,
        name: s.name,                                    // ex: "PAC", "SEDEX"
        company: s.company?.name || s.name,             // ex: "Correios"
        price: parseFloat(s.price),                     // em reais
        estimatedDays: `${s.delivery_time} dias úteis`, // ex: "7 dias úteis"
        active: true,
        fromMelhorEnvio: true,
      }))

    return res.status(200).json({ options })
  } catch (err) {
    console.error('Erro ao calcular frete:', err)
    return res.status(200).json({ options: [] }) // fallback silencioso
  }
}
