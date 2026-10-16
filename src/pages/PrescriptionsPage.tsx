import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api, isAbortError } from '../api/client'
import { formatWhen, money } from '../lib/format'
import type { PrescriptionList } from '../types/pharmacy'

const filters = ['', 'Pending', 'Dispensed', 'Cancelled']

export function PrescriptionsPage() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState('Pending')
  const [page, setPage] = useState(1)
  const [list, setList] = useState<PrescriptionList | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebounced(query.trim())
      setPage(1)
    }, 250)
    return () => window.clearTimeout(handle)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      search: debounced,
      status,
      page: String(page),
      pageSize: '8'
    })
    api<PrescriptionList>(`/api/prescriptions?${params.toString()}`, { signal: controller.signal })
      .then((next) => {
        setList(next)
        setError('')
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return
        setError(caught instanceof ApiError ? caught.message : 'Prescriptions could not be loaded.')
      })
    return () => controller.abort()
  }, [debounced, status, page])

  const total = list?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / (list?.pageSize ?? 8)))

  return (
    <div className="page rise">
      <header className="page-head">
        <div>
          <p className="eyebrow">Scripts</p>
          <h1>Prescriptions</h1>
        </div>
        <Link className="button primary" to="/prescriptions/new">Write script</Link>
      </header>
      <section className="panel">
        <div className="toolbar">
          <label className="search">
            <span className="sr-only">Search prescriptions</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient, record number, prescriber, or Rx number" />
          </label>
          <div className="filters">
            {filters.map((filter) => (
              <button key={filter || 'all'} type="button" className={status === filter ? 'chip on' : 'chip'} onClick={() => { setStatus(filter); setPage(1) }}>
                {filter || 'All'}
              </button>
            ))}
          </div>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="registry">
          {list?.items.map((script) => (
            <Link key={script.id} className="registry-row script-row" to={`/prescriptions/${script.id}`}>
              <span className="who">
                <strong>{script.patientName}</strong>
                <small>{script.prescriptionNumber}</small>
              </span>
              <span className="meta">{script.medicalRecordNumber}<br />{script.prescriberName}</span>
              <span className={script.status === 'Pending' ? 'status' : script.status === 'Dispensed' ? 'status on' : 'status low'}>{script.status}</span>
              <span className="when">{money(script.total)}<br /><em>{formatWhen(script.createdAtUtc)}</em></span>
            </Link>
          ))}
          {list && total === 0 ? <div className="empty"><h2>No scripts in this tray</h2><p>Write one against a patient chart, or change the filter.</p></div> : null}
        </div>
        <footer className="pager">
          <span>{total === 0 ? 'No prescriptions' : `${total} scripts`}</span>
          <div>
            <button className="button ghost" type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
            <button className="button ghost" type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </footer>
      </section>
    </div>
  )
}
