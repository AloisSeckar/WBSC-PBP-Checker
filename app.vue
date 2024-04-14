<template>
  <div>
    <h1>WBSC-PBP-Checker</h1>
    <div>
      Automated crawler for finding common scoring mistakes in Ballclubz play-by-play
    </div>
    <div>
      The website is powered by <a href="https://nuxt.com/">Nuxt</a>
    </div>
    <div>
      <br>Raw test data <pre>{{ pbpCheckData }}</pre>
    </div>
    <div>
      Visit <a href="https://github.com/AloisSeckar/WBSC-PBP-Checker">https://github.com/AloisSeckar/WBSC-PBP-Checker</a> for more info and contact
    </div>
  </div>
</template>

<script setup lang="ts">
// import type { PBPCheck } from './server/utils/types'
//
// const { data: pbpCheckData } = await useFetch<PBPCheck>('/api/check')
const pbpCheckData = { temp: 'disabled' }
</script>
