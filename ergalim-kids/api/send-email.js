/**
 * Função Serverless da Vercel — Envio seguro de e-mails via Resend
 *
 * Roda no SERVIDOR da Vercel (não no navegador), então:
 * ✅ A chave do Resend fica protegida (nunca exposta ao cliente)
 * ✅ Não tem problema de CORS
 *
 * A chave fica na variável de ambiente RESEND_API_KEY (sem o VITE_)
 */

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const RESEND_KEY = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY
  if (!RESEND_KEY) {
    return res.status(500).json({ error: 'Resend não configurado no servidor' })
  }

  try {
    const { to, subject, html, from } = req.body

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Campos obrigatórios: to, subject, html' })
    }

    // Suporta enviar para vários destinatários (campanhas)
    const recipients = Array.isArray(to) ? to : [to]

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || process.env.EMAIL_FROM || 'Ergalim Kids <onboarding@resend.dev>',
        to: recipients,
        subject,
        html,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Erro no envio', details: data })
    }

    return res.status(200).json({ success: true, id: data.id })
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao enviar e-mail', message: err.message })
  }
}
