<template>
  <div
    v-show="model"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
  >
    <div class="rounded-xl bg-slate-300 px-8 py-4 shadow-xl border border-slate-600">
      <div class="text-lg font-bold text-accent">
        {{ loadingText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'

const model = defineModel<boolean>({ default: false })

const translatedText = useNuxtApp().$i18n.t('loading')
const loadingText = ref(`${translatedText}...`)
const { pause, resume } = useIntervalFn(() => {
  if (loadingText.value.endsWith('...')) {
    loadingText.value = `${translatedText}`
  } else {
    loadingText.value += '.'
  }
}, 400)
pause()

watch(model, (show) => {
  if (show) {
    resume()
  } else {
    pause()
  }
})
</script>
