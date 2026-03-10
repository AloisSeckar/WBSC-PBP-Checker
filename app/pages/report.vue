<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/" class="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-light transition-colors">
        &larr; {{ $t('report.back') }}
      </NuxtLink>
    </div>

    <div class="rounded-xl bg-slate-300 p-6 shadow-lg">
      <h2 class="mb-6 text-xl font-bold text-accent">
        {{ $t('report.title') }}
      </h2>

      <UForm :schema="schema" :state="state" class="max-w-lg space-y-5" @submit="onSubmit">
        <UFormField :label="$t('report.gameLink')" name="gameLink" required :ui="{ label: 'text-slate-800' }">
          <UInput v-model="state.gameLink" placeholder="https://game.wbsc.org/..." class="w-full" />
        </UFormField>

        <UFormField :label="$t('report.reportType')" name="reportType" required :ui="{ label: 'text-slate-800' }">
          <URadioGroup v-model="state.reportType" :items="reportTypeOptions" :ui="{ label: 'text-slate-800' }" />
        </UFormField>

        <UFormField :label="$t('report.issue')" name="issue" required :ui="{ label: 'text-slate-800' }">
          <UInput v-model="state.issue" :placeholder="$t('report.issuePlaceholder')" class="w-full" />
        </UFormField>

        <UFormField :label="$t('report.description')" name="description" required :ui="{ label: 'text-slate-800' }">
          <UTextarea v-model="state.description" :placeholder="$t('report.descriptionPlaceholder')" :rows="5" class="w-full" />
        </UFormField>

        <div class="flex items-center gap-4 pt-2">
          <UButton type="submit" size="lg" :loading="submitting">
            {{ $t('report.submit') }}
          </UButton>
          <span v-if="successMessage" class="text-sm font-medium text-emerald-500">{{ successMessage }}</span>
          <span v-if="errorMessage" class="text-sm font-medium text-red-400">{{ errorMessage }}</span>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  gameLink: z.string().url('Must be a valid URL').min(1, 'Game link is required'),
  reportType: z.enum(['false-positive', 'false-negative'], {
    required_error: 'Please select a report type',
  }),
  issue: z.string().min(1, 'Issue summary is required'),
  description: z.string().min(1, 'Description is required'),
})

type Schema = z.output<typeof schema>

const gameLink = useState<string>('reportLink')
const reportType = useState<PBPReportType | undefined>('reportType')

const state = reactive({
  gameLink: gameLink.value,
  reportType: reportType.value,
  issue: '',
  description: '',
})

const reportTypeOptions = [
  { value: 'false-positive', label: useNuxtApp().$i18n.t('report.falsePositive') },
  { value: 'false-negative', label: useNuxtApp().$i18n.t('report.falseNegative') },
]

const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function onSubmit(event: FormSubmitEvent<Schema>) {
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await $fetch<PBPReportResponse>('/api/report', {
      method: 'POST',
      body: event.data,
    })

    if (response.success) {
      successMessage.value = 'Report submitted successfully!'
      state.gameLink = ''
      state.reportType = undefined
      state.issue = ''
      state.description = ''
    } else {
      errorMessage.value = response.error || 'Failed to submit report.'
    }
  } catch {
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
