import { supabase } from '../lib/supabaseClient'

export type RSVP = {
  name: string
  phone?: string
  attending: boolean
  date?: string
}

export async function createRSVP(entry: RSVP): Promise<void> {
  const payload = { ...entry, date: entry.date ?? new Date().toISOString() }
  const { error } = await supabase
    .from('rsvps')
    .insert(payload)
  if (error) throw error
}

export async function getAllRsvps(): Promise<Array<RSVP & { id?: string }>> {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Array<RSVP & { id?: string }>
}
