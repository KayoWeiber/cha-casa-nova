// Defaults centralizados do NOIVO – seguindo a mesma lógica do BrideWiggle.
// AJUSTE AQUI: offsets e sincronismo (y maior no véu/gravata para ficar abaixo do rosto).
import rostoNoivo from '../assets/Rosto-noivo.png'
import gravataNoivo from '../assets/gravata-noivo.png'

export const DEFAULT_GROOM_WIGGLE_CONFIG = {
  size: 220,
  // Defaults com src dos assets (case exato)
  face: { src: rostoNoivo, x: -5, y: 0, scale: 1.2, rotate: -7, zIndex: 2 },
  // Gravata (camada de trás) mais abaixo por padrão
  veil: { src: gravataNoivo, x: 0, y: 50, scale: 0.8, rotate: 0, zIndex: 1 },
  motion: { enabled: true, durationMs: 2800, amplitudeX: 6, amplitudeY: 5, rotateDeg: 2, phaseMs: 0 },
  // Parallax idêntico à noiva; ajuste aqui para diferenciar a "balançada" por camada.
  parallaxFactors: { face: 1, veil: 0.7 }
} as const
