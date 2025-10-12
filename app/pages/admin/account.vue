<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Manage your account information and security settings
      </p>
    </div>

    <div class="space-y-6">
      <!-- Profile Information -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:person" class="text-primary-500" size="20" />
            <h2 class="text-lg font-semibold">Profile Information</h2>
          </div>
        </template>

        <UForm :state="profileForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="First Name" name="first_name" required>
              <UInput v-model="profileForm.first_name" placeholder="Enter first name" />
            </UFormField>

            <UFormField label="Last Name" name="last_name" required>
              <UInput v-model="profileForm.last_name" placeholder="Enter last name" />
            </UFormField>
          </div>

          <UFormField label="Email" name="email" required>
            <UInput v-model="profileForm.email" type="email" placeholder="Enter email" />
          </UFormField>

          <div class="flex justify-end pt-4">
            <UButton :loading="updatingProfile" @click="updateProfile">
              <Icon name="material-symbols:save" class="mr-2" />
              Save Changes
            </UButton>
          </div>
        </UForm>
      </UCard>

      <!-- Change Password -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:lock" class="text-primary-500" size="20" />
            <h2 class="text-lg font-semibold">Change Password</h2>
          </div>
        </template>

        <UForm :state="passwordForm" class="space-y-4">
          <UFormField label="Current Password" name="current_password" required>
            <UInput
              v-model="passwordForm.current_password"
              type="password"
              placeholder="Enter current password"
            />
          </UFormField>

          <UFormField label="New Password" name="new_password" required>
            <UInput
              v-model="passwordForm.new_password"
              type="password"
              placeholder="Enter new password"
            />
          </UFormField>

          <UFormField label="Confirm New Password" name="confirm_password" required>
            <UInput
              v-model="passwordForm.confirm_password"
              type="password"
              placeholder="Confirm new password"
            />
          </UFormField>

          <div class="flex justify-end pt-4">
            <UButton :loading="changingPassword" @click="changePassword">
              <Icon name="material-symbols:lock-reset" class="mr-2" />
              Change Password
            </UButton>
          </div>
        </UForm>
      </UCard>

      <!-- Account Information -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:info" class="text-primary-500" size="20" />
            <h2 class="text-lg font-semibold">Account Information</h2>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Admin ID</p>
            <p class="font-medium">{{ user?.id }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Role</p>
            <UBadge color="primary" variant="soft">
              {{ getRoleName(roleId) }}
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { updateAdminHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const { user, roleId, roles } = useAdminAuth()
const toast = useToast()
const { showError } = useErrorToast()

const updatingProfile = ref(false)
const changingPassword = ref(false)

const profileForm = reactive({
  first_name: '',
  last_name: '',
  email: ''
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const getRoleName = (id: number | null): string => {
  if (id === roles.ROOT) return 'Root'
  if (id === roles.PROFESSOR) return 'Professor'
  if (id === roles.COORDINATOR) return 'Coordinator'
  return 'Unknown'
}

const loadProfileData = () => {
  if (user.value) {
    profileForm.first_name = user.value.first_name
    profileForm.last_name = user.value.last_name
    profileForm.email = user.value.email
  }
}

const updateProfile = async () => {
  if (!user.value) return

  updatingProfile.value = true

  try {
    const { error } = await updateAdminHandler({
      path: { id: user.value.id },
      body: {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email
      }
    })

    if (error) {
      showError('Update Failed', error)
      return
    }

    // Update local user data
    user.value.first_name = profileForm.first_name
    user.value.last_name = profileForm.last_name
    user.value.email = profileForm.email

    toast.add({
      title: 'Profile Updated',
      description: 'Your profile information has been updated successfully',
      color: 'success'
    })
  } catch (err) {
    showError('Error', err)
  } finally {
    updatingProfile.value = false
  }
}

const changePassword = async () => {
  if (!user.value) return

  // Validate passwords match
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    toast.add({
      title: 'Validation Error',
      description: 'New passwords do not match',
      color: 'error'
    })
    return
  }

  // Validate password length
  if (passwordForm.new_password.length < 8) {
    toast.add({
      title: 'Validation Error',
      description: 'Password must be at least 8 characters long',
      color: 'error'
    })
    return
  }

  changingPassword.value = true

  try {
    const { error } = await updateAdminHandler({
      path: { id: user.value.id },
      body: {
        password: passwordForm.new_password
      }
    })

    if (error) {
      showError('Password Change Failed', error)
      return
    }

    // Reset form
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''

    toast.add({
      title: 'Password Changed',
      description: 'Your password has been updated successfully',
      color: 'success'
    })
  } catch (err) {
    showError('Error', err)
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  loadProfileData()
})
</script>
