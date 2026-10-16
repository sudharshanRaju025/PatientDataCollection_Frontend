import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api, isAbortError } from '../api/client'
import { ageFrom, formatDate, formatWhen, initials } from '../lib/format'
import type { PatientList, PatientStats } from '../types'

const filters = ['', 'Active', 'Inactive']

export function PatientsPage() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [list, setList] = useState<PatientList | null>(null)
  const [stats, setStats] = useState<PatientStats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebounced(query.trim())
      setPage(1)
    }, 250)
    return () => window.clearTimeout(handle)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const params = new URLSearchParams({
      search: debounced,
      status,
      page: String(page),
      pageSize: '8'
    })

    Promise.all([
      api<PatientList>(`/api/patients?${params.toString()}`, { signal: controller.signal }),
      api<PatientStats>('/api/patients/stats', { signal: controller.signal })
    ])
      .then(([nextList, nextStats]) => {
        setList(nextList)
        setStats(nextStats)
        setError('')
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return
        setError(caught instanceof ApiError ? caught.message : 'The registry could not be loaded.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [debounced, status, page])

  const total = list?.total ?? 0
  const pageSize = list?.pageSize ?? 8
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="page rise">
      <header className="page-head">
        <div>
          <p className="eyebrow">Clinical registry</p>
          <h1>Patient charts</h1>
        </div>
        <Link className="button primary" to="/patients/new">New patient</Link>
      </header>

      <section className="stat-row">
        <Stat label="On record" value={stats?.total} hint="All charts" />
        <Stat label="Active" value={stats?.active} hint="Open for care" />
        <Stat label="Updated today" value={stats?.updatedToday} hint="Touched this day" />
      </section>

      <section className="panel">
        <div className="toolbar">
          <label className="search">
            <span className="sr-only">Search patients</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, record number, phone, or city"
            />
          </label>
          <div className="filters" role="tablist" aria-label="Status">
            {filters.map((filter) => (
              <button
                key={filter || 'all'}
                type="button"
                className={status === filter ? 'chip on' : 'chip'}
                onClick={() => {
                  setStatus(filter)
                  setPage(1)
                }}
              >
                {filter || 'All'}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className={loading ? 'registry loading' : 'registry'}>
          {list?.items.map((patient) => {
            const age = ageFrom(patient.dateOfBirth)
            return (
              <Link key={patient.id} className="registry-row" to={`/patients/${patient.id}`}>
                <span className="avatar">{initials(patient.firstName, patient.lastName)}</span>
                <span className="who">
                  <strong>{patient.firstName} {patient.lastName}</strong>
                  <small>{patient.medicalRecordNumber}</small>
                </span>
                <span className="meta">{age === null ? 'Age unknown' : `${age} yrs`} · {patient.gender}</span>
                <span className="blood">{patient.bloodGroup}</span>
                <span className="meta">{patient.phone}<br />{patient.city}</span>
                <span className={patient.status === 'Active' ? 'status on' : 'status'}>{patient.status}</span>
                <span className="when">{formatWhen(patient.updatedAtUtc)}<br /><em>{formatDate(patient.dateOfBirth)}</em></span>
              </Link>
            )
          })}
          {!loading && total === 0 ? (
            <div className="empty">
              <h2>No charts in this view</h2>
              <p>Create the first patient record, or widen the search.</p>
            </div>
          ) : null}
        </div>

        <footer className="pager">
          <span>{total === 0 ? 'No records' : `${from}–${to} of ${total}`}</span>
          <div>
            <button className="button ghost" type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
            <button className="button ghost" type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </footer>
      </section>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value?: number; hint: string }) {
  return (
    <article className="stat">
      <span>{label}</span>
      <strong>{value ?? '—'}</strong>
      <small>{hint}</small>
    </article>
  )
}
