import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import SectionTitle from '../components/SectionTitle'
import Divider from '../components/Divider'
import Button from '../components/Button'
import { presentes, ROOM_OPTIONS } from '../data/presentes'
import type { Presente } from '../data/presentes'
import Modal from '../components/Modal'
import { processImageToPng } from '../utils/processImageToPng'

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

function getSelectedRoom(): string {
  try {
    const raw = localStorage.getItem('selectedRoom')
    return raw ? JSON.parse(raw) : 'Todos'
  } catch {
    return 'Todos'
  }
}
function setSelectedRoom(room: string) {
  try {
    localStorage.setItem('selectedRoom', JSON.stringify(room))
  } catch { /* ignore persistence errors */ }
}

export default function ListaPresentes() {
  const navigate = useNavigate()
  const [purchased, setPurchased] = useState<number[]>(() => getPurchasedIds())
  const [modalItem, setModalItem] = useState<Presente | null>(null)
  const [selectedRoom, setSelectedRoomState] = useState<string>(() => getSelectedRoom())

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

  const filterOptions = ['Todos', ...ROOM_OPTIONS]
  const visibleItems = selectedRoom === 'Todos'
    ? presentes
    : presentes.filter(p => p.comodo === selectedRoom)

  function handleSelectRoom(room: string) {
    setSelectedRoomState(room)
    setSelectedRoom(room)
  }

  // track image load/error state
  const [loadedIds, setLoadedIds] = useState<Set<number>>(new Set())
  const [errorIds, setErrorIds] = useState<Set<number>>(new Set())
  const [processedMap, setProcessedMap] = useState<Record<number, string | undefined>>({})

  useEffect(() => {
    // process images for visible items with caching
    visibleItems.forEach(async (p) => {
      if (processedMap[p.id]) return
      try {
        const src = await processImageToPng(p.imageUrl, {
          removeBg: p.removeBg ?? true,
          bgTolerance: p.bgTolerance ?? 35,
          bgSample: p.bgSample ?? 'corners',
        })
        setProcessedMap(prev => ({ ...prev, [p.id]: src }))
      } catch {
        setProcessedMap(prev => ({ ...prev, [p.id]: p.imageUrl }))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom, visibleItems.length])

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

        {/* Room filter chips */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 6,
            marginBottom: 12,
          }}
          aria-label="Filtrar por cômodo"
        >
          {filterOptions.map((room) => {
            const active = selectedRoom === room
            return (
              <button
                key={room}
                type="button"
                onClick={() => handleSelectRoom(room)}
                className="chip"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  background: active ? '#e8f1e3' : '#fff',
                  color: 'var(--color-text)',
                  fontWeight: 500,
                  boxShadow: active ? '0 4px 12px var(--shadow-soft)' : 'none',
                  cursor: 'pointer',
                }}
                aria-pressed={active}
              >
                {room}
              </button>
            )
          })}
        </div>

        {visibleItems.length === 0 && (
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <span className="muted">Nenhum item neste cômodo ainda.</span>
          </div>
        )}

        <div className="grid">
          {visibleItems.map((p: Presente) => {
            const isPurchased = purchased.includes(p.id)
            return (
              <div key={p.id} className="card" style={{ padding: 16 }}>
                {/* Image area */}
                <div className="gift-image">
                  {(!p.imageUrl || errorIds.has(p.id)) && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', gap: 8 }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#CED1CD" strokeWidth="1.5" />
                        <line x1="6" y1="8" x2="18" y2="16" stroke="#CED1CD" strokeWidth="1.5" />
                      </svg>
                      <span className="muted">Imagem indisponível</span>
                    </div>
                  )}
                  {p.imageUrl && !errorIds.has(p.id) && (
                    <>
                      {!loadedIds.has(p.id) && (
                        <div style={{ width: '100%', height: '100%', background: 'transparent' }} />
                      )}
                      <img
                        src={processedMap[p.id] || p.imageUrl}
                        alt={p.nome}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: loadedIds.has(p.id) ? 'block' : 'none' }}
                        onLoad={() => setLoadedIds(prev => new Set(prev).add(p.id))}
                        onError={() => setErrorIds(prev => new Set(prev).add(p.id))}
                      />
                    </>
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
