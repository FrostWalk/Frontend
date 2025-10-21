<template>
  <div class="max-w-2xl mx-auto">
    <div v-if="loading" class="text-center py-12">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading admin...</p>
    </div>

    <div v-else-if="!admin" class="text-center py-12">
      <Icon name="material-symbols:person-off" size="64" class="mx-auto text-gray-400 mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Not Found</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        The admin you're looking for doesn't exist.
      </p>
      <UButton to="/admin/users" color="primary">
        <Icon name="material-symbols:arrow-back" class="mr-2" />
        Back to Admins
      </UButton>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Edit Admin</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Update {{ admin.first_name }} {{ admin.last_name }}'s information
          </p>
        </div>
        <UButton to="/admin/users" color="neutral" variant="outline">
          <Icon name="material-symbols:arrow-back" class="mr-2" />
          Back to Admins
        </UButton>
      </div>

      <!-- Edit Form -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Icon
                name="material-symbols:edit"
                class="text-primary-600 dark:text-primary-400"
                size="20"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Admin Details</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Update the admin's information</p>
            </div>
          </div>
        </template>

        <UForm :state="form" class="space-y-6" @submit="updateAdmin">
          <!-- Current Role Display -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="material-symbols:admin-panel-settings" size="20" class="text-gray-500" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Current Role</span>
            </div>
            <UBadge :color="getRoleColor(admin.role_id)" size="lg">
              {{ getRoleName(admin.role_id) }}
            </UBadge>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Role cannot be changed through this form
            </p>
          </div>

          <!-- First Name -->
          <UFormField label="First Name" name="first_name" required :error="errors.first_name">
            <UInput
              v-model="form.first_name"
              placeholder="Enter first name"
              size="lg"
              icon="material-symbols:person"
            />
          </UFormField>

          <!-- Last Name -->
          <UFormField label="Last Name" name="last_name" required :error="errors.last_name">
            <UInput
              v-model="form.last_name"
              placeholder="Enter last name"
              size="lg"
              icon="material-symbols:person"
            />
          </UFormField>

          <!-- Email -->
          <UFormField label="Email Address" name="email" required :error="errors.email">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="Enter email address"
              size="lg"
              icon="material-symbols:mail"
            />
          </UFormField>

          <!-- Password Section -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="flex items-center gap-2 mb-4">
              <Icon name="material-symbols:lock" size="20" class="text-gray-500" />
              <h4 class="text-lg font-medium text-gray-900 dark:text-white">Password</h4>
            </div>

            <UAlert
              icon="material-symbols:info"
              color="info"
              variant="soft"
              title="Password Update"
              description="Leave the password field empty to keep the current password unchanged."
              class="mb-4"
            />

            <UFormField label="New Password" name="password" :error="errors.password">
              <UInput
                v-model="form.password"
                type="password"
                placeholder="Enter new password (leave empty to keep current)"
                size="lg"
                icon="material-symbols:lock"
              />
            </UFormField>
          </div>

          <!-- Action Buttons -->
          <div
            class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <UButton to="/admin/users" color="neutral" variant="outline" size="lg">
              <Icon name="material-symbols:close" class="mr-2" />
              Cancel
            </UButton>

            <UButton
              type="submit"
              color="primary"
              size="lg"
              :loading="updating"
              :disabled="!isFormValid"
            >
              <Icon name="material-symbols:save" class="mr-2" />
              Update Admin
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminResponseScheme, UpdateAdminScheme } from '~/composables/api/types.gen'
import { getOneAdminHandler, updateAdminHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const route = useRoute()
const toast = useToast()
const { showError } = useErrorToast()

const loading = ref(true)
const updating = ref(false)
const admin = ref<AdminResponseScheme | null>(null)

const form = reactive<UpdateAdminScheme>({
  first_name: '',
  last_name: '',
  email: '',
  password: ''
})

const errors = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: ''
})

const isFormValid = computed(() => {
  return form.first_name && form.last_name && form.email
})

const getRoleName = (roleId: number): string => {
  if (roleId === 1) return 'Root'
  if (roleId === 2) return 'Professor'
  if (roleId === 3) return 'Coordinator'
  return 'Unknown'
}

const getRoleColor = (roleId: number) => {
  if (roleId === 1) return 'error'
  if (roleId === 2) return 'info'
  if (roleId === 3) return 'success'
  return 'neutral'
}

const fetchAdmin = async () => {
  loading.value = true
  try {
    const adminId = parseInt(route.params.id as string)
    const { data, error } = await getOneAdminHandler({
      path: { id: adminId }
    })

    if (error) {
      showError('Error', error)
      return
    }

    if (data) {
      admin.value = data
      form.first_name = data.first_name
      form.last_name = data.last_name
      form.email = data.email
      form.password = '' // Don't pre-fill password
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}

const updateAdmin = async () => {
  if (!admin.value) return

  updating.value = true

  // Clear previous errors
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })

  try {
    // Prepare update data - only include fields that have values
    const updateData: UpdateAdminScheme = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email
    }

    // Only include password if it's not empty
    if (form.password && form.password.trim()) {
      updateData.password = form.password
    }

    const { data, error } = await updateAdminHandler({
      path: { id: admin.value.id },
      body: updateData
    })

    if (error) {
      showError('Update Failed', error)
      return
    }

    if (data) {
      toast.add({
        title: 'Admin Updated',
        description: `${form.first_name} ${form.last_name} has been updated successfully`,
        color: 'success'
      })

      // Update local admin data with form values
      if (admin.value) {
        admin.value.first_name = form.first_name || ''
        admin.value.last_name = form.last_name || ''
        admin.value.email = form.email || ''
      }

      // Clear password field
      form.password = ''
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  fetchAdmin()
})
</script>
