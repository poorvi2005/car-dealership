/** Label + input pair, so every form in the app looks and behaves the same. */
export const inputClass =
  'w-full rounded-xl border border-petrol/20 bg-white px-3.5 py-2.5 text-asphalt placeholder:text-gravel/70 focus:border-petrol focus:outline-none focus:ring-2 focus:ring-marigold/60'

export default function Field({ label, hint, id, as = 'input', children, ...props }) {
  const Tag = as
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-asphalt">
        {label}
      </label>
      <Tag id={id} className={inputClass} aria-describedby={hintId} {...props}>
        {children}
      </Tag>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-gravel">
          {hint}
        </p>
      )}
    </div>
  )
}
