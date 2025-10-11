<template>
  <UCard>
    <template #header>
      <h2 class="text-2xl font-bold text-center">Student Registration</h2>
    </template>

    <UForm :state="form" class="space-y-4" @submit="onSubmit">
      <UFormField label="First Name" name="first_name" required>
        <UInput v-model="form.first_name" placeholder="John" />
      </UFormField>

      <UFormField label="Last Name" name="last_name" required>
        <UInput v-model="form.last_name" placeholder="Doe" />
      </UFormField>

      <UFormField label="Email" name="email" required>
        <UInput v-model="form.email" type="email" placeholder="john.doe@studenti.unitn.it" />
      </UFormField>

      <UFormField label="University ID" name="university_id" required>
        <UInput v-model.number="form.university_id" type="number" placeholder="123456" />
      </UFormField>

      <UFormField label="Password" name="password" required>
        <UInput v-model="form.password" type="password" placeholder="Enter your password" />
      </UFormField>

      <UButton type="submit" block :loading="loading"> Register </UButton>
    </UForm>

    <template #footer>
      <div class="text-center text-sm">
        Already have an account?
        <NuxtLink to="/login" class="text-primary-500 hover:text-primary-600">
          Login here
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { studentSignupHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  layout: 'auth'
})

const toast = useToast()
const loading = ref(false)

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  university_id: null as number | null,
  password: ''
})

const onSubmit = async () => {
  loading.value = true

  try {
    const { error } = await studentSignupHandler({
      body: {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        university_id: form.university_id!,
        password: form.password
      }
    })

    if (error) {
      toast.add({
        title: 'Registration Failed',
        description: error.error || 'An error occurred during registration',
        color: 'error'
      })
      return
    }

    toast.add({
      title: 'Registration Successful',
      description: 'Please check your email to confirm your account',
      color: 'success'
    })

    // Clear form
    Object.assign(form, {
      first_name: '',
      last_name: '',
      email: '',
      university_id: null,
      password: ''
    })

    // Redirect to login after 2 seconds
    setTimeout(() => {
      navigateTo('/login')
    }, 2000)
  } catch {
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>
