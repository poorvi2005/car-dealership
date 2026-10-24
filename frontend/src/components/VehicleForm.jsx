/** Add / edit form for admins. Same component for both; `initial` decides which. */
import { useState } from 'react'
import Field from './Field'

const EMPTY = { make: '', model: '', category: 'Sedan', year: '', color: '', price: '', quantity: '' }

export default function VehicleForm({ initial, categories, onSubmit, onCancel }) {
  const editing = Boolean(initial)
  const [values, setValues] = useState(() => (initial ? { ...EMPTY, ...initial } : EMPTY))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!values.make.trim() || !values.model.trim()) return setError('Make and model are required.')
    if (values.price === '' || Number(values.price) < 0) return setError('Enter a price of 0 or more.')
    if (values.quantity === '' || Number(values.quantity) < 0 || !Number.isInteger(Number(values.quantity)))
      return setError('Enter a whole-number quantity of 0 or more.')

    const payload = {
      make: values.make.trim(),
      model: values.model.trim(),
      category: values.category,
      price: Number(values.price),
      quantity: Number(values.quantity),
      year: values.year ? Number(values.year) : null,
      color: values.color.trim() || null,
    }
    setSaving(true)
    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field id="vf-make" label="Make" value={values.make} onChange={set('make')} placeholder="Toyota" />
      <Field id="vf-model" label="Model" value={values.model} onChange={set('model')} placeholder="Innova Hycross" />
      <Field id="vf-category" label="Body type" as="select" value={values.category} onChange={set('category')}>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Field>
      <Field id="vf-year" label="Year" type="number" min="1900" max="2100" value={values.year ?? ''} onChange={set('year')} placeholder="2025" />
      <Field id="vf-color" label="Paint" value={values.color ?? ''} onChange={set('color')} placeholder="Pearl White" hint="The card paints the car in this colour." />
      <Field id="vf-price" label="Price (₹)" type="number" min="0" step="1000" value={values.price} onChange={set('price')} placeholder="1850000" />
      <Field id="vf-quantity" label="Units in stock" type="number" min="0" value={values.quantity} onChange={set('quantity')} placeholder="3" />

      {error && (
        <p className="rounded-xl bg-brake/10 px-3 py-2 text-sm text-brake sm:col-span-2" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 sm:col-span-2">
        <button type="button" onClick={onCancel} className="rounded-full px-4 py-2.5 font-medium text-gravel hover:bg-showroom">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-petrol px-5 py-2.5 font-semibold text-showroom hover:bg-petrol-soft disabled:opacity-60"
        >
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Add to lot'}
        </button>
      </div>
    </form>
  )
}
