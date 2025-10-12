<template>
  <UCard>
    <template #header>
      <h2 class="text-2xl font-bold text-center">Email Confirmation</h2>
    </template>

    <div class="text-center py-8">
      <div v-if="loading" class="space-y-4">
        <Icon
          name="material-symbols:hourglass-empty"
          size="48"
          class="animate-spin mx-auto text-primary-500"
        />
        <p class="text-gray-600">Confirming your email...</p>
      </div>

      <div v-else-if="success" class="space-y-4">
        <div class="flex justify-center">
          <div class="flex items-center justify-center w-16 h-16 rounded-full bg-green-500">
            <Icon name="material-symbols:check" size="32" class="text-white" />
          </div>
        </div>
        <p class="text-lg font-medium text-gray-900">Account successfully confirmed</p>
        <UButton to="/login" color="primary" block> Go to Login </UButton>
      </div>

      <div v-else-if="error" class="space-y-4">
        <div class="flex justify-center">
          <div class="flex items-center justify-center w-16 h-16 rounded-full bg-red-500">
            <Icon name="material-symbols:close" size="32" class="text-white" />
          </div>
        </div>
        <p class="text-lg font-medium text-red-600">Confirmation failed</p>
        <p class="text-sm text-gray-600">{{ errorMessage }}</p>
        <UButton to="/login" color="primary" block> Go to Login </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { confirmStudentHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()

const loading = ref(true)
const success = ref(false)
const error = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  const token = route.query.t as string

  if (!token) {
    error.value = true
    errorMessage.value = 'No confirmation token provided'
    loading.value = false
    return
  }

  try {
    const response = await confirmStudentHandler({
      query: { t: token }
    })

    if (response.error) {
      error.value = true
      errorMessage.value = response.error.error || 'Invalid or expired token'
    } else {
      success.value = true
    }
  } catch {
    error.value = true
    errorMessage.value = 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
})
</script>
