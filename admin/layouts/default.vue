<script setup lang="ts">
const { isSuperAdmin, logout } = useAuth()
const sidebarOpen = ref(false)

const route = useRoute()
watch(() => route.path, () => { sidebarOpen.value = false })
</script>

<template>
  <div class="min-h-screen flex bg-brand-light">
    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/30 z-30 lg:hidden" @click="sidebarOpen = false" />

    <!-- Sidebar -->
    <aside :class="[
      'bg-brand-light p-6 flex flex-col h-screen z-40',
      'fixed inset-y-0 left-0 w-72 transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
      <!-- Mobile close -->
      <button class="lg:hidden mb-4 self-start text-brand" @click="sidebarOpen = false">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>

      <div class="text-center mb-8">
        <img src="/knock-knock-logo.svg" alt="Knock Knock Logo" class="w-[100px] h-[100px] mx-auto mb-3" />
        <p class="text-gray-400 text-base mt-2">Initiativbewerbungen einfach, schnell und unkompliziert</p>
      </div>

      <nav class="flex-1 space-y-1">
        <NuxtLink to="/applicants"
          class="flex items-center justify-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition"
          active-class="bg-blue-50 font-semibold text-blue-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Bewerber
        </NuxtLink>
        <NuxtLink v-if="isSuperAdmin" to="/tenants"
          class="flex items-center justify-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition"
          active-class="bg-blue-50 font-semibold text-blue-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          Unternehmen
        </NuxtLink>
        <NuxtLink v-if="isSuperAdmin" to="/users"
          class="flex items-center justify-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition"
          active-class="bg-blue-50 font-semibold text-blue-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Benutzer
        </NuxtLink>
      </nav>

      <div class="mt-auto">
        <button @click="logout"
          class="flex items-center justify-center gap-2 text-gray-500 text-base hover:text-gray-700 transition w-full">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Logout
        </button>
        <div class="border-t border-gray-200 mt-4 pt-4">
          <p class="text-gray-400 text-base text-center">Powered by <strong class="text-gray-600">Knock Knock HR</strong></p>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-white min-h-screen overflow-y-auto">
      <!-- Mobile hamburger -->
      <button class="lg:hidden mb-4 text-brand" @click="sidebarOpen = true">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <slot />
    </main>
  </div>
</template>
