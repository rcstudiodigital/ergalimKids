/**
 * Serviço de busca de CEP — ViaCEP (API gratuita, sem chave)
 * https://viacep.com.br
 */

export interface CepResult {
  street:       string  // logradouro
  neighborhood: string  // bairro
  city:         string  // localidade
  state:        string  // uf
  found:        boolean
}

export async function fetchCep(cep: string): Promise<CepResult> {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return { street:'', neighborhood:'', city:'', state:'', found:false }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { street:'', neighborhood:'', city:'', state:'', found:false }
    const data = await res.json()
    if (data.erro) return { street:'', neighborhood:'', city:'', state:'', found:false }
    return {
      street:       data.logradouro  || '',
      neighborhood: data.bairro      || '',
      city:         data.localidade  || '',
      state:        data.uf          || '',
      found:        true,
    }
  } catch {
    return { street:'', neighborhood:'', city:'', state:'', found:false }
  }
}

export const formatCep = (value: string) => {
  const nums = value.replace(/\D/g, '').slice(0, 8)
  return nums.length > 5 ? `${nums.slice(0,5)}-${nums.slice(5)}` : nums
}
