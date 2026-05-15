import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: 'Dota 1 Item Helper',
      meta: [
        { name: 'description', content: 'Pick 6 items for your Dota 1 build and find them in shops quickly' },
      ],
    },
  },
})
