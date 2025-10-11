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

    <div v-if="loading" class="text-center py-12">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading admins...</p>
    </div>

    <UCard v-else>
      <div class="overflow-x-auto">
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
                <UButton
                  v-if="roleId === roles.PROFESSOR || roleId === roles.ROOT"
                  color="error"
                  variant="ghost"
                  size="sm"
                  @click="deleteAdmin(admin.id)"
                >
                  Delete
                </UButton>
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

const { roleId, roles } = useAdminAuth()
const toast = useToast()
const { showError } = useErrorToast()

const loading = ref(true)
const admins = ref<AdminResponseScheme[]>([])

const filteredAdmins = computed(() => admins.value)

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
