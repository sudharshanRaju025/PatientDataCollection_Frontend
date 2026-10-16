import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Mark } from './Mark'

export function Shell() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const registryActive = pathname === '/patients' || /^\/patients\/\d+/.test(pathname)
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  return (
    <div className="app-shell">
      <aside className="rail">
        <div className="brand">
          <Mark size={40} />
          <div>
            <strong>Meridian</strong>
            <span>Pharmacy counter</span>
          </div>
        </div>

        <nav className="rail-nav">
          <NavLink to="/pharmacy" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <BottleIcon />
            Dispensary
          </NavLink>
          <NavLink to="/prescriptions" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <ScriptIcon />
            Prescriptions
          </NavLink>
          <NavLink to="/medicines" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <ShelfIcon />
            Formulary
          </NavLink>
          <NavLink to="/patients" end className={() => `nav-link${registryActive ? ' active' : ''}`}>
            <ChartIcon />
            Registry
          </NavLink>
          <NavLink to="/patients/new" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <PlusIcon />
            New record
          </NavLink>
        </nav>

        <div className="rail-foot">
          <p className="ward-date">{today}</p>
          <div className="user-chip">
            <span>{session?.displayName.charAt(0) ?? 'C'}</span>
            <div>
              <strong>{session?.displayName}</strong>
              <small>{session?.role}</small>
            </div>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="workspace">
        <Outlet />
      </main>
    </div>
  )
}

function BottleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3h6M10 3v3l-3 3v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9l-3-3V3" />
      <path d="M8 13h8" />
    </svg>
  )
}

function ScriptIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5z" />
      <path d="M14 3.5V8h4.5M8 12h8M8 16h5" />
    </svg>
  )
}

function ShelfIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
      <path d="M7 7V4h3v3M14 12V9h3v3M8 17v-3h4v3" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v12.5H8A3 3 0 0 0 5 16.5z" />
      <path d="M8 4.5v12" />
      <path d="M10.5 9h4M10.5 12.5h4" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6v12M6 12h12" />
    </svg>
  )
}
