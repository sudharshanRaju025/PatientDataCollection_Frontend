import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, api, isAbortError } from '../api/client'
import { formatWhen, money } from '../lib/format'
import type { PrescriptionDetail } from '../types/pharmacy'

export function PrescriptionDetailPage() {
  const { id } = useParams()
  const [script, setScript] = useState<PrescriptionDetail | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  function load(controller?: AbortController) {
    return api<PrescriptionDetail>(`/api/prescriptions/${id}`, { signal: controller?.signal })
      .then(setScript)
  }

  useEffect(() => {
    const controller = new AbortController()
    load(controller).catch((caught: unknown) => {
      if (isAbortError(caught)) return
      setError(caught instanceof ApiError ? caught.message : 'This prescription could not be opened.')
    })
    return () => controller.abort()
  }, [id])

  async function act(action: 'dispense' | 'cancel') {
    setBusy(action)
    setError('')
    try {
      setScript(await api<PrescriptionDetail>(`/api/prescriptions/${id}/${action}`, { method: 'POST' }))
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'The counter could not update this script.')
    } finally {
      setBusy('')
    }
  }

  if (!script && !error) return <div className="page"><p className="muted">Opening the script…</p></div>
  if (!script) {
    return <div className="page"><p className="form-error">{error}</p><Link to="/prescriptions">Back to scripts</Link></div>
  }

  return (
    <div className="page rise">
      <Link className="back" to="/prescriptions">← Prescriptions</Link>
      {error ? <p className="form-error">{error}</p> : null}
      {script.allergyWarning ? <p className="form-error">{script.allergyWarning}</p> : null}
      <header className="chart-hero">
        <div>
          <p className="eyebrow">{script.prescriptionNumber}</p>
          <h1>{script.patientName}</h1>
          <p className="lede tight">{script.medicalRecordNumber} · {script.prescriberName}</p>
        </div>
        <div className="hero-side">
          <span className={script.status === 'Dispensed' ? 'status on' : script.status === 'Cancelled' ? 'status low' : 'status'}>{script.status}</span>
          {script.status === 'Pending' ? (
            <>
              <button className="button primary" type="button" disabled={busy !== ''} onClick={() => { void act('dispense') }}>{busy === 'dispense' ? 'Dispensing…' : 'Dispense'}</button>
              <button className="button ghost" type="button" disabled={busy !== ''} onClick={() => { void act('cancel') }}>Cancel script</button>
            </>
          ) : null}
        </div>
      </header>
      <section className="panel">
        <h2>Items to fill</h2>
        <div className="line-table">
          {script.items.map((item) => (
            <div key={item.id} className="line-row">
              <span><strong>{item.medicineName}</strong><small>{item.strength} · {item.form}<br />{item.dosage}</small></span>
              <span>{item.quantity} × {item.daysSupply} days</span>
              <span>{money(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <p className="total-line">Counter total {money(script.total)}</p>
        {script.notes ? <p className="stamp">{script.notes}</p> : null}
        <p className="stamp">Written {formatWhen(script.createdAtUtc)}{script.dispensedAtUtc ? ` · Dispensed ${formatWhen(script.dispensedAtUtc)}` : ''}</p>
        <Link to={`/patients/${script.patientId}`}>Open patient chart</Link>
      </section>
    </div>
  )
}
