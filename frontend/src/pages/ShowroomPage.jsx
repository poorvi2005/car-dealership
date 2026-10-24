/**
 * The main dashboard. Shows the lot, runs search, and opens the buy / admin dialogs.
 *
 * Data flow: filters change -> wait 300 ms (debounce) -> call the API -> replace `vehicles`.
 * After any purchase or admin change we update that one car in state, so the page
 * reflects the new stock immediately without reloading everything.
 */
import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import FilterBar, { EMPTY_FILTERS } from '../components/FilterBar'
import Field from '../components/Field'
import Modal from '../components/Modal'
import Navbar from '../components/Navbar'
import VehicleCard from '../components/VehicleCard'
import VehicleForm from '../components/VehicleForm'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatINR } from '../utils/format'

const FALLBACK_CATEGORIES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Truck', 'Electric', 'Convertible']

export default function ShowroomPage() {
  const { user, isAdmin } = useAuth()
  const notify = useToast()

  const [vehicles, setVehicles] = useState([])
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [dialog, setDialog] = useState(null) // { type: 'buy'|'add'|'edit'|'restock'|'delete', vehicle? }
  const [busyId, setBusyId] = useState(null)

  const filtering = Object.values(filters).some(Boolean)

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {})
  }, [])

  // Debounced fetch whenever the filters change.
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      const request = filtering ? api.searchVehicles(filters) : api.listVehicles()
      request
        .then((data) => {
          setVehicles(data)
          setLoadError('')
        })
        .catch((err) => setLoadError(err.message))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [filters, filtering])

  const replaceVehicle = (updated) => setVehicles((list) => list.map((v) => (v.id === updated.id ? updated : v)))
  const closeDialog = useCallback(() => setDialog(null), [])

  async function confirmPurchase(vehicle) {
    setBusyId(vehicle.id)
    closeDialog()
    try {
      const updated = await api.purchase(vehicle.id)
      replaceVehicle(updated)
      notify(
        updated.quantity === 0
          ? `Purchased the ${vehicle.model}. That was the last one.`
          : `Purchased the ${vehicle.model}. ${updated.quantity} left on the lot.`,
      )
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function saveVehicle(payload) {
    if (dialog.type === 'edit') {
      const updated = await api.updateVehicle(dialog.vehicle.id, payload)
      replaceVehicle(updated)
      notify(`Saved changes to the ${updated.model}.`)
    } else {
      const created = await api.createVehicle(payload)
      setVehicles((list) => [...list, created])
      notify(`Added the ${created.model} to the lot.`)
    }
    closeDialog()
  }

  async function confirmDelete(vehicle) {
    try {
      await api.deleteVehicle(vehicle.id)
      setVehicles((list) => list.filter((v) => v.id !== vehicle.id))
      notify(`Deleted the ${vehicle.model}.`)
    } catch (err) {
      notify(err.message, 'error')
    }
    closeDialog()
  }

  const firstName = user?.full_name?.split(' ')[0]
  const inStock = vehicles.filter((v) => v.quantity > 0).length

  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      <div className="bg-petrol pb-24 text-showroom">
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
          <h1 className="font-badge max-w-3xl text-3xl leading-tight font-extrabold sm:text-5xl">
            {isAdmin ? `The lot is yours to run, ${firstName}.` : `What are you driving home, ${firstName}?`}
          </h1>
          <p className="mt-3 max-w-xl text-showroom/75">
            {isAdmin
              ? 'Add new arrivals, fix prices, restock what sold, and clear out what you no longer carry.'
              : 'Search by make, model, body type or budget. Stock updates the moment someone buys.'}
          </p>
        </div>
      </div>

      <main className="mx-auto -mt-16 max-w-6xl px-4 sm:px-6">
        <FilterBar filters={filters} categories={categories} onChange={setFilters} />

        <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-gravel" aria-live="polite">
            {loading
              ? 'Looking over the lot…'
              : filtering
                ? `${vehicles.length} ${vehicles.length === 1 ? 'car matches' : 'cars match'} your search`
                : `${vehicles.length} cars parked, ${inStock} ready to drive away`}
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setDialog({ type: 'add' })}
              className="rounded-full bg-petrol px-5 py-2.5 font-semibold text-showroom hover:bg-petrol-soft"
            >
              Add a vehicle
            </button>
          )}
        </div>

        {loadError && (
          <p role="alert" className="rounded-2xl bg-brake/10 p-4 text-brake">
            {loadError}
          </p>
        )}

        {!loading && !loadError && vehicles.length === 0 && (
          <div className="rounded-[22px] border-2 border-dashed border-petrol/20 p-10 text-center">
            <p className="font-badge text-lg font-bold text-petrol">
              {filtering ? 'Nothing on the lot matches that.' : 'The lot is empty.'}
            </p>
            <p className="mt-2 text-gravel">
              {filtering
                ? 'Try a wider price range or a different body type.'
                : isAdmin
                  ? 'Add your first vehicle to get started.'
                  : 'Check back soon. New stock arrives every week.'}
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v, i) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              index={i}
              isAdmin={isAdmin}
              busy={busyId === v.id}
              onBuy={(vehicle) => setDialog({ type: 'buy', vehicle })}
              onEdit={(vehicle) => setDialog({ type: 'edit', vehicle })}
              onRestock={(vehicle) => setDialog({ type: 'restock', vehicle })}
              onDelete={(vehicle) => setDialog({ type: 'delete', vehicle })}
            />
          ))}
        </div>
      </main>

      {dialog?.type === 'buy' && (
        <Modal title={`Buy the ${dialog.vehicle.make} ${dialog.vehicle.model}?`} onClose={closeDialog} width="max-w-md">
          <p className="text-gravel">
            You're buying one unit for <strong className="text-asphalt">{formatINR(dialog.vehicle.price)}</strong>.
            Stock drops from {dialog.vehicle.quantity} to {dialog.vehicle.quantity - 1}.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={closeDialog} className="rounded-full px-4 py-2.5 font-medium text-gravel hover:bg-showroom">
              Keep browsing
            </button>
            <button
              type="button"
              onClick={() => confirmPurchase(dialog.vehicle)}
              className="rounded-full bg-marigold px-5 py-2.5 font-semibold text-asphalt hover:bg-marigold-deep"
            >
              Confirm purchase
            </button>
          </div>
        </Modal>
      )}

      {(dialog?.type === 'add' || dialog?.type === 'edit') && (
        <Modal title={dialog.type === 'add' ? 'Add a vehicle' : `Edit the ${dialog.vehicle.model}`} onClose={closeDialog}>
          <VehicleForm initial={dialog.vehicle} categories={categories} onSubmit={saveVehicle} onCancel={closeDialog} />
        </Modal>
      )}

      {dialog?.type === 'restock' && (
        <RestockDialog
          vehicle={dialog.vehicle}
          onClose={closeDialog}
          onDone={(updated, added) => {
            replaceVehicle(updated)
            notify(`Restocked ${added} ${dialog.vehicle.model}. ${updated.quantity} on the lot now.`)
            closeDialog()
          }}
        />
      )}

      {dialog?.type === 'delete' && (
        <Modal title={`Delete the ${dialog.vehicle.model}?`} onClose={closeDialog} width="max-w-md">
          <p className="text-gravel">
            This removes the {dialog.vehicle.make} {dialog.vehicle.model} and its {dialog.vehicle.quantity} units from the
            lot. It can't be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={closeDialog} className="rounded-full px-4 py-2.5 font-medium text-gravel hover:bg-showroom">
              Keep it
            </button>
            <button
              type="button"
              onClick={() => confirmDelete(dialog.vehicle)}
              className="rounded-full bg-brake px-5 py-2.5 font-semibold text-white hover:opacity-90"
            >
              Delete vehicle
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function RestockDialog({ vehicle, onClose, onDone }) {
  const [amount, setAmount] = useState('5')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    const n = Number(amount)
    if (!Number.isInteger(n) || n < 1) return setError('Enter a whole number of 1 or more.')
    try {
      const updated = await api.restock(vehicle.id, n)
      onDone(updated, n)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Modal title={`Restock the ${vehicle.model}`} onClose={onClose} width="max-w-md">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <p className="text-gravel">Currently {vehicle.quantity} on the lot.</p>
        <Field id="restock-qty" label="Units arriving" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
        {error && (
          <p role="alert" className="text-sm text-brake">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 font-medium text-gravel hover:bg-showroom">
            Cancel
          </button>
          <button type="submit" className="rounded-full bg-petrol px-5 py-2.5 font-semibold text-showroom hover:bg-petrol-soft">
            Restock
          </button>
        </div>
      </form>
    </Modal>
  )
}
