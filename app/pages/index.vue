<template>
  <div>
    <LoadingOverlay v-model="loading" />

    <GameInputSingle @check="check" />

    <DisplayPBPCheck :check-data="pbpCheckData" />
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)

const pbpCheckData = ref<PBPCheck | undefined>(undefined)

async function check(link: string) {
  pbpCheckData.value = undefined
  loading.value = true
  console.debug(link)
  const data = await $fetch<PBPCheck>('/api/check', {
    method: 'POST',
    body: {
      gameLinks: [link],
    },
  })
  console.debug(data)
  pbpCheckData.value = data
  loading.value = false
}
</script>
