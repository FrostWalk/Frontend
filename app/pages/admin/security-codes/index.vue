<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Security Codes</h1>
      <UButton to="/admin/security-codes/create" color="primary">
        <Icon name="material-symbols:add" class="mr-2" />
        Create Code
      </UButton>
    </div>

    <div v-if="loading" class="text-center py-12">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading security codes...</p>
    </div>

    <div v-else-if="codes.length === 0" class="text-center py-12">
      <Icon name="material-symbols:key-off" size="64" class="mx-auto text-gray-400" />
      <p class="mt-4 text-lg text-gray-600">No security codes found</p>
      <UButton to="/admin/security-codes/create" color="primary" class="mt-4">
        Create Your First Code
      </UButton>
    </div>

    <UCard v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Code
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Project
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Expiration
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="code in codes" :key="code.security_code_id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <code class="text-sm font-mono font-semibold">{{ code.code }}</code>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    icon="material-symbols:content-copy"
                    @click="copyCode(code.code)"
                  />
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ code.project_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(code.expiration) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge :color="isExpired(code.expiration) ? 'error' : 'success'">
                  {{ isExpired(code.expiration) ? 'Expired' : 'Active' }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <!-- Edit Expiration Button -->
                  <UButton color="primary" variant="ghost" size="sm" @click="editExpiration(code)">
                    <Icon name="material-symbols:edit" size="16" class="mr-1" />
                    Edit
                  </UButton>

                  <!-- Expire Button -->
                  <UButton
                    v-if="!isExpired(code.expiration)"
                    color="warning"
                    variant="ghost"
                    size="sm"
                    @click="openExpireModal(code)"
                  >
                    <Icon name="material-symbols:schedule" size="16" class="mr-1" />
                    Expire
                  </UButton>

                  <!-- Delete Button -->
                  <UButton color="error" variant="ghost" size="sm" @click="openDeleteModal(code)">
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

    <!-- Edit Expiration Modal -->
    <UModal v-model:open="isEditModalOpen">
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
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Expiration Date
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Update the expiration date for security code
            </p>
          </div>
        </div>
      </template>

      <template #body>
        <div v-if="selectedCode" class="space-y-6">
          <!-- Code Info -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="material-symbols:key" size="20" class="text-gray-500" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Security Code</span
              >
            </div>
            <div class="flex items-center gap-2">
              <code class="text-sm font-mono font-semibold">{{ selectedCode.code }}</code>
              <UBadge :color="isExpired(selectedCode.expiration) ? 'error' : 'success'" size="sm">
                {{ isExpired(selectedCode.expiration) ? 'Expired' : 'Active' }}
              </UBadge>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Project: {{ selectedCode.project_name }}
            </p>
          </div>

          <!-- Expiration Date Form -->
          <UForm :state="expirationForm" @submit="updateExpiration">
            <UFormField
              label="New Expiration Date"
              name="expiration"
              required
              :error="expirationFormError"
            >
              <UInput
                v-model="expirationForm.expiration"
                type="datetime-local"
                size="lg"
                icon="material-symbols:schedule"
              />
            </UFormField>

            <div
              class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <UButton color="neutral" variant="outline" size="lg" @click="isEditModalOpen = false">
                <Icon name="material-symbols:close" class="mr-2" />
                Cancel
              </UButton>

              <UButton
                type="submit"
                color="primary"
                size="lg"
                :loading="updating"
                :disabled="!expirationForm.expiration"
              >
                <Icon name="material-symbols:save" class="mr-2" />
                Update Expiration
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen" title="Delete Security Code" :dismissible="false">
      <template #body>
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center mb-4">
            <Icon name="material-symbols:warning" size="48" class="text-red-500" />
          </div>

          <div v-if="selectedCode">
            <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Are you sure you want to delete this security code?
            </p>
            <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <code class="text-lg font-mono font-bold text-primary-600">{{
                selectedCode.code
              }}</code>
            </div>
            <p class="text-sm text-gray-600 mt-2">
              This action cannot be undone. The security code will be permanently removed.
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="neutral" variant="ghost" @click="isDeleteModalOpen = false">
            Cancel
          </UButton>
          <UButton color="error" @click="confirmDelete">
            <Icon name="material-symbols:delete" class="mr-2" />
            Delete Code
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Expire Confirmation Modal -->
    <UModal v-model:open="isExpireModalOpen" title="Expire Security Code" :dismissible="false">
      <template #body>
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center mb-4">
            <Icon name="material-symbols:schedule" size="48" class="text-orange-500" />
          </div>

          <div v-if="selectedCode">
            <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Are you sure you want to expire this security code?
            </p>
            <div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <code class="text-lg font-mono font-bold text-primary-600">{{
                selectedCode.code
              }}</code>
            </div>
            <p class="text-sm text-gray-600 mt-2">
              This will make the security code immediately unusable. You can still edit the
              expiration date later if needed.
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="neutral" variant="ghost" @click="isExpireModalOpen = false">
            Cancel
          </UButton>
          <UButton color="warning" @click="confirmExpire">
            <Icon name="material-symbols:schedule" class="mr-2" />
            Expire Code
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { SecurityCodeWithNames } from '~/composables/api/types.gen'
import { getAllCodesHandler, deleteCodeHandler, updateCodeHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const toast = useToast()
const { showError } = useErrorToast()

const loading = ref(true)
const codes = ref<SecurityCodeWithNames[]>([])
const isEditModalOpen = ref(false)
const updating = ref(false)
const selectedCode = ref<SecurityCodeWithNames | null>(null)
const expirationForm = reactive({
  expiration: ''
})
const expirationFormError = ref('')

// Confirmation modal states
const isDeleteModalOpen = ref(false)
const isExpireModalOpen = ref(false)
const actionType = ref<'delete' | 'expire' | null>(null)

const fetchCodes = async () => {
  loading.value = true
  try {
    const { data, error } = await getAllCodesHandler()

    if (error) {
      showError('Error', error)
      return
    }

    if (data) {
      codes.value = data.codes
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}

const isExpired = (expirationStr: string): boolean => {
  return new Date(expirationStr) < new Date()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    toast.add({
      title: 'Copied',
      description: 'Security code copied to clipboard',
      color: 'success'
    })
  } catch (err) {
    showError('Copy Failed', err)
  }
}

const editExpiration = (code: SecurityCodeWithNames) => {
  selectedCode.value = code
  // Convert the expiration date to datetime-local format
  const date = new Date(code.expiration)
  const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
  expirationForm.expiration = localDateTime
  expirationFormError.value = ''
  isEditModalOpen.value = true
}

const openDeleteModal = (code: SecurityCodeWithNames) => {
  selectedCode.value = code
  actionType.value = 'delete'
  isDeleteModalOpen.value = true
}

const openExpireModal = (code: SecurityCodeWithNames) => {
  selectedCode.value = code
  actionType.value = 'expire'
  isExpireModalOpen.value = true
}

const updateExpiration = async () => {
  if (!selectedCode.value || !expirationForm.expiration) return

  updating.value = true
  expirationFormError.value = ''

  try {
    // Convert datetime-local to ISO 8601 format (same as creation page)
    const expirationDate = new Date(expirationForm.expiration)
    const expirationISO = expirationDate.toISOString()

    const { error } = await updateCodeHandler({
      path: { security_code_id: selectedCode.value.security_code_id },
      body: { expiration: expirationISO }
    })

    if (error) {
      expirationFormError.value = 'Failed to update expiration date'
      showError('Update Failed', error)
      return
    }

    toast.add({
      title: 'Expiration Updated',
      description: `Security code expiration updated successfully`,
      color: 'success'
    })

    // Update local data
    if (selectedCode.value) {
      selectedCode.value.expiration = expirationForm.expiration
    }

    isEditModalOpen.value = false
    await fetchCodes() // Refresh the list
  } catch (err) {
    expirationFormError.value = 'Failed to update expiration date'
    showError('Update Failed', err)
  } finally {
    updating.value = false
  }
}

const confirmDelete = async () => {
  if (!selectedCode.value) return

  try {
    const { error } = await deleteCodeHandler({
      path: { security_code_id: selectedCode.value.security_code_id }
    })

    if (error) {
      showError('Delete Failed', error)
      return
    }

    toast.add({
      title: 'Security Code Deleted',
      description: `Security code "${selectedCode.value.code}" has been deleted successfully`,
      color: 'success'
    })

    // Update local data
    codes.value = codes.value.filter(
      (c) => c.security_code_id !== selectedCode.value!.security_code_id
    )

    // Close modal
    isDeleteModalOpen.value = false
    selectedCode.value = null
    actionType.value = null
  } catch (err) {
    showError('Delete Failed', err)
  }
}

const confirmExpire = async () => {
  if (!selectedCode.value) return

  try {
    // Set expiration to current time to make it expire immediately
    const currentTime = new Date().toISOString()

    const { error } = await updateCodeHandler({
      path: { security_code_id: selectedCode.value.security_code_id },
      body: { expiration: currentTime }
    })

    if (error) {
      showError('Expire Failed', error)
      return
    }

    toast.add({
      title: 'Security Code Expired',
      description: `Security code "${selectedCode.value.code}" has been expired successfully`,
      color: 'warning'
    })

    // Update local data
    const codeIndex = codes.value.findIndex(
      (c) => c.security_code_id === selectedCode.value!.security_code_id
    )
    if (codeIndex !== -1 && codes.value[codeIndex]) {
      codes.value[codeIndex].expiration = currentTime
    }

    // Close modal
    isExpireModalOpen.value = false
    selectedCode.value = null
    actionType.value = null
  } catch (err) {
    showError('Expire Failed', err)
  }
}

onMounted(() => {
  fetchCodes()
})
</script>
