// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxt/icon',
    '@pinia/nuxt'
  ],

  icon: {
    provider: 'iconify',
    serverBundle: 'remote'
  },

  imports: {
    dirs: ['app/composables']
  },
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'light'
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://advancedprogramming.ovh/api'
    }
  }
})
