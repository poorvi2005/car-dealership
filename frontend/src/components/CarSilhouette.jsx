/**
 * A side-view car drawn in SVG, shaped by body type and painted in the car's real colour.
 * Each shape is: a body outline, window cut-outs, and the x-positions of the two wheels.
 */
import { useId } from 'react'
import { shade } from '../utils/format'

const SHAPES = {
  Sedan: {
    body: 'M14 70C14 60 18 56 34 54L70 50L94 33C99 29 104 28 112 28H152C160 28 165 30 171 35L190 50L214 54C224 56 228 60 228 66V70C228 72 226 73 224 73H16C15 73 14 72 14 70Z',
    windows: ['M78 50L98 35C101 33 104 32 110 32H130V50Z', 'M134 32H152C158 32 162 34 166 38L180 50H134Z'],
    wheels: [62, 184],
  },
  SUV: {
    body: 'M14 70V52C14 46 18 44 26 44L62 42L76 22C79 18 82 17 90 17H182C188 17 191 19 194 24L206 42L216 44C224 46 228 50 228 58V70C228 72 226 73 224 73H16C15 73 14 72 14 70Z',
    windows: ['M70 42L82 24C84 22 86 21 90 21H126V42Z', 'M130 21H170V42H130Z', 'M174 21H182C186 21 188 22 190 26L200 42H174Z'],
    wheels: [60, 184],
  },
  Hatchback: {
    body: 'M30 70C30 60 34 56 50 54L82 50L106 30C110 26 114 25 122 25H180C188 25 192 28 195 34L206 54C208 58 210 62 210 66V70C210 72 208 73 206 73H32C31 73 30 72 30 70Z',
    windows: ['M90 50L110 32C113 30 116 29 122 29H146V50Z', 'M150 29H178C184 29 187 31 189 35L198 50H150Z'],
    wheels: [74, 178],
  },
  Coupe: {
    body: 'M12 70C12 62 16 58 36 56L84 50L114 34C120 31 124 30 132 30H156C164 30 170 33 176 38L194 52L218 55C226 57 230 61 230 66V70C230 72 228 73 226 73H14C13 73 12 72 12 70Z',
    windows: ['M96 50L118 37C122 35 126 34 132 34H148V50Z', 'M152 34H156C162 34 166 36 170 40L182 50H152Z'],
    wheels: [60, 188],
  },
  Convertible: {
    body: 'M12 70C12 62 16 58 36 56L104 52L119 38H124L114 52L196 53L218 55C226 57 230 61 230 66V70C230 72 228 73 226 73H14C13 73 12 72 12 70Z',
    windows: ['M112 51L121 41H122L115 51Z'],
    wheels: [60, 188],
  },
  Truck: {
    body: 'M12 70V50C12 45 16 43 24 43L58 41L72 20C75 16 78 15 86 15H128C132 15 134 17 134 21V44H228V70C228 72 226 73 224 73H14C13 73 12 72 12 70Z',
    windows: ['M66 41L78 22C80 20 82 19 86 19H102V41Z', 'M106 19H128C129 19 130 20 130 21V41H106Z'],
    wheels: [56, 192],
  },
}
SHAPES.Electric = SHAPES.Sedan

export default function CarSilhouette({ category, paint, className = '' }) {
  const shape = SHAPES[category] || SHAPES.Sedan
  const gradientId = useId()

  return (
    <svg viewBox="0 0 240 96" className={className} role="img" aria-label={`${category} silhouette`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade(paint, 0.35)} />
          <stop offset="55%" stopColor={paint} />
          <stop offset="100%" stopColor={shade(paint, -0.35)} />
        </linearGradient>
      </defs>

      <ellipse cx="120" cy="88" rx="112" ry="5" fill="rgba(0,0,0,0.35)" />
      <path d={shape.body} fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
      {shape.windows.map((d) => (
        <path key={d} d={d} fill="#1A2526" opacity="0.88" />
      ))}

      {category === 'Electric' && (
        <path d="M118 56L112 64H117L114 70L122 61H117L120 56Z" fill="#F2B33D" aria-hidden="true" />
      )}

      {shape.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy="74" r="15" fill="#151A1B" />
          <circle cx={x} cy="74" r="7.5" fill="#C9D1D0" />
          <circle cx={x} cy="74" r="2.5" fill="#6F7B7C" />
        </g>
      ))}
    </svg>
  )
}
