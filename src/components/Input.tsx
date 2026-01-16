import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

type BaseProps = {
  label: string
  hint?: ReactNode
  error?: string
}

type TextInputProps = BaseProps & {
  type?: string
} & InputHTMLAttributes<HTMLInputElement>

type TextAreaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>

type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement>

const inputClasses = 'w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl bg-white text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-secondary)] focus:outline-offset-2'

export function TextInput({ label, hint, error, id, ...props }: TextInputProps) {
  const reactId = useId()
  const inputId = id || `input-${reactId}`
  return (
    <div className="grid gap-1.5">
      <label htmlFor={inputId} className="text-sm text-[var(--color-text)]">{label}</label>
      <input id={inputId} className={inputClasses} {...props} />
      {hint && <div className="text-xs text-[var(--color-muted)]">{hint}</div>}
      {error && <div className="text-xs text-red-700" role="alert">{error}</div>}
    </div>
  )
}

export function TextArea({ label, hint, error, id, ...props }: TextAreaProps) {
  const reactId = useId()
  const inputId = id || `textarea-${reactId}`
  return (
    <div className="grid gap-1.5">
      <label htmlFor={inputId} className="text-sm text-[var(--color-text)]">{label}</label>
      <textarea id={inputId} className={inputClasses} rows={4} {...props} />
      {hint && <div className="text-xs text-[var(--color-muted)]">{hint}</div>}
      {error && <div className="text-xs text-red-700" role="alert">{error}</div>}
    </div>
  )
}

export function Select({ label, hint, error, id, children, ...props }: SelectProps) {
  const reactId = useId()
  const inputId = id || `select-${reactId}`
  return (
    <div className="grid gap-1.5">
      <label htmlFor={inputId} className="text-sm text-[var(--color-text)]">{label}</label>
      <select id={inputId} className={inputClasses} {...props}>
        {children}
      </select>
      {hint && <div className="text-xs text-[var(--color-muted)]">{hint}</div>}
      {error && <div className="text-xs text-red-700" role="alert">{error}</div>}
    </div>
  )
}
