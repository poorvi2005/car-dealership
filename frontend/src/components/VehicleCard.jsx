/**
 * One car on the lot. The top half is its parking bay; the bottom half is the details.
 * The Buy button is disabled when quantity is 0 (an assignment requirement).
 */
import CarSilhouette from './CarSilhouette'
import NumberPlate from './NumberPlate'
import { formatINR, paintFor, stockStatus } from '../utils/format'

const TONE = {
  ok: 'bg-mint',
  low: 'bg-marigold',
  out: 'bg-brake',
}

export default function VehicleCard({ vehicle, isAdmin, onBuy, onEdit, onRestock, onDelete, index = 0, busy = false }) {
  const { make, model, category, year, color, price, quantity } = vehicle
  const stock = stockStatus(quantity)
  const soldOut = quantity <= 0

  return (
    <article
      className="roll-in flex flex-col overflow-hidden rounded-[18px] border border-petrol/12 bg-white"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
      aria-label={`${make} ${model}`}
    >
      {/* Parking bay */}
      <div className="relative bg-gradient-to-b from-[#3B4546] to-[#2A3132] px-4 pt-9 pb-3">
        <span className="absolute inset-y-0 left-3 w-[3px] bg-white/55" aria-hidden="true" />
        <span className="absolute inset-y-0 right-3 w-[3px] bg-white/55" aria-hidden="true" />
        <span className="absolute top-3 right-6 rounded-full bg-white/12 px-2.5 py-0.5 text-xs font-medium text-white/90">
          {category}
        </span>
        <CarSilhouette
          category={category}
          paint={paintFor(color)}
          className={`mx-auto w-full max-w-[260px] transition-opacity ${soldOut ? 'opacity-45' : ''}`}
        />
        <div className="mt-1 pl-3">
          <NumberPlate vehicle={vehicle} />
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-sm text-gravel">{make}</p>
          <h3 className="font-badge text-lg leading-tight font-bold text-petrol">{model}</h3>
          <p className="mt-1 text-sm text-gravel">{[year, color].filter(Boolean).join(', ')}</p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <p className="text-xl font-bold tabular-nums">{formatINR(price)}</p>
          <p className="flex items-center gap-1.5 text-sm text-gravel" data-testid="stock">
            <span className={`h-2 w-2 rounded-full ${TONE[stock.tone]}`} aria-hidden="true" />
            {stock.label}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onBuy?.(vehicle)}
          disabled={soldOut || busy}
          className="rounded-full bg-marigold px-4 py-2.5 font-semibold text-asphalt transition-colors hover:bg-marigold-deep disabled:cursor-not-allowed disabled:bg-showroom disabled:text-gravel"
        >
          {soldOut ? 'Sold out' : 'Buy this car'}
        </button>

        {isAdmin && (
          <div className="flex justify-between border-t border-petrol/10 pt-3 text-sm font-medium">
            <button type="button" onClick={() => onEdit?.(vehicle)} className="text-petrol hover:underline">
              Edit
            </button>
            <button type="button" onClick={() => onRestock?.(vehicle)} className="text-petrol hover:underline">
              Restock
            </button>
            <button type="button" onClick={() => onDelete?.(vehicle)} className="text-brake hover:underline">
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
