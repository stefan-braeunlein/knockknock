<script setup lang="ts">
const { apiFetch } = useApi()
const route = useRoute()
const error = ref(false)

onMounted(async () => {
  try {
    const { url } = await apiFetch<{ url: string }>(`/api/applicants/${route.params.id}/cv`)
    window.location.href = url
  } catch {
    error.value = true
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-[50vh]">
    <p v-if="error" class="text-red-500">Lebenslauf konnte nicht geladen werden.</p>
    <p v-else class="text-gray-500">Lebenslauf wird heruntergeladen…</p>
  </div>
</template>
