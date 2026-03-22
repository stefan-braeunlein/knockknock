<script setup lang="ts">
definePageMeta({ layout: false })

const { setAuth } = useAuth()
const { apiFetch } = useApi()
const route = useRoute()

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
    navigateTo((route.query.redirect as string) || '/applicants')
  } catch {
    error.value = 'Ungültige Anmeldedaten.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center">
    <img src="/login-bg.png" alt="" class="absolute inset-0 w-full h-full object-cover" />
    <div class="relative bg-brand-light/90 rounded-2xl shadow-sm p-6 sm:p-10 w-full max-w-sm mx-4 sm:mx-0">
      <div class="text-center mb-8">
        <img src="/knock-knock-logo.svg" alt="Knock Knock Logo" class="w-[100px] h-[100px] mx-auto mb-5" />
        <p class="text-gray-400 text-base">Initiativbewerbungen einfach, schnell und unkompliziert</p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <KkInput v-model="email" type="email" placeholder="E-Mail" required />
        <KkInput v-model="password" type="password" placeholder="Passwort" required />
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" :disabled="loading"
          class="w-full py-2 bg-brand text-white rounded-full font-semibold hover:bg-blue-800 disabled:opacity-50">
          {{ loading ? 'Laden...' : 'Anmelden' }}
        </button>
      </form>
    </div>
  </div>
</template>
