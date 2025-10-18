// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        // SVG favicon for modern browsers
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // ICO fallback
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // PNG favicons for different sizes
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/mdc'
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
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://advancedprogramming.ovh/api',
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '',
      appCommitHash: process.env.NUXT_PUBLIC_APP_COMMIT_HASH || ''
    }
  },

  routeRules: {
    '/admin/**': { ssr: false }
  },

  vite: {
    build: {
      sourcemap: false
    }
  }
})
