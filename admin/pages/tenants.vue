<script setup lang="ts">
const { apiFetch } = useApi()

interface Tenant {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: string
}

const tenants = ref<Tenant[]>([])
const newName = ref('')
const newSlug = ref('')

async function load() {
  tenants.value = await apiFetch<Tenant[]>('/api/tenants')
}

async function create() {
  await apiFetch('/api/tenants', {
    method: 'POST',
    body: JSON.stringify({ name: newName.value, slug: newSlug.value })
  })
  newName.value = ''
  newSlug.value = ''
  await load()
}

async function toggleActive(t: Tenant) {
  await apiFetch(`/api/tenants/${t.id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: t.name, isActive: !t.isActive })
  })
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Unternehmen</h1>

    <!-- Create form -->
    <form @submit.prevent="create" class="flex gap-3 mb-8">
      <input v-model="newName" placeholder="Name" required
        class="px-4 py-2 border border-gray-200 rounded-lg flex-1" />
      <input v-model="newSlug" placeholder="Slug (für Widget)" required
        class="px-4 py-2 border border-gray-200 rounded-lg flex-1" />
      <button type="submit" class="px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800">
        Erstellen
      </button>
    </form>

    <!-- Table -->
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-gray-500 border-b">
          <th class="py-2 font-medium">Name</th>
          <th class="py-2 font-medium">Slug</th>
          <th class="py-2 font-medium">Status</th>
          <th class="py-2 font-medium">Aktion</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in tenants" :key="t.id" class="border-b border-gray-100">
          <td class="py-3">{{ t.name }}</td>
          <td class="py-3 font-mono text-gray-500">{{ t.slug }}</td>
          <td class="py-3">
            <span :class="t.isActive ? 'text-green-600' : 'text-red-500'">
              {{ t.isActive ? 'Aktiv' : 'Inaktiv' }}
            </span>
          </td>
          <td class="py-3">
            <button @click="toggleActive(t)" class="text-blue-600 hover:underline text-sm">
              {{ t.isActive ? 'Deaktivieren' : 'Aktivieren' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
