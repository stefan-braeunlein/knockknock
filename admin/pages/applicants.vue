<script setup lang="ts">
const { apiFetch } = useApi()

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

async function openCv(id: string) {
  const { url } = await apiFetch<{ url: string }>(`/api/applicants/${id}/cv`)
  window.open(url, '_blank')
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-blue-900 mb-6 underline underline-offset-4 decoration-2">Bewerberliste</h1>

    <div v-for="[month, items] in grouped" :key="month" class="mb-8">
      <h2 class="text-base font-medium text-gray-600 mb-3">{{ month }}</h2>
      <div class="overflow-hidden rounded-lg">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500">
              <th class="py-3 px-4 font-medium">Datum</th>
              <th class="py-3 px-4 font-medium">Vorname</th>
              <th class="py-3 px-4 font-medium">Nachname</th>
              <th class="py-3 px-4 font-medium">Einsatzbereich</th>
              <th class="py-3 px-4 font-medium">LinkedIn</th>
              <th class="py-3 px-4 font-medium">Lebenslauf</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in items" :key="a.id"
              class="bg-blue-50/60 border-b border-white"
              :class="{ 'opacity-60': !a.emailConfirmed }">
              <td class="py-3 px-4">{{ formatDate(a.createdAt) }}</td>
              <td class="py-3 px-4">{{ a.firstName }}</td>
              <td class="py-3 px-4">{{ a.lastName }}</td>
              <td class="py-3 px-4">{{ a.areaOfWork }}</td>
              <td class="py-3 px-4">
                <a v-if="a.linkedinUrl" :href="a.linkedinUrl" target="_blank" class="text-blue-600 font-semibold hover:underline">
                  Profil anschauen
                </a>
              </td>
              <td class="py-3 px-4">
                <button v-if="a.hasCv" class="text-blue-600 font-semibold hover:underline" @click="openCv(a.id)">
                  Lebenslauf anschauen
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-if="!applicants.length" class="text-gray-400">Noch keine Bewerbungen vorhanden.</p>
  </div>
</template>
