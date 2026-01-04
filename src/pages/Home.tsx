import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Divider from '../components/Divider'

export default function Home() {
  return (
    <Layout>
      <div className="card" aria-label="Convite do chá de casa nova">
        <div className="eyebrow">chá de casa nova</div>
        <h1 className="display-title">Áthina e Kayo</h1>

        <div className="subinfo" style={{ marginBottom: 8 }}>SÁBADO, ÀS 15 HRS</div>
        <div className="date-block" aria-label="Data do evento">
          <span className="date-part">09</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 21s-6.5-4.35-9.5-7.35A5.5 5.5 0 1 1 12 6a5.5 5.5 0 1 1 9.5 7.65C18.5 16.65 12 21 12 21Z" fill="#829A5D"/>
          </svg>
          <span className="date-part">MAIO</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 21s-6.5-4.35-9.5-7.35A5.5 5.5 0 1 1 12 6a5.5 5.5 0 1 1 9.5 7.65C18.5 16.65 12 21 12 21Z" fill="#829A5D"/>
          </svg>
          <span className="date-part">2026</span>
        </div>

        <div className="muted" style={{ marginTop: 12 }}>ENDEREÇO COMPLETO</div>

        <Divider />

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/confirmar-presenca"><Button>Confirmar presença</Button></Link>
          <Link to="/lista-presentes"><Button variant="outline">Ver lista de presentes</Button></Link>
          <a href="#como-chegar" className="muted" style={{ alignSelf: 'center' }}>Como chegar</a>
        </div>

        <Divider />

        <section id="como-chegar">
          <p className="muted">Estamos muito felizes em celebrar com você. Chegue alguns minutos antes para acomodação tranquila.</p>
        </section>
      </div>
    </Layout>
  )
}
