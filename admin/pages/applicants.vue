<script setup lang="ts">
const { apiFetch } = useApi()
const config = useRuntimeConfig()

interface Applicant {
  id: string
  firstName: string
  lastName: string
  email: string
  areaOfWork: string
  linkedinUrl: string | null
  hasCv: boolean
  emailConfirmed: boolean
  createdAt: string
}

const applicants = ref<Applicant[]>([])

onMounted(async () => {
  applicants.value = await apiFetch<Applicant[]>('/api/applicants')
})

const grouped = computed(() => {
  const groups: Record<string, Applicant[]> = {}
  for (const a of applicants.value) {
    const date = new Date(a.createdAt)
    const key = date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    ;(groups[key] ??= []).push(a)
  }
  return Object.entries(groups)
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) + ' Uhr'
}

function cvUrl(id: string) {
  return `${config.public.apiBase}/api/applicants/${id}/cv`
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Bewerberliste</h1>

    <div v-for="[month, items] in grouped" :key="month" class="mb-8">
      <h2 class="text-lg font-semibold text-gray-700 mb-3">{{ month }}</h2>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b">
            <th class="py-2 font-medium">Datum</th>
            <th class="py-2 font-medium">Vorname</th>
            <th class="py-2 font-medium">Nachname</th>
            <th class="py-2 font-medium">Einsatzbereich</th>
            <th class="py-2 font-medium">LinkedIn</th>
            <th class="py-2 font-medium">Lebenslauf</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in items" :key="a.id" class="border-b border-gray-100"
            :class="{ 'opacity-60': !a.emailConfirmed }">
            <td class="py-3">{{ formatDate(a.createdAt) }}</td>
            <td class="py-3">{{ a.firstName }}</td>
            <td class="py-3">{{ a.lastName }}</td>
            <td class="py-3">{{ a.areaOfWork }}</td>
            <td class="py-3">
              <a v-if="a.linkedinUrl" :href="a.linkedinUrl" target="_blank" class="text-blue-600 font-semibold hover:underline">
                Profil anschauen
              </a>
            </td>
            <td class="py-3">
              <a v-if="a.hasCv" :href="cvUrl(a.id)" target="_blank" class="text-blue-600 font-semibold hover:underline">
                Lebenslauf anschauen
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!applicants.length" class="text-gray-400">Noch keine Bewerbungen vorhanden.</p>
  </div>
</template>
