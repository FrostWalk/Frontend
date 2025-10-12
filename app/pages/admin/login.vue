<template>
  <UCard>
    <template #header>
      <h2 class="text-2xl font-bold text-center">Admin Login</h2>
    </template>

    <UForm :state="form" class="space-y-4" @submit="onSubmit">
      <UFormField label="Email" name="email" required>
        <UInput v-model="form.email" type="email" placeholder="admin@example.com" class="w-full" />
      </UFormField>

      <UFormField label="Password" name="password" required>
        <UInput
          v-model="form.password"
          type="password"
          placeholder="Enter your password"
          class="w-full"
        />
      </UFormField>

      <UButton type="submit" block :loading="loading"> Login </UButton>
    </UForm>

    <template #footer>
      <div class="text-center text-sm">
        <NuxtLink to="/admin/forgot-password" class="text-gray-500 hover:text-gray-600">
          Forgot password?
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'admin-guest'
})

const { login } = useAdminAuth()
const toast = useToast()
const { showError } = useErrorToast()
const loading = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const onSubmit = async () => {
  loading.value = true

  try {
    await login({
      email: form.email,
      password: form.password
    })

    toast.add({
      title: 'Login Successful',
      description: 'Welcome back!',
      color: 'success'
    })

    navigateTo('/admin/projects')
  } catch (err: unknown) {
    showError('Login Failed', err)
  } finally {
    loading.value = false
  }
}
</script>
