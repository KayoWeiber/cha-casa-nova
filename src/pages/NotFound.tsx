import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <Layout>
      <div className="bg-white rounded-3xl p-4 shadow-[0_4px_30px_var(--shadow-soft)] border border-[var(--color-border)]" style={{ textAlign: 'center' }}>
        <h1 className="font-sans font-semibold text-lg mb-3">Página não encontrada</h1>
        <p className="text-[var(--color-muted)] text-sm">A página solicitada não existe.</p>
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => navigate('/')}>Ir para o início</Button>
        </div>
      </div>
    </Layout>
  )
}
