<template>
  <div class="p-4">
    <div v-show="loading" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-28 z-10 pt-1 pl-3 bg-primary text-gray-900 font-bold rounded">
      {{ loadingText }}
    </div>
    <h1 class="mb-4 text-3xl font-bold">
      WBSC-PBP-Checker
    </h1>
    <div class="mb-2">
      Automated crawler for finding common scoring mistakes in Ballclubz play-by-play
    </div>
    <h2 class="mb-4 text-2xl font-bold">
      Games to be checked
    </h2>
    <div class="mb-2 flex flex-row gap-2 items-center">
      Get links for:
      <USelect v-model="filterVariant" :options="variantOptions" />
      <USelect v-model="filterLeague" :options="leagueOptions" />
      in
      <USelect v-model="filterMonth" :options="monthOptions" />
      <USelect v-model="filterYear" :options="yearOptions" disabled />
      <UButton @click="getLinks">
        Get links
      </UButton>
    </div>
    <div class="mb-2">
      <UTextarea id="games" v-model="gamesText" :rows="10" />
    </div>
    <UButton @click="check">
      Check games
    </UButton>
    <DisplayPBPCheck :check-data="pbpCheckData" />
    <footer>
      <hr>
      <div>
        Visit
        <a href="https://github.com/AloisSeckar/WBSC-PBP-Checker" class="text-blue-600 hover:text-blue-400">
          https://github.com/AloisSeckar/WBSC-PBP-Checker
        </a>
        for more info and contact
      </div>
      <div>
        The website is powered by <a href="https://nuxt.com/" class="text-blue-600 hover:text-blue-400">Nuxt</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import type { PBPCheck } from './server/utils/types'

const loading = ref(false)

const gamesText = ref('')
const gamesArray = computed(() => gamesText.value.split('\n'))

const filterVariant = ref('')
const variantOptions = ['', 'baseball', 'softball']

const filterMonth = ref('all')
const monthOptions = ['all', '04', '05', '06', '07', '08', '09', '10']

const filterYear = '2024'
const yearOptions = ['2024']

const filterLeague = ref('')
const leagueOptions = computed(() => {
  switch (filterVariant.value) {
    case 'baseball':
      return ['EXL', 'LIG', 'U23', 'U18']
    case 'softball':
      return ['ELM', 'ELZ', 'ELJI', 'ELJY']
    default:
      return ['']
  }
})

async function getLinks() {
  if (filterVariant.value && filterLeague.value) {
    gamesText.value = ''
    pbpCheckData.value = {}
    showPending(true)
    nextTick()
    console.debug(filterVariant.value, filterLeague.value)
    const data = await $fetch<string[]>('/api/links', {
      method: 'GET',
      params: {
        variant: filterVariant.value,
        league: filterLeague.value,
        month: filterMonth.value,
        year: filterYear,
      },
    })
    console.debug(data)
    gamesText.value = data.join('\n')
    showPending(false)
  }
}

const pbpCheckData = ref({})
async function check() {
  pbpCheckData.value = {}
  showPending(true)
  nextTick()
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

const loadingText = ref('LOADING...')
const { pause, resume } = useIntervalFn(() => {
  if (loadingText.value.endsWith('...')) {
    loadingText.value = 'LOADING'
  } else {
    loadingText.value += '.'
  }
}, 400)
</script>
