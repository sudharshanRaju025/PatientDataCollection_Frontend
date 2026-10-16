import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api, isAbortError } from '../api/client'
import { formatWhen, money } from '../lib/format'
import type { PharmacySummary } from '../types/pharmacy'

export function PharmacyPage() {
  const [summary, setSummary] = useState<PharmacySummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    api<PharmacySummary>('/api/pharmacy/summary', { signal: controller.signal })
      .then(setSummary)
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return
        setError(caught instanceof ApiError ? caught.message : 'The dispensary could not be opened.')
      })
    return () => controller.abort()
  }, [])

  return (
    <div className="page rise">
      <header className="page-head">
        <div>
          <p className="eyebrow">Dispensary</p>
          <h1>Pharmacy counter</h1>
        </div>
        <Link className="button primary" to="/prescriptions/new">New prescription</Link>
      </header>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="stat-row four">
        <article className="stat">
          <span>Charts on file</span>
          <strong>{summary?.patientCount ?? '—'}</strong>
          <small>Your patient records</small>
        </article>
        <article className="stat">
          <span>Waiting to fill</span>
          <strong>{summary?.pendingPrescriptions ?? '—'}</strong>
          <small>Pending scripts</small>
        </article>
        <article className="stat">
          <span>Dispensed today</span>
          <strong>{summary?.dispensedToday ?? '—'}</strong>
          <small>{summary ? money(summary.dispensedValueToday) : 'Counter total'}</small>
        </article>
        <article className="stat">
          <span>Low on the shelf</span>
          <strong>{summary?.lowStockCount ?? '—'}</strong>
          <small>{summary ? `${summary.medicineCount} medicines stocked` : 'Formulary'}</small>
        </article>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <div className="panel-title">
            <h2>Fill queue</h2>
            <Link to="/prescriptions">All scripts</Link>
          </div>
          {summary?.pending.length ? summary.pending.map((script) => (
            <Link key={script.id} className="queue-row" to={`/prescriptions/${script.id}`}>
              <span>
                <strong>{script.patientName}</strong>
                <small>{script.prescriptionNumber} · {script.prescriberName}</small>
              </span>
              <em>{script.itemCount} items · {money(script.total)}</em>
            </Link>
          )) : <p className="muted">No prescriptions are waiting.</p>}
        </section>

        <section className="panel">
          <div className="panel-title">
            <h2>Reorder shelf</h2>
            <Link to="/medicines?low=1">Formulary</Link>
          </div>
          {summary?.lowStock.length ? summary.lowStock.map((medicine) => (
            <Link key={medicine.id} className="queue-row" to={`/medicines/${medicine.id}/edit`}>
              <span>
                <strong>{medicine.name}</strong>
                <small>{medicine.strength} · {medicine.form}</small>
              </span>
              <em className="low">{medicine.stockQuantity} left</em>
            </Link>
          )) : <p className="muted">Every stocked medicine is above its reorder level.</p>}
          {summary ? <p className="stamp">Last counter check {formatWhen(new Date().toISOString())}</p> : null}
        </section>
      </div>
    </div>
  )
}
