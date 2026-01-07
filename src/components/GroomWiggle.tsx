import React, { useMemo, useState } from 'react'
// Reutiliza o mesmo CSS module da noiva para manter classes/logic idênticas
import styles from './BrideWiggle.module.css'
import { DEFAULT_GROOM_WIGGLE_CONFIG } from './GroomWiggle.config'

type LayerConfig = {
  src?: string
  x: number
  y: number
  scale: number
  rotate: number
  zIndex?: number
}

type MotionConfig = {
  enabled: boolean
  durationMs: number
  amplitudeX: number
  amplitudeY: number
  rotateDeg: number
  phaseMs?: number
}

type SizeProp = number | { width: number; height: number }

type GroomWiggleProps = {
  className?: string
  size?: SizeProp
  face: LayerConfig
  // Mantém o mesmo nome interno "veil" para reaproveitar 100% da lógica
  veil: LayerConfig
  motion: MotionConfig
  debug?: boolean
}

// Tipagem para CSS variables sem erros em React.CSSProperties.
// Usa o mesmo padrão do BrideWiggle
type CSSVars = React.CSSProperties & Record<string, string | number>

function toSize(size?: SizeProp): { width: number; height: number } | undefined {
  if (!size) return undefined
  if (typeof size === 'number') return { width: size, height: size }
  return { width: size.width, height: size.height }
}

export default function GroomWiggle(props: GroomWiggleProps) {
  const {
    className,
    size = DEFAULT_GROOM_WIGGLE_CONFIG.size,
    face = DEFAULT_GROOM_WIGGLE_CONFIG.face,
    veil = DEFAULT_GROOM_WIGGLE_CONFIG.veil,
    motion = DEFAULT_GROOM_WIGGLE_CONFIG.motion,
    debug = false,
  } = props

  const dims = toSize(size) ?? { width: DEFAULT_GROOM_WIGGLE_CONFIG.size, height: DEFAULT_GROOM_WIGGLE_CONFIG.size }

  const isDev = import.meta.env.MODE !== 'production'
  const [debugAdjust, setDebugAdjust] = useState({
    faceX: 0,
    faceY: 0,
    veilX: 0,
    veilY: 0,
    ampX: 0,
    ampY: 0,
  })

  const faceVars: CSSVars = useMemo(() => ({
    '--base-x': `${face.x + debugAdjust.faceX}px`,
    '--base-y': `${face.y + debugAdjust.faceY}px`,
    '--base-rotate': `${face.rotate}deg`,
    '--base-scale': String(face.scale),
    '--ax': `${(motion.amplitudeX + debugAdjust.ampX) * DEFAULT_GROOM_WIGGLE_CONFIG.parallaxFactors.face}px`,
    '--ay': `${(motion.amplitudeY + debugAdjust.ampY) * DEFAULT_GROOM_WIGGLE_CONFIG.parallaxFactors.face}px`,
    '--ar': `${motion.rotateDeg * DEFAULT_GROOM_WIGGLE_CONFIG.parallaxFactors.face}deg`,
    '--phase': `${motion.phaseMs ?? 0}ms`,
    '--duration': `${motion.durationMs}ms`,
    '--z': String(face.zIndex ?? 2),
  }) as CSSVars, [face, motion, debugAdjust])

  const veilVars: CSSVars = useMemo(() => ({
    '--base-x': `${veil.x + debugAdjust.veilX}px`,
    '--base-y': `${veil.y + debugAdjust.veilY}px`,
    '--base-rotate': `${veil.rotate}deg`,
    '--base-scale': String(veil.scale),
    '--ax': `${(motion.amplitudeX + debugAdjust.ampX) * DEFAULT_GROOM_WIGGLE_CONFIG.parallaxFactors.veil}px`,
    '--ay': `${(motion.amplitudeY + debugAdjust.ampY) * DEFAULT_GROOM_WIGGLE_CONFIG.parallaxFactors.veil}px`,
    '--ar': `${motion.rotateDeg * DEFAULT_GROOM_WIGGLE_CONFIG.parallaxFactors.veil}deg`,
    '--phase': `${motion.phaseMs ?? 0}ms`,
    '--duration': `${motion.durationMs}ms`,
    '--z': String(veil.zIndex ?? 1),
  }) as CSSVars, [veil, motion, debugAdjust])

  const layerClass = (extra: string, withAnim: boolean, withDebugOutline: boolean) => [
    styles.layer,
    extra,
    withAnim ? styles.animated : '',
    withDebugOutline ? styles.debugOutline : '',
  ].filter(Boolean).join(' ')

  const renderLayer = (layer: LayerConfig, kind: 'veil' | 'face', vars: CSSVars) => {
    const cls = layerClass(kind === 'veil' ? styles.veil : styles.face, motion.enabled, debug)
    const commonBase = { style: vars, 'aria-hidden': true } as const
    if (layer.src) {
      return <img {...commonBase} className={cls} src={layer.src} alt="" />
    }
    if (isDev && kind === 'face') {
      console.warn('GroomWiggle: face.src não definido')
    }
    return <div {...commonBase} className={[cls, styles.placeholder].join(' ')} />
  }

  return (
    <div className={[styles.wrapper, className ?? ''].join(' ')} style={{ width: dims.width, height: dims.height }}>
      {renderLayer(veil, 'veil', veilVars)}
      {renderLayer(face, 'face', faceVars)}

      {debug && (
        <div className={styles.debugPanel} role="status" aria-live="polite">
          <div className={styles.debugPanelRow}>
            <div className={styles.debugLabel}>Face</div>
            <div className={styles.debugVals}>
              <span>x: {face.x}</span>
              <span>y: {face.y}</span>
              <span>scale: {face.scale}</span>
              <span>rot: {face.rotate}°</span>
            </div>
          </div>
          <div className={styles.debugPanelRow}>
            <div className={styles.debugLabel}>Gravata</div>
            <div className={styles.debugVals}>
              <span>x: {veil.x}</span>
              <span>y: {veil.y}</span>
              <span>scale: {veil.scale}</span>
              <span>rot: {veil.rotate}°</span>
            </div>
          </div>
          {isDev && (
            <div className={styles.debugSliders}>
              <label>
                <span style={{ display: 'block' }}>Face X</span>
                <input type="range" min={-40} max={40} value={debugAdjust.faceX}
                       onChange={(e) => setDebugAdjust(v => ({ ...v, faceX: Number(e.target.value) }))} />
              </label>
              <label>
                <span style={{ display: 'block' }}>Face Y</span>
                <input type="range" min={-40} max={40} value={debugAdjust.faceY}
                       onChange={(e) => setDebugAdjust(v => ({ ...v, faceY: Number(e.target.value) }))} />
              </label>
              <label>
                <span style={{ display: 'block' }}>Amp X</span>
                <input type="range" min={-12} max={12} step={0.5} value={debugAdjust.ampX}
                       onChange={(e) => setDebugAdjust(v => ({ ...v, ampX: Number(e.target.value) }))} />
              </label>
              <label>
                <span style={{ display: 'block' }}>Gravata X</span>
                <input type="range" min={-40} max={40} value={debugAdjust.veilX}
                       onChange={(e) => setDebugAdjust(v => ({ ...v, veilX: Number(e.target.value) }))} />
              </label>
              <label>
                <span style={{ display: 'block' }}>Gravata Y</span>
                <input type="range" min={-40} max={40} value={debugAdjust.veilY}
                       onChange={(e) => setDebugAdjust(v => ({ ...v, veilY: Number(e.target.value) }))} />
              </label>
              <label>
                <span style={{ display: 'block' }}>Amp Y</span>
                <input type="range" min={-12} max={12} step={0.5} value={debugAdjust.ampY}
                       onChange={(e) => setDebugAdjust(v => ({ ...v, ampY: Number(e.target.value) }))} />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
