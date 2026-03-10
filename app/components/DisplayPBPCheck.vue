<template>
  <div class="my-4">
    <h2 class="mb-4 text-2xl font-bold">
      {{ $t('checker.results') }}
    </h2>
    <div v-if="checkData?.date" :class="cssClass">
      <div class="flex flex-row gap-2">
        <strong>{{ $t('checker.display') }}:</strong> {{ $t('checker.all') }} ({{ countAll }}) <USwitch v-model="errorsOnly" /> {{ $t('checker.errors') }} ({{ countErr }})
      </div>
      <div>
        <strong>{{ $t('checker.checkedAt') }}:</strong> {{ useDateFormat(checkData.date, 'YYYY-MM-DD HH:mm:ss').value }}
      </div>
      <div v-for="gameData in displayedData" :key="gameData.link">
        <DisplayPBPGameCheck :game-data="gameData" />
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
  const baseCss = 'px-4 py-2 rounded-lg border-2 border-black text-gray-900'
  const colorsCss = props.checkData?.result === 'OK' ? 'bg-primary-100' : 'bg-red-100'
  return baseCss + ' ' + colorsCss
})

const errorsOnly = ref(false)
</script>
