<template>
  <div>
    <div :class="cssCard">
      <div class="flex flex-row">
        <div class="w-full">
          <div>
            <strong>{{ $t('checker.game') }}:</strong>
            <a :href="gameData.link" target="_blank" :class="cssLink">{{ gameData.game }}</a>
          </div>
          <div>
            <strong>{{ $t('checker.scorer') }}:</strong> {{ gameData.scorer }}
          </div>
        </div>
        <div>
          <UButton
            :label="$t('checker.report')" color="warning" size="sm"
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
  const baseCss = 'my-2 px-4 py-3 rounded-lg shadow-sm transition-shadow hover:shadow-md'
  const colorsCss = props.gameData.result === 'OK' ? 'bg-emerald-50 border-l-3 border-emerald-400 text-slate-800' : 'bg-red-50 border-l-3 border-red-400 text-slate-800'
  const notPlayedCss = props.gameData.game.includes('(NOT PLAYED)') ? 'bg-amber-50! border-amber-400!' : ''
  return baseCss + ' ' + colorsCss + ' ' + notPlayedCss
})
const cssLink = 'ml-2 font-medium text-accent hover:text-accent-light transition-colors'

const gameLink = useState<string>('reportLink')
const reportType = useState<PBPReportType | undefined>('reportType')

function report(link: string, result: PBPResult) {
  gameLink.value = link
  reportType.value = result === 'OK' ? 'false-positive' : 'false-negative'
  return navigateTo('/report')
}
</script>
