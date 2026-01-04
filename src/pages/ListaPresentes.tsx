import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import SectionTitle from '../components/SectionTitle'
import Divider from '../components/Divider'
import Button from '../components/Button'
import { presentes } from '../data/presentes'
import type { Presente } from '../data/presentes'
import Modal from '../components/Modal'

function getPurchasedIds(): number[] {
  try {
    const raw = localStorage.getItem('purchasedIds')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
function setPurchasedIds(ids: number[]) {
  try {
    localStorage.setItem('purchasedIds', JSON.stringify(ids))
  } catch { /* ignore persistence errors */ }
}

export default function ListaPresentes() {
  const navigate = useNavigate()
  const [purchased, setPurchased] = useState<number[]>(() => getPurchasedIds())
  const [modalItem, setModalItem] = useState<Presente | null>(null)

  // no direct toggle; confirmation happens via modal after opening link

  function handleOpenLink(p: Presente) {
    // open in a new tab then prompt
    window.open(p.linkLoja, '_blank', 'noopener,noreferrer')
    setModalItem(p)
  }

  function confirmPurchased() {
    if (!modalItem) return
    const id = modalItem.id
    const next = purchased.includes(id) ? purchased : [...purchased, id]
    setPurchased(next)
    setPurchasedIds(next)
    setModalItem(null)
  }

  return (
    <Layout>
      <div className="card">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <SectionTitle>Lista de presentes</SectionTitle>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/')} aria-label="Voltar para o início">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="#446323" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voltar
          </button>
        </div>
        <div className="hint">Ao marcar como comprado, o item aparece como reservado.</div>
        <Divider />

        <div className="grid">
          {presentes.map((p: Presente) => {
            const isPurchased = purchased.includes(p.id)
            return (
              <div key={p.id} className="card" style={{ padding: 16 }}>
                {/* Image placeholder */}
                <div style={{ border: `1px solid var(--color-border)`, borderRadius: 12, overflow: 'hidden', background: '#fff', aspectRatio: '4 / 3' }}>
                  {p.imagemUrl ? (
                    <img src={p.imagemUrl} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#CED1CD" strokeWidth="1.5" />
                        <circle cx="12" cy="12" r="3" stroke="#829A5D" strokeWidth="1.5" />
                      </svg>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <strong>{p.nome}</strong>
                  {isPurchased && <span className="badge">Comprado</span>}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                  <Button onClick={() => handleOpenLink(p)}>{isPurchased ? 'Ver novamente' : 'Abrir link'}</Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal
        isOpen={!!modalItem}
        title="Você comprou este item?"
        description={modalItem ? modalItem.nome : undefined}
        confirmText="Sim, comprei"
        cancelText="Ainda não"
        onConfirm={confirmPurchased}
        onCancel={() => setModalItem(null)}
      />
    </Layout>
  )
}
