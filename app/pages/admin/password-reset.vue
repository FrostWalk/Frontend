<template>
  <UCard>
    <template #header>
      <div class="text-center">
        <Icon
          name="material-symbols:admin-panel-settings"
          size="48"
          class="mx-auto text-primary-500 mb-2"
        />
        <h2 class="text-2xl font-bold">Reset Admin Password</h2>
        <p class="text-gray-600 text-sm mt-2">Enter your new password below</p>
      </div>
    </template>

    <UForm v-if="!passwordReset" :state="form" class="space-y-4" @submit="onSubmit">
      <UFormField label="New Password" name="password" required>
        <UInput
          v-model="form.password"
          type="password"
          placeholder="Enter your new password"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Confirm Password" name="confirmPassword" required>
        <UInput
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirm your new password"
          class="w-full"
        />
      </UFormField>

      <UButton type="submit" block :loading="loading" :disabled="!isFormValid">
        <Icon name="material-symbols:lock-reset" class="mr-2" />
        Reset Password
      </UButton>
    </UForm>

    <div v-else class="text-center py-4">
      <Icon name="material-symbols:check-circle" size="64" class="mx-auto text-success-500 mb-4" />
      <p class="text-gray-700 dark:text-gray-300 mb-2">
        Your admin password has been successfully reset!
      </p>
      <p class="text-sm text-gray-500">You can now log in with your new password.</p>
    </div>

    <template #footer>
      <div class="text-center text-sm">
        <NuxtLink to="/admin/login" class="text-primary-500 hover:text-primary-600">
          Back to Admin Login
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { resetPasswordHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  layout: 'auth',
  middleware: 'admin-guest'
})

const route = useRoute()
const toast = useToast()
const { showError } = useErrorToast()
const loading = ref(false)
const passwordReset = ref(false)

const form = reactive({
  password: '',
  confirmPassword: ''
})

const isFormValid = computed(() => {
  return form.password.length >= 8 && form.password === form.confirmPassword
})

const onSubmit = async () => {
  if (!isFormValid.value) {
    toast.add({
      title: 'Invalid Form',
      description: 'Please ensure passwords match and are at least 8 characters long',
      color: 'error'
    })
    return
  }

  const token = route.query.t as string

  if (!token) {
    toast.add({
      title: 'Invalid Link',
      description: 'This password reset link is invalid or missing a token',
      color: 'error'
    })
    return
  }

  loading.value = true

  try {
    const { error } = await resetPasswordHandler({
      body: {
        new_password: form.password
      },
      query: {
        t: token
      }
    })

    if (error) {
      // Check if it's a 400 error (invalid/expired token) by looking at the error message
      if (error.error && error.error.toLowerCase().includes('invalid')) {
        toast.add({
          title: 'Invalid Token',
          description:
            'This password reset link is invalid or has expired. Please request a new one.',
          color: 'error'
        })
      } else {
        showError('Password Reset Failed', error)
      }
      return
    }

    passwordReset.value = true
    toast.add({
      title: 'Password Reset Successful',
      description: 'Your admin password has been updated successfully',
      color: 'success'
    })
  } catch (err: unknown) {
    showError('Password Reset Failed', err)
  } finally {
    loading.value = false
  }
}

// Check if token exists on page load
onMounted(() => {
  const token = route.query.t as string
  if (!token) {
    toast.add({
      title: 'Invalid Link',
      description: 'This password reset link is invalid or missing a token',
      color: 'error'
    })
  }
})
</script>
