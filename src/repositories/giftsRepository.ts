import { supabase } from '../lib/supabaseClient'
import type { Room } from './constants'

export type Gift = {
  id: number
  nome: string
  imageUrl: string
  linkLoja: string
  comodo: Room
  removeBg?: boolean
  bgTolerance?: number
  bgSample?: 'corners' | 'border'
}

function mapDbGift(row: any): Gift {
  return {
    id: row.id,
    nome: row.nome,
    imageUrl: (row.image_url as string) ?? '',
    linkLoja: (row.link_loja as string) ?? '',
    comodo: row.comodo as Room,
    removeBg: row.remove_bg ?? undefined,
    bgTolerance: row.bg_tolerance ?? undefined,
    bgSample: row.bg_sample ?? undefined,
  }
}

export async function getAllGifts(): Promise<Gift[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .order('id', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapDbGift)
}

export async function getGiftsByRoom(room: Room): Promise<Gift[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('comodo', room)
    .order('id', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapDbGift)
}

export async function getGiftsPaginated(options: {
  room?: Room
  afterId?: number
  limit?: number
}): Promise<Gift[]> {
  const { room, afterId, limit = 20 } = options

  let query = supabase
    .from('gifts')
    .select('*')
    .order('id', { ascending: true })
    .limit(limit)

  if (room) query = query.eq('comodo', room)
  if (typeof afterId === 'number') query = query.gt('id', afterId)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapDbGift)
}

export async function createGift(payload: Omit<Gift, 'id'> & { id?: number }): Promise<Gift> {
  // If no id provided, compute next id based on current max
  let newId = payload.id
  if (typeof newId !== 'number') {
    const { data: maxData, error: maxError } = await supabase
      .from('gifts')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    if (maxError) throw maxError
    const lastId = (maxData && maxData[0]?.id) ? Number(maxData[0].id) : 0
    newId = (Number.isFinite(lastId) ? lastId : 0) + 1
  }

  const row = {
    id: newId,
    nome: payload.nome,
    image_url: payload.imageUrl ?? '',
    link_loja: payload.linkLoja ?? '',
    comodo: payload.comodo,
    remove_bg: payload.removeBg ?? null,
    bg_tolerance: payload.bgTolerance ?? null,
    bg_sample: payload.bgSample ?? null,
  }

  const { data, error } = await supabase
    .from('gifts')
    .insert(row)
    .select('*')
    .single()

  if (error) throw error

  // Map snake_case back to Gift type
  return mapDbGift(data)
}

export async function updateGift(id: number, changes: Partial<Omit<Gift, 'id'>>): Promise<Gift> {
  const row: Record<string, unknown> = {}
  if (typeof changes.nome === 'string') row.nome = changes.nome
  if (typeof changes.imageUrl === 'string') row.image_url = changes.imageUrl
  if (typeof changes.linkLoja === 'string') row.link_loja = changes.linkLoja
  if (typeof changes.comodo === 'string') row.comodo = changes.comodo
  if (typeof changes.removeBg === 'boolean') row.remove_bg = changes.removeBg
  if (typeof changes.bgTolerance === 'number') row.bg_tolerance = changes.bgTolerance
  if (typeof changes.bgSample === 'string') row.bg_sample = changes.bgSample

  const { data, error } = await supabase
    .from('gifts')
    .update(row)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  return mapDbGift(data)
}

export async function deleteGift(id: number): Promise<void> {
  const { error } = await supabase
    .from('gifts')
    .delete()
    .eq('id', id)
  if (error) throw error
}
