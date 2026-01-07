import BrideWiggle from './BrideWiggle'
import GroomWiggle from './GroomWiggle'
import { DEFAULT_BRIDE_WIGGLE_CONFIG } from './BrideWiggle.config'
import { DEFAULT_GROOM_WIGGLE_CONFIG } from './GroomWiggle.config'
import rostoNoivo from '../assets/Rosto-noivo.png'
import gravataNoivo from '../assets/gravata-noivo.png'

export default function CoupleWiggle() {
  return (
    <div className="relative flex items-end justify-center gap-2 sm:gap-4">
      <BrideWiggle
        className=""
        size={110}
        face={{ ...DEFAULT_BRIDE_WIGGLE_CONFIG.face }}
        veil={{ ...DEFAULT_BRIDE_WIGGLE_CONFIG.veil }}
        motion={DEFAULT_BRIDE_WIGGLE_CONFIG.motion}
        debug={false}
      />
      <GroomWiggle
        className=""
        size={110}
        face={{ ...DEFAULT_GROOM_WIGGLE_CONFIG.face, src: rostoNoivo }}
        veil={{ ...DEFAULT_GROOM_WIGGLE_CONFIG.veil, src: gravataNoivo }}
        motion={DEFAULT_GROOM_WIGGLE_CONFIG.motion}
        debug={false}
      />
    </div>
  )
}
