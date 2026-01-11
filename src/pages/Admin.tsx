import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import Divider from '../components/Divider'
import Button from '../components/Button'
import { Select, TextInput } from '../components/Input'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { ROOM_OPTIONS, type Room } from '../repositories/constants'
import type { Gift } from '../repositories/giftsRepository'
import { getAllGifts, createGift, updateGift, deleteGift } from '../repositories/giftsRepository'
import { getAllRsvps, type RSVP } from '../repositories/rsvpRepository'
import { getPurchasesDetailed, type Purchase, unmarkGiftPurchased } from '../repositories/purchasesRepository'

export default function Admin() {
  const { session } = useAuth()

  const [tab, setTab] = useState<'gifts' | 'rsvps' | 'purchases'>('gifts')

  // Gifts state
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loadingGifts, setLoadingGifts] = useState(false)
  const [giftForm, setGiftForm] = useState<Omit<Gift, 'id'> & { id?: number }>({
    id: undefined,
    nome: '',
    imageUrl: '',
    linkLoja: '',
    comodo: ROOM_OPTIONS[0],
    removeBg: true,
    bgTolerance: 35,
    bgSample: 'corners',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editMap, setEditMap] = useState<Record<number, Omit<Gift, 'id'>>>({})
  const [giftError, setGiftError] = useState<string | null>(null)

  // RSVPs state
  const [rsvps, setRsvps] = useState<Array<RSVP & { id?: string }>>([])
  const [loadingRsvps, setLoadingRsvps] = useState(false)

  // Purchases state
  const [purchases, setPurchases] = useState<Array<Purchase & { gifts?: any; gift?: any }>>([])
  const [loadingPurchases, setLoadingPurchases] = useState(false)

  async function logout() {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore errors on signOut
    }
  }

  useEffect(() => {
    async function loadGifts() {
      setLoadingGifts(true)
      setGiftError(null)
      try {
        const all = await getAllGifts()
        setGifts(all)
      } catch (e) {
        setGiftError('Falha ao carregar lista de presentes.')
      } finally {
        setLoadingGifts(false)
      }
    }

    async function loadRsvps() {
      setLoadingRsvps(true)
      try {
        const all = await getAllRsvps()
        setRsvps(all)
      } catch {
        // hidden on purpose
      } finally {
        setLoadingRsvps(false)
      }
    }

    async function loadPurchases() {
      setLoadingPurchases(true)
      try {
        const all = await getPurchasesDetailed()
        setPurchases(all)
      } catch {
        // hidden on purpose
      } finally {
        setLoadingPurchases(false)
      }
    }

    loadGifts()
    loadRsvps()
    loadPurchases()
  }, [])

  async function handleCreateGift() {
    if (!giftForm.nome.trim()) {
      setGiftError('Informe o nome do presente.')
      return
    }
    setGiftError(null)
    try {
      const created = await createGift(giftForm)
      setGifts(prev => [...prev, created].sort((a, b) => a.id - b.id))
      setGiftForm({ id: undefined, nome: '', imageUrl: '', linkLoja: '', comodo: ROOM_OPTIONS[0], removeBg: true, bgTolerance: 35, bgSample: 'corners' })
    } catch (e) {
      setGiftError('Erro ao criar presente. Verifique permissões.')
    }
  }

  function startEdit(g: Gift) {
    setEditingId(g.id)
    setEditMap(prev => ({ ...prev, [g.id]: {
      nome: g.nome,
      imageUrl: g.imageUrl,
      linkLoja: g.linkLoja,
      comodo: g.comodo,
      removeBg: g.removeBg,
      bgTolerance: g.bgTolerance,
      bgSample: g.bgSample,
    } }))
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id: number) {
    const changes = editMap[id]
    if (!changes) return
    try {
      const updated = await updateGift(id, changes)
      setGifts(prev => prev.map(g => g.id === id ? updated : g))
      setEditingId(null)
    } catch {
      alert('Erro ao salvar alterações.')
    }
  }

  async function removeGift(id: number) {
    if (!window.confirm('Remover este presente?')) return
    try {
      await deleteGift(id)
      setGifts(prev => prev.filter(g => g.id !== id))
    } catch {
      alert('Erro ao remover presente.')
    }
  }

  async function cancelPurchase(giftId: number) {
    try {
      await unmarkGiftPurchased(giftId)
      const all = await getPurchasesDetailed()
      setPurchases(all)
    } catch (e) {
      alert('Erro ao cancelar reserva. Limite de 5 minutos pode ter sido excedido.')
    }
  }

  return (
    <Layout>
      <div className="card" style={{ maxWidth: 980, margin: '0 auto' }}>
        <div className="card-header" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <h2>Área administrativa</h2>
          <div className="flex gap-2 items-center">
            <span className="muted">{session?.user?.email ? `Logado como ${session.user.email}` : 'Sessão ativa'}</span>
            <Button onClick={logout}>Sair</Button>
          </div>
        </div>

        <Divider />

        <div className="flex flex-wrap gap-2" style={{ marginBottom: 12 }}>
          <Button variant={tab === 'gifts' ? 'primary' : 'outline'} onClick={() => setTab('gifts')}>Presentes (CRUD)</Button>
          <Button variant={tab === 'purchases' ? 'primary' : 'outline'} onClick={() => setTab('purchases')}>Reservas</Button>
          <Button variant={tab === 'rsvps' ? 'primary' : 'outline'} onClick={() => setTab('rsvps')}>Confirmações</Button>
        </div>

        {tab === 'gifts' && (
          <div>
            <h3 className="text-lg font-semibold">Cadastrar/Editar presentes</h3>
            <div className="hint">Use o formulário para criar; edite inline na lista.</div>
            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextInput label="Nome" value={giftForm.nome} onChange={(e) => setGiftForm(f => ({ ...f, nome: e.target.value }))} required />
              <Select label="Cômodo" value={giftForm.comodo} onChange={(e) => setGiftForm(f => ({ ...f, comodo: e.target.value as Room }))}>
                {ROOM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
              <TextInput label="Link da loja" value={giftForm.linkLoja} onChange={(e) => setGiftForm(f => ({ ...f, linkLoja: e.target.value }))} />
              <TextInput label="URL da imagem" value={giftForm.imageUrl} onChange={(e) => setGiftForm(f => ({ ...f, imageUrl: e.target.value }))} />
              <Select label="Remover fundo" value={giftForm.removeBg ? 'true' : 'false'} onChange={(e) => setGiftForm(f => ({ ...f, removeBg: e.target.value === 'true' }))}>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </Select>
              <TextInput label="Tolerância do fundo" type="number" value={String(giftForm.bgTolerance ?? 35)} onChange={(e) => setGiftForm(f => ({ ...f, bgTolerance: Number(e.target.value) }))} />
              <Select label="Amostra do fundo" value={giftForm.bgSample ?? 'corners'} onChange={(e) => setGiftForm(f => ({ ...f, bgSample: (e.target.value as 'corners' | 'border') }))}>
                <option value="corners">Cantos</option>
                <option value="border">Borda</option>
              </Select>
            </div>

            <div className="flex gap-2" style={{ marginTop: 8 }}>
              <Button onClick={handleCreateGift}>Criar presente</Button>
            </div>

            {giftError && <div className="error" role="alert" style={{ marginTop: 8 }}>{giftError}</div>}

            <Divider />

            {loadingGifts ? (
              <div className="muted">Carregando presentes...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="w-full" style={{ minWidth: 720 }}>
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
                    {gifts.map(g => {
                      const editing = editingId === g.id
                      const edits = editMap[g.id]
                      return (
                        <tr key={g.id}>
                          <td>{g.id}</td>
                          <td>
                            {editing ? (
                              <input className="input" value={edits?.nome ?? ''} onChange={(e) => setEditMap(prev => ({ ...prev, [g.id]: { ...(prev[g.id] ?? {}), nome: e.target.value } }))} />
                            ) : (
                              <span>{g.nome}</span>
                            )}
                          </td>
                          <td>
                            {editing ? (
                              <select className="select" value={edits?.comodo ?? g.comodo} onChange={(e) => setEditMap(prev => ({ ...prev, [g.id]: { ...(prev[g.id] ?? {}), comodo: e.target.value as Room } }))}>
                                {ROOM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            ) : (
                              <span>{g.comodo}</span>
                            )}
                          </td>
                          <td>
                            {editing ? (
                              <input className="input" value={edits?.linkLoja ?? g.linkLoja} onChange={(e) => setEditMap(prev => ({ ...prev, [g.id]: { ...(prev[g.id] ?? {}), linkLoja: e.target.value } }))} />
                            ) : (
                              g.linkLoja ? <a href={g.linkLoja} target="_blank" rel="noreferrer">Abrir</a> : <span className="muted">—</span>
                            )}
                          </td>
                          <td>
                            {editing ? (
                              <input className="input" value={edits?.imageUrl ?? g.imageUrl} onChange={(e) => setEditMap(prev => ({ ...prev, [g.id]: { ...(prev[g.id] ?? {}), imageUrl: e.target.value } }))} />
                            ) : (
                              g.imageUrl ? <a href={g.imageUrl} target="_blank" rel="noreferrer">Ver</a> : <span className="muted">—</span>
                            )}
                          </td>
                          <td>
                            {editing ? (
                              <div className="flex gap-2">
                                <Button onClick={() => saveEdit(g.id)}>Salvar</Button>
                                <Button variant="outline" onClick={cancelEdit}>Cancelar</Button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Button variant="outline" onClick={() => startEdit(g)}>Editar</Button>
                                <Button variant="outline" onClick={() => removeGift(g.id)}>Remover</Button>
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
          </div>
        )}

        {tab === 'purchases' && (
          <div>
            <h3 className="text-lg font-semibold">Reservas efetuadas</h3>
            <Divider />
            {loadingPurchases ? (
              <div className="muted">Carregando reservas...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="w-full" style={{ minWidth: 720 }}>
                  <thead>
                    <tr>
                      <th>Quando</th>
                      <th>Presente</th>
                      <th>ID do presente</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map(p => {
                      const gift = (p as any).gifts || (p as any).gift || undefined
                      const nome = gift?.nome ?? '—'
                      const when = new Date(p.purchased_at).toLocaleString()
                      return (
                        <tr key={p.id}>
                          <td>{when}</td>
                          <td>{nome}</td>
                          <td>{p.gift_id}</td>
                          <td>
                            <Button variant="outline" onClick={() => cancelPurchase(p.gift_id)}>Cancelar</Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'rsvps' && (
          <div>
            <h3 className="text-lg font-semibold">Confirmações de presença</h3>
            <Divider />
            {loadingRsvps ? (
              <div className="muted">Carregando confirmações...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="w-full" style={{ minWidth: 680 }}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Nome</th>
                      <th>Telefone</th>
                      <th>Vai?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map(r => (
                      <tr key={(r as any).id ?? r.name + r.date}>
                        <td>{r.date ? new Date(r.date).toLocaleString() : '—'}</td>
                        <td>{r.name}</td>
                        <td>{r.phone || '—'}</td>
                        <td>{r.attending ? 'Sim' : 'Não'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
