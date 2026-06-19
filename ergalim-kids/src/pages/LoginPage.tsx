import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Star, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  if (!loading && user) { navigate(redirect, { replace: true }); return null }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      toast.success('Bem-vindo de volta')
      navigate(redirect, { replace: true })
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center px-4 py-12">
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[
          {top:'5%', left:'3%',  size:48, color:'#FF3D9A'},
          {top:'90%',left:'5%',  size:32, color:'#FFD600'},
          {top:'10%',right:'4%', size:40, color:'#4FC3F7'},
          {top:'85%',right:'6%', size:28, color:'#00C9A7'},
          {top:'50%',left:'1%',  size:24, color:'#9C27B0'},
        ].map((s, i) => (
          <Star key={i} size={s.size} fill={s.color} color={s.color} opacity={0.2}
            className="absolute " style={{top:s.top, left:(s as any).left, right:(s as any).right, animationDelay:`${i*0.6}s`}}/>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <Star size={40} fill="#FFD600" color="#FFD600" className="group-hover:"/>
            <div className="text-left">
              <div className="font-black text-3xl text-brand-navy leading-none">ergalim</div>
              <div className="font-black text-3xl text-brand-pink leading-none">kids</div>
            </div>
          </Link>
        </div>

        {/* Card de login */}
        <div className="card-kid p-8">
          <h1 className="font-black text-2xl text-brand-navy text-center mb-1">
            Bem-vindo de volta
          </h1>
          <p className="text-center text-sm text-gray-500 font-bold mb-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-brand-pink hover:underline font-black">Criar grátis</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="flex items-center gap-2 p-3.5 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 text-sm font-bold">
                <AlertCircle size={16} className="shrink-0"/>{error}
              </div>
            )}

            <div>
              <label className="text-sm font-black text-brand-navy block mb-1.5">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="email" autoComplete="email" required value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                  className="input-field pl-10"/>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-black text-brand-navy">Senha</label>
                <Link to="/forgot-password" className="text-xs text-brand-pink hover:underline font-black">Esqueci a senha</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type={showPass ? 'text' : 'password'} autoComplete="current-password"
                  required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="input-field pl-10 pr-10"/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-base mt-2">
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Demo */}
          <div className="mt-5">
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 font-bold mt-6">
          Seus dados estão seguros com a gente
        </p>
      </div>
    </div>
  )
}
