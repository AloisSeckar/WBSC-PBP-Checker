<template>
  <div>
    <div :class="cssCard">
      <div class="flex flex-row">
        <div class="w-full">
          <div>
            <strong>Game:</strong>
            <a :href="gameData.link" target="_blank" :class="cssLink">{{ gameData.game }}</a>
          </div>
          <div>
            <strong>Scorer:</strong> {{ gameData.scorer }}
          </div>
        </div>
        <div>
          <UButton
            label="Report mistake" color="warning" size="sm"
            class="cursor-pointer" @click="report(gameData.link, gameData.result)"
          />
        </div>
      </div>
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
const props = defineProps({
  gameData: { type: Object as PropType<PBPGameCheck>, required: true },
})

const cssCard = computed(() => {
  const baseCss = 'my-2 px-4 py-2 rounded-lg border-2 border-black text-gray-900'
  const colorsCss = props.gameData.result === 'OK' ? 'text-gray-900 bg-primary-400' : 'bg-red-300'
  const notPlayedCss = props.gameData.game.includes('(NOT PLAYED)') ? 'bg-amber-200!' : ''
  return baseCss + ' ' + colorsCss + ' ' + notPlayedCss
})
const cssLink = 'text-gray-700 hover:text-primary-600'

const gameLink = useState<string>('reportLink')
const reportType = useState<PBPReportType | undefined>('reportType')

function report(link: string, result: PBPResult) {
  gameLink.value = link
  reportType.value = result === 'OK' ? 'false-positive' : 'false-negative'
  return navigateTo('/report')
}
</script>
