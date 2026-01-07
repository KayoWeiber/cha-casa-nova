// Defaults centralizados para offsets e sincronismo do BrideWiggle.
// AJUSTE AQUI: valores iniciais de posição/escala/rotação e ritmo.
export const DEFAULT_BRIDE_WIGGLE_CONFIG = {
  size: 220,
  face: { x: 0, y: 0, scale: 1, rotate: 0, zIndex: 2 },
  veil: { x: 0, y: 0, scale: 1, rotate: 0, zIndex: 1 },
  motion: { enabled: true, durationMs: 3000, amplitudeX: 6, amplitudeY: 4, rotateDeg: 1.2, phaseMs: 0 },
  // Parallax: multiplicadores de amplitude por camada no mesmo ritmo.
  parallaxFactors: { face: 1, veil: 0.65 }
} as const
