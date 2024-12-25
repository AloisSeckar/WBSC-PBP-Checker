// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    'nuxt-ignis',
  ],

  modules: [
    'nuxt-cron',
  ],

  runtimeConfig: {
    emailPassword: '',
    public: {
      adminVersion: false,
      automatedCheck: '0 6 * * MON',
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
