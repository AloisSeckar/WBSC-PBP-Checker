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

    <!-- Game input section -->
    <div class="rounded-xl bg-slate-300 p-6 shadow-lg">
      <h2 class="mb-5 text-xl font-bold text-accent">
        {{ $t('index.game') }}
      </h2>
      <div v-if="useRuntimeConfig().public.adminVersion" class="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-slate-400 p-3 text-sm text-slate-800">
        <span class="font-medium text-black">{{ $t('index.link') }}:</span>
        <UInput v-model="link" class="w-full" />
      </div>
      <UButton size="lg" @click="check">
        {{ $t('index.check') }}
      </UButton>
    </div>

    <DisplayPBPCheck :check-data="pbpCheckData" />
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'

const loading = ref(false)

const link = ref('')

const pbpCheckData = ref<PBPCheck | undefined>(undefined)
async function check() {
  pbpCheckData.value = undefined
  showPending(true)
  console.debug(link.value)
  const data = await $fetch<PBPCheck>('/api/check', {
    method: 'POST',
    body: {
      gameLinks: [link.value],
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

const translatedText = useNuxtApp().$i18n.t('index.loading')
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
