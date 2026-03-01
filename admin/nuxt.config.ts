export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  ssr: false,
  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:5118/api/**'
    }
  }
})
