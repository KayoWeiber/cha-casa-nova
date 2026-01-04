import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = {
  variant?: 'primary' | 'outline'
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({ variant = 'primary', children, className, ...props }: ButtonProps) {
  const classes = [
    'btn',
    variant === 'outline' ? 'btn-outline' : '',
    className || ''
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
