import type { FormEvent, ReactNode } from 'react'
import type { PatientInput } from '../types'

const genders = ['Female', 'Male', 'Other', 'Prefer not to say']
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']

type PatientFormProps = {
  mode: 'create' | 'edit'
  recordNumber?: string
  value: PatientInput
  errors: Record<string, string[]>
  submitting: boolean
  onChange: (value: PatientInput) => void
  onSubmit: () => void
  onCancel: () => void
}

export function PatientForm({
  mode,
  recordNumber,
  value,
  errors,
  submitting,
  onChange,
  onSubmit,
  onCancel
}: PatientFormProps) {
  function update<K extends keyof PatientInput>(key: K, next: PatientInput[K]) {
    onChange({ ...value, [key]: next })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="chart-form" onSubmit={handleSubmit}>
      <section>
        <header className="section-head">
          <span>01</span>
          <div>
            <h2>Identity</h2>
            <p>Who this record belongs to.</p>
          </div>
        </header>
        {recordNumber ? <p className="mrn-lock">Medical record <strong>{recordNumber}</strong></p> : <p className="mrn-lock">A medical record number is assigned when you save.</p>}
        <div className="form-grid">
          <Field label="First name" error={errors.firstName?.[0]}>
            <input value={value.firstName} onChange={(event) => update('firstName', event.target.value)} autoComplete="given-name" />
          </Field>
          <Field label="Last name" error={errors.lastName?.[0]}>
            <input value={value.lastName} onChange={(event) => update('lastName', event.target.value)} autoComplete="family-name" />
          </Field>
          <Field label="Date of birth" error={errors.dateOfBirth?.[0]}>
            <input type="date" value={value.dateOfBirth} onChange={(event) => update('dateOfBirth', event.target.value)} />
          </Field>
          <Field label="Gender" error={errors.gender?.[0]}>
            <select value={value.gender} onChange={(event) => update('gender', event.target.value)}>
              {genders.map((gender) => <option key={gender}>{gender}</option>)}
            </select>
          </Field>
          <Field label="Blood group" error={errors.bloodGroup?.[0]}>
            <select value={value.bloodGroup} onChange={(event) => update('bloodGroup', event.target.value)}>
              {bloodGroups.map((group) => <option key={group}>{group}</option>)}
            </select>
          </Field>
          <Field label="Chart status" error={errors.status?.[0]}>
            <select value={value.status} onChange={(event) => update('status', event.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </Field>
        </div>
      </section>

      <section>
        <header className="section-head">
          <span>02</span>
          <div>
            <h2>Contact</h2>
            <p>How to reach the patient.</p>
          </div>
        </header>
        <div className="form-grid">
          <Field label="Phone" error={errors.phone?.[0]}>
            <input value={value.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" />
          </Field>
          <Field label="Email" error={errors.email?.[0]}>
            <input type="email" value={value.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" />
          </Field>
          <Field label="Address" error={errors.addressLine?.[0]} wide>
            <input value={value.addressLine} onChange={(event) => update('addressLine', event.target.value)} autoComplete="street-address" />
          </Field>
          <Field label="City" error={errors.city?.[0]}>
            <input value={value.city} onChange={(event) => update('city', event.target.value)} />
          </Field>
          <Field label="State" error={errors.state?.[0]}>
            <input value={value.state} onChange={(event) => update('state', event.target.value)} />
          </Field>
          <Field label="Postal code" error={errors.postalCode?.[0]}>
            <input value={value.postalCode} onChange={(event) => update('postalCode', event.target.value)} />
          </Field>
        </div>
      </section>

      <section>
        <header className="section-head">
          <span>03</span>
          <div>
            <h2>Emergency and coverage</h2>
            <p>Who to call, and how the visit is covered.</p>
          </div>
        </header>
        <div className="form-grid">
          <Field label="Emergency contact" error={errors.emergencyContactName?.[0]}>
            <input value={value.emergencyContactName} onChange={(event) => update('emergencyContactName', event.target.value)} />
          </Field>
          <Field label="Emergency phone" error={errors.emergencyContactPhone?.[0]}>
            <input value={value.emergencyContactPhone} onChange={(event) => update('emergencyContactPhone', event.target.value)} />
          </Field>
          <Field label="Insurance provider" error={errors.insuranceProvider?.[0]}>
            <input value={value.insuranceProvider} onChange={(event) => update('insuranceProvider', event.target.value)} />
          </Field>
          <Field label="Insurance number" error={errors.insuranceNumber?.[0]}>
            <input value={value.insuranceNumber} onChange={(event) => update('insuranceNumber', event.target.value)} />
          </Field>
        </div>
      </section>

      <section>
        <header className="section-head">
          <span>04</span>
          <div>
            <h2>Clinical notes</h2>
            <p>Allergies, medicines, history, and why they are here.</p>
          </div>
        </header>
        <div className="form-grid">
          <Field label="Allergies" error={errors.allergies?.[0]} wide>
            <textarea value={value.allergies} onChange={(event) => update('allergies', event.target.value)} rows={3} />
          </Field>
          <Field label="Current medications" error={errors.currentMedications?.[0]} wide>
            <textarea value={value.currentMedications} onChange={(event) => update('currentMedications', event.target.value)} rows={3} />
          </Field>
          <Field label="Medical history" error={errors.medicalHistory?.[0]} wide>
            <textarea value={value.medicalHistory} onChange={(event) => update('medicalHistory', event.target.value)} rows={4} />
          </Field>
          <Field label="Presenting notes" error={errors.presentingNotes?.[0]} wide>
            <textarea value={value.presentingNotes} onChange={(event) => update('presentingNotes', event.target.value)} rows={4} />
          </Field>
        </div>
      </section>

      <div className="form-actions">
        <button className="button ghost" type="button" onClick={onCancel}>Cancel</button>
        <button className="button primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : mode === 'create' ? 'Create record' : 'Update record'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span>{label}</span>
      {children}
      {error ? <small>{error}</small> : null}
    </label>
  )
}
