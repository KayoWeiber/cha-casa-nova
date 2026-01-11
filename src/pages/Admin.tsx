import Layout from '../components/Layout'
import Divider from '../components/Divider'
import Button from '../components/Button'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Admin() {
  const { session } = useAuth()

  async function logout() {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore errors on signOut
    }
  }

  return (
    <Layout>
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2>Área administrativa</h2>
        <Divider />
        <div className="muted" style={{ marginBottom: 12 }}>
          {session?.user?.email ? `Logado como ${session.user.email}` : 'Sessão ativa'}
        </div>
        <div className="flex gap-8 items-center">
          <Button onClick={logout}>Sair</Button>
        </div>
      </div>
    </Layout>
  )
}
