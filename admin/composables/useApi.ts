export function useApi() {
  const { state, logout } = useAuth()

  async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(path, {
      ...options,
      headers: {
        ...options.headers,
        ...(state.value.token ? { Authorization: `Bearer ${state.value.token}` } : {}),
        ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {})
      }
    })

    if (res.status === 401) {
      logout()
      throw new Error('Unauthorized')
    }

    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  }

  return { apiFetch }
}
