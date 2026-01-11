import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import SectionTitle from '../components/SectionTitle'
import Divider from '../components/Divider'
import Button from '../components/Button'
import { ROOM_OPTIONS } from '../repositories/constants'
import type { Gift } from '../repositories/giftsRepository'
import { getAllGifts, getGiftsByRoom } from '../repositories/giftsRepository'
import { getPurchasedGiftIds, markGiftPurchased, unmarkGiftPurchased } from '../repositories/purchasesRepository'
import Modal from '../components/Modal'
import { processImageToPng } from '../utils/processImageToPng'
import Spinner from '../components/Spinner'

const ALL_ROOMS = 'Todos' as const
type Room = (typeof ROOM_OPTIONS)[number]
type RoomFilter = typeof ALL_ROOMS | Room

function isRoomFilter(value: string): value is RoomFilter {
  return value === ALL_ROOMS || (ROOM_OPTIONS as readonly string[]).includes(value)
}

function getPersistedRoom(): RoomFilter {
  try {
    const raw = localStorage.getItem('selectedRoom')
    if (!raw) return ALL_ROOMS

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === 'string' && isRoomFilter(parsed)) return parsed
    return ALL_ROOMS
  } catch {
    return ALL_ROOMS
  }
}

function persistRoom(room: RoomFilter) {
  try {
    localStorage.setItem('selectedRoom', JSON.stringify(room))
  } catch {
    // ignore
  }
}

function safeHttpUrl(url?: string | null) {
  const u = url?.trim()
  if (!u) return null
  return /^https?:\/\//i.test(u) ? u : null
}

function safeImageSrc(src?: string | null) {
  const s = src?.trim()
  if (!s) return null
  // permite http(s), data: (resultado do processImageToPng) e blob:
  return /^(https?:\/\/|data:|blob:)/i.test(s) ? s : null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

function pickString(obj: unknown, keys: string[]): string | undefined {
  const rec = asRecord(obj)
  if (!rec) return undefined

  for (const k of keys) {
    const v = rec[k]
    if (typeof v === 'string') {
      const t = v.trim()
      if (t) return t
    }
  }
  return undefined
}

function pickBoolean(obj: unknown, keys: string[], fallback: boolean): boolean {
  const rec = asRecord(obj)
  if (!rec) return fallback

  for (const k of keys) {
    const v = rec[k]
    if (typeof v === 'boolean') return v
  }
  return fallback
}

function pickNumber(obj: unknown, keys: string[], fallback: number): number {
  const rec = asRecord(obj)
  if (!rec) return fallback

  for (const k of keys) {
    const v = rec[k]
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return fallback
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  const rec = asRecord(e)
  const msg = rec?.message
  return typeof msg === 'string' ? msg : ''
}

// pega campos vindo do banco mesmo se estiverem em snake_case (sem usar any)
function getGiftLink(p: Gift) {
  return pickString(p, ['linkLoja', 'link_loja', 'link'])
}

function getGiftImage(p: Gift) {
  return pickString(p, ['imageUrl', 'image_url', 'imageurl', 'image'])
}

export default function ListaPresentes() {
  const navigate = useNavigate()

  const [purchased, setPurchased] = useState<number[]>([])
  const [modalItem, setModalItem] = useState<Gift | null>(null)

  const [selectedRoom, setSelectedRoomState] = useState<RoomFilter>(() => getPersistedRoom())
  const [items, setItems] = useState<Gift[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // track image load/error state
  const [loadedIds, setLoadedIds] = useState<Set<number>>(new Set())
  const [errorIds, setErrorIds] = useState<Set<number>>(new Set())
  const [processedMap, setProcessedMap] = useState<Record<number, string | undefined>>({})

  // evita processar a mesma imagem em paralelo
  const processingIdsRef = useRef<Set<number>>(new Set())

  const filterOptions = useMemo<RoomFilter[]>(() => [ALL_ROOMS, ...ROOM_OPTIONS], [])

  const visibleItems = useMemo(() => {
    if (selectedRoom === ALL_ROOMS) return items
    return items.filter(p => p.comodo === selectedRoom)
  }, [items, selectedRoom])

  function handleSelectRoom(room: RoomFilter) {
    setSelectedRoomState(room)
    persistRoom(room)
  }

  function handleOpenLink(p: Gift) {
    const raw = getGiftLink(p)
    const url = safeHttpUrl(raw)

    if (!url) {
      console.warn('Link inválido/ausente para este item:', { id: p.id, nome: p.nome, raw })
      alert('Link indisponível para este item.')
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer')
    setModalItem(p)
  }

  async function cancelPurchased(item: Gift) {
    const confirmCancel = window.confirm('Deseja cancelar a compra deste item?')
    if (!confirmCancel) return

    try {
      await unmarkGiftPurchased(item.id)
      const latest = await getPurchasedGiftIds()
      setPurchased(latest)
    } catch (e: unknown) {
      console.error('Erro ao cancelar compra', e)
      const msg = getErrorMessage(e)
      alert(msg || 'Não foi possível cancelar a compra. Verifique o limite de 5 minutos.')
    }
  }

  async function confirmPurchased() {
    if (!modalItem) return

    const id = modalItem.id
    if (!purchased.includes(id)) {
      try {
        await markGiftPurchased(id)
        const latest = await getPurchasedGiftIds()
        setPurchased(latest)
      } catch (e: unknown) {
        console.error('Erro ao marcar como comprado', e)
        alert(getErrorMessage(e) || 'Não foi possível marcar como comprado.')
      }
    }

    setModalItem(null)
  }

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      try {
        const gifts =
          selectedRoom === ALL_ROOMS
            ? await getAllGifts()
            : await getGiftsByRoom(selectedRoom) // agora tipado, sem "as any"

        if (cancelled) return

        setItems(gifts)

        const purchasedIds = await getPurchasedGiftIds()
        if (cancelled) return
        setPurchased(purchasedIds)
      } catch (e: unknown) {
        console.error('Falha ao carregar dados do Supabase', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [selectedRoom])

  useEffect(() => {
    let cancelled = false

    async function run() {
      for (const p of visibleItems) {
        const rawImg = getGiftImage(p)
        const imgUrl = safeImageSrc(rawImg)

        if (!imgUrl) continue
        if (processedMap[p.id]) continue
        if (processingIdsRef.current.has(p.id)) continue

        processingIdsRef.current.add(p.id)

        try {
          const removeBg = pickBoolean(p, ['removeBg', 'remove_bg'], true)
          const bgTolerance = pickNumber(p, ['bgTolerance', 'bg_tolerance'], 35)
          const bgSample = (pickString(p, ['bgSample', 'bg_sample']) as 'corners' | 'border' | undefined) ?? 'corners'

          const src = await processImageToPng(imgUrl, { removeBg, bgTolerance, bgSample })

          if (cancelled) return
          setProcessedMap(prev => ({ ...prev, [p.id]: src }))
        } catch {
          // fallback: usa a url original
          if (cancelled) return
          setProcessedMap(prev => ({ ...prev, [p.id]: imgUrl }))
        } finally {
          processingIdsRef.current.delete(p.id)
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [visibleItems, processedMap])

  return (
    <Layout>
      <div className="card">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <SectionTitle>Lista de presentes</SectionTitle>

          <button
            type="button"
            className="btn btn-outline cursor-pointer"
            onClick={() => navigate('/')}
            aria-label="Voltar para o início"
          >
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

        {loading && (
          <Spinner message="Carregando itens da lista de presente" />
        )}

        {!loading && visibleItems.length === 0 && (
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <span className="muted">Nenhum item neste cômodo ainda.</span>
          </div>
        )}

        {!loading && (
        <div className="grid">
          {visibleItems.map((p: Gift) => {
            const isPurchased = purchased.includes(p.id)
            const rawImg = getGiftImage(p)
            const imgUrl = safeImageSrc(rawImg)

            return (
              <div key={p.id} className="card" style={{ padding: 16 }}>
                {/* Image area */}
                <div className="gift-image">
                  {(!imgUrl || errorIds.has(p.id)) && (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-muted)',
                        gap: 8,
                      }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#CED1CD" strokeWidth="1.5" />
                        <line x1="6" y1="8" x2="18" y2="16" stroke="#CED1CD" strokeWidth="1.5" />
                      </svg>
                      <span className="muted">Imagem indisponível</span>
                    </div>
                  )}

                  {imgUrl && !errorIds.has(p.id) && (
                    <>
                      {!loadedIds.has(p.id) && <div style={{ width: '100%', height: '100%', background: 'transparent' }} />}

                      <img
                        src={processedMap[p.id] || imgUrl}
                        alt={p.nome}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          display: loadedIds.has(p.id) ? 'block' : 'none',
                        }}
                        onLoad={() => setLoadedIds(prev => new Set(prev).add(p.id))}
                        onError={() => setErrorIds(prev => new Set(prev).add(p.id))}
                      />
                    </>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginTop: 12,
                    minWidth: 0,
                  }}
                >
                  <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                    {p.nome}
                  </strong>
                  {isPurchased && <span className="badge" style={{ flexShrink: 0 }}>Comprado</span>}
                </div>

                {/* AÇÕES (fix do “Cancelar compra” quebrando o card) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isPurchased ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                    gap: 10,
                    marginTop: 10,
                    alignItems: 'stretch',
                  }}
                >
                  <Button
                    onClick={() => handleOpenLink(p)}
                    style={{ width: '100%', whiteSpace: 'normal' }}
                  >
                    {isPurchased ? 'Ver novamente' : 'Abrir link'}
                  </Button>

                  {isPurchased && (
                    <Button
                      variant="outline"
                      onClick={() => cancelPurchased(p)}
                      style={{ width: '100%', whiteSpace: 'normal' }}
                    >
                      Cancelar compra
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        )}
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
