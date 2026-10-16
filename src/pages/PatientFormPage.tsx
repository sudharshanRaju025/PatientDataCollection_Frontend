import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, api, isAbortError } from '../api/client'
import { PatientForm } from '../components/PatientForm'
import { emptyPatient, toInput } from '../types'
import type { PatientDetail, PatientInput } from '../types'

export function PatientFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [value, setValue] = useState<PatientInput>(emptyPatient())
  const [recordNumber, setRecordNumber] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    api<PatientDetail>(`/api/patients/${id}`, { signal: controller.signal })
      .then((patient) => {
        setValue(toInput(patient))
        setRecordNumber(patient.medicalRecordNumber)
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return
        setMessage(caught instanceof ApiError ? caught.message : 'This chart could not be opened.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [id])

  async function save() {
    const nextErrors = validate(value)
    setErrors(nextErrors)
    setMessage('')
    if (Object.keys(nextErrors).length > 0) {
      setMessage('Please check the highlighted fields.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...value,
        email: value.email.trim() || null,
        allergies: value.allergies.trim() || null,
        currentMedications: value.currentMedications.trim() || null,
        medicalHistory: value.medicalHistory.trim() || null,
        presentingNotes: value.presentingNotes.trim() || null,
        insuranceProvider: value.insuranceProvider.trim() || null,
        insuranceNumber: value.insuranceNumber.trim() || null
      }
      const saved = await api<PatientDetail>(isEdit ? `/api/patients/${id}` : '/api/patients', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      })
      navigate(`/patients/${saved.id}`, { state: { saved: true } })
    } catch (caught) {
      if (caught instanceof ApiError) {
        setMessage(caught.message)
        setErrors(caught.errors ?? {})
      } else {
        setMessage('The chart could not be saved.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page rise">
      <Link className="back" to={isEdit ? `/patients/${id}` : '/patients'}>← {isEdit ? 'Chart' : 'Registry'}</Link>
      <header className="page-head">
        <div>
          <p className="eyebrow">{isEdit ? 'Update' : 'Create'}</p>
          <h1>{isEdit ? 'Revise this chart' : 'New patient chart'}</h1>
        </div>
      </header>
      {message ? <p className="form-error">{message}</p> : null}
      {loading ? <p className="muted">Opening the chart…</p> : (
        <PatientForm
          mode={isEdit ? 'edit' : 'create'}
          recordNumber={recordNumber || undefined}
          value={value}
          errors={errors}
          submitting={submitting}
          onChange={setValue}
          onSubmit={() => { void save() }}
          onCancel={() => navigate(isEdit ? `/patients/${id}` : '/patients')}
        />
      )}
    </div>
  )
}

function validate(value: PatientInput) {
  const errors: Record<string, string[]> = {}
  const required: Array<[keyof PatientInput, string]> = [
    ['firstName', 'Enter a first name.'],
    ['lastName', 'Enter a last name.'],
    ['dateOfBirth', 'Enter a date of birth.'],
    ['phone', 'Enter a phone number.'],
    ['addressLine', 'Enter an address.'],
    ['city', 'Enter a city.'],
    ['state', 'Enter a state.'],
    ['postalCode', 'Enter a postal code.'],
    ['emergencyContactName', 'Enter an emergency contact.'],
    ['emergencyContactPhone', 'Enter an emergency phone.']
  ]
  for (const [key, message] of required) {
    if (!value[key].trim()) errors[key] = [message]
  }
  if (value.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) {
    errors.email = ['Enter a valid email address.']
  }
  return errors
}
