import { useEffect, useRef } from 'react'
import Button from './Button'

export type ModalProps = {
  isOpen: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function Modal({ isOpen, title, description, confirmText = 'Sim', cancelText = 'Cancelar', onConfirm, onCancel }: ModalProps) {
  const firstButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      // small timeout to ensure open render then focus
      setTimeout(() => firstButtonRef.current?.focus(), 0)
    }
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const titleId = 'modal-title'
  const descId = description ? 'modal-desc' : undefined

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" 
      role="presentation" 
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg text-center"
        role="dialog" 
        aria-modal="true" 
        aria-labelledby={titleId} 
        aria-describedby={descId} 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId} className="font-sans font-semibold text-lg mb-2">{title}</h3>
        {description && <p id={descId} className="text-[var(--color-muted)] text-sm">{description}</p>}
        <div className="flex gap-2 justify-center mt-5">
          <Button ref={firstButtonRef} onClick={onConfirm}>{confirmText}</Button>
          <Button variant="outline" onClick={onCancel}>{cancelText}</Button>
        </div>
      </div>
    </div>
  )
}
