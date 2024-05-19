<template>
  <div class="my-4">
    <h2 class="mb-4 text-2xl font-bold">
      Check results
    </h2>
    <div v-if="checkData.date" :class="cssClass">
      <div>
        <strong>Display:</strong> All results <UToggle v-model="errorsOnly" /> Errors only
      </div>
      <div>
        <strong>Checked at:</strong> {{ useDateFormat(checkData.date, 'YYYY-MM-DD HH:mm:ss').value }}
      </div>
      <div v-for="gameData in displayedData" :key="gameData.link">
        <DisplayPBPGameCheck :game-data="gameData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PBPCheck } from '~/server/utils/types'

const props = defineProps({
  checkData: { type: Object as PropType<PBPCheck>, required: true },
})

const displayedData = computed(() => {
  const games = props.checkData.games
  if (errorsOnly.value) {
    return games.filter(g => g.result !== 'OK')
  } else {
    return games
  }
})

const cssClass = computed(() => {
  const baseCss = 'px-4 py-2 rounded-lg border-2 border-black text-gray-900'
  const colorsCss = props.checkData.result === 'OK' ? 'bg-primary-100' : 'bg-red-100'
  return baseCss + ' ' + colorsCss
})

const errorsOnly = ref(false)
</script>
