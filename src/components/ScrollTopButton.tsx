import { useEffect, useState } from 'react'
import styles from './ScrollTopButton.module.css'

type ScrollTopButtonProps = {
  threshold?: number
}

export default function ScrollTopButton({ threshold = 300 }: ScrollTopButtonProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  function scrollToTop() {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      window.scrollTo(0, 0)
    }
  }

  return (
    <button
      type="button"
      className={`${styles.fab} ${visible ? styles.visible : styles.hidden} cursor-pointer`}
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 6l-6 6h4v6h4v-6h4l-6-6z" fill="currentColor" />
      </svg>
    </button>
  )
}
