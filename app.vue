<template>
  <div>
    <h1>WBSC-PBP-Checker</h1>
    <div>
      Automated crawler for finding common scoring mistakes in Ballclubz play-by-play
    </div>
    <h2>Games to be checked</h2>
    <div>
      <textarea id="games" v-model="gamesText" :rows="10" />
    </div>
    <div>
      The website is powered by <a href="https://nuxt.com/">Nuxt</a>
    </div>
    <h2>Check result</h2>
    <button @click="check">
      Check games
    </button>
    <div>
      <br>Raw test data <pre>{{ pbpCheckData }}</pre>
    </div>
    <div>
      Visit <a href="https://github.com/AloisSeckar/WBSC-PBP-Checker">https://github.com/AloisSeckar/WBSC-PBP-Checker</a> for more info and contact
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PBPCheck } from './server/utils/types'

const gamesText = ref('')
const gamesArray = computed(() => gamesText.value.split('\n'))

const pbpCheckData = ref({})
async function check () {
  console.debug(gamesArray.value)
  const data = await $fetch<PBPCheck>('/api/check', {
    method: 'POST',
    body: {
      gameLinks: gamesArray.value
    }
  })
  pbpCheckData.value = data
}
</script>
