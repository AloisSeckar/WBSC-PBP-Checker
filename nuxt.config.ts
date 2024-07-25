// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-04',

  devtools: {
    enabled: false,
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-cron',
  ],

  eslint: {
    config: {
      stylistic: true,
    },
  },

  runtimeConfig: {
    emailPassword: '',
    public: {
      adminVersion: false,
      automatedCheck: '0 6 * * MON',
    },
  },
})
