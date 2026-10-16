import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { Shell } from './components/Shell'
import { LoginPage } from './pages/LoginPage'
import { MedicineFormPage } from './pages/MedicineFormPage'
import { MedicinesPage } from './pages/MedicinesPage'
import { PatientDetailPage } from './pages/PatientDetailPage'
import { PatientFormPage } from './pages/PatientFormPage'
import { PatientsPage } from './pages/PatientsPage'
import { PharmacyPage } from './pages/PharmacyPage'
import { PrescriptionDetailPage } from './pages/PrescriptionDetailPage'
import { PrescriptionFormPage } from './pages/PrescriptionFormPage'
import { PrescriptionsPage } from './pages/PrescriptionsPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<Shell />}>
          <Route index element={<Navigate to="/pharmacy" replace />} />
          <Route path="pharmacy" element={<PharmacyPage />} />
          <Route path="medicines" element={<MedicinesPage />} />
          <Route path="medicines/new" element={<MedicineFormPage />} />
          <Route path="medicines/:id/edit" element={<MedicineFormPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="prescriptions/new" element={<PrescriptionFormPage />} />
          <Route path="prescriptions/:id" element={<PrescriptionDetailPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/new" element={<PatientFormPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />
          <Route path="patients/:id/edit" element={<PatientFormPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/patients" replace />} />
    </Routes>
  )
}

function RequireAuth() {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}
