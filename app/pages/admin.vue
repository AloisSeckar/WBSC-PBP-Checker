<template>
  <div>
    <!-- Loading overlay -->
    <div
      v-show="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div class="rounded-xl bg-slate-300 px-8 py-4 shadow-xl border border-slate-600">
        <div class="text-lg font-bold text-accent">
          {{ loadingText }}
        </div>
      </div>
    </div>

    <GameInputMultiple @check="check" @loading="showPending" />

    <DisplayPBPCheck :check-data="pbpCheckData" />
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'

const loading = ref(false)

const pbpCheckData = ref<PBPCheck | undefined>(undefined)
async function check(gameLinks: string[]) {
  pbpCheckData.value = undefined
  showPending(true)
  console.debug(gameLinks)
  const data = await $fetch<PBPCheck>('/api/check', {
    method: 'POST',
    body: {
      gameLinks,
    },
  })
  console.debug(data)
  pbpCheckData.value = data
  showPending(false)
}

function showPending(show: boolean) {
  loading.value = show
  if (show) {
    resume()
  } else {
    pause()
  }
}

const translatedText = useNuxtApp().$i18n.t('admin.loading')
const loadingText = ref(`${translatedText}...`)
const { pause, resume } = useIntervalFn(() => {
  if (loadingText.value.endsWith('...')) {
    loadingText.value = `${translatedText}`
  } else {
    loadingText.value += '.'
  }
}, 400)
pause()
</script>
