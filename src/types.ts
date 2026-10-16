export type PatientInput = {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  bloodGroup: string
  phone: string
  email: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  emergencyContactName: string
  emergencyContactPhone: string
  allergies: string
  currentMedications: string
  medicalHistory: string
  presentingNotes: string
  insuranceProvider: string
  insuranceNumber: string
  status: string
}

export type PatientSummary = {
  id: number
  medicalRecordNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  bloodGroup: string
  phone: string
  city: string
  status: string
  updatedAtUtc: string
}

export type PatientDetail = PatientSummary & {
  email: string | null
  addressLine: string
  state: string
  postalCode: string
  emergencyContactName: string
  emergencyContactPhone: string
  allergies: string | null
  currentMedications: string | null
  medicalHistory: string | null
  presentingNotes: string | null
  insuranceProvider: string | null
  insuranceNumber: string | null
  createdAtUtc: string
}

export type PatientList = {
  items: PatientSummary[]
  total: number
  page: number
  pageSize: number
}

export type PatientStats = {
  total: number
  active: number
  inactive: number
  updatedToday: number
}

export const emptyPatient = (): PatientInput => ({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'Female',
  bloodGroup: 'Unknown',
  phone: '',
  email: '',
  addressLine: '',
  city: '',
  state: '',
  postalCode: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  allergies: '',
  currentMedications: '',
  medicalHistory: '',
  presentingNotes: '',
  insuranceProvider: '',
  insuranceNumber: '',
  status: 'Active'
})

export function toInput(patient: PatientDetail): PatientInput {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    phone: patient.phone,
    email: patient.email ?? '',
    addressLine: patient.addressLine,
    city: patient.city,
    state: patient.state,
    postalCode: patient.postalCode,
    emergencyContactName: patient.emergencyContactName,
    emergencyContactPhone: patient.emergencyContactPhone,
    allergies: patient.allergies ?? '',
    currentMedications: patient.currentMedications ?? '',
    medicalHistory: patient.medicalHistory ?? '',
    presentingNotes: patient.presentingNotes ?? '',
    insuranceProvider: patient.insuranceProvider ?? '',
    insuranceNumber: patient.insuranceNumber ?? '',
    status: patient.status
  }
}
