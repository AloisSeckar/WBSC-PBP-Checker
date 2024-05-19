<template>
  <div>
    <div :class="cssClass">
      <div><strong>Game:</strong> <a :href="gameData.link" :class="link">{{ gameData.game }}</a></div>
      <div><strong>Scorer:</strong> {{ gameData.scorer }}</div>
      <div v-for="problem in gameData.problems" :key="problem.toString()">
        &#8594; {{ problem }}
      </div>
      <div v-if="gameData.result === 'OK'">
        OK
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PBPGameCheck } from '~/server/utils/types'

const props = defineProps({
  gameData: { type: Object as PropType<PBPGameCheck>, required: true },
})

const cssClass = computed(() => {
  const baseCss = 'my-2 px-4 py-2 rounded-lg border-2 border-black text-gray-900'
  const colorsCss = props.gameData.result === 'OK' ? 'text-gray-900 bg-primary-400' : 'bg-red-300'
  return baseCss + ' ' + colorsCss
})
const link = 'text-gray-700 hover:text-primary-600'
</script>
