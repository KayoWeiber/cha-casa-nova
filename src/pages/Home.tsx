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

  const brideScale = useMemo(
    () => coupleSize / DEFAULT_BRIDE_WIGGLE_CONFIG.size,
    [coupleSize]
  )
  const groomScale = useMemo(
    () => coupleSize / DEFAULT_GROOM_WIGGLE_CONFIG.size,
    [coupleSize]
  )

  // aproxima os dois
  const overlap = useMemo(() => Math.round(coupleSize * 0.18), [coupleSize])

  // “contorno/halo” (o quanto ele cresce pra fora)
  const haloPad = useMemo(() => Math.max(10, Math.round(coupleSize * 0.14)), [coupleSize])

  return (
    <Layout>
      <div
        className="
          bg-white rounded-3xl p-4 shadow-[0_4px_30px_var(--shadow-soft)] border border-[var(--color-border)] relative mx-auto w-full
          min-h-[100svh]
          flex flex-col
          overflow-hidden
        "
        aria-label="Convite do chá de casa nova"
      >
        {/* brilho de fundo */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#829A5D]/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#829A5D]/10 blur-3xl" />
        </div>

        <div className="relative flex flex-1 flex-col px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="uppercase tracking-[0.08em] text-xs font-medium text-[var(--color-muted)] text-center">chá de casa nova</div>

          {/* Casal */}
          <div className="mt-3 flex justify-center">
            <div
              className="
                relative
                inline-flex items-center justify-center
                rounded-full
                bg-white/20 backdrop-blur-md
                border border-white/35
                shadow-[0_18px_50px_rgba(0,0,0,0.10)]
                px-6 py-5
              "
            >
              {/* CAMADA 1: HALOS (SEMPRE ATRÁS) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0"
              >
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex items-center">
                    {/* halo noiva */}
                    <div
                      className="relative"
                      style={{ width: coupleSize, height: coupleSize, marginRight: -overlap }}
                    >
                      <div
                        className="absolute rounded-full bg-white/18 ring-1 ring-[#829A5D]/25 shadow-[0_16px_40px_rgba(0,0,0,0.10)]"
                        style={{ top: -haloPad, left: -haloPad, right: -haloPad, bottom: -haloPad }}
                      />
                      <div
                        className="absolute rounded-full ring-8 ring-[color:var(--page-bg,#fff)]"
                        style={{ top: -haloPad, left: -haloPad, right: -haloPad, bottom: -haloPad }}
                      />
                      <div
                        className="absolute rounded-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_rgba(255,255,255,0.18)_60%,_transparent_78%)]"
                        style={{ top: -haloPad, left: -haloPad, right: -haloPad, bottom: -haloPad }}
                      />
                    </div>

                    {/* halo noivo */}
                    <div
                      className="relative"
                      style={{ width: coupleSize, height: coupleSize, marginLeft: -overlap }}
                    >
                      <div
                        className="absolute rounded-full bg-white/18 ring-1 ring-[#829A5D]/25 shadow-[0_16px_40px_rgba(0,0,0,0.10)]"
                        style={{ top: -haloPad, left: -haloPad, right: -haloPad, bottom: -haloPad }}
                      />
                      <div
                        className="absolute rounded-full ring-8 ring-[color:var(--page-bg,#fff)]"
                        style={{ top: -haloPad, left: -haloPad, right: -haloPad, bottom: -haloPad }}
                      />
                      <div
                        className="absolute rounded-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_rgba(255,255,255,0.18)_60%,_transparent_78%)]"
                        style={{ top: -haloPad, left: -haloPad, right: -haloPad, bottom: -haloPad }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CAMADA 2: WIGGLES (SEMPRE NA FRENTE) */}
              <div className="relative z-10 flex items-end justify-center">
                {/* Noiva */}
                <div style={{ marginRight: -overlap }}>
                  <BrideWiggle
                    size={coupleSize}
                    face={{
                      ...DEFAULT_BRIDE_WIGGLE_CONFIG.face,
                      src: rostoNoiva,
                      x: Math.round(DEFAULT_BRIDE_WIGGLE_CONFIG.face.x * brideScale),
                      y: Math.round(DEFAULT_BRIDE_WIGGLE_CONFIG.face.y * brideScale),
                    }}
                    veil={{
                      ...DEFAULT_BRIDE_WIGGLE_CONFIG.veil,
                      src: veuNoiva,
                      x: Math.round(DEFAULT_BRIDE_WIGGLE_CONFIG.veil.x * brideScale),
                      y: Math.round(DEFAULT_BRIDE_WIGGLE_CONFIG.veil.y * brideScale),
                    }}
                    motion={DEFAULT_BRIDE_WIGGLE_CONFIG.motion}
                    debug={false}
                  />
                </div>

                {/* Noivo */}
                <div style={{ marginLeft: -overlap }}>
                  <GroomWiggle
                    size={coupleSize}
                    face={{
                      ...DEFAULT_GROOM_WIGGLE_CONFIG.face,
                      src: rostoNoivo,
                      x: Math.round(DEFAULT_GROOM_WIGGLE_CONFIG.face.x * groomScale),
                      y: Math.round(DEFAULT_GROOM_WIGGLE_CONFIG.face.y * groomScale),
                    }}
                    veil={{
                      ...DEFAULT_GROOM_WIGGLE_CONFIG.veil,
                      src: gravataNoivo,
                      x: Math.round(DEFAULT_GROOM_WIGGLE_CONFIG.veil.x * groomScale),
                      y: Math.round(DEFAULT_GROOM_WIGGLE_CONFIG.veil.y * groomScale),
                    }}
                    motion={DEFAULT_GROOM_WIGGLE_CONFIG.motion}
                    debug={false}
                  />
                </div>
              </div>


            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-light text-center mt-3">Áthina e Kayo</h1>

          <div className="mt-2 flex flex-col items-center">
            <div className="uppercase text-sm tracking-wider text-[var(--color-text)] text-center" style={{ marginBottom: 4 }}>
              SÁBADO, ÀS 15 HRS
            </div>

            <div className="font-serif text-lg text-[var(--color-text)] flex flex-wrap items-center justify-center gap-2" aria-label="Data do evento">
              <span className="font-serif text-lg text-[var(--color-text)]">09</span>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path
                  d="M12 21s-6.5-4.35-9.5-7.35A5.5 5.5 0 1 1 12 6a5.5 5.5 0 1 1 9.5 7.65C18.5 16.65 12 21 12 21Z"
                  fill="#829A5D"
                />
              </svg>

              <span className="font-serif text-lg text-[var(--color-text)]">MAIO</span>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path
                  d="M12 21s-6.5-4.35-9.5-7.35A5.5 5.5 0 1 1 12 6a5.5 5.5 0 1 1 9.5 7.65C18.5 16.65 12 21 12 21Z"
                  fill="#829A5D"
                />
              </svg>

              <span className="font-serif text-lg text-[var(--color-text)]">2026</span>
            </div>

            <div className="text-[var(--color-muted)] text-sm text-center mt-2">ENDEREÇO COMPLETO</div>
          </div>

          <Divider />

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
            <Link className="w-full sm:w-auto" to="/confirmar-presenca">
              <Button>Confirmar presença</Button>
            </Link>

            <Link className="w-full sm:w-auto" to="/lista-presentes">
              <Button variant="outline">Ver lista de presentes</Button>
            </Link>

            <a href="#como-chegar" className="text-[var(--color-muted)] text-sm w-full text-center sm:w-auto sm:text-left self-center">
              Como chegar
            </a>
          </div>

          <Divider />

          <section id="como-chegar" className="scroll-mt-24 mt-auto pb-4 sm:pb-6">
            <p className="text-[var(--color-muted)] text-sm text-center">
              Estamos muito felizes em celebrar com você. Chegue alguns minutos antes para acomodação tranquila.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  )
}
