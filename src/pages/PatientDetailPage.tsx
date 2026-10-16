import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError, api, isAbortError } from '../api/client'
import { ageFrom, formatDate, formatWhen, initials } from '../lib/format'
import type { PatientDetail } from '../types'

export function PatientDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const saved = Boolean((location.state as { saved?: boolean } | null)?.saved)
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    api<PatientDetail>(`/api/patients/${id}`, { signal: controller.signal })
      .then(setPatient)
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return
        setError(caught instanceof ApiError ? caught.message : 'This chart could not be opened.')
      })
    return () => controller.abort()
  }, [id])

  if (error) {
    return (
      <div className="page">
        <p className="form-error">{error}</p>
        <Link to="/patients">Back to registry</Link>
      </div>
    )
  }

  if (!patient) {
    return <div className="page"><p className="muted">Opening the chart…</p></div>
  }

  const age = ageFrom(patient.dateOfBirth)

  return (
    <div className="page rise">
      <Link className="back" to="/patients">← Registry</Link>
      {saved ? <p className="banner">The chart was saved.</p> : null}
      <header className="chart-hero">
        <span className="avatar large">{initials(patient.firstName, patient.lastName)}</span>
        <div>
          <p className="eyebrow">{patient.medicalRecordNumber}</p>
          <h1>{patient.firstName} {patient.lastName}</h1>
          <p className="lede tight">
            {age === null ? 'Age unknown' : `${age} years`} · {patient.gender} · Born {formatDate(patient.dateOfBirth)}
          </p>
        </div>
        <div className="hero-side">
          <span className="blood large">{patient.bloodGroup}</span>
          <span className={patient.status === 'Active' ? 'status on' : 'status'}>{patient.status}</span>
          <Link className="button ghost" to={`/prescriptions/new?patientId=${patient.id}`}>Write prescription</Link>
          <Link className="button primary" to={`/patients/${patient.id}/edit`}>Update chart</Link>
        </div>
      </header>

      <div className="detail-grid">
        <section className="panel">
          <h2>Demographics</h2>
          <dl>
            <Fact label="Phone" value={patient.phone} />
            <Fact label="Email" value={patient.email} />
            <Fact label="City" value={patient.city} />
            <Fact label="Address" value={`${patient.addressLine}, ${patient.city}, ${patient.state} ${patient.postalCode}`} />
          </dl>
        </section>
        <section className="panel">
          <h2>Emergency</h2>
          <dl>
            <Fact label="Contact" value={patient.emergencyContactName} />
            <Fact label="Phone" value={patient.emergencyContactPhone} />
            <Fact label="Insurance" value={patient.insuranceProvider} />
            <Fact label="Member number" value={patient.insuranceNumber} />
          </dl>
        </section>
        <section className="panel wide">
          <h2>Clinical notes</h2>
          <div className="notes">
            <Note label="Allergies" value={patient.allergies} />
            <Note label="Current medications" value={patient.currentMedications} />
            <Note label="Medical history" value={patient.medicalHistory} />
            <Note label="Presenting notes" value={patient.presentingNotes} />
          </div>
          <p className="stamp">Opened {formatWhen(patient.createdAtUtc)} · Last updated {formatWhen(patient.updatedAtUtc)}</p>
        </section>
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value?.trim() ? value : '—'}</dd>
    </div>
  )
}

function Note({ label, value }: { label: string; value?: string | null }) {
  return (
    <article>
      <h3>{label}</h3>
      <p>{value?.trim() ? value : 'Nothing recorded.'}</p>
    </article>
  )
}
