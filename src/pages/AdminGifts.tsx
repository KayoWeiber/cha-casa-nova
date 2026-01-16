import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import Divider from '../components/Divider'
import Button from '../components/Button'
import { Select, TextInput } from '../components/Input'
import { ROOM_OPTIONS, type Room } from '../repositories/constants'
import type { Gift } from '../repositories/giftsRepository'
import {
  getAllGifts,
  createGift,
  updateGift,
  deleteGift,
} from '../repositories/giftsRepository'

type GiftFormState = Omit<Gift, 'id'> & { id?: number }
type GiftEditState = Omit<Gift, 'id'>
type EditMap = Record<number, GiftEditState>

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

export default function AdminGifts() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loadingGifts, setLoadingGifts] = useState(false)
  const [giftForm, setGiftForm] = useState<GiftFormState>(DEFAULT_GIFT_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editMap, setEditMap] = useState<EditMap>({})
  const [giftError, setGiftError] = useState<string | null>(null)

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
    void loadGifts()
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Presentes</h1>
        <p className="text-sm text-gray-500">CRUD + ajustes de imagem</p>
      </div>

      {/* Form card */}
      <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold">Cadastrar presente</h3>
            <div className="text-sm opacity-60">Crie itens e mantenha a lista organizada.</div>
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
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
            onChange={(e) => handleGiftFormChange('bgTolerance')(Number(e.target.value))}
          />

          <Select
            label="Amostra do fundo"
            value={giftForm.bgSample ?? 'corners'}
            onChange={(e) => handleGiftFormChange('bgSample')(e.target.value as GiftFormState['bgSample'])}
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
          <div className="text-gray-500">Carregando presentes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 820 }}>
              <thead>
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Cômodo</th>
                  <th className="text-left p-2">Link</th>
                  <th className="text-left p-2">Imagem</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {gifts.map((g) => {
                  const editing = editingId === g.id
                  const edits = editMap[g.id]

                  return (
                    <tr key={g.id} className="border-t border-black/10">
                      <td className="p-2">{g.id}</td>
                      <td className="p-2">
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
                      <td className="p-2">
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
                      <td className="p-2">
                        {editing ? (
                          <input
                            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl bg-white text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-secondary)] focus:outline-offset-2"
                            value={edits?.linkLoja ?? g.linkLoja}
                            onChange={handleInputEvent('linkLoja', g.id)}
                          />
                        ) : g.linkLoja ? (
                          <a href={g.linkLoja} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                            Abrir
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2">
                        {editing ? (
                          <input
                            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl bg-white text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-secondary)] focus:outline-offset-2"
                            value={edits?.imageUrl ?? g.imageUrl}
                            onChange={handleInputEvent('imageUrl', g.id)}
                          />
                        ) : g.imageUrl ? (
                          <a href={g.imageUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                            Ver
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2">
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
  )
}
