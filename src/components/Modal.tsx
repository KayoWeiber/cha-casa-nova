import { useEffect, useRef } from 'react'

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
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} onClick={(e) => e.stopPropagation()}>
        <h3 id={titleId} className="section-title" style={{ marginBottom: 8 }}>{title}</h3>
        {description && <p id={descId} className="muted">{description}</p>}
        <div className="modal-actions">
          <button ref={firstButtonRef} className="btn" onClick={onConfirm}>{confirmText}</button>
          <button className="btn btn-outline" onClick={onCancel}>{cancelText}</button>
        </div>
      </div>
    </div>
  )
}
