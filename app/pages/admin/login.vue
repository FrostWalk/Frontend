<template>
  <UCard>
    <template #header>
      <div class="text-center">
        <Icon
          name="material-symbols:admin-panel-settings"
          size="48"
          class="mx-auto text-primary-500 mb-2"
        />
        <h2 class="text-2xl font-bold">Admin Login</h2>
      </div>
    </template>

    <UForm :state="form" class="space-y-4" @submit="onSubmit">
      <UFormField label="Email" name="email" required>
        <UInput v-model="form.email" type="email" placeholder="admin@example.com" />
      </UFormField>

      <UFormField label="Password" name="password" required>
        <UInput v-model="form.password" type="password" placeholder="Enter your password" />
      </UFormField>

      <UButton type="submit" block :loading="loading">
        <Icon name="material-symbols:login" class="mr-2" />
        Login
      </UButton>
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
  layout: 'auth'
})

const { login } = useAdminAuth()
const toast = useToast()
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
    toast.add({
      title: 'Login Failed',
      description: err instanceof Error ? err.message : 'Invalid credentials',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>
