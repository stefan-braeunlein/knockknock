interface AuthState {
  token: string | null
  role: string | null
  tenantName: string | null
}

export function useAuth() {
  const state = useState<AuthState>('auth', () => ({
    token: import.meta.client ? localStorage.getItem('kk_token') : null,
    role: import.meta.client ? localStorage.getItem('kk_role') : null,
    tenantName: import.meta.client ? localStorage.getItem('kk_tenant_name') : null
  }))

  function setAuth(token: string, role: string, tenantName: string | null) {
    state.value = { token, role, tenantName }
    localStorage.setItem('kk_token', token)
    localStorage.setItem('kk_role', role)
    if (tenantName) localStorage.setItem('kk_tenant_name', tenantName)
  }

  function logout() {
    state.value = { token: null, role: null, tenantName: null }
    localStorage.removeItem('kk_token')
    localStorage.removeItem('kk_role')
    localStorage.removeItem('kk_tenant_name')
    navigateTo('/login')
  }

  const isAuthenticated = computed(() => !!state.value.token)
  const isSuperAdmin = computed(() => state.value.role === 'SuperAdmin')

  return { state, setAuth, logout, isAuthenticated, isSuperAdmin }
}
