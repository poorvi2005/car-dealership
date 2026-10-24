export default function Logo({ className = '' }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="#F2B33D" />
        <path d="M6 20v-3q0-1.5 2.5-1.8l3-.4 3-4.2q.6-.8 1.8-.8h4.4q1 0 1.6.8l2.3 4.2 1.4.3q1.2.3 1.2 1.6V20Z" fill="#0F3D3E" />
        <circle cx="11" cy="21" r="2.6" fill="#F2B33D" stroke="#0F3D3E" strokeWidth="1.5" />
        <circle cx="22" cy="21" r="2.6" fill="#F2B33D" stroke="#0F3D3E" strokeWidth="1.5" />
      </svg>
      <span className="font-badge text-lg font-extrabold">Forecourt</span>
    </span>
  )
}
