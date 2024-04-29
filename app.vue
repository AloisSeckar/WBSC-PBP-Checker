<template>
  <div class="p-4">
    <h1 class="mb-4 text-3xl font-bold">
      WBSC-PBP-Checker
    </h1>
    <div class="mb-2">
      Automated crawler for finding common scoring mistakes in Ballclubz play-by-play
    </div>
    <h2 class="mb-4 text-2xl font-bold">
      Games to be checked
    </h2>
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
import type { PBPCheck } from './server/utils/types'

const gamesText = ref('')
const gamesArray = computed(() => gamesText.value.split('\n'))

const pbpCheckData = ref({})
async function check() {
  console.debug(gamesArray.value)
  const data = await $fetch<PBPCheck>('/api/check', {
    method: 'POST',
    body: {
      gameLinks: gamesArray.value,
    },
  })
  console.debug(data)
  pbpCheckData.value = data
}
</script>
