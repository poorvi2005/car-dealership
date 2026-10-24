/**
 * Search and filter controls. It only reports changes upward via onChange;
 * the page decides when to call the API (debounced), which keeps this component dumb and testable.
 */
import { inputClass } from './Field'

export const EMPTY_FILTERS = { make: '', model: '', category: '', min_price: '', max_price: '' }

export default function FilterBar({ filters, categories, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value })
  const active = Object.values(filters).some(Boolean)

  return (
    <section aria-label="Search the lot" className="rounded-[22px] bg-white p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_1fr_0.7fr_0.7fr]">
        <input
          className={`${inputClass} col-span-2 sm:col-span-1`}
          placeholder="Make, like Tata"
          aria-label="Make"
          value={filters.make}
          onChange={(e) => update('make', e.target.value)}
        />
        <input
          className={`${inputClass} col-span-2 sm:col-span-1`}
          placeholder="Model, like Nexon"
          aria-label="Model"
          value={filters.model}
          onChange={(e) => update('model', e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          min="0"
          placeholder="Min ₹"
          aria-label="Minimum price"
          value={filters.min_price}
          onChange={(e) => update('min_price', e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          min="0"
          placeholder="Max ₹"
          aria-label="Maximum price"
          value={filters.max_price}
          onChange={(e) => update('max_price', e.target.value)}
        />
      </div>

      <div
        className="-mx-4 mt-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        role="group"
        aria-label="Body type"
      >
        {['', ...categories].map((c) => {
          const selected = filters.category === c
          return (
            <button
              key={c || 'all'}
              type="button"
              aria-pressed={selected}
              onClick={() => update('category', c)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                selected
                  ? 'border-petrol bg-petrol text-showroom'
                  : 'border-petrol/20 text-petrol hover:border-petrol/50'
              }`}
            >
              {c || 'All types'}
            </button>
          )
        })}
        {active && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="ml-auto shrink-0 text-sm font-medium text-gravel underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </section>
  )
}
