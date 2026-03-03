export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  ssr: false,
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap' }
      ]
    }
  },
  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:5118/api/**'
    }
  }
})
