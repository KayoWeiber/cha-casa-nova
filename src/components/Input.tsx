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

export function TextInput({ label, hint, error, id, ...props }: TextInputProps) {
  const reactId = useId()
  const inputId = id || `input-${reactId}`
  return (
    <div className="field">
      <label htmlFor={inputId} className="label">{label}</label>
      <input id={inputId} className="input" {...props} />
      {hint && <div className="hint">{hint}</div>}
      {error && <div className="error" role="alert">{error}</div>}
    </div>
  )
}

export function TextArea({ label, hint, error, id, ...props }: TextAreaProps) {
  const reactId = useId()
  const inputId = id || `textarea-${reactId}`
  return (
    <div className="field">
      <label htmlFor={inputId} className="label">{label}</label>
      <textarea id={inputId} className="textarea" rows={4} {...props} />
      {hint && <div className="hint">{hint}</div>}
      {error && <div className="error" role="alert">{error}</div>}
    </div>
  )
}

export function Select({ label, hint, error, id, children, ...props }: SelectProps) {
  const reactId = useId()
  const inputId = id || `select-${reactId}`
  return (
    <div className="field">
      <label htmlFor={inputId} className="label">{label}</label>
      <select id={inputId} className="select" {...props}>
        {children}
      </select>
      {hint && <div className="hint">{hint}</div>}
      {error && <div className="error" role="alert">{error}</div>}
    </div>
  )
}
