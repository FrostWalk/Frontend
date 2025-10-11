<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Admin User</h1>

    <UCard>
      <UForm :state="form" class="space-y-4" @submit="onSubmit">
        <UFormField label="First Name" name="first_name" required>
          <UInput v-model="form.first_name" placeholder="John" />
        </UFormField>

        <UFormField label="Last Name" name="last_name" required>
          <UInput v-model="form.last_name" placeholder="Doe" />
        </UFormField>

        <UFormField label="Email" name="email" required>
          <UInput v-model="form.email" type="email" placeholder="john.doe@example.com" />
        </UFormField>

        <UFormField label="Role" name="admin_role_id" required>
          <USelectMenu
            v-model="selectedRole"
            :options="roleOptions"
            option-attribute="label"
            value-attribute="value"
            placeholder="Select a role"
          />
          <p v-if="selectedRole" class="text-sm text-gray-600 mt-1">
            Selected: {{ selectedRole.label }}
          </p>
        </UFormField>

        <UAlert
          icon="material-symbols:info"
          color="secondary"
          title="Auto-generated Password"
          description="A secure password will be automatically generated and sent to the admin's email address."
        />

        <div class="flex gap-3 pt-4">
          <UButton type="submit" :loading="loading">
            <Icon name="material-symbols:person-add" class="mr-2" />
            Create Admin
          </UButton>
          <UButton to="/admin/users" color="neutral" variant="ghost"> Cancel </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { createAdminHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const { roleId, roles } = useAdminAuth()
const toast = useToast()
const { showError } = useErrorToast()
const loading = ref(false)

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  admin_role_id: 3 // Default to Coordinator
})

const roleOptions = computed(() => {
  const options = [
    { value: 3, label: 'Coordinator' },
    { value: 2, label: 'Professor' }
  ]

  // Only Root can create Root users
  if (roleId.value === roles.ROOT) {
    options.unshift({ value: 1, label: 'Root' })
  }

  return options
})

const selectedRole = ref(roleOptions.value.find((r) => r.value === 3))

watch(selectedRole, (role) => {
  if (role) {
    form.admin_role_id = role.value
  }
})

const onSubmit = async () => {
  loading.value = true

  try {
    const { data, error } = await createAdminHandler({
      body: {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        admin_role_id: form.admin_role_id
      }
    })

    if (error) {
      showError('Admin Creation Failed', error)
      return
    }

    if (data) {
      toast.add({
        title: 'Admin Created',
        description: 'Admin account created successfully. Credentials have been sent via email.',
        color: 'success'
      })

      navigateTo('/admin/users')
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}
</script>
