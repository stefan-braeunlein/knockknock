<script setup lang="ts">
definePageMeta({ layout: false })

const { setAuth } = useAuth()
const { apiFetch } = useApi()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const data = await apiFetch<{ token: string; role: string; tenantName: string | null }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    setAuth(data.token, data.role, data.tenantName)
    navigateTo('/applicants')
  } catch {
    error.value = 'Ungültige Anmeldedaten.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-sm p-10 w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-blue-700">Knock Knock</h1>
        <p class="text-gray-500 text-sm mt-1">Admin Login</p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <input v-model="email" type="email" placeholder="E-Mail" required
          class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input v-model="password" type="password" placeholder="Passwort" required
          class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" :disabled="loading"
          class="w-full py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
          {{ loading ? 'Laden...' : 'Anmelden' }}
        </button>
      </form>
    </div>
  </div>
</template>
