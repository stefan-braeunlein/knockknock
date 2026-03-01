<script setup lang="ts">
const { isSuperAdmin, logout } = useAuth()
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-72 bg-blue-50 border border-blue-200 border-dashed rounded-2xl m-4 p-6 flex flex-col">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg width="32" height="32" viewBox="0 0 75 75" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M57 46.3572C57 52.2236 52.2324 56.9911 46.3661 56.9911V54.3326C50.7969 54.3326 54.3415 50.788 54.3415 46.3572H57ZM18.0089 28.6339C18.0089 22.7676 22.7764 18 28.6428 18V20.6585C24.212 20.6585 20.6673 24.2031 20.6673 28.6339H18.0089ZM30.4151 23.8841L22.2802 32.0368C16.5733 37.7437 16.5733 47.013 22.2802 52.7198C27.987 58.4267 37.2563 58.4267 42.9632 52.7198L55.4935 40.1541C56.362 39.3211 56.362 37.9209 55.4935 37.0525C54.6251 36.184 53.2249 36.184 52.3565 37.0525L44.5228 44.8862L43.2645 43.6278L54.8555 32.0368C55.7239 31.1684 55.7239 29.7682 54.8555 28.8998C53.987 28.0314 52.5692 28.0314 51.683 28.8998L41.3858 39.2679L40.1629 37.9741L52.3388 25.7628C53.2072 24.8943 53.2072 23.4942 52.3388 22.6258C51.4703 21.7573 50.0702 21.7573 49.2018 22.6258L36.9905 34.8371L35.7321 33.5965L45.4799 23.8841C46.3661 23.0157 46.3661 21.6155 45.4799 20.7471C44.5937 19.8787 43.2113 19.8787 42.3429 20.7471L28.8378 34.2522C31 37.0348 30.805 41.0402 28.2529 43.6101L26.9945 42.3517C29.0682 40.2781 29.0682 36.9107 26.9945 34.8371L26.3742 34.2168L33.5876 27.0034C34.456 26.135 34.456 24.7348 33.5876 23.8664C32.7014 23.0157 31.3013 23.0157 30.4151 23.8841Z" fill="white"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-blue-700">Knock Knock</h2>
        <p class="text-gray-500 text-sm mt-1">Initiativ. Konversionsstark. Einzigartig.</p>
      </div>

      <nav class="flex-1 space-y-1">
        <NuxtLink to="/applicants"
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-100 transition"
          active-class="bg-blue-100 font-semibold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Bewerber / Interessenten
        </NuxtLink>
        <NuxtLink v-if="isSuperAdmin" to="/tenants"
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-100 transition"
          active-class="bg-blue-100 font-semibold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          Unternehmen
        </NuxtLink>
        <NuxtLink v-if="isSuperAdmin" to="/users"
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-100 transition"
          active-class="bg-blue-100 font-semibold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Benutzer
        </NuxtLink>
      </nav>

      <div class="mt-auto">
        <button @click="logout"
          class="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Logout
        </button>
        <p class="text-gray-400 text-xs mt-4">Powered by <strong class="text-gray-600">Knock Knock HR</strong></p>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-8">
      <slot />
    </main>
  </div>
</template>
