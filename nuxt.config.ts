// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  // TODO remove later https://github.com/nuxt-modules/tailwindcss/releases/tag/v6.12.0
  tailwindcss: {
    quiet: true
  }
})
