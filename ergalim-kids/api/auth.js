/**
 * API de autenticação segura — roda no servidor da Vercel
 * As senhas ficam APENAS aqui (variáveis de ambiente SEM prefixo VITE_)
 * O bundle do cliente NUNCA vê as senhas reais
 */

const STAFF = [
  {
    id: '1',
    name: 'Admin',
    role: 'admin',
    email: process.env.ADMIN_EMAIL,
    pass:  process.env.ADMIN_PASS,
  },
  {
    id: '2',
    name: 'Gabriel Furtado',
    role: 'owner',
    email: process.env.OWNER_EMAIL,
    pass:  process.env.OWNER_PASS,
  },
]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios' })

  const user = STAFF.find(
    u => u.email && u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.pass === password
  )

  if (!user) {
    // Delay para dificultar brute force
    await new Promise(r => setTimeout(r, 500))
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }

  // Retorna só os dados públicos — NUNCA a senha
  return res.status(200).json({
    id:   user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  })
}
