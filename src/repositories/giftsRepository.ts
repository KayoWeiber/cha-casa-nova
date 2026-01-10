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

export async function getAllGifts(): Promise<Gift[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .order('id', { ascending: true })
  if (error) throw error
  return data as Gift[]
}

export async function getGiftsByRoom(room: Room): Promise<Gift[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('comodo', room)
    .order('id', { ascending: true })
  if (error) throw error
  return data as Gift[]
}
