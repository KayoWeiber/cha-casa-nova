import { useCallback, useEffect, useState } from 'react'
import Divider from '../components/Divider'
import Button from '../components/Button'
import type { Gift } from '../repositories/giftsRepository'
import {
  getPurchasesDetailed,
  type Purchase,
  unmarkGiftPurchased,
} from '../repositories/purchasesRepository'

type PurchaseWithGift = Purchase & {
  gifts?: Gift | null
  gift?: Gift | null
}

export default function AdminReservas() {
  const [purchases, setPurchases] = useState<PurchaseWithGift[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(false)

  const loadPurchases = useCallback(async () => {
    setLoadingPurchases(true)
    try {
      const all = await getPurchasesDetailed()
      setPurchases(all)
    } catch {
      // silencioso
    } finally {
      setLoadingPurchases(false)
    }
  }, [])

  useEffect(() => {
    void loadPurchases()
  }, [loadPurchases])

  const cancelPurchase = useCallback(
    async (giftId: number) => {
      try {
        await unmarkGiftPurchased(giftId)
        await loadPurchases()
      } catch {
        alert('Erro ao cancelar reserva. Limite de 5 minutos pode ter sido excedido.')
      }
    },
    [loadPurchases],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reservas</h1>
        <p className="text-sm text-gray-500">Gerenciar reservas efetuadas</p>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
        <div>
          <h3 className="text-lg font-semibold">Reservas efetuadas</h3>
          <div className="text-sm opacity-60">
            Você pode cancelar reservas (com as regras atuais).
          </div>
        </div>

        <Divider />

        {loadingPurchases ? (
          <div className="text-gray-500">Carregando reservas...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  <th className="text-left p-2">Quando</th>
                  <th className="text-left p-2">Presente</th>
                  <th className="text-left p-2">ID do presente</th>
                  <th className="text-left p-2">Ações</th>
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
                    <tr key={p.id} className="border-t border-black/10">
                      <td className="p-2">{when}</td>
                      <td className="p-2">{nome}</td>
                      <td className="p-2">{p.gift_id}</td>
                      <td className="p-2">
                        <Button variant="outline" onClick={() => cancelPurchase(p.gift_id)}>
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
    </div>
  )
}
