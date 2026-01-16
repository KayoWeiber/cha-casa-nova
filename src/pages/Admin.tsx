import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react'
import Divider from '../components/Divider'
import Button from '../components/Button'
import { Select, TextInput } from '../components/Input'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { ROOM_OPTIONS, type Room } from '../repositories/constants'
import type { Gift } from '../repositories/giftsRepository'
import {
  getAllGifts,
  createGift,
  updateGift,
  deleteGift,
} from '../repositories/giftsRepository'
import { getAllRsvps, type RSVP } from '../repositories/rsvpRepository'
import {
  getPurchasesDetailed,
  type Purchase,
  unmarkGiftPurchased,
} from '../repositories/purchasesRepository'

type Tab = 'gifts' | 'purchases' | 'rsvps'

type GiftFormState = Omit<Gift, 'id'> & { id?: number }
type GiftEditState = Omit<Gift, 'id'>
type EditMap = Record<number, GiftEditState>

type PurchaseWithGift = Purchase & {
  gifts?: Gift | null
  gift?: Gift | null
}

type RsvpWithId = RSVP & { id?: string }

const DEFAULT_GIFT_FORM: GiftFormState = {
  id: undefined,
  nome: '',
  imageUrl: '',
  linkLoja: '',
  comodo: ROOM_OPTIONS[0],
  removeBg: true,
  bgTolerance: 35,
  bgSample: 'corners',
}

export default function Admin() {
  const { session } = useAuth()

  const [tab, setTab] = useState<Tab>('gifts')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Gifts state
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loadingGifts, setLoadingGifts] = useState(false)
  const [giftForm, setGiftForm] = useState<GiftFormState>(DEFAULT_GIFT_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editMap, setEditMap] = useState<EditMap>({})
  const [giftError, setGiftError] = useState<string | null>(null)

  // RSVPs
  const [rsvps, setRsvps] = useState<RsvpWithId[]>([])
  const [loadingRsvps, setLoadingRsvps] = useState(false)

  // Purchases
  const [purchases, setPurchases] = useState<PurchaseWithGift[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(false)

  const labels = useMemo(() => {
    const map: Record<Tab, { title: string; subtitle: string }> = {
      gifts: { title: 'Presentes', subtitle: 'CRUD + ajustes de imagem' },
      purchases: { title: 'Reservas', subtitle: 'Gerenciar reservas efetuadas' },
      rsvps: { title: 'Confirmações', subtitle: 'Lista de presença (RSVP)' },
    }
    return map[tab]
  }, [tab])

  const navItems = useMemo(
    () => [
      { key: 'gifts' as const, label: 'Presentes', hint: 'CRUD', count: gifts.length },
      { key: 'purchases' as const, label: 'Reservas', hint: 'Compras', count: purchases.length },
      { key: 'rsvps' as const, label: 'Confirmações', hint: 'RSVP', count: rsvps.length },
    ],
    [gifts.length, purchases.length, rsvps.length],
  )

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const loadGifts = async () => {
      setLoadingGifts(true)
      setGiftError(null)
      try {
        const all = await getAllGifts()
        setGifts(all)
      } catch {
        setGiftError('Falha ao carregar lista de presentes.')
      } finally {
        setLoadingGifts(false)
      }
    }

    const loadRsvps = async () => {
      setLoadingRsvps(true)
      try {
        const all = await getAllRsvps()
        setRsvps(all)
      } catch {
        // silencioso
      } finally {
        setLoadingRsvps(false)
      }
    }

    const loadPurchases = async () => {
      setLoadingPurchases(true)
      try {
        const all = await getPurchasesDetailed()
        setPurchases(all)
      } catch {
        // silencioso
      } finally {
        setLoadingPurchases(false)
      }
    }

    void Promise.all([loadGifts(), loadRsvps(), loadPurchases()])
  }, [])

  const handleGiftFormChange =
    <K extends keyof GiftFormState>(key: K) =>
    (value: GiftFormState[K]) => {
      setGiftForm((prev) => ({ ...prev, [key]: value }))
    }

  const handleCreateGift = useCallback(async () => {
    if (!giftForm.nome.trim()) {
      setGiftError('Informe o nome do presente.')
      return
    }

    setGiftError(null)

    try {
      const created = await createGift(giftForm)
      setGifts((prev) => [...prev, created].sort((a, b) => a.id - b.id))
      setGiftForm(DEFAULT_GIFT_FORM)
    } catch {
      setGiftError('Erro ao criar presente. Verifique permissões.')
    }
  }, [giftForm])

  const startEdit = useCallback((g: Gift) => {
    setEditingId(g.id)
    setEditMap((prev) => ({
      ...prev,
      [g.id]: {
        nome: g.nome,
        imageUrl: g.imageUrl,
        linkLoja: g.linkLoja,
        comodo: g.comodo,
        removeBg: g.removeBg,
        bgTolerance: g.bgTolerance,
        bgSample: g.bgSample,
      },
    }))
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const saveEdit = useCallback(
    async (id: number) => {
      const changes = editMap[id]
      if (!changes) return

      try {
        const updated = await updateGift(id, changes)
        setGifts((prev) => prev.map((g) => (g.id === id ? updated : g)))
        setEditingId(null)
      } catch {
        alert('Erro ao salvar alterações.')
      }
    },
    [editMap],
  )

  const removeGift = useCallback(async (id: number) => {
    const confirmed = window.confirm('Remover este presente?')
    if (!confirmed) return

    try {
      await deleteGift(id)
      setGifts((prev) => prev.filter((g) => g.id !== id))
    } catch {
      alert('Erro ao remover presente.')
    }
  }, [])

  const refreshPurchases = useCallback(async () => {
    try {
      const all = await getPurchasesDetailed()
      setPurchases(all)
    } catch {
      // silencioso
    }
  }, [])

  const cancelPurchase = useCallback(
    async (giftId: number) => {
      try {
        await unmarkGiftPurchased(giftId)
        await refreshPurchases()
      } catch {
        alert('Erro ao cancelar reserva. Limite de 5 minutos pode ter sido excedido.')
      }
    },
    [refreshPurchases],
  )

  const handleInputEvent =
    (key: keyof GiftEditState, id: number) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target

      setEditMap((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] ?? ({} as GiftEditState)),
          [key]:
            key === 'comodo'
              ? (value as Room)
              : key === 'bgTolerance'
              ? Number(value)
              : value,
        },
      }))
    }

  // ✅ Sidebar rola e nada fica “fixo” (sem mt-auto)
  const SidebarContent = () => (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      {/* Topo (agora não fica “fixo” visualmente, porque a sidebar pode rolar) */}
      <div className="p-3">
        <div className="text-xs uppercase tracking-wider opacity-70">Admin</div>
        <div className="text-base font-semibold leading-tight">Chá Casa Nova</div>

        <div className="mt-2.5 rounded-xl border border-black/10 bg-white/60 p-2.5">
          <div className="text-xs opacity-70">Sessão</div>
          <div className="break-all text-sm font-medium">
            {session?.user?.email ?? 'Sessão ativa'}
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="px-2 flex flex-col gap-2">
        {navItems.map((item) => {
          const active = tab === item.key
          const baseClass = 'w-full text-left px-3 py-2.5 rounded-xl transition border'
          const activeClass = 'bg-black text-white border-black'
          const inactiveClass = 'bg-white/60 border-black/10 hover:bg-white'

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setTab(item.key)
                setSidebarOpen(false)
              }}
              className={`${baseClass} ${active ? activeClass : inactiveClass}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.label}</div>
                  <div className={active ? 'text-xs opacity-80' : 'text-xs opacity-60'}>
                    {item.hint}
                  </div>
                </div>

                <div
                  className={
                    active
                      ? 'rounded-full bg-white/20 px-2 py-1 text-xs'
                      : 'rounded-full bg-black/5 px-2 py-1 text-xs'
                  }
                >
                  {item.count}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Logout (não está mais “fixo” no rodapé) */}
      <div className="p-3">
        <Divider />
        <div className="mt-3">
          <Button onClick={logout} variant="outline" className="w-full">
            Sair
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-gradient-to-b from-black/[0.04] to-transparent">
      <div className="p-4 md:p-5 md:h-full md:min-h-0">
        {/* Mobile topbar */}
        <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
          <div>
            <div className="text-xs opacity-60">Área administrativa</div>
            <div className="font-semibold">{labels.title}</div>
          </div>
          <Button variant="outline" onClick={() => setSidebarOpen(true)}>
            Menu
          </Button>
        </div>

        {/* Desktop layout (sidebar menor) */}
        <div className="flex flex-col gap-4 md:grid md:h-full md:min-h-0 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block md:h-full md:min-h-0 overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm backdrop-blur">
            <SidebarContent />
          </aside>

          {/* Main (rola só aqui no desktop) */}
          <main className="overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm backdrop-blur md:h-full md:min-h-0 md:overflow-y-auto">
            <div className="p-1 md:p-6">
              <div className="hidden items-start justify-between gap-3 md:flex">
                <div>
                  <h2 className="text-xl font-semibold">{labels.title}</h2>
                  <div className="text-sm opacity-60">{labels.subtitle}</div>
                </div>
                <div className="text-right text-sm opacity-70">
                  {session?.user?.email ? `Logado como ${session.user.email}` : 'Sessão ativa'}
                </div>
              </div>

              <Divider />

              {tab === 'gifts' && (
                <div className="flex flex-col gap-4">
                  {/* Form card */}
                  <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">Cadastrar presente</h3>
                        <div className="text-sm opacity-60">
                          Crie itens e mantenha a lista organizada.
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Form layout sem "grid" */}
                    <div className="flex flex-col gap-3 md:[display:grid] md:[grid-template-columns:repeat(2,minmax(0,1fr))]">
                      <TextInput
                        label="Nome"
                        value={giftForm.nome}
                        onChange={(e) => handleGiftFormChange('nome')(e.target.value)}
                        required
                      />
                      <Select
                        label="Cômodo"
                        value={giftForm.comodo}
                        onChange={(e) => handleGiftFormChange('comodo')(e.target.value as Room)}
                      >
                        {ROOM_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </Select>

                      <TextInput
                        label="Link da loja"
                        value={giftForm.linkLoja}
                        onChange={(e) => handleGiftFormChange('linkLoja')(e.target.value)}
                      />
                      <TextInput
                        label="URL da imagem"
                        value={giftForm.imageUrl}
                        onChange={(e) => handleGiftFormChange('imageUrl')(e.target.value)}
                      />

                      <Select
                        label="Remover fundo"
                        value={giftForm.removeBg ? 'true' : 'false'}
                        onChange={(e) => handleGiftFormChange('removeBg')(e.target.value === 'true')}
                      >
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                      </Select>

                      <TextInput
                        label="Tolerância do fundo"
                        type="number"
                        value={String(giftForm.bgTolerance ?? 35)}
                        onChange={(e) =>
                          handleGiftFormChange('bgTolerance')(Number(e.target.value))
                        }
                      />

                      <Select
                        label="Amostra do fundo"
                        value={giftForm.bgSample ?? 'corners'}
                        onChange={(e) =>
                          handleGiftFormChange('bgSample')(
                            e.target.value as GiftFormState['bgSample'],
                          )
                        }
                      >
                        <option value="corners">Cantos</option>
                        <option value="border">Borda</option>
                      </Select>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button onClick={handleCreateGift}>Criar presente</Button>
                      <Button variant="outline" onClick={() => setGiftForm(DEFAULT_GIFT_FORM)}>
                        Limpar
                      </Button>
                    </div>

                    {giftError && (
                      <div className="mt-3 text-sm text-red-600" role="alert">
                        {giftError}
                      </div>
                    )}
                  </section>

                  {/* List card */}
                  <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">Lista de presentes</h3>
                        <div className="text-sm opacity-60">Edite inline ou remova itens.</div>
                      </div>
                    </div>

                    <Divider />

                    {loadingGifts ? (
                      <div className="text-[var(--color-muted)] text-sm">
                        Carregando presentes...
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full" style={{ minWidth: 820 }}>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Nome</th>
                              <th>Cômodo</th>
                              <th>Link</th>
                              <th>Imagem</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gifts.map((g) => {
                              const editing = editingId === g.id
                              const edits = editMap[g.id]

                              return (
                                <tr key={g.id}>
                                  <td>{g.id}</td>

                                  <td>
                                    {editing ? (
                                      <input
                                        className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl bg-white text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-secondary)] focus:outline-offset-2"
                                        value={edits?.nome ?? ''}
                                        onChange={handleInputEvent('nome', g.id)}
                                      />
                                    ) : (
                                      <span>{g.nome}</span>
                                    )}
                                  </td>

                                  <td>
                                    {editing ? (
                                      <select
                                        className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl bg-white text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-secondary)] focus:outline-offset-2"
                                        value={edits?.comodo ?? g.comodo}
                                        onChange={handleInputEvent('comodo', g.id)}
                                      >
                                        {ROOM_OPTIONS.map((r) => (
                                          <option key={r} value={r}>
                                            {r}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span>{g.comodo}</span>
                                    )}
                                  </td>

                                  <td>
                                    {editing ? (
                                      <input
                                        className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl bg-white text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-secondary)] focus:outline-offset-2"
                                        value={edits?.linkLoja ?? g.linkLoja}
                                        onChange={handleInputEvent('linkLoja', g.id)}
                                      />
                                    ) : g.linkLoja ? (
                                      <a href={g.linkLoja} target="_blank" rel="noreferrer">
                                        Abrir
                                      </a>
                                    ) : (
                                      <span className="text-[var(--color-muted)] text-sm">—</span>
                                    )}
                                  </td>

                                  <td>
                                    {editing ? (
                                      <input
                                        className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl bg-white text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-secondary)] focus:outline-offset-2"
                                        value={edits?.imageUrl ?? g.imageUrl}
                                        onChange={handleInputEvent('imageUrl', g.id)}
                                      />
                                    ) : g.imageUrl ? (
                                      <a href={g.imageUrl} target="_blank" rel="noreferrer">
                                        Ver
                                      </a>
                                    ) : (
                                      <span className="text-[var(--color-muted)] text-sm">—</span>
                                    )}
                                  </td>

                                  <td>
                                    {editing ? (
                                      <div className="flex gap-2">
                                        <Button onClick={() => saveEdit(g.id)}>Salvar</Button>
                                        <Button variant="outline" onClick={cancelEdit}>
                                          Cancelar
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => startEdit(g)}>
                                          Editar
                                        </Button>
                                        <Button variant="outline" onClick={() => removeGift(g.id)}>
                                          Remover
                                        </Button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {tab === 'purchases' && (
                <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
                  <div>
                    <h3 className="text-lg font-semibold">Reservas efetuadas</h3>
                    <div className="text-sm opacity-60">
                      Você pode cancelar reservas (com as regras atuais).
                    </div>
                  </div>

                  <Divider />

                  {loadingPurchases ? (
                    <div className="text-[var(--color-muted)] text-sm">Carregando reservas...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full" style={{ minWidth: 760 }}>
                        <thead>
                          <tr>
                            <th>Quando</th>
                            <th>Presente</th>
                            <th>ID do presente</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchases.map((p) => {
                            const gift = p.gifts ?? p.gift ?? undefined
                            const nome = gift?.nome ?? '—'
                            const when = p.purchased_at
                              ? new Date(p.purchased_at).toLocaleString('pt-BR')
                              : '—'

                            return (
                              <tr key={p.id}>
                                <td>{when}</td>
                                <td>{nome}</td>
                                <td>{p.gift_id}</td>
                                <td>
                                  <Button
                                    variant="outline"
                                    onClick={() => cancelPurchase(p.gift_id)}
                                  >
                                    Cancelar
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {tab === 'rsvps' && (
                <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
                  <div>
                    <h3 className="text-lg font-semibold">Confirmações de presença</h3>
                    <div className="text-sm opacity-60">Lista com presença e contato.</div>
                  </div>

                  <Divider />

                  {loadingRsvps ? (
                    <div className="text-[var(--color-muted)] text-sm">
                      Carregando confirmações...
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full" style={{ minWidth: 720 }}>
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Vai?</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rsvps.map((r) => (
                            <tr key={(r as RsvpWithId).id ?? `${r.name}-${r.date}`}>
                              <td>{r.date ? new Date(r.date).toLocaleString('pt-BR') : '—'}</td>
                              <td>{r.name}</td>
                              <td>{r.phone || '—'}</td>
                              <td>{r.attending ? 'Sim' : 'Não'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
            </div>
          </main>
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[72%] max-w-[280px] overflow-hidden rounded-r-2xl border border-black/10 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-black/10 p-3">
                <div className="font-semibold">Menu</div>
                <Button variant="outline" onClick={() => setSidebarOpen(false)}>
                  Fechar
                </Button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
