<template>
  <div class="p-4">
    <div
      v-show="loading"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-32 z-10 bg-primary text-gray-900 font-bold rounded flex items-center justify-center"
      :class="loadingBorder"
    >
      <div class="w-[90px]">
        {{ loadingText }}
      </div>
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
    <div v-if="useRuntimeConfig().public.adminVersion" class="mb-2 flex flex-row gap-2 items-center">
      Get links for:
      <USelect v-model="filterVariant" :items="variantOptions" class="w-28" @change="setLeague" />
      <USelect v-model="filterLeague" :items="leagueOptions" class="w-20" />
      in
      <USelect v-model="filterMonth" :items="monthOptions" class="w-20" />
      <USelect v-model="filterYear" :items="yearOptions" class="w-20" disabled />
      <UButton @click="getLinks">
        Get links
      </UButton>
      <div v-if="gamesArray.length > 0 && !loading" class="ml-4">
        <strong>{{ gamesArray.length }}</strong> games found
      </div>
    </div>
    <div class="mb-2">
      <UTextarea id="games" v-model="gamesText" :rows="6" class="w-full" />
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
        The website is powered by <a href="https://github.com/AloisSeckar/nuxt-ignis" class="text-blue-600 hover:text-blue-400">Nuxt Ignis</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'

const loading = ref(false)

const gamesText = ref('')
const gamesArray = computed(() => gamesText.value.split('\n'))

const filterVariant = ref('softball')
const variantOptions = ['baseball', 'softball']

const filterMonth = ref('all')
const monthOptions = ['all', '04', '05', '06', '07', '08', '09', '10']

const filterYear = ref('2025')
const yearOptions = ['2024', '2025']

const filterLeague = ref('EXL')
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

const loadingText = ref('LOADING...')
const loadingBorder = ref('border-[0px]')
const { pause, resume } = useIntervalFn(() => {
  if (loadingText.value.endsWith('...')) {
    loadingText.value = 'LOADING'
  } else {
    loadingText.value += '.'
  }

  let border = parseInt(loadingBorder.value.at(-4)!)
  if (border < 3) {
    border++
  } else {
    border = 0
  }
  loadingBorder.value = `border-[${border}px]`
}, 400)
pause()
</script>
