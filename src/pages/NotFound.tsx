import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <Layout>
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 className="section-title">Página não encontrada</h1>
        <p className="muted">A página solicitada não existe.</p>
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => navigate('/')}>Ir para o início</Button>
        </div>
      </div>
    </Layout>
  )
}
