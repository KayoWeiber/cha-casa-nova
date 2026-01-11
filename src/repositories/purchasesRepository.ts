import { supabase } from '../lib/supabaseClient'

export async function getPurchasedGiftIds(): Promise<number[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('gift_id')
  if (error) throw error
  return (data ?? []).map((r: { gift_id: number }) => r.gift_id)
}

export async function markGiftPurchased(giftId: number): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .upsert({ gift_id: giftId }, { onConflict: 'gift_id' })
  if (error) throw error
}

export async function unmarkGiftPurchased(giftId: number): Promise<void> {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('gift_id', giftId)
  if (error) throw error
}
