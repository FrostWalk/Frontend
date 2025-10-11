<template>
  <UCard>
    <template #header>
      <h2 class="text-2xl font-bold text-center">Student Registration</h2>
    </template>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="First Name" name="first_name" required>
        <UInput v-model="state.first_name" placeholder="John" class="w-full" />
      </UFormField>

      <UFormField label="Last Name" name="last_name" required>
        <UInput v-model="state.last_name" placeholder="Doe" class="w-full" />
      </UFormField>

      <UFormField label="Email" name="email" required>
        <UInput
          v-model="state.email"
          type="email"
          placeholder="john.doe@studenti.unitn.it"
          class="w-full"
        />
      </UFormField>

      <UFormField label="University ID" name="university_id" required>
        <UInput
          v-model.number="state.university_id"
          type="number"
          placeholder="123456"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Password" name="password" required>
        <UInput
          v-model="state.password"
          type="password"
          placeholder="Enter your password"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Confirm Password" name="confirm_password" required>
        <UInput
          v-model="state.confirm_password"
          type="password"
          placeholder="Confirm your password"
          class="w-full"
        />
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
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import { studentSignupHandler, allowedDomainsHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  layout: 'auth'
})

const toast = useToast()
const { showError } = useErrorToast()
const loading = ref(false)
const allowedDomains = ref<string[]>([])

// Fetch allowed domains
const { data: domainsData } = await allowedDomainsHandler()
if (domainsData?.domains) {
  allowedDomains.value = domainsData.domains
}

const schema = computed(() =>
  v.pipe(
    v.object({
      first_name: v.pipe(
        v.string(),
        v.trim(),
        v.minLength(1, 'First name is required'),
        v.maxLength(50, 'First name must be less than 50 characters')
      ),
      last_name: v.pipe(
        v.string(),
        v.trim(),
        v.minLength(1, 'Last name is required'),
        v.maxLength(50, 'Last name must be less than 50 characters')
      ),
      email: v.pipe(
        v.string(),
        v.trim(),
        v.minLength(1, 'Email is required'),
        v.email('Invalid email address'),
        v.check(
          (email) => {
            if (allowedDomains.value.length === 0) return true
            const domain = email.split('@')[1]?.toLowerCase()
            return allowedDomains.value.some((allowed) => allowed.toLowerCase() === domain)
          },
          () => `Email domain must be one of: ${allowedDomains.value.join(', ')}`
        )
      ),
      university_id: v.pipe(
        v.number('University ID is required'),
        v.integer('University ID must be a number'),
        v.minValue(1, 'University ID must be greater than 0')
      ),
      password: v.pipe(
        v.string(),
        v.minLength(8, 'Password must be at least 8 characters'),
        v.maxLength(100, 'Password must be less than 100 characters')
      ),
      confirm_password: v.pipe(v.string(), v.minLength(1, 'Please confirm your password'))
    }),
    v.forward(
      v.partialCheck(
        [['password'], ['confirm_password']],
        (input) => input.password === input.confirm_password,
        'Passwords do not match'
      ),
      ['confirm_password']
    )
  )
)

type Schema = v.InferOutput<typeof schema.value>

const state = reactive({
  first_name: '',
  last_name: '',
  email: '',
  university_id: undefined as number | undefined,
  password: '',
  confirm_password: ''
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    const { error } = await studentSignupHandler({
      body: {
        first_name: event.data.first_name,
        last_name: event.data.last_name,
        email: event.data.email,
        university_id: event.data.university_id,
        password: event.data.password
      }
    })

    if (error) {
      showError('Registration Failed', error)
      return
    }

    toast.add({
      title: 'Registration Successful',
      description: 'Please check your email to confirm your account',
      color: 'success'
    })

    // Clear form
    Object.assign(state, {
      first_name: '',
      last_name: '',
      email: '',
      university_id: undefined,
      password: '',
      confirm_password: ''
    })

    // Redirect to login after 2 seconds
    setTimeout(() => {
      navigateTo('/login')
    }, 2000)
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}
</script>
