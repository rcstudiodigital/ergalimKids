# 🔐 Guia de Segurança — Ergalim Kids

## O que está protegido

| Proteção | Como funciona |
|---|---|
| Rotas `/admin/*` | `AdminLayout` verifica token JWT assinado antes de renderizar |
| Rotas `/owner/*` | `OwnerLayout` verifica token JWT + permissões antes de renderizar |
| `/checkout` | `Navigate` redireciona para `/login` se não autenticado |
| Manipulação de URL | `if (!isAdmin) return <Navigate to="/login"/>` — não adianta mudar a URL |
| Token JWT | Assinado com HMAC-SHA256 via Web Crypto API — não pode ser forjado |
| Role no token | Role fica dentro do JWT assinado — não pode ser mudado via DevTools |
| Senhas | Vêm de `.env.local` — nunca no código-fonte ou no GitHub |
| Email real | Via `import.meta.env.VITE_STORE_EMAIL` — não exposto no bundle |
| XSS | Sem `dangerouslySetInnerHTML` em nenhum lugar |
| Rate limiting | 5 tentativas de login por minuto |
| Headers HTTP | X-Frame-Options, CSP, HSTS, X-XSS-Protection via `vercel.json` |
| Sessão | `sessionStorage` (fecha com a aba) — não `localStorage` |
| Expiração | Token expira em 8 horas automaticamente |

## Como testar a proteção de rotas

1. Abra o navegador sem logar
2. Tente acessar `http://localhost:5173/admin` → deve redirecionar para `/login`
3. Tente acessar `http://localhost:5173/owner` → deve redirecionar para `/login`
4. Abra o DevTools → Application → Session Storage → tente mudar `role` para `admin` → **não funciona** porque o role vem do token assinado, não do storage

## Em produção — o que ainda deve ser feito

1. **Backend real** (Node.js/Express + Banco de dados):
   - Senhas armazenadas com `bcrypt` (hash)
   - JWT gerado e verificado no servidor com `jsonwebtoken`
   - Banco PostgreSQL (Supabase ou Railway)

2. **HTTPS obrigatório** — Vercel já faz isso automaticamente

3. **Remover usuários demo** do `AuthContext.tsx` e conectar ao backend

4. **Variáveis de ambiente no Vercel** — nunca commitar `.env.local`
