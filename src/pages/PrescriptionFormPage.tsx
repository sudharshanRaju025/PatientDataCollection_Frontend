import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, api, isAbortError } from '../api/client'
import type { MedicineList, PrescriptionDetail, ScriptLine } from '../types/pharmacy'
import type { PatientList } from '../types'

const blankLine = (): ScriptLine => ({ medicineId: '', dosage: '1 tablet twice daily', quantity: '10', daysSupply: '5' })

export function PrescriptionFormPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [patientQuery, setPatientQuery] = useState('')
  const [patients, setPatients] = useState<PatientList['items']>([])
  const [patientId, setPatientId] = useState(params.get('patientId') ?? '')
  const [patientLabel, setPatientLabel] = useState('')
  const [prescriber, setPrescriber] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<ScriptLine[]>([blankLine()])
  const [medicines, setMedicines] = useState<MedicineList['items']>([])
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    api<MedicineList>('/api/medicines?pageSize=100', { signal: controller.signal })
      .then((list) => setMedicines(list.items))
      .catch((caught: unknown) => {
        if (!isAbortError(caught)) setMessage(caught instanceof ApiError ? caught.message : 'The shelf could not be loaded.')
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!patientId) return
    const controller = new AbortController()
    api<{ firstName: string; lastName: string; medicalRecordNumber: string }>(`/api/patients/${patientId}`, { signal: controller.signal })
      .then((patient) => setPatientLabel(`${patient.firstName} ${patient.lastName} · ${patient.medicalRecordNumber}`))
      .catch(() => undefined)
    return () => controller.abort()
  }, [patientId])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (patientQuery.trim().length < 2) {
        setPatients([])
        return
      }
      const search = new URLSearchParams({ search: patientQuery.trim(), page: '1', pageSize: '6' })
      api<PatientList>(`/api/patients?${search.toString()}`)
        .then((list) => setPatients(list.items))
        .catch(() => setPatients([]))
    }, 250)
    return () => window.clearTimeout(handle)
  }, [patientQuery])

  function updateLine(index: number, patch: Partial<ScriptLine>) {
    setLines((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line))
  }

  async function save() {
    setMessage('')
    if (!patientId) {
      setMessage('Choose a patient from the registry.')
      return
    }
    setSaving(true)
    try {
      const saved = await api<PrescriptionDetail>('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          patientId: Number(patientId),
          prescriberName: prescriber,
          notes,
          items: lines.filter((line) => line.medicineId).map((line) => ({
            medicineId: Number(line.medicineId),
            dosage: line.dosage,
            quantity: Number(line.quantity),
            daysSupply: Number(line.daysSupply)
          }))
        })
      })
      navigate(`/prescriptions/${saved.id}`)
    } catch (caught) {
      setMessage(caught instanceof ApiError ? caught.message : 'The prescription could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page rise">
      <Link className="back" to="/prescriptions">← Prescriptions</Link>
      <header className="page-head">
        <div>
          <p className="eyebrow">New script</p>
          <h1>Write a prescription</h1>
        </div>
      </header>
      {message ? <p className="form-error">{message}</p> : null}
      <form className="chart-form" onSubmit={(event) => { event.preventDefault(); void save() }}>
        <section>
          <div className="form-grid">
            <label className="field wide">Find a patient
              <input value={patientQuery} onChange={(event) => setPatientQuery(event.target.value)} placeholder="Type a name or record number" />
            </label>
            {patients.length > 0 ? (
              <div className="suggest wide">
                {patients.map((patient) => (
                  <button key={patient.id} type="button" onClick={() => { setPatientId(String(patient.id)); setPatientLabel(`${patient.firstName} ${patient.lastName} · ${patient.medicalRecordNumber}`); setPatients([]) }}>
                    {patient.firstName} {patient.lastName} · {patient.medicalRecordNumber}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="mrn-lock wide">{patientLabel || 'No chart selected yet. The search uses your existing patient records.'}</p>
            <label className="field">Prescriber<input value={prescriber} onChange={(event) => setPrescriber(event.target.value)} /></label>
            <label className="field">Notes<input value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          </div>
        </section>
        <section>
          <header className="section-head"><span>Rx</span><div><h2>Medicines</h2><p>Each line is filled from the formulary.</p></div></header>
          {lines.map((line, index) => (
            <div className="form-grid line-editor" key={index}>
              <label className="field">Medicine
                <select value={line.medicineId} onChange={(event) => updateLine(index, { medicineId: event.target.value })}>
                  <option value="">Select</option>
                  {medicines.map((medicine) => <option key={medicine.id} value={medicine.id}>{medicine.name} · {medicine.strength} ({medicine.stockQuantity})</option>)}
                </select>
              </label>
              <label className="field">Dosage<input value={line.dosage} onChange={(event) => updateLine(index, { dosage: event.target.value })} /></label>
              <label className="field">Quantity<input type="number" min="1" value={line.quantity} onChange={(event) => updateLine(index, { quantity: event.target.value })} /></label>
              <label className="field">Days<input type="number" min="1" value={line.daysSupply} onChange={(event) => updateLine(index, { daysSupply: event.target.value })} /></label>
            </div>
          ))}
          <button className="button ghost" type="button" onClick={() => setLines((current) => [...current, blankLine()])}>Add another medicine</button>
        </section>
        <div className="form-actions">
          <button className="button ghost" type="button" onClick={() => navigate('/prescriptions')}>Cancel</button>
          <button className="button primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save prescription'}</button>
        </div>
      </form>
    </div>
  )
}
