const storageKey = 'meridian.session'

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

function apiBase() {
  return (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const raw = sessionStorage.getItem(storageKey)
  if (raw) {
    try {
      const session = JSON.parse(raw) as { token?: string }
      if (session.token) headers.set('Authorization', `Bearer ${session.token}`)
    } catch {
      sessionStorage.removeItem(storageKey)
    }
  }

  const url = `${apiBase()}${path}`
  let response: Response
  try {
    response = await fetch(url, { ...options, headers })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new ApiError(0, `The page could not reach the clinical API at ${url}. Open the site at http://127.0.0.1:5173 while the API is running on http://127.0.0.1:5080.`)
  }

  if (response.status === 401 && !path.endsWith('/login')) {
    sessionStorage.removeItem(storageKey)
    if (!window.location.pathname.startsWith('/login')) {
      window.location.assign('/login')
    }
  }

  if (!response.ok) {
    let message = 'The request could not be completed.'
    let errors: Record<string, string[]> | undefined
    try {
      const payload = await response.json() as { message?: string; errors?: Record<string, string[]> }
      if (payload.message) message = payload.message
      errors = payload.errors
    } catch {
      // The body was empty or not JSON.
    }
    throw new ApiError(response.status, message, errors)
  }

  if (response.status === 204) return undefined as T
  return await response.json() as T
}
