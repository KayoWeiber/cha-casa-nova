import { ReactNode } from 'react'

type SectionTitleProps = {
  children: ReactNode
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return <h2 className="font-sans font-semibold text-lg mb-3">{children}</h2>
}
