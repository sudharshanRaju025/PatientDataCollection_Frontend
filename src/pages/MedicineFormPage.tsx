import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, api, isAbortError } from '../api/client'
import { emptyMedicine, medicineForms, medicineToInput } from '../types/pharmacy'
import type { Medicine, MedicineInput } from '../types/pharmacy'

export function MedicineFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [value, setValue] = useState<MedicineInput>(emptyMedicine())
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    api<Medicine>(`/api/medicines/${id}`, { signal: controller.signal })
      .then((medicine) => setValue(medicineToInput(medicine)))
      .catch((caught: unknown) => {
        if (isAbortError(caught)) return
        setMessage(caught instanceof ApiError ? caught.message : 'This medicine could not be opened.')
      })
    return () => controller.abort()
  }, [id])

  function update<K extends keyof MedicineInput>(key: K, next: MedicineInput[K]) {
    setValue((current) => ({ ...current, [key]: next }))
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const saved = await api<Medicine>(isEdit ? `/api/medicines/${id}` : '/api/medicines', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...value,
          stockQuantity: Number(value.stockQuantity),
          reorderLevel: Number(value.reorderLevel),
          unitPrice: Number(value.unitPrice)
        })
      })
      navigate(`/medicines/${saved.id}/edit`)
      setMessage('The shelf was updated.')
    } catch (caught) {
      setMessage(caught instanceof ApiError ? caught.message : 'The medicine could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page rise">
      <Link className="back" to="/medicines">← Formulary</Link>
      <header className="page-head">
        <div>
          <p className="eyebrow">{isEdit ? 'Update stock' : 'New product'}</p>
          <h1>{isEdit ? value.name || 'Medicine' : 'Add to the shelf'}</h1>
        </div>
      </header>
      {message ? <p className={message.includes('updated') ? 'banner' : 'form-error'}>{message}</p> : null}
      <form className="chart-form" onSubmit={save}>
        <section>
          <div className="form-grid">
            <label className="field">Name<input value={value.name} onChange={(event) => update('name', event.target.value)} /></label>
            <label className="field">Generic name<input value={value.genericName} onChange={(event) => update('genericName', event.target.value)} /></label>
            <label className="field">Strength<input value={value.strength} onChange={(event) => update('strength', event.target.value)} /></label>
            <label className="field">Form
              <select value={value.form} onChange={(event) => update('form', event.target.value)}>
                {medicineForms.map((form) => <option key={form}>{form}</option>)}
              </select>
            </label>
            <label className="field">Category<input value={value.category} onChange={(event) => update('category', event.target.value)} /></label>
            <label className="field">Manufacturer<input value={value.manufacturer} onChange={(event) => update('manufacturer', event.target.value)} /></label>
            <label className="field">Stock<input type="number" min="0" value={value.stockQuantity} onChange={(event) => update('stockQuantity', event.target.value)} /></label>
            <label className="field">Reorder level<input type="number" min="0" value={value.reorderLevel} onChange={(event) => update('reorderLevel', event.target.value)} /></label>
            <label className="field">Unit price (INR)<input type="number" min="0" step="0.01" value={value.unitPrice} onChange={(event) => update('unitPrice', event.target.value)} /></label>
            <label className="field check">
              <input type="checkbox" checked={value.requiresPrescription} onChange={(event) => update('requiresPrescription', event.target.checked)} />
              Requires a prescription
            </label>
          </div>
        </section>
        <div className="form-actions">
          <button className="button ghost" type="button" onClick={() => navigate('/medicines')}>Cancel</button>
          <button className="button primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save medicine'}</button>
        </div>
      </form>
    </div>
  )
}
