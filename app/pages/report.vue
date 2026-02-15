<template>
  <div class="p-4">
    <h1 class="mb-4 text-3xl font-bold">
      WBSC-PBP-Checker
    </h1>
    <div class="mb-4">
      <NuxtLink to="/" class="text-blue-600 hover:text-blue-400">
        &larr; Back to checker
      </NuxtLink>
    </div>
    <h2 class="mb-4 text-2xl font-bold">
      Report problem
    </h2>

    <UForm :schema="schema" :state="state" class="max-w-lg space-y-4" @submit="onSubmit">
      <UFormField label="Game link" name="gameLink" required>
        <UInput v-model="state.gameLink" placeholder="https://game.wbsc.org/..." class="w-full" />
      </UFormField>

      <UFormField label="Report type" name="reportType" required>
        <URadioGroup v-model="state.reportType" :items="reportTypeOptions" />
      </UFormField>

      <UFormField label="Issue" name="issue" required>
        <UInput v-model="state.issue" placeholder="Brief summary of the problem" class="w-full" />
      </UFormField>

      <UFormField label="Description" name="description" required>
        <UTextarea v-model="state.description" placeholder="Describe the problem in detail..." :rows="5" class="w-full" />
      </UFormField>

      <div class="flex items-center gap-4">
        <UButton type="submit" :loading="submitting">
          Submit report
        </UButton>
        <span v-if="successMessage" class="text-green-600 font-medium">{{ successMessage }}</span>
        <span v-if="errorMessage" class="text-red-600 font-medium">{{ errorMessage }}</span>
      </div>
    </UForm>
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
  { value: 'false-positive', label: 'Report false positive' },
  { value: 'false-negative', label: 'Report false negative' },
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
