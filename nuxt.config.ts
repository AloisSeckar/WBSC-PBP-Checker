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

  // TODO remove later https://github.com/nuxt-modules/tailwindcss/releases/tag/v6.12.0
  tailwindcss: {
    quiet: true,
  },

  // TODO this temporary for investigating behavior on Netlify
  vite: {
    build: {
      minify: false,
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
