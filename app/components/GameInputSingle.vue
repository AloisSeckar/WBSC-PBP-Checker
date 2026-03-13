<template>
  <section>
    <h2 class="mb-5 text-xl font-bold text-accent">
      {{ $t('index.game') }}
    </h2>
    <UForm :schema="schema" :state="state" @submit="onSubmit">
      <div v-if="useRuntimeConfig().public.adminVersion" class="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-slate-300 p-3 text-sm text-slate-800">
        <span class="font-medium text-black">{{ $t('index.link') }}:</span>
        <UFormField name="link" class="w-full">
          <UInput v-model="state.link" class="w-full" />
        </UFormField>
      </div>
      <UButton type="submit" size="lg">
        {{ $t('index.check') }}
      </UButton>
    </UForm>
  </section>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useNuxtApp().$i18n

const emit = defineEmits<{
  check: [value: string]
}>()

const schema = z.object({
  link: z.string().min(1, t('index.linkRequired')),
})

type Schema = z.output<typeof schema>

const state = reactive({
  link: '',
})

function onSubmit(event: FormSubmitEvent<Schema>) {
  emit('check', event.data.link)
}
</script>
