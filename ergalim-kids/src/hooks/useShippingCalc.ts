import { useState, useCallback } from 'react'

export interface ShippingOption {
  id: string
  name: string
  company: string
  price: number
  estimatedDays: string
  active: boolean
  fromMelhorEnvio?: boolean
}

export function useShippingCalc() {
  const [calculating, setCalculating] = useState(false)
  const [melhorEnvioOptions, setMelhorEnvioOptions] = useState<ShippingOption[]>([])

  const calcularFrete = useCallback(async (cep: string, subtotal: number) => {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return

    setCalculating(true)
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep_destino: cepLimpo,
          // Produto genérico de roupas infantis
          produtos: [{
            id: '1',
            width: 20, height: 15, length: 20,
            weight: 0.5,
            insurance_value: subtotal,
            quantity: 1,
          }]
        }),
      })
      const data = await res.json()
      setMelhorEnvioOptions(data.options || [])
    } catch {
      setMelhorEnvioOptions([])
    } finally {
      setCalculating(false)
    }
  }, [])

  const limparOpcoes = useCallback(() => {
    setMelhorEnvioOptions([])
  }, [])

  return { melhorEnvioOptions, calculating, calcularFrete, limparOpcoes }
}
