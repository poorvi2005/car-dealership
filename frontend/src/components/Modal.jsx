/** Accessible dialog: closes on Escape or backdrop click, and moves focus inside when opened. */
import { useEffect, useRef } from 'react'

export default function Modal({ title, onClose, children, width = 'max-w-lg' }) {
  const panelRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    panelRef.current?.querySelector('input, select, button')?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-petrol/55 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`max-h-[92vh] w-full ${width} overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="font-badge text-xl font-bold text-petrol">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-m-2 rounded-full p-2 text-gravel hover:bg-showroom"
            aria-label="Close"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
