// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
  runtimeConfig: {
    emailPassword: '',
  },
})
