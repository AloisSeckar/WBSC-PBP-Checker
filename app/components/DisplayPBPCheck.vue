<template>
  <div class="mt-8">
    <h2 class="mb-4 text-xl font-bold text-accent">
      {{ $t('checker.results') }}
    </h2>
    <div v-if="checkData?.date" :class="cssClass">
      <div class="flex flex-wrap items-center gap-3 text-sm">
        <span class="font-semibold text-accent-dark">{{ $t('checker.display') }}:</span>
        <span class="text-slate-800">{{ $t('checker.all') }} ({{ countAll }})</span>
        <USwitch v-model="errorsOnly" />
        <span class="text-slate-800">{{ $t('checker.errors') }} ({{ countErr }})</span>
      </div>
      <div class="mt-2 text-sm text-slate-800">
        <strong>{{ $t('checker.checkedAt') }}:</strong> {{ useDateFormat(checkData.date, 'YYYY-MM-DD HH:mm:ss').value }}
      </div>
      <div v-for="gameData in displayedData" :key="gameData.link">
        <DisplayPBPGameCheck :game-data="gameData" />
      </div>
    </div>
    <div v-else class="rounded-xl bg-slate-300 px-8 py-4 shadow-xl border border-slate-600">
      <div class="text-md text-black">
        {{ $t('checker.init') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  checkData: { type: Object as PropType<PBPCheck> },
})

const displayedData = computed(() => {
  const games = props.checkData?.games
  if (errorsOnly.value) {
    return games?.filter(g => g.result !== 'OK')
  } else {
    return games
  }
})

const countAll = computed(() => props.checkData?.games?.length ?? 0)
const countErr = computed(() => props.checkData?.games?.filter(g => g.result !== 'OK').length ?? 0)

const cssClass = computed(() => {
  const baseCss = 'px-5 py-4 rounded-xl bg-slate-300 shadow-lg'
  const colorsCss = props.checkData?.result === 'OK' ? 'border-l-4 border-accent' : 'border-l-4 border-red-400'
  return baseCss + ' ' + colorsCss
})

const errorsOnly = ref(false)
</script>
