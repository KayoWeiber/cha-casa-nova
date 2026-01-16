import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import SectionTitle from '../components/SectionTitle'
import Divider from '../components/Divider'
import Button from '../components/Button'
import { TextInput } from '../components/Input'
import { createRSVP } from '../repositories/rsvpRepository'

type RSVP = {
  name: string
  phone?: string
  attending: boolean
  date: string
}

type FieldErrors = {
  name?: string
}

export default function ConfirmePresenca() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [attending, setAttending] = useState(true)

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cleaned = useMemo(() => {
    const cleanedName = name.trim()
    const cleanedPhone = phone.trim()

    return {
      cleanedName,
      cleanedPhone: cleanedPhone || undefined,
    }
  }, [name, phone])

  function validate(): boolean {
    const nextErrors: FieldErrors = {}

    if (!cleaned.cleanedName) {
      nextErrors.name = 'Por favor, informe seu nome completo.'
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSubmitting || success) return

    setSubmitError('')
    if (!validate()) return

    const data: RSVP = {
      name: cleaned.cleanedName,
      phone: cleaned.cleanedPhone,
      attending,
      date: new Date().toISOString(),
    }

    try {
      setIsSubmitting(true)
      await createRSVP(data)
      setSuccess(true)
    } catch {
      setSubmitError('Erro ao enviar confirmação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <form
        onSubmit={handleSubmit}
        aria-label="Formulário de confirmação de presença"
        className="bg-white rounded-3xl p-4 shadow-[0_4px_30px_var(--shadow-soft)] border border-[var(--color-border)] w-full max-w-xl mx-auto"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <SectionTitle>Confirmar presença</SectionTitle>
            <p className="text-sm opacity-70 mt-1">
              Leva 10 segundos. Prometo. (Você vai sobreviver.)
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('/')}
            aria-label="Voltar para o início"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="#446323"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Voltar
          </Button>
        </div>

        <Divider />

        {/* FORÇA VERTICAL NO PC TAMBÉM */}
        <div className="grid grid-cols-1 gap-4">
          <div className="w-full">
            <TextInput
              label="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              required
              aria-required="true"
            />
          </div>

          <div className="w-full">
            <TextInput
              label="Telefone/WhatsApp (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
            />
          </div>

          <div className="w-full">
            <fieldset
              className="grid gap-1.5 w-full"
              aria-label="Vai comparecer?"
              disabled={isSubmitting || success}
            >
              <legend className="text-sm text-[var(--color-text)]">Vai comparecer?</legend>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={attending ? 'primary' : 'outline'}
                  aria-pressed={attending}
                  onClick={() => setAttending(true)}
                  className="cursor-pointer"
                >
                  Sim
                </Button>

                <Button
                  type="button"
                  variant={!attending ? 'primary' : 'outline'}
                  aria-pressed={!attending}
                  onClick={() => setAttending(false)}
                  className="cursor-pointer"
                >
                  Não
                </Button>
              </div>

              <div className="text-xs text-[var(--color-muted)]">Selecione sua disponibilidade</div>
            </fieldset>
          </div>


          {submitError && (
            <div className="alert alert-error" role="alert" aria-live="polite">
              <span>{submitError}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="status" aria-live="polite">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="#829A5D" strokeWidth="2" />
                <path d="M8 12l3 3 5-6" stroke="#446323" strokeWidth="2" fill="none" />
              </svg>
              <div>
                <div className="font-medium">Confirmado!</div>
                <div className="text-sm opacity-80">Obrigado por avisar. A gente se vê lá.</div>
              </div>
            </div>
          )}
        </div>

        <Divider />

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitting || success}>
            {isSubmitting ? 'Enviando...' : success ? 'Enviado' : 'Enviar confirmação'}
          </Button>

          {!success && (
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Layout>
  )
}
