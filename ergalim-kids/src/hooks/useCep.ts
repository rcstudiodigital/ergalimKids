import { useState, useCallback } from 'react'
import { fetchCep, formatCep } from '@/services/cep'

interface AddressFields {
  zipCode:      string
  street:       string
  neighborhood: string
  city:         string
  state:        string
}

export function useCep<T extends AddressFields>(
  form: T,
  setForm: (fn: (prev: T) => T) => void
) {
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError,   setCepError]   = useState('')

  const handleCepChange = useCallback(async (raw: string) => {
    const formatted = formatCep(raw)
    setForm(f => ({ ...f, zipCode: formatted }))
    setCepError('')

    const clean = raw.replace(/\D/g, '')
    if (clean.length !== 8) return

    setCepLoading(true)
    try {
      const result = await fetchCep(clean)
      if (result.found) {
        setForm(f => ({
          ...f,
          zipCode:      formatted,
          street:       result.street       || f.street,
          neighborhood: result.neighborhood || f.neighborhood,
          city:         result.city,
          state:        result.state,
        }))
      } else {
        setCepError('CEP não encontrado')
      }
    } finally {
      setCepLoading(false)
    }
  }, [setForm])

  return { cepLoading, cepError, handleCepChange }
}
