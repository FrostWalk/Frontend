<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Users</h1>
      <UButton
        v-if="roleId === roles.PROFESSOR || roleId === roles.ROOT"
        to="/admin/users/create"
        color="primary"
      >
        <Icon name="material-symbols:person-add" class="mr-2" />
        Create Admin
      </UButton>
    </div>

    <!-- Search Input -->
    <div class="mb-6">
      <UInput
        v-model="searchTerm"
        placeholder="Search admins by name or email..."
        icon="material-symbols:search"
        size="lg"
        class="max-w-md"
      />
    </div>

    <div v-if="loading" class="text-center py-12">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading admins...</p>
    </div>

    <UCard v-else>
      <div v-if="filteredAdmins.length === 0 && searchTerm" class="text-center py-12">
        <Icon name="material-symbols:search-off" size="64" class="mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No admins found</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          No admins match your search for "{{ searchTerm }}"
        </p>
        <UButton color="primary" variant="outline" @click="searchTerm = ''">
          <Icon name="material-symbols:clear" class="mr-2" />
          Clear search
        </UButton>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="admin in filteredAdmins" :key="admin.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ admin.first_name }} {{ admin.last_name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ admin.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge :color="getRoleColor(admin.role_id)">
                  {{ getRoleName(admin.role_id) }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <!-- Edit Button -->
                  <UButton
                    v-if="roleId === roles.PROFESSOR || roleId === roles.ROOT"
                    :to="`/admin/users/${admin.id}`"
                    color="primary"
                    variant="ghost"
                    size="sm"
                  >
                    <Icon name="material-symbols:edit" size="16" class="mr-1" />
                    Edit
                  </UButton>

                  <!-- Delete Button -->
                  <UButton
                    v-if="
                      (roleId === roles.PROFESSOR || roleId === roles.ROOT) &&
                      !isCurrentUser(admin.id)
                    "
                    color="error"
                    variant="ghost"
                    size="sm"
                    @click="deleteAdmin(admin.id)"
                  >
                    <Icon name="material-symbols:delete" size="16" class="mr-1" />
                    Delete
                  </UButton>

                  <!-- Self-deletion message -->
                  <span
                    v-if="isCurrentUser(admin.id)"
                    class="text-sm text-gray-400 dark:text-gray-500 italic"
                  >
                    Cannot delete yourself
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { AdminResponseScheme } from '~/composables/api/types.gen'
import { getAllAdminsHandler, deleteAdminHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const { roleId, roles, user } = useAdminAuth()
const toast = useToast()
const { showError } = useErrorToast()

const loading = ref(true)
const admins = ref<AdminResponseScheme[]>([])
const searchTerm = ref('')

const filteredAdmins = computed(() => {
  let filtered = admins.value

  // If current user is professor, hide root admins
  if (roleId.value === roles.PROFESSOR) {
    filtered = filtered.filter((admin) => admin.role_id !== roles.ROOT)
  }

  // Apply search filter
  if (searchTerm.value.trim()) {
    const search = searchTerm.value.toLowerCase().trim()
    filtered = filtered.filter((admin) => {
      const fullName = `${admin.first_name} ${admin.last_name}`.toLowerCase()
      const email = admin.email.toLowerCase()
      return fullName.includes(search) || email.includes(search)
    })
  }

  return filtered
})

const isCurrentUser = (adminId: number) => {
  return user.value?.id === adminId
}

const fetchAdmins = async () => {
  loading.value = true
  try {
    const { data, error } = await getAllAdminsHandler()

    if (error) {
      showError('Error', error)
      return
    }

    if (data) {
      admins.value = data.admins
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}

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

const deleteAdmin = async (id: number) => {
  // Prevent self-deletion
  if (isCurrentUser(id)) {
    showError('Cannot Delete Yourself', 'You cannot delete your own admin account.')
    return
  }

  if (!confirm('Are you sure you want to delete this admin?')) return

  try {
    const { error } = await deleteAdminHandler({
      path: { id }
    })

    if (error) {
      showError('Delete Failed', error)
      return
    }

    toast.add({
      title: 'Admin Deleted',
      description: 'Admin deleted successfully',
      color: 'success'
    })

    await fetchAdmins()
  } catch (err) {
    showError('Error', err)
  }
}

onMounted(() => {
  fetchAdmins()
})
</script>
