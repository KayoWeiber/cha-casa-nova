import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Divider from '../components/Divider'
import Spinner from '../components/Spinner'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

// Ajuste a extensão se necessário: .png / .svg / .webp
import logoUrl from '../assets/logo-120x120.png'

type UnknownRecord = Record<string, unknown>

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null
}

function getString(obj: UnknownRecord, key: string): string | null {
  const v = obj[key]
  return typeof v === 'string' ? v : null
}

function getNumber(obj: UnknownRecord, key: string): number | null {
  const v = obj[key]
  return typeof v === 'number' ? v : null
}

function friendlyAuthError(err: unknown): string {
  // Extrai info de erro sem any e sem vazar mensagem crua pro usuário
  let message = ''
  let code = ''
  let status: number | null = null

  if (err instanceof Error) {
    message = err.message || ''
  }

  if (isRecord(err)) {
    message =
      message ||
      getString(err, 'message') ||
      getString(err, 'error_description') ||
      getString(err, 'error') ||
      ''

    code =
      getString(err, 'code') ||
      getString(err, 'error_code') ||
      getString(err, 'name') ||
      ''

    status = getNumber(err, 'status') || getNumber(err, 'statusCode') || null
  }

  const normalized = `${code} ${message}`.trim().toLowerCase()

  // Credenciais inválidas (Supabase pode variar texto/código)
  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid_credentials') ||
    normalized.includes('invalid credentials') ||
    (status === 400 && normalized.includes('login'))
  ) {
    return 'E-mail ou senha inválidos. Confira os dados e tente novamente.'
  }

  // Email não confirmado
  if (normalized.includes('email not confirmed')) {
    return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e confirme o cadastro.'
  }

  // Rate limit
  if (normalized.includes('too many requests') || normalized.includes('rate limit')) {
    return 'Muitas tentativas em pouco tempo. Aguarde um momento e tente novamente.'
  }

  // Rede
  if (normalized.includes('network') || normalized.includes('fetch failed')) {
    return 'Não foi possível conectar ao servidor agora. Verifique sua internet e tente novamente.'
  }

  // Fallback elegante (NUNCA vaza inglês cru)
  return 'Não foi possível entrar no momento. Verifique suas credenciais e tente novamente.'
}

export default function Login() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && session) {
      navigate('/admin', { replace: true })
    }
  }, [loading, session, navigate])

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0 && !submitting
  }, [email, password, submitting])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const cleanedEmail = email.trim()

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password
      })

      // Não joga pra catch: trata aqui e não vaza texto cru
      if (error) {
        setError(friendlyAuthError(error))
        return
      }

      navigate('/admin', { replace: true })
    } catch (err) {
      setError(friendlyAuthError(err))
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
      <div className="px-4">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[520px] flex-col justify-center">
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[28px] blur-2xl opacity-60"
              style={{
                background:
                  'radial-gradient(circle at 20% 20%, rgba(167, 139, 250, .22), transparent 55%), radial-gradient(circle at 80% 40%, rgba(34, 197, 94, .12), transparent 55%), radial-gradient(circle at 40% 90%, rgba(236, 72, 153, .10), transparent 60%)'
              }}
            />

            <div className="relative rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg backdrop-blur">
              <div className="flex flex-col items-center text-center">
                <img
                  src={logoUrl}
                  alt="Logo"
                  width={68}
                  height={68}
                  className="mb-2 select-none"
                  draggable={false}
                />

                <h2 className="text-lg font-semibold leading-tight">Acesso administrativo</h2>
                <p className="mt-1 text-sm leading-snug text-black/55">
                  Área restrita. Se você caiu aqui sem querer, parabéns pela curiosidade.
                </p>
              </div>

              <Divider />

              <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-black/60">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input"
                    placeholder="admin@exemplo.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-black/60">Senha</span>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                      required
                      className="input pr-12"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      aria-describedby={capsLockOn ? 'capslock-hint' : undefined}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-2 text-black/60 transition  focus:outline-none "
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? (
                        // eye-off
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path
                            d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M9.88 5.08A10.55 10.55 0 0112 4c7 0 10 8 10 8a18.24 18.24 0 01-4.29 5.38"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6.61 6.61C3.56 8.86 2 12 2 12s3 8 10 8c1.5 0 2.86-.3 4.06-.83"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        // eye
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {capsLockOn && (
                    <div id="capslock-hint" className="text-xs text-black/55">
                      Caps Lock parece estar ativado.
                    </div>
                  )}
                </label>

                {error && (
                  <div className="error" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={!canSubmit}>
                  {submitting ? 'Entrando...' : 'Entrar'}
                </Button>

                <div className="mt-0.5 flex items-center justify-center gap-2 text-sm text-black/55">
                  <Link to="/" className="cursor-pointer underline underline-offset-4 hover:text-black">
                    página inicial
                  </Link>
                </div>
              </form>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-black/45">
            Dica: se sua senha estiver em um post-it colado no monitor, pelo menos cola do lado de dentro.
          </p>
        </div>
      </div>
    </Layout>
  )
}
