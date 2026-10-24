/** Shared split-screen layout for the login and register pages. */
import CarSilhouette from '../components/CarSilhouette'
import Logo from '../components/Logo'

const PARADE = [
  { category: 'SUV', paint: '#F2B33D' },
  { category: 'Hatchback', paint: '#2AA59A' },
  { category: 'Coupe', paint: '#C8322E' },
]

export default function AuthLayout({ heading, subheading, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-petrol px-6 py-6 text-showroom sm:px-10 lg:py-10">
        <Logo />
        <div className="my-8 lg:my-0">
          <p className="font-badge max-w-md text-3xl leading-[1.1] font-extrabold sm:text-4xl lg:text-5xl">
            Every car on the lot, one login away.
          </p>
          <p className="mt-4 max-w-sm text-showroom/75">
            Browse live stock, search by make, body type or budget, and buy in two clicks.
          </p>
        </div>
        {/* Cars parked along the bottom edge, like a dealer's front lot. */}
        <div className="hidden grid-cols-3 gap-2 border-t-2 border-dashed border-white/25 pt-4 sm:grid" aria-hidden="true">
          {PARADE.map((car) => (
            <CarSilhouette key={car.category} {...car} />
          ))}
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <h1 className="font-badge text-2xl font-extrabold text-petrol">{heading}</h1>
          <p className="mt-2 text-gravel">{subheading}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
