import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '@/services/api'
import { Button } from '@/components/primitives/Button'
import { Input } from '@/components/primitives/Input'
import { useAuth } from '@/auth/authContext'

function getLoginMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 403) return 'This account does not have admin access.'
  if (error instanceof ApiError && error.status === 401) return 'Unable to sign in with those credentials.'
  return 'The admin service is unavailable. Check your connection and try again.'
}

export function LoginPage() {
  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = location.state as { reason?: string } | null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(
    locationState?.reason === 'session-expired'
      ? 'Your session expired. Sign in again to continue.'
      : locationState?.reason === 'admin-required'
        ? 'Admin access is required for this workspace.'
        : null,
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      await auth.login({ email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (loginError) {
      setError(getLoginMessage(loginError))
    }
  }

  return <main className="admin-login-page">
    <div className="admin-login-brand"><div className="admin-brand-mark"><img src="/gamecity.png" alt="" /></div><div><strong>Gamecity</strong><span>Admin workspace</span></div></div>
    <section className="admin-login-card" aria-labelledby="admin-login-title">
      <div className="admin-login-intro"><div className="admin-login-icon"><ShieldCheck size={21} aria-hidden="true" /></div><p className="admin-page-eyebrow">Secure workspace</p><h1 id="admin-login-title">Welcome back</h1><p>Sign in to manage GameCity operations.</p></div>
      {error && <div className="admin-login-error" role="alert"><LockKeyhole size={17} aria-hidden="true" /><span>{error}</span></div>}
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <Input label="Email" name="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <Button type="submit" variant="primary" fullWidth disabled={auth.isLoading}>{auth.isLoading ? 'Signing in…' : <>Sign in <ArrowRight size={17} aria-hidden="true" /></>}</Button>
      </form>
      <p className="admin-login-note">Admin access is restricted to authorized GameCity staff.</p>
    </section>
  </main>
}
