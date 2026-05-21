<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Blacklist</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage blocked students across projects.
        </p>
      </div>
    </div>

    <div class="mb-6">
      <UInput
        v-model="searchTerm"
        placeholder="Search by name, ID, or description..."
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
      <p class="mt-4 text-gray-600">Loading blacklist...</p>
    </div>

    <UCard v-else>
      <div v-if="filteredEntries.length === 0" class="text-center py-12">
        <Icon name="material-symbols:block" size="56" class="mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No blacklisted students
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{
            searchTerm.trim()
              ? `No entries match "${searchTerm}"`
              : 'Blacklist table is currently empty.'
          }}
        </p>
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
                University ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Banned At
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="entry in filteredEntries" :key="entry.blacklist_id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ entry.first_name }} {{ entry.last_name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  {{ entry.university_id }}
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {{ entry.description || 'No description' }}
                </p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDateTime(entry.banned_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <UButton color="primary" variant="ghost" size="sm" @click="openEditModal(entry)">
                    <Icon name="material-symbols:edit" size="16" class="mr-1" />
                    Edit
                  </UButton>
                  <UButton color="error" variant="ghost" size="sm" @click="openDeleteModal(entry)">
                    <Icon name="material-symbols:delete" size="16" class="mr-1" />
                    Delete
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <UModal v-model:open="isEditModalOpen" title="Edit Blacklist Entry">
      <template #body>
        <UForm :state="editForm" class="space-y-4" @submit="updateEntry">
          <UFormField label="First Name" name="first_name" required>
            <UInput v-model="editForm.first_name" />
          </UFormField>
          <UFormField label="Last Name" name="last_name" required>
            <UInput v-model="editForm.last_name" />
          </UFormField>
          <UFormField label="Description" name="description">
            <UTextarea
              v-model="editForm.description"
              :rows="4"
              placeholder="Optional reason for blacklisting"
            />
          </UFormField>
        </UForm>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="neutral" variant="ghost" @click="isEditModalOpen = false">Cancel</UButton>
          <UButton color="primary" :loading="savingEdit" @click="updateEntry">Save</UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="isDeleteModalOpen" title="Delete Blacklist Entry" :dismissible="false">
      <template #body>
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center mb-4">
            <Icon name="material-symbols:warning" size="48" class="text-red-500" />
          </div>
          <div v-if="selectedEntry">
            <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Delete blacklist entry for {{ selectedEntry.first_name }}
              {{ selectedEntry.last_name }}?
            </p>
            <p class="text-sm text-gray-600">
              This action cannot be undone. Student will be removed from blacklist.
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="neutral" variant="ghost" @click="isDeleteModalOpen = false"
            >Cancel</UButton
          >
          <UButton color="error" :loading="deleting" @click="deleteEntry">
            <Icon name="material-symbols:delete" class="mr-2" />
            Delete Entry
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Blacklist } from '~/composables/api/types.gen'
import {
  listBlacklistHandler,
  updateBlacklistHandler,
  deleteBlacklistHandler
} from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const { roleId, roles } = useAdminAuth()
const toast = useToast()
const { showError } = useErrorToast()

const loading = ref(true)
const savingEdit = ref(false)
const deleting = ref(false)
const searchTerm = ref('')
const entries = ref<Blacklist[]>([])
const selectedEntry = ref<Blacklist | null>(null)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const editForm = reactive({
  first_name: '',
  last_name: '',
  description: ''
})

const filteredEntries = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return entries.value

  return entries.value.filter((entry) => {
    const fullName = `${entry.first_name} ${entry.last_name}`.toLowerCase()
    const description = (entry.description || '').toLowerCase()
    return (
      fullName.includes(term) ||
      description.includes(term) ||
      String(entry.university_id).includes(term)
    )
  })
})

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchBlacklist = async () => {
  loading.value = true
  try {
    const { data, error } = await listBlacklistHandler()
    if (error) {
      showError('Failed to load blacklist', error)
      return
    }

    entries.value = data?.blacklist ?? []
  } catch (error) {
    showError('Failed to load blacklist', error)
  } finally {
    loading.value = false
  }
}

const openEditModal = (entry: Blacklist) => {
  selectedEntry.value = entry
  editForm.first_name = entry.first_name
  editForm.last_name = entry.last_name
  editForm.description = entry.description || ''
  isEditModalOpen.value = true
}

const openDeleteModal = (entry: Blacklist) => {
  selectedEntry.value = entry
  isDeleteModalOpen.value = true
}

const updateEntry = async () => {
  if (!selectedEntry.value) return

  savingEdit.value = true
  try {
    const { data, error } = await updateBlacklistHandler({
      path: { blacklist_id: selectedEntry.value.blacklist_id },
      body: {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        description: editForm.description || null
      }
    })

    if (error) {
      showError('Update failed', error)
      return
    }

    if (data) {
      entries.value = entries.value.map((entry) =>
        entry.blacklist_id === data.blacklist.blacklist_id ? data.blacklist : entry
      )
    }

    toast.add({
      title: 'Blacklist updated',
      description: 'Entry updated successfully',
      color: 'success'
    })

    isEditModalOpen.value = false
    selectedEntry.value = null
  } catch (error) {
    showError('Update failed', error)
  } finally {
    savingEdit.value = false
  }
}

const deleteEntry = async () => {
  if (!selectedEntry.value) return

  deleting.value = true
  try {
    const { error } = await deleteBlacklistHandler({
      path: { blacklist_id: selectedEntry.value.blacklist_id }
    })

    if (error) {
      showError('Delete failed', error)
      return
    }

    entries.value = entries.value.filter(
      (entry) => entry.blacklist_id !== selectedEntry.value!.blacklist_id
    )

    toast.add({
      title: 'Entry deleted',
      description: 'Student removed from blacklist',
      color: 'success'
    })

    isDeleteModalOpen.value = false
    selectedEntry.value = null
  } catch (error) {
    showError('Delete failed', error)
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  if (roleId.value === roles.COORDINATOR) {
    await navigateTo('/admin/projects')
    return
  }

  await fetchBlacklist()
})
</script>
