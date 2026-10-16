export type Medicine = {
  id: number
  name: string
  genericName: string
  strength: string
  form: string
  category: string
  manufacturer: string
  stockQuantity: number
  reorderLevel: number
  unitPrice: number
  requiresPrescription: boolean
  lowStock: boolean
}

export type MedicineList = {
  items: Medicine[]
  total: number
  page: number
  pageSize: number
}

export type MedicineInput = {
  name: string
  genericName: string
  strength: string
  form: string
  category: string
  manufacturer: string
  stockQuantity: string
  reorderLevel: string
  unitPrice: string
  requiresPrescription: boolean
}

export const medicineForms = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Inhaler', 'Drops', 'Sachet']

export const emptyMedicine = (): MedicineInput => ({
  name: '',
  genericName: '',
  strength: '',
  form: 'Tablet',
  category: '',
  manufacturer: '',
  stockQuantity: '0',
  reorderLevel: '10',
  unitPrice: '0',
  requiresPrescription: true
})

export function medicineToInput(medicine: Medicine): MedicineInput {
  return {
    name: medicine.name,
    genericName: medicine.genericName,
    strength: medicine.strength,
    form: medicine.form,
    category: medicine.category,
    manufacturer: medicine.manufacturer,
    stockQuantity: String(medicine.stockQuantity),
    reorderLevel: String(medicine.reorderLevel),
    unitPrice: String(medicine.unitPrice),
    requiresPrescription: medicine.requiresPrescription
  }
}

export type PrescriptionItem = {
  id: number
  medicineId: number
  medicineName: string
  strength: string
  form: string
  dosage: string
  quantity: number
  daysSupply: number
  unitPrice: number
  lineTotal: number
}

export type PrescriptionSummary = {
  id: number
  prescriptionNumber: string
  patientId: number
  patientName: string
  medicalRecordNumber: string
  prescriberName: string
  status: string
  itemCount: number
  total: number
  createdAtUtc: string
  dispensedAtUtc: string | null
}

export type PrescriptionDetail = PrescriptionSummary & {
  notes: string | null
  allergyWarning: string | null
  items: PrescriptionItem[]
}

export type PrescriptionList = {
  items: PrescriptionSummary[]
  total: number
  page: number
  pageSize: number
}

export type PharmacySummary = {
  patientCount: number
  medicineCount: number
  pendingPrescriptions: number
  dispensedToday: number
  lowStockCount: number
  dispensedValueToday: number
  pending: PrescriptionSummary[]
  lowStock: Medicine[]
}

export type ScriptLine = {
  medicineId: string
  dosage: string
  quantity: string
  daysSupply: string
}
