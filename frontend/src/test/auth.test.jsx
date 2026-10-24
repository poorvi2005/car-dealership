/**
 * Login / register flows with the network mocked out: we replace `fetch`
 * with a fake so these tests never need the backend running.
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readableError } from '../api/client'
import { AuthProvider } from '../context/AuthContext'
import LoginPage from '../pages/LoginPage'
import RegisterPage, { validateRegistration } from '../pages/RegisterPage'

function mockFetch(status, body) {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body })
}

function renderAt(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<p>Showroom</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

afterEach(() => vi.restoreAllMocks())

describe('LoginPage', () => {
  it('logs in, stores the token and goes to the showroom', async () => {
    mockFetch(200, { access_token: 'abc.def.ghi', user: { id: 1, email: 'a@b.co', full_name: 'A B', is_admin: false } })
    renderAt('/login')
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Showroom')).toBeInTheDocument()
    expect(localStorage.getItem('forecourt_token')).toBe('abc.def.ghi')
    const [url, options] = fetch.mock.calls[0]
    expect(String(url)).toContain('/api/auth/login')
    expect(JSON.parse(options.body)).toEqual({ email: 'a@b.co', password: 'password123' })
  })

  it('shows the server error on bad credentials', async () => {
    mockFetch(401, { detail: 'Invalid email or password' })
    renderAt('/login')
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.co')
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  })

  it('demo buttons fill the form', async () => {
    renderAt('/login')
    await userEvent.click(screen.getByRole('button', { name: 'Admin' }))
    expect(screen.getByLabelText('Email')).toHaveValue('admin@dealership.com')
  })
})

describe('RegisterPage', () => {
  it('blocks mismatched passwords before calling the API', async () => {
    globalThis.fetch = vi.fn()
    renderAt('/register')
    await userEvent.type(screen.getByLabelText('Full name'), 'Shaurya Kumar')
    await userEvent.type(screen.getByLabelText('Email'), 's@k.in')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'password124')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('alert')).toHaveTextContent("Passwords don't match.")
    expect(fetch).not.toHaveBeenCalled()
  })

  it('validates each rule', () => {
    const ok = { full_name: 'Ana Rao', email: 'ana@x.in', password: 'longenough', confirm: 'longenough' }
    expect(validateRegistration(ok)).toBe('')
    expect(validateRegistration({ ...ok, full_name: 'A' })).toMatch(/name/)
    expect(validateRegistration({ ...ok, email: 'nope' })).toMatch(/email/)
    expect(validateRegistration({ ...ok, password: 'short', confirm: 'short' })).toMatch(/8 characters/)
  })
})

describe('readableError', () => {
  it('turns FastAPI validation lists into a sentence', () => {
    const detail = [{ loc: ['body', 'min_price'], msg: 'Input should be greater than or equal to 0' }]
    expect(readableError(detail)).toBe('min price: Input should be greater than or equal to 0')
  })
  it('passes plain strings through and falls back when empty', () => {
    expect(readableError('Nope')).toBe('Nope')
    expect(readableError(undefined)).toMatch(/Something went wrong/)
  })
})
