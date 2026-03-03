<script setup lang="ts">
const { apiFetch } = useApi()

interface User {
  id: string
  email: string
  role: string
  tenantName: string | null
  createdAt: string
}

interface Tenant {
  id: string
  name: string
}

const users = ref<User[]>([])
const tenants = ref<Tenant[]>([])
const newEmail = ref('')
const newPassword = ref('')
const newTenantId = ref<string | undefined>()
const newRole = ref<'CompanyUser' | 'SuperAdmin'>('CompanyUser')

async function load() {
  users.value = await apiFetch<User[]>('/api/users')
  tenants.value = await apiFetch<Tenant[]>('/api/tenants')
}

async function create() {
  await apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      email: newEmail.value,
      password: newPassword.value,
      tenantId: newRole.value === 'CompanyUser' ? newTenantId.value : null,
      role: newRole.value === 'SuperAdmin' ? 1 : 0
    })
  })
  newEmail.value = ''
  newPassword.value = ''
  newTenantId.value = undefined
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-blue-900 mb-6 underline underline-offset-4 decoration-2">Benutzer</h1>

    <!-- Create form -->
    <form @submit.prevent="create" class="flex flex-wrap gap-3 mb-8">
      <input v-model="newEmail" type="email" placeholder="E-Mail" required
        class="px-4 py-2 border border-gray-200 rounded-lg" />
      <input v-model="newPassword" type="password" placeholder="Passwort" required
        class="px-4 py-2 border border-gray-200 rounded-lg" />
      <select v-model="newRole" class="px-4 py-2 border border-gray-200 rounded-lg">
        <option value="CompanyUser">Unternehmens-Benutzer</option>
        <option value="SuperAdmin">Super Admin</option>
      </select>
      <select v-if="newRole === 'CompanyUser'" v-model="newTenantId"
        class="px-4 py-2 border border-gray-200 rounded-lg">
        <option disabled :value="undefined">Unternehmen wählen...</option>
        <option v-for="t in tenants" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <button type="submit" class="px-6 py-2 bg-[#0B56CF] text-white rounded-lg font-semibold hover:bg-blue-800">
        Erstellen
      </button>
    </form>

    <!-- Table -->
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-gray-500 border-b">
          <th class="py-2 font-medium">E-Mail</th>
          <th class="py-2 font-medium">Rolle</th>
          <th class="py-2 font-medium">Unternehmen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id" class="border-b border-gray-100">
          <td class="py-3">{{ u.email }}</td>
          <td class="py-3">{{ u.role === 'SuperAdmin' ? 'Super Admin' : 'Benutzer' }}</td>
          <td class="py-3">{{ u.tenantName ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
