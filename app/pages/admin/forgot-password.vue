<template>
  <UCard>
    <template #header>
      <div class="text-center">
        <Icon
          name="material-symbols:admin-panel-settings"
          size="48"
          class="mx-auto text-primary-500 mb-2"
        />
        <h2 class="text-2xl font-bold">Admin Password Reset</h2>
        <p class="text-gray-600 text-sm mt-2">Enter your email to receive a password reset link</p>
      </div>
    </template>

    <UForm v-if="!emailSent" :state="form" class="space-y-4" @submit="onSubmit">
      <UFormField label="Email" name="email" required>
        <UInput v-model="form.email" type="email" placeholder="admin@example.com" class="w-full" />
      </UFormField>

      <UButton type="submit" block :loading="loading">
        <Icon name="material-symbols:send" class="mr-2" />
        Send Reset Link
      </UButton>
    </UForm>

    <div v-else class="text-center py-4">
      <Icon name="material-symbols:check-circle" size="64" class="mx-auto text-success-500 mb-4" />
      <p class="text-gray-700 dark:text-gray-300 mb-2">
        If an admin account exists with this email, you'll receive a password reset link shortly.
      </p>
      <p class="text-sm text-gray-500">Check your inbox and spam folder.</p>
    </div>

    <template #footer>
      <div class="text-center text-sm">
        <NuxtLink to="/admin/login" class="text-primary-500 hover:text-primary-600">
          Back to Login
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { forgotPasswordHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  layout: 'auth',
  middleware: 'admin-guest'
})

const toast = useToast()
const { showError } = useErrorToast()
const loading = ref(false)
const emailSent = ref(false)

const form = reactive({
  email: ''
})

const onSubmit = async () => {
  loading.value = true

  try {
    const { error } = await forgotPasswordHandler({
      body: {
        email: form.email
      }
    })

    if (error) {
      showError('Error', error)
      return
    }

    emailSent.value = true
    toast.add({
      title: 'Email Sent',
      description: 'Check your inbox for the password reset link',
      color: 'success'
    })
  } catch (err: unknown) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}
</script>
