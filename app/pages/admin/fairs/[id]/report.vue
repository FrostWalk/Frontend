<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Fair Report</h1>
        <p class="text-sm text-gray-600">Review sold/bought transactions by group</p>
      </div>
      <UButton
        color="neutral"
        variant="soft"
        icon="material-symbols:arrow-back"
        @click="navigateBack"
      >
        Back
      </UButton>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <Icon name="material-symbols:filter-alt" size="20" class="text-primary-500" />
          <h2 class="font-semibold">Load Group Report</h2>
        </div>
      </template>

      <div class="flex flex-wrap items-end gap-3">
        <UFormField label="Fair ID" name="fair_id">
          <UInput :model-value="String(fairId)" disabled />
        </UFormField>
        <UFormField label="Group ID" name="group_id" required>
          <UInput v-model.number="groupId" type="number" min="1" placeholder="Enter group ID" />
        </UFormField>
        <UButton color="primary" :loading="loading" @click="loadReport">Load Report</UButton>
      </div>
    </UCard>

    <UCard v-if="loading">
      <div class="text-center py-10">
        <Icon
          name="material-symbols:hourglass-empty"
          size="40"
          class="animate-spin mx-auto text-primary-500"
        />
        <p class="mt-3 text-gray-600">Loading report...</p>
      </div>
    </UCard>

    <UAlert
      v-else-if="!report"
      icon="material-symbols:info"
      color="neutral"
      title="No report loaded"
      description="Enter a group ID and click Load Report."
    />

    <UCard v-else>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold">{{ report.group_name }}</h2>
            <p class="text-sm text-gray-600">Group ID: {{ report.group_id }}</p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge :color="report.purchases_fulfilled ? 'success' : 'warning'" variant="soft">
              {{ report.purchases_fulfilled ? 'Fulfilled' : 'Not Fulfilled' }}
            </UBadge>
            <UBadge color="neutral" variant="soft">
              Min Purchases: {{ report.min_purchases_required }}
            </UBadge>
          </div>
        </div>
      </template>

      <div class="grid gap-6 lg:grid-cols-2">
        <section>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Sold</h3>
          <div v-if="report.sold.length === 0" class="text-sm text-gray-600">
            No sold transactions.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Component</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Buyer Group</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="entry in report.sold" :key="entry.transaction_id">
                  <td class="px-4 py-2">{{ entry.component_name }}</td>
                  <td class="px-4 py-2">{{ entry.buyer_group_name }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">
                    {{ formatDateTime(entry.timestamp) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Bought</h3>
          <div v-if="report.bought.length === 0" class="text-sm text-gray-600">
            No bought transactions.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Component</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Seller Group</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="entry in report.bought" :key="entry.transaction_id">
                  <td class="px-4 py-2">{{ entry.component_name }}</td>
                  <td class="px-4 py-2">{{ entry.seller_group_name }}</td>
                  <td class="px-4 py-2 text-sm text-gray-600">
                    {{ formatDateTime(entry.timestamp) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { GroupFairReport } from '~/composables/api/types.gen'
import { fairReportHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const { showError } = useErrorToast()

const fairId = Number(route.params.id)
const groupId = ref<number | null>(null)
const loading = ref(false)
const report = ref<GroupFairReport | null>(null)

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadReport = async () => {
  if (!groupId.value || Number.isNaN(groupId.value)) {
    showError('Validation Error', 'Group ID is required')
    return
  }

  loading.value = true
  try {
    const { data, error } = await fairReportHandler({
      path: { fair_id: fairId },
      query: { group_id: groupId.value }
    })

    if (error) {
      showError('Failed to load report', error)
      return
    }

    report.value = data ?? null
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}

const navigateBack = () => {
  router.back()
}
</script>
