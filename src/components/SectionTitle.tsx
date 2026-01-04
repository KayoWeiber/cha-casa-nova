import { ReactNode } from 'react'

type SectionTitleProps = {
  children: ReactNode
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return <h2 className="section-title">{children}</h2>
}
