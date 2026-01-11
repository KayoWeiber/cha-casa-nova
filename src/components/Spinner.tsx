import styles from './Spinner.module.css'

type SpinnerProps = {
  message?: string
  ariaLabel?: string
}

export default function Spinner({ message, ariaLabel }: SpinnerProps) {
  return (
    <div className={styles.container} aria-live="polite" aria-busy="true" role="status">
      <div className={styles.ring} aria-label={ariaLabel || 'Carregando'} />
      {message && <div className={styles.message}>{message}</div>}
    </div>
  )
}
