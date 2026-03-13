<template>
  <div>
    <LoadingOverlay v-model="loading" />

    <GameInputMultiple @check="check" @loading="(v: boolean) => loading = v" />

    <DisplayPBPCheck :check-data="pbpCheckData" />
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)

const pbpCheckData = ref<PBPCheck | undefined>(undefined)

async function check(gameLinks: string[]) {
  pbpCheckData.value = undefined
  loading.value = true
  console.debug(gameLinks)
  const data = await $fetch<PBPCheck>('/api/check', {
    method: 'POST',
    body: {
      gameLinks,
    },
  })
  console.debug(data)
  pbpCheckData.value = data
  loading.value = false
}
</script>
