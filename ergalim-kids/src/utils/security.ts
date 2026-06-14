// Remove tags HTML e caracteres perigosos — protege contra XSS
export const sanitize = (str: string): string =>
  str.replace(/[<>"'&]/g, c => ({ '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":"&#39;", '&':'&amp;' }[c] ?? c))

export const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

export const isValidPhone = (p: string) => /^\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}$/.test(p.replace(/\s/g,''))

export const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))

export const formatDateFull = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(iso))

export const isValidCEP = (c: string) => /^\d{5}-?\d{3}$/.test(c)

const rlMap = new Map<string, number[]>()
export const rateLimit = (key: string, max: number, ms: number): boolean => {
  const now = Date.now()
  const calls = (rlMap.get(key) || []).filter(t => now - t < ms)
  if (calls.length >= max) return false
  rlMap.set(key, [...calls, now])
  return true
}

export const genId = () => Math.random().toString(36).slice(2, 10).toUpperCase()
