import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Divider from '../components/Divider'
import BrideWiggle from '../components/BrideWiggle'
import GroomWiggle from '../components/GroomWiggle'
import { DEFAULT_BRIDE_WIGGLE_CONFIG } from '../components/BrideWiggle.config'
import { DEFAULT_GROOM_WIGGLE_CONFIG } from '../components/GroomWiggle.config'
import rostoNoiva from '../assets/Rosto-noiva.png'
import veuNoiva from '../assets/veu-noiva.png'
import rostoNoivo from '../assets/Rosto-noivo.png'
import gravataNoivo from '../assets/gravata-noivo.png'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function calcCoupleSize(width: number) {
  // Ajuste fino:
  // - base: 86
  // - máximo: 132
  // - cresce conforme a largura (0.22 * width)
  return Math.round(clamp(width * 0.22, 84, 132))
}

export default function Home() {
  const [coupleSize, setCoupleSize] = useState(() =>
    typeof window === 'undefined' ? 110 : calcCoupleSize(window.innerWidth)
  )

  useEffect(() => {
    const onResize = () => setCoupleSize(calcCoupleSize(window.innerWidth))
    onResize()
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Offset proporcional ao tamanho (não quebra no mobile)
  const faceOffset = useMemo(() => Math.round(coupleSize * 0.34), [coupleSize])

  // Escalas para manter os offsets (principalmente Y) proporcionais ao tamanho do componente
  const brideScale = useMemo(
    () => coupleSize / DEFAULT_BRIDE_WIGGLE_CONFIG.size,
    [coupleSize]
  )

  const groomScale = useMemo(
    () => coupleSize / DEFAULT_GROOM_WIGGLE_CONFIG.size,
    [coupleSize]
  )

  return (
    <Layout>
      <div
        className="
          card relative mx-auto w-full
          min-h-[100svh]
          flex flex-col
          overflow-hidden
        "
        aria-label="Convite do chá de casa nova"
      >
        {/* Topo */}
        <div className="pt-4 sm:pt-6">
          <div className="eyebrow text-center">chá de casa nova</div>

          {/* Casal */}
          <div className="mt-2 flex items-end justify-center gap-2 sm:gap-3">
            <BrideWiggle
              size={coupleSize}
              face={{
                ...DEFAULT_BRIDE_WIGGLE_CONFIG.face,
                src: rostoNoiva,
                x: faceOffset,
                y: Math.round(DEFAULT_BRIDE_WIGGLE_CONFIG.face.y * brideScale),
              }}
              veil={{
                ...DEFAULT_BRIDE_WIGGLE_CONFIG.veil,
                src: veuNoiva,
                x: faceOffset,
                y: Math.round(DEFAULT_BRIDE_WIGGLE_CONFIG.veil.y * brideScale),
              }}
              motion={DEFAULT_BRIDE_WIGGLE_CONFIG.motion}
              debug={false}
            />

            <GroomWiggle
              size={coupleSize}
              face={{
                ...DEFAULT_GROOM_WIGGLE_CONFIG.face,
                src: rostoNoivo,
                x: -faceOffset,
                y: Math.round(DEFAULT_GROOM_WIGGLE_CONFIG.face.y * groomScale),
              }}
              veil={{
                ...DEFAULT_GROOM_WIGGLE_CONFIG.veil,
                src: gravataNoivo,
                x: -faceOffset,
                y: Math.round(DEFAULT_GROOM_WIGGLE_CONFIG.veil.y * groomScale),
              }}
              motion={DEFAULT_GROOM_WIGGLE_CONFIG.motion}
              debug={false}
            />
          </div>

          {/* Título */}
          <h1 className="display-title text-center mt-2">Áthina e Kayo</h1>

          {/* Conteúdo do meio */}
          <div className="mt-2 flex flex-col items-center">
            <div className="subinfo text-center" style={{ marginBottom: 4 }}>
              SÁBADO, ÀS 15 HRS
            </div>

            <div
              className="date-block flex flex-wrap items-center justify-center gap-2"
              aria-label="Data do evento"
            >
              <span className="date-part">09</span>

              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M12 21s-6.5-4.35-9.5-7.35A5.5 5.5 0 1 1 12 6a5.5 5.5 0 1 1 9.5 7.65C18.5 16.65 12 21 12 21Z"
                  fill="#829A5D"
                />
              </svg>

              <span className="date-part">MAIO</span>

              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M12 21s-6.5-4.35-9.5-7.35A5.5 5.5 0 1 1 12 6a5.5 5.5 0 1 1 9.5 7.65C18.5 16.65 12 21 12 21Z"
                  fill="#829A5D"
                />
              </svg>

              <span className="date-part">2026</span>
            </div>

            <div className="muted text-center mt-2">ENDEREÇO COMPLETO</div>
          </div>

          <Divider />

          {/* Ações */}
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
            <Link className="w-full sm:w-auto" to="/confirmar-presenca">
              <Button>Confirmar presença</Button>
            </Link>

            <Link className="w-full sm:w-auto" to="/lista-presentes">
              <Button variant="outline">Ver lista de presentes</Button>
            </Link>

            <a
              href="#como-chegar"
              className="muted w-full text-center sm:w-auto sm:text-left self-center"
            >
              Como chegar
            </a>
          </div>

          <Divider />

          {/* Rodapé */}
          <section id="como-chegar" className="scroll-mt-24 mt-auto pb-4 sm:pb-6">
            <p className="muted text-center">
              Estamos muito felizes em celebrar com você. Chegue alguns minutos antes para acomodação tranquila.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  )
}
