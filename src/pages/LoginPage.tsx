import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Mark } from '../components/Mark'

type LoginResponse = {
  token: string
  username: string
  displayName: string
  role: string
  expiresAtUtc: string
}

export function LoginPage() {
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  if (session) return <Navigate to="/patients" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      const result = await api<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })
      login({
        token: result.token,
        username: result.username,
        displayName: result.displayName,
        role: result.role,
        expiresAt: result.expiresAtUtc
      })
      navigate('/patients')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Sign-in failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="login-screen">
      <section className="login-story">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="story-inner">
          <div className="brand light">
            <Mark />
            <div>
              <strong>Meridian</strong>
              <span>Night ward console</span>
            </div>
          </div>
          <p className="eyebrow">Patient data collection</p>
          <h1>Records held in a quiet, clinical light.</h1>
          <p className="lede">
            Open a chart, capture the intake, and revise it later. This console keeps demographics,
            emergency contacts, and clinical notes in your MySQL database.
          </p>
          <svg className="ecg" viewBox="0 0 640 120" aria-hidden="true">
            <polyline points="0,62 70,62 96,62 118,28 142,98 166,62 250,62 274,46 298,62 390,62 414,18 444,104 470,62 640,62" />
          </svg>
          <ul className="story-points">
            <li><b>01</b> Signed clinic access</li>
            <li><b>02</b> Create, review, and update charts</li>
            <li><b>03</b> Same code, any Docker MySQL host</li>
          </ul>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Sign in</p>
          <h2>Welcome back to the ward.</h2>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button primary wide" type="submit" disabled={pending}>
            {pending ? 'Checking credentials…' : 'Enter registry'}
          </button>
          <div className="access-note">
            <span>First-run clinic access</span>
            <strong>admin</strong>
            <strong>Admin@123</strong>
          </div>
        </form>
      </section>
    </div>
  )
}
