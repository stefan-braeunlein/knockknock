<script setup lang="ts">
const { isSuperAdmin, logout } = useAuth()
</script>

<template>
  <div class="min-h-screen flex bg-brand-light">
    <!-- Sidebar -->
    <aside class="w-72 bg-brand-light p-6 flex flex-col h-screen sticky top-0">
      <div class="text-center mb-8">
        <img src="/knock-knock-logo.svg" alt="Knock Knock Logo" class="w-[100px] h-[100px] mx-auto mb-3" />
        <p class="text-gray-500 text-sm mt-2">Initativbewerbungen einfach,<br>schnell und unkompliziert</p>
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
          class="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 transition text-sm w-full">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Logout
        </button>
        <div class="border-t border-gray-200 mt-4 pt-4">
          <p class="text-gray-400 text-base text-center">Powered by <strong class="text-gray-600">Knock Knock HR</strong></p>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-8 bg-white min-h-screen overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
