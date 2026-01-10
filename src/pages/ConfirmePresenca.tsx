import { useState } from 'react'
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

export default function ConfirmePresenca() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [attending, setAttending] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Por favor, informe seu nome completo.')
      return
    }
    const data: RSVP = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      attending,
      date: new Date().toISOString(),
    }
    createRSVP(data)
      .then(() => setSuccess(true))
      .catch(() => setError('Erro ao enviar confirmação. Tente novamente.'))
  }

  return (
    <Layout>
      <form className="card" onSubmit={handleSubmit} aria-label="Formulário de confirmação de presença">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <SectionTitle>Confirmar presença</SectionTitle>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/')}
            aria-label="Voltar para o início">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="#446323" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voltar
          </button>
        </div>
        <Divider />

        <div style={{ display: 'grid', gap: 14 }}>
          <TextInput label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} error={error} required aria-required="true" />
          <TextInput label="Telefone/WhatsApp (opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />

          <div className="field" role="group" aria-label="Vai comparecer?">
            <span className="label">Vai comparecer?</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="button" variant={attending ? 'primary' : 'outline'} aria-pressed={attending} onClick={() => setAttending(true)}>Sim</Button>
              <Button type="button" variant={!attending ? 'primary' : 'outline'} aria-pressed={!attending} onClick={() => setAttending(false)}>Não</Button>
            </div>
            <div className="hint">Selecione sua disponibilidade</div>
          </div>

          {/* Campos removidos: Nº de acompanhantes e Observação */}
        </div>

        <Divider />
        <div style={{ display: 'flex', gap: 10 }}>
          <Button type="submit">Enviar confirmação</Button>
        </div>

        {success && (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }} role="status" aria-live="polite">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="#829A5D" strokeWidth="2" />
              <path d="M8 12l3 3 5-6" stroke="#446323" strokeWidth="2" fill="none" />
            </svg>
            <span>Confirmado! Obrigado por avisar.</span>
          </div>
        )}
      </form>
    </Layout>
  )
}
