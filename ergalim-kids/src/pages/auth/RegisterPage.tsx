import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Mail, Lock, Phone, Star, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { ok: password.length >= 8,          label: 'Mínimo 8 caracteres' },
    { ok: /[A-Z]/.test(password),        label: 'Uma letra maiúscula' },
    { ok: /[0-9]/.test(password),        label: 'Um número' },
    { ok: /[^A-Za-z0-9]/.test(password), label: 'Um caractere especial' },
  ]
  const score = checks.filter(c => c.ok).length
  const color = score <= 1 ? 'bg-red-400' : score === 2 ? 'bg-amber-400' : score === 3 ? 'bg-blue-400' : 'bg-green-400'
  const label = score <= 1 ? 'Fraca' : score === 2 ? 'Regular' : score === 3 ? 'Boa' : 'Forte ✓'

  if (!password) return null
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1 items-center">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= score ? color : 'bg-gray-200'}`}/>
        ))}
        <span className="text-xs font-black ml-2 text-gray-500">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.label} className={`flex items-center gap-1 text-[10px] font-bold ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle size={10} fill={c.ok ? 'currentColor' : 'none'}/>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const { register, user, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' })
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!loading && user) { navigate('/account', { replace: true }); return null }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('As senhas não coincidem'); return }
    setSubmitting(true)
    try {
      await register(form.name, form.email, form.password, form.phone)
      toast.success('Conta criada com sucesso! 🎉')
      navigate('/account')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center px-4 py-12">
      {/* Decorações */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[{t:'5%',l:'3%',s:48,c:'#FF3D9A'},{t:'88%',l:'5%',s:32,c:'#FFD600'},{t:'8%',r:'4%',s:40,c:'#4FC3F7'},{t:'85%',r:'6%',s:28,c:'#00C9A7'}].map((d,i)=>(
          <Star key={i} size={d.s} fill={d.c} color={d.c} opacity={0.15} className="absolute"
            style={{top:d.t,left:(d as any).l,right:(d as any).r}}/>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3">
            <Star size={36} fill="#FFD600" color="#FFD600"/>
            <div className="text-left">
              <div className="font-black text-2xl text-brand-navy leading-none">ergalim</div>
              <div className="font-black text-2xl text-brand-pink leading-none">kids</div>
            </div>
          </Link>
        </div>

        <div className="card-kid p-7">
          <h1 className="font-black text-2xl text-brand-navy text-center mb-1">Criar conta 🎉</h1>
          <p className="text-center text-sm text-gray-400 font-bold mb-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-brand-pink font-black hover:underline">Entrar</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="flex items-start gap-2 p-3.5 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-bold">
                <AlertCircle size={16} className="shrink-0 mt-0.5"/><span>{error}</span>
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="text-sm font-black text-brand-navy block mb-1.5">👤 Nome completo *</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="text" autoComplete="name" required value={form.name} onChange={set('name')}
                  placeholder="Seu nome completo"
                  className="input-field pl-10"/>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-black text-brand-navy block mb-1.5">📧 E-mail *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="email" autoComplete="email" required value={form.email} onChange={set('email')}
                  placeholder="seu@email.com"
                  className="input-field pl-10"/>
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className="text-sm font-black text-brand-navy block mb-1.5">📱 WhatsApp / Telefone *</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="tel" autoComplete="tel" required value={form.phone} onChange={set('phone')}
                  placeholder="(24) 9 9999-9999"
                  className="input-field pl-10"/>
              </div>
              <p className="text-xs text-gray-400 font-bold mt-1">Usado para avisos de entrega e suporte</p>
            </div>

            {/* Senha */}
            <div>
              <label className="text-sm font-black text-brand-navy block mb-1.5">🔒 Senha *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type={show1 ? 'text' : 'password'} autoComplete="new-password"
                  required value={form.password} onChange={set('password')}
                  placeholder="Mínimo 8 caracteres" className="input-field pl-10 pr-10"/>
                <button type="button" onClick={() => setShow1(!show1)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy">
                  {show1 ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              <PasswordStrength password={form.password}/>
            </div>

            {/* Confirmar senha */}
            <div>
              <label className="text-sm font-black text-brand-navy block mb-1.5">🔒 Confirmar senha *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type={show2 ? 'text' : 'password'} autoComplete="new-password"
                  required value={form.confirm} onChange={set('confirm')}
                  placeholder="Repita a senha" className="input-field pl-10 pr-10"/>
                <button type="button" onClick={() => setShow2(!show2)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy">
                  {show2 ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
                {form.confirm && form.password && (
                  <div className={`absolute right-10 top-1/2 -translate-y-1/2 ${form.password === form.confirm ? 'text-green-500' : 'text-red-400'}`}>
                    <CheckCircle size={15} fill={form.password === form.confirm ? 'currentColor' : 'none'}/>
                  </div>
                )}
              </div>
            </div>

            {/* Aviso de segurança */}
            <div className="p-3 bg-bg-blue border-2 border-brand-sky/30 rounded-2xl text-xs text-gray-500 font-bold flex items-start gap-2">
              <span className="text-base shrink-0">🔒</span>
              <span>Seus dados são criptografados e protegidos. Nunca compartilhamos suas informações com terceiros.</span>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-base mt-1">
              {submitting ? '⏳ Criando conta...' : '🚀 Criar minha conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 font-bold mt-5">
          🔒 Conexão segura SSL · Seus dados estão protegidos
        </p>
      </div>
    </div>
  )
}
