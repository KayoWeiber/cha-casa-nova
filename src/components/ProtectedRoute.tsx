import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import Spinner from './Spinner'
import { useAuth } from '../context/AuthContext'

type ProtectedRouteProps = {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth()

  if (loading) {
    return <Spinner message="Verificando sessão..." ariaLabel="Verificando sessão" />
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
