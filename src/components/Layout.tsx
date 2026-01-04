import { ReactNode } from 'react'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingTop: 24, paddingBottom: 24 }}>
      <div className="decor" aria-hidden>
        <svg className="leaf top-left" width="140" height="120" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 100C30 80 60 50 100 40C110 38 120 38 130 40C110 20 80 10 60 14C40 18 26 30 20 40C14 50 10 70 20 100Z" stroke="#A4B688" strokeWidth="1" fill="#EAF2E2" />
          <path d="M40 84C50 66 72 52 96 48" stroke="#829A5D" strokeWidth="1" />
        </svg>
        <svg className="leaf bottom-right" width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M140 20C120 40 90 60 60 70C50 73 40 74 32 72C48 92 80 108 104 104C128 100 144 84 150 72C156 60 158 40 140 20Z" stroke="#A4B688" strokeWidth="1" fill="#EAF2E2" />
          <path d="M120 40C104 56 80 68 56 72" stroke="#829A5D" strokeWidth="1" />
        </svg>
      </div>
      <main className="container">
        {children}
      </main>
    </div>
  )
}
