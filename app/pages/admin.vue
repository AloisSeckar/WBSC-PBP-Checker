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

    <!-- Games input section -->
    <div class="rounded-xl bg-slate-300 p-6 shadow-lg">
      <h2 class="mb-5 text-xl font-bold text-accent">
        {{ $t('admin.getGames') }}
      </h2>
      <div v-if="useRuntimeConfig().public.adminVersion" class="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-slate-400 p-3 text-sm text-slate-800">
        <span class="font-medium text-black">{{ $t('admin.linksFor') }}:</span>
        <USelect v-model="filterVariant" :items="variantOptions" class="w-28" @change="setLeague" />
        <USelect v-model="filterLeague" :items="leagueOptions" class="w-20" />
        <span class="font-medium text-black">{{ $t('admin.linksIn') }}</span>
        <USelect v-model="filterMonth" :items="monthOptions" class="w-20" />
        <USelect v-model="filterYear" :items="yearOptions" class="w-20" disabled />
        <UButton @click="getLinks">
          {{ $t('admin.getLinks') }}
        </UButton>
        <div v-if="gamesArray.length > 0 && !loading" class="ml-4 font-medium text-accent">
          {{ $t('admin.found1') }} <strong>{{ gamesArray.length }}</strong> {{ $t('admin.found2') }}
        </div>
      </div>
      <div class="mb-4">
        <UTextarea id="games" v-model="gamesText" :rows="6" class="w-full" />
      </div>
      <UButton size="lg" @click="check">
        {{ $t('admin.checkGames') }}
      </UButton>
    </div>

    <DisplayPBPCheck :check-data="pbpCheckData" />
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'

const loading = ref(false)

const gamesText = ref('')
const gamesArray = computed(() => gamesText.value.split('\n').filter(link => link.trim() !== ''))

const filterVariant = ref('softball')
const variantOptions = ['baseball', 'softball']

const filterMonth = ref('all')
const monthOptions = ['all', '04', '05', '06', '07', '08', '09', '10']

const filterYear = ref('2025')
const yearOptions = ['2024', '2025']

const filterLeague = ref('ELM')
const leagueOptions = computed(() => {
  switch (filterVariant.value) {
    case 'baseball':
      return ['EXL', 'NAD', 'LIG', 'U23', 'U18']
    case 'softball':
      return ['ELM', 'ELZ', 'ELJI', 'ELJY']
    default:
      return ['']
  }
})

const setLeague = () => {
  filterLeague.value = leagueOptions.value[0]!
}

async function getLinks() {
  if (filterVariant.value && filterLeague.value) {
    gamesText.value = ''
    pbpCheckData.value = undefined
    showPending(true)
    console.debug(filterVariant.value, filterLeague.value)
    const data = await $fetch<string[]>('/api/links', {
      method: 'GET',
      params: {
        variant: filterVariant.value,
        league: filterLeague.value,
        month: filterMonth.value !== 'all' ? filterMonth.value : '',
        year: filterMonth.value !== 'all' ? filterYear.value : '',
      },
    })
    console.debug(data)
    gamesText.value = data.join('\n')
    showPending(false)
  }
}

const pbpCheckData = ref<PBPCheck | undefined>(undefined)
async function check() {
  pbpCheckData.value = undefined
  showPending(true)
  console.debug(gamesArray.value)
  const data = await $fetch<PBPCheck>('/api/check', {
    method: 'POST',
    body: {
      gameLinks: gamesArray.value,
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
