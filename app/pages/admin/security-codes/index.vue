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
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { SecurityCodeWithNames } from '~/composables/api/types.gen'
import { getAllCodesHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const toast = useToast()
const { showError } = useErrorToast()

const loading = ref(true)
const codes = ref<SecurityCodeWithNames[]>([])

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

onMounted(() => {
  fetchCodes()
})
</script>
