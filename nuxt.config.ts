// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'nuxt-cron',
  ],

  css: ['~/assets/main.css'],

  runtimeConfig: {
    emailPassword: '',
    githubToken: '',
    public: {
      chromium: '/opt/bin/chromium',
      adminVersion: false,
      automatedCheck: '0 6 * * MON',
    },
  },

  compatibilityDate: '2026-02-01',

  eslint: {
    config: {
      stylistic: true,
    },
  },

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'en',
  },
})
