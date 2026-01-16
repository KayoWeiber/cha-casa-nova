import { useEffect, useState } from 'react'
import Divider from '../components/Divider'
import { getAllRsvps, type RSVP } from '../repositories/rsvpRepository'

type RsvpWithId = RSVP & { id?: string }

export default function AdminConfirmacoes() {
  const [rsvps, setRsvps] = useState<RsvpWithId[]>([])
  const [loadingRsvps, setLoadingRsvps] = useState(false)

  useEffect(() => {
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
    void loadRsvps()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Confirmações</h1>
        <p className="text-sm text-gray-500">Lista de presença (RSVP)</p>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
        <div>
          <h3 className="text-lg font-semibold">Confirmações de presença</h3>
          <div className="text-sm opacity-60">Lista com presença e contato.</div>
        </div>

        <Divider />

        {loadingRsvps ? (
          <div className="text-gray-500">Carregando confirmações...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Telefone</th>
                  <th className="text-left p-2">Vai?</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r) => (
                  <tr
                    key={(r as RsvpWithId).id ?? `${r.name}-${r.date}`}
                    className="border-t border-black/10"
                  >
                    <td className="p-2">
                      {r.date ? new Date(r.date).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="p-2">{r.name}</td>
                    <td className="p-2">{r.phone || '—'}</td>
                    <td className="p-2">{r.attending ? 'Sim' : 'Não'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
