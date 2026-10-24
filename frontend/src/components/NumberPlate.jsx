/** An Indian-style number plate used as the vehicle's stock number badge. */
import { plateFor } from '../utils/format'

export default function NumberPlate({ vehicle }) {
  const plate = plateFor(vehicle)
  return (
    <span
      className="inline-flex items-stretch overflow-hidden rounded-[5px] border-2 border-asphalt bg-plate text-asphalt"
      aria-label={`Stock number ${plate}`}
    >
      <span className="flex items-center bg-[#1F4FA3] px-1 text-[8px] font-bold leading-none text-white">IND</span>
      <span className="font-plate px-2 py-0.5 text-sm font-bold tracking-wide whitespace-nowrap">{plate}</span>
    </span>
  )
}
