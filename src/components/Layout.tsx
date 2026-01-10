import { ReactNode } from 'react'

type LayoutProps = {
  children: ReactNode
}

function Leaf({
  className,
  width = 180,
  height = 160,
}: {
  className: string
  width?: number
  height?: number
}) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 160 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M140 20C120 40 90 60 60 70C50 73 40 74 32 72C48 92 80 108 104 104C128 100 144 84 150 72C156 60 158 40 140 20Z"
        stroke="#A4B688"
        strokeWidth="1"
        fill="#EAF2E2"
        fillOpacity="0.75"
      />
      <path d="M120 40C104 56 80 68 56 72" stroke="#829A5D" strokeWidth="1" strokeOpacity="0.9" />
    </svg>
  )
}

function Sprig({
  className,
  width = 120,
  height = 110,
}: {
  className: string
  width?: number
  height?: number
}) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 140 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 100C30 80 60 50 100 40C110 38 120 38 130 40C110 20 80 10 60 14C40 18 26 30 20 40C14 50 10 70 20 100Z"
        stroke="#A4B688"
        strokeWidth="1"
        fill="#EAF2E2"
        fillOpacity="0.75"
      />
      <path d="M40 84C50 66 72 52 96 48" stroke="#829A5D" strokeWidth="1" strokeOpacity="0.9" />
    </svg>
  )
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div
      className="relative min-h-[100svh] py-6"
      style={{
        // fundo mais tranquilo (mesmas cores, só melhor distribuídas)
        background:
          'radial-gradient(900px 520px at 18% 12%, rgba(130,154,93,0.10), transparent 60%),' +
          'radial-gradient(900px 520px at 85% 85%, rgba(164,182,136,0.16), transparent 55%),' +
          'linear-gradient(180deg, #F7F9F4 0%, #EEF4E8 100%)',
        // útil pra contornos/halos em outros componentes
        ['--page-bg' as any]: '#EEF4E8',
      }}
    >
      {/* Decoração */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* brilho leve central */}
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-[#829A5D]/10 blur-3xl" />

        {/* folhas nos cantos */}
        <Sprig className="absolute -left-8 -top-6 rotate-6 opacity-70 blur-[0.2px]" />
        <Leaf className="absolute -right-10 -top-8 -rotate-12 opacity-65 blur-[0.2px]" />

        <Leaf className="absolute -left-12 -bottom-10 rotate-[22deg] opacity-60 blur-[0.3px]" />
        <Sprig className="absolute -right-8 -bottom-8 -rotate-[18deg] opacity-70 blur-[0.2px]" />

        {/* folhinhas extras (bem sutis) */}
        <Leaf className="absolute left-6 top-1/2 -translate-y-1/2 rotate-90 opacity-25 blur-[0.5px]" width={140} height={120} />
        <Leaf className="absolute right-6 top-1/2 -translate-y-1/2 -rotate-90 opacity-25 blur-[0.5px]" width={140} height={120} />
      </div>

      {/* Conteúdo */}
      <main className="container relative mx-auto">{children}</main>
    </div>
  )
}
