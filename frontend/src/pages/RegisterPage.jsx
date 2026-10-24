import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Field from '../components/Field'
import { useAuth } from '../context/AuthContext'
import AuthLayout from './AuthLayout'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Same rules as the backend, checked early so people get instant feedback. */
export function validateRegistration({ full_name, email, password, confirm }) {
  if (full_name.trim().length < 2) return 'Enter your full name.'
  if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email address.'
  if (password.length < 8) return 'Use at least 8 characters for your password.'
  if (password !== confirm) return "Passwords don't match."
  return ''
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    const problem = validateRegistration(form)
    if (problem) return setError(problem)
    setError('')
    setLoading(true)
    try {
      await register({ full_name: form.full_name.trim(), email: form.email.trim(), password: form.password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <AuthLayout heading="Create your account" subheading="You'll sign in with your email address.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field id="full_name" label="Full name" autoComplete="name" value={form.full_name} onChange={set('full_name')} />
        <Field id="email" label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        <Field id="password" label="Password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} hint="At least 8 characters." />
        <Field id="confirm" label="Confirm password" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />

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
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gravel">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-petrol underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
