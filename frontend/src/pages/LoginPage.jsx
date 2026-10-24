import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Field from '../components/Field'
import { useAuth } from '../context/AuthContext'
import AuthLayout from './AuthLayout'

// Seeded by backend/seed.py so reviewers can try both roles without signing up.
const DEMO_ACCOUNTS = [
  { label: 'Buyer', email: 'buyer@example.com', password: 'buyer12345' },
  { label: 'Admin', email: 'admin@dealership.com', password: 'admin12345' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Enter your email and password.')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <AuthLayout heading="Log in" subheading="Use the email you registered with.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Field id="password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && (
          <p role="alert" className="rounded-xl bg-brake/10 px-3 py-2 text-sm text-brake">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-marigold px-4 py-3 font-semibold text-asphalt hover:bg-marigold-deep disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gravel">
        New here?{' '}
        <Link to="/register" className="font-semibold text-petrol underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-petrol/25 p-4">
        <p className="text-sm font-medium text-asphalt">Reviewing this project? Fill in a demo account:</p>
        <div className="mt-3 flex gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                setEmail(a.email)
                setPassword(a.password)
              }}
              className="rounded-full border border-petrol/25 px-3 py-1.5 text-sm font-medium text-petrol hover:border-petrol"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}
