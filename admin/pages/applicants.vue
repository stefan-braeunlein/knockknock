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
  const groups: Record<string, { label: string; year: number; month: number; items: Applicant[] }> = {}
  for (const a of applicants.value) {
    const date = new Date(a.createdAt)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const key = `${year}-${month}`
    if (!groups[key]) {
      const label = date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
      groups[key] = { label, year, month, items: [] }
    }
    groups[key].items.push(a)
  }
  return Object.values(groups)
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

async function downloadXlsx(year: number, month: number) {
  const { state } = useAuth()
  const res = await fetch(`/api/applicants/export?year=${year}&month=${month}`, {
    headers: state.value.token ? { Authorization: `Bearer ${state.value.token}` } : {}
  })
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Bewerbungen_${year}_${month}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div>
    <h1 class="text-[28px] leading-[38px] font-bold text-brand mb-10">Bewerberliste</h1>

    <div v-for="group in grouped" :key="`${group.year}-${group.month}`" class="mb-8">
      <div class="flex items-center gap-3 mb-3">
        <h2 class="text-base font-medium text-gray-600">{{ group.label }}</h2>
        <button @click="downloadXlsx(group.year, group.month)" class="text-brand hover:text-brand/80 transition" title="Als Excel herunterladen">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"/></svg>
        </button>
      </div>
      <div class="overflow-x-auto">
        <div class="min-w-[700px]">
          <div class="grid grid-cols-7 text-sm text-gray-500 px-4 mb-4">
            <span class="font-medium">Datum</span>
            <span class="font-medium">Vorname</span>
            <span class="font-medium">Nachname</span>
            <span class="font-medium">Tätigkeitsbereich</span>
            <span class="font-medium">E-Mail Adresse</span>
            <span class="font-medium text-center">LinkedIn</span>
            <span class="font-medium text-center">Lebenslauf</span>
          </div>
          <div class="space-y-2">
            <div v-for="a in group.items" :key="a.id"
              class="grid grid-cols-7 items-center text-sm bg-brand-light rounded-full px-6 py-4"
              :class="{ 'opacity-60': !a.emailConfirmed }">
              <span>{{ formatDate(a.createdAt) }}</span>
              <span>{{ a.firstName }}</span>
              <span>{{ a.lastName }}</span>
              <span>{{ a.areaOfWork }}</span>
              <span>{{ a.email }}</span>
              <span class="flex justify-center">
                <a v-if="a.linkedinUrl" :href="a.linkedinUrl" target="_blank" class="text-brand hover:text-brand/80 transition" title="LinkedIn Profil">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </a>
              </span>
              <span class="flex justify-center">
                <button v-if="a.hasCv" class="text-brand hover:text-brand/80 transition" @click="openCv(a.id)" title="Lebenslauf anschauen">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!applicants.length" class="text-gray-400">Noch keine Bewerbungen vorhanden.</p>
  </div>
</template>
