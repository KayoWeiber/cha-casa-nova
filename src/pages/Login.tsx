import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Divider from '../components/Divider'
import Spinner from '../components/Spinner'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && session) {
      navigate('/admin', { replace: true })
    }
  }, [loading, session, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/admin', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(msg || 'Falha ao entrar. Verifique suas credenciais.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Spinner message="Carregando sessão..." ariaLabel="Carregando sessão" />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>Login administrativo</h2>
        <Divider />
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label>
            <span className="muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="admin@exemplo.com"
            />
          </label>
          <label>
            <span className="muted">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
            />
          </label>
          {error && <div className="error" role="alert">{error}</div>}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </Layout>
  )
}
