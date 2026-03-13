<template>
  <section>
    <h2 class="mb-5 text-xl font-bold text-accent">
      {{ $t('admin.getGames') }}
    </h2>
    <UForm :schema="schema" :state="state" @submit="onSubmit">
      <div v-if="useRuntimeConfig().public.adminVersion" class="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-slate-300 p-3 text-sm text-slate-800">
        <span class="font-medium text-black">{{ $t('admin.linksFor') }}:</span>
        <USelect v-model="filterVariant" :items="variantOptions" class="w-28" @change="setLeague" />
        <USelect v-model="filterLeague" :items="leagueOptions" class="w-20" />
        <span class="font-medium text-black">{{ $t('admin.linksIn') }}</span>
        <USelect v-model="filterMonth" :items="monthOptions" class="w-20" />
        <USelect v-model="filterYear" :items="yearOptions" class="w-20" disabled />
        <UButton @click="getLinks">
          {{ $t('admin.getLinks') }}
        </UButton>
        <div v-if="gamesArray.length > 0" class="ml-4 font-medium text-accent">
          {{ $t('admin.found1') }} <strong>{{ gamesArray.length }}</strong> {{ $t('admin.found2') }}
        </div>
      </div>
      <div class="mb-4">
        <UFormField name="games">
          <UTextarea id="games" v-model="state.games" :rows="6" class="w-full" />
        </UFormField>
      </div>
      <UButton type="submit" size="lg">
        {{ $t('admin.checkGames') }}
      </UButton>
    </UForm>
  </section>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useNuxtApp().$i18n

const emit = defineEmits<{
  check: [value: string[]]
  loading: [value: boolean]
}>()

const schema = z.object({
  games: z.string().min(1, t('admin.gamesRequired')),
})

type Schema = z.output<typeof schema>

const state = reactive({
  games: '',
})

const gamesArray = computed(() => state.games.split('\n').filter(link => link.trim() !== ''))

const filterVariant = ref('softball')
const variantOptions = ['baseball', 'softball']

const filterMonth = ref('all')
const monthOptions = ['all', '04', '05', '06', '07', '08', '09', '10']

const filterYear = ref('2025')
const yearOptions = ['2024', '2025']

const filterLeague = ref('ELM')
const leagueOptions = computed(() => {
  switch (filterVariant.value) {
    case 'baseball':
      return ['EXL', 'NAD', 'LIG', 'U23', 'U18']
    case 'softball':
      return ['ELM', 'ELZ', 'ELJI', 'ELJY']
    default:
      return ['']
  }
})

const setLeague = () => {
  filterLeague.value = leagueOptions.value[0]!
}

async function getLinks() {
  if (filterVariant.value && filterLeague.value) {
    state.games = ''
    emit('loading', true)
    const data = await $fetch<string[]>('/api/links', {
      method: 'GET',
      params: {
        variant: filterVariant.value,
        league: filterLeague.value,
        month: filterMonth.value !== 'all' ? filterMonth.value : '',
        year: filterMonth.value !== 'all' ? filterYear.value : '',
      },
    })
    state.games = data.join('\n')
    emit('loading', false)
  }
}

function onSubmit(_event: FormSubmitEvent<Schema>) {
  emit('check', gamesArray.value)
}
</script>
