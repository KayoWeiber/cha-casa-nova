import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = {
  variant?: 'primary' | 'outline'
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({ variant = 'primary', children, className, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[14px] font-medium transition-all duration-150 ease-out'
  const primary = 'border border-[var(--color-primary)] bg-[var(--color-primary)] text-white hover:-translate-y-0.5 focus:outline-2 focus:outline-[var(--color-secondary)] focus:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'
  const outline = 'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:shadow-md focus:outline-2 focus:outline-[var(--color-secondary)] focus:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

  const classes = [
    base,
    variant === 'outline' ? outline : primary,
    className || ''
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
