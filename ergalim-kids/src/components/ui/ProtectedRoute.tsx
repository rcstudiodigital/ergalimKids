/**
 * ProtectedRoute — Guard de rota genérico
 * Usado para proteger qualquer rota que exija autenticação
 */
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'

interface Props {
  children: React.ReactNode
  roles?: UserRole[]
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-pink border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return <>{children}</>
}
