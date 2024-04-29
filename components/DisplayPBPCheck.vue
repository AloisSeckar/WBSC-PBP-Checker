<template>
  <div class="my-4">
    <h2 class="mb-4 text-2xl font-bold">
      Check result
    </h2>
    <div v-if="checkData.date" :class="cssClass">
      <div><strong>Checked at:</strong> {{ checkData.date }}</div>
      <div v-for="gameData in checkData.games" :key="gameData.link">
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

const cssClass = computed(() => {
  const baseCss = 'px-4 py-2 rounded-lg border-2 border-black text-gray-900'
  const colorsCss = props.checkData.result === 'OK' ? 'bg-primary-100' : 'bg-red-100'
  return baseCss + ' ' + colorsCss
})
</script>
