<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Fair Trade</h1>
        <p class="text-sm text-gray-600">Buy sellable components from other groups</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UBadge :color="leaderboard?.is_active ? 'success' : 'neutral'" variant="soft">
          {{ leaderboard?.is_active ? 'Fair Active' : 'Fair Inactive' }}
        </UBadge>
        <UBadge v-if="buyerGroupName" color="neutral" variant="soft">
          Buying as: {{ buyerGroupName }}
        </UBadge>
        <UButton color="neutral" variant="soft" :to="`/fairs/${fairId}/leaderboard`">
          <Icon name="material-symbols:leaderboard" class="mr-2" />
          View Leaderboard
        </UButton>
      </div>
    </div>

    <UCard v-if="loadingPage">
      <div class="text-center py-12">
        <Icon
          name="material-symbols:hourglass-empty"
          size="42"
          class="animate-spin mx-auto text-primary-500"
        />
        <p class="mt-3 text-gray-600">Loading fair trading data...</p>
      </div>
    </UCard>

    <UAlert
      v-else-if="!leaderboard || !projectId"
      icon="material-symbols:error"
      color="error"
      title="Trade data unavailable"
      description="No project linked to this fair for your account."
    />

    <template v-else>
      <UAlert
        v-if="!buyerGroupId"
        icon="material-symbols:warning"
        color="warning"
        title="Group not found"
        description="You are not currently enrolled in a group for this project's fair."
      />

      <UCard v-if="transactions">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold">My Purchase Progress</h2>
            <div class="flex items-center gap-2">
              <UBadge
                :color="transactions.purchases_fulfilled ? 'success' : 'warning'"
                variant="soft"
              >
                {{ transactions.purchases_fulfilled ? 'Fulfilled' : 'Pending' }}
              </UBadge>
              <UBadge color="neutral" variant="soft">
                {{ transactions.transactions.length }} / {{ transactions.min_purchases_required }}
              </UBadge>
              <UButton color="neutral" variant="ghost" size="sm" @click="fetchTransactions">
                <Icon name="material-symbols:refresh" />
              </UButton>
            </div>
          </div>
        </template>

        <div v-if="loadingTransactions" class="text-center py-6">
          <Icon
            name="material-symbols:hourglass-empty"
            size="32"
            class="animate-spin mx-auto text-primary-500"
          />
        </div>
        <div v-else-if="transactions.transactions.length === 0" class="text-sm text-gray-600">
          No transactions yet.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Timestamp</th>
                <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Component ID</th>
                <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">
                  Seller Selection ID
                </th>
                <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Transaction ID</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="entry in transactions.transactions" :key="entry.transaction_id">
                <td class="px-4 py-2">{{ formatDateTime(entry.timestamp) }}</td>
                <td class="px-4 py-2">{{ entry.group_deliverable_component_id }}</td>
                <td class="px-4 py-2">{{ entry.group_deliverable_selection_id }}</td>
                <td class="px-4 py-2">{{ entry.transaction_id }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">Component Catalog</h2>
            <UBadge color="primary" variant="soft">
              {{ sellableComponents.length }} sellable component{{
                sellableComponents.length !== 1 ? 's' : ''
              }}
            </UBadge>
          </div>
        </template>

        <div v-if="sellableComponents.length === 0" class="text-center py-10 text-gray-600">
          No sellable components configured for this fair.
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="component in sellableComponents"
            :key="component.group_deliverable_component_id"
            class="border border-gray-200 dark:border-gray-700"
          >
            <div class="space-y-3">
              <div class="space-y-1">
                <p class="font-semibold text-gray-900 dark:text-white">{{ component.name }}</p>
                <p class="text-xs text-gray-500">
                  Component ID: {{ component.group_deliverable_component_id }}
                </p>
              </div>
              <div class="flex items-center justify-between">
                <UBadge color="success" variant="soft">Sellable</UBadge>
                <UButton
                  size="sm"
                  color="primary"
                  :disabled="!buyerGroupId || !leaderboard.is_active"
                  @click="openPurchaseModal(component)"
                >
                  Buy
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </UCard>
    </template>

    <UModal
      v-model:open="showPurchaseModal"
      title="Buy Component"
      description="Select a seller group and confirm purchase"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Component">
            <UInput :model-value="selectedComponent?.name ?? ''" disabled />
          </UFormField>

          <UFormField label="Seller Group" required>
            <USelectMenu
              v-model="selectedSeller"
              :items="sellerOptions"
              placeholder="Select seller group"
            />
          </UFormField>

          <UAlert
            v-if="sellerSelectionError"
            icon="material-symbols:warning"
            color="warning"
            :description="sellerSelectionError"
          />

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="Buyer Group ID">
              <UInput :model-value="buyerGroupId ? String(buyerGroupId) : ''" disabled />
            </UFormField>
            <UFormField label="Seller Selection ID">
              <UInput :model-value="sellerSelectionId ? String(sellerSelectionId) : ''" disabled />
            </UFormField>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showPurchaseModal = false"
            >Cancel</UButton
          >
          <UButton
            color="primary"
            :loading="loadingPurchase"
            :disabled="!canPurchase"
            @click="submitPurchase"
          >
            Confirm Purchase
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type {
  GroupDeliverableComponent,
  LeaderboardResponse,
  ListTransactionsResponse,
  ProjectWithDetails
} from '~/composables/api/types.gen'
import {
  getGroupDeliverableSelection,
  getGroups,
  getStudentProjects,
  leaderboardHandler,
  listTransactionsHandler,
  purchaseHandler
} from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'auth'
})

type SellerOption = {
  group_id: number
  group_name: string
  rank: number
  total_sales: number
  label: string
}

const route = useRoute()
const { showError } = useErrorToast()
const toast = useToast()

const fairId = Number(route.params.id)
const loadingPage = ref(true)
const loadingTransactions = ref(false)
const loadingSellerSelection = ref(false)
const loadingPurchase = ref(false)

const leaderboard = ref<LeaderboardResponse | null>(null)
const projectInfo = ref<ProjectWithDetails | null>(null)
const buyerGroupId = ref<number | null>(null)
const buyerGroupName = ref('')
const projectId = ref<number | null>(null)
const sellableComponents = ref<GroupDeliverableComponent[]>([])
const transactions = ref<ListTransactionsResponse | null>(null)

const showPurchaseModal = ref(false)
const selectedComponent = ref<GroupDeliverableComponent | null>(null)
const selectedSeller = ref<SellerOption>()
const sellerSelectionId = ref<number | null>(null)
const sellerSelectionError = ref('')
const sellerSelectionCache = ref<Map<number, number>>(new Map())

const sellerOptions = computed<SellerOption[]>(() => {
  if (!leaderboard.value) return []
  return leaderboard.value.leaderboard
    .filter((group) => group.group_id !== buyerGroupId.value)
    .map((group) => ({
      ...group,
      label: `${group.group_name} (#${group.rank})`
    }))
})

const canPurchase = computed(() => {
  return Boolean(
    selectedComponent.value &&
    selectedSeller.value &&
    buyerGroupId.value &&
    sellerSelectionId.value &&
    leaderboard.value?.is_active
  )
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

const fetchTransactions = async () => {
  if (!buyerGroupId.value) return

  loadingTransactions.value = true
  try {
    const { data, error } = await listTransactionsHandler({
      path: { fair_id: fairId },
      query: { group_id: buyerGroupId.value }
    })

    if (error) {
      showError('Failed to load transactions', error)
      return
    }

    transactions.value = data ?? null
  } catch (err) {
    showError('Error', err)
  } finally {
    loadingTransactions.value = false
  }
}

const fetchSellerSelectionId = async (groupId: number) => {
  sellerSelectionError.value = ''
  sellerSelectionId.value = null

  const cached = sellerSelectionCache.value.get(groupId)
  if (cached) {
    sellerSelectionId.value = cached
    return
  }

  loadingSellerSelection.value = true
  try {
    const { data, error } = await getGroupDeliverableSelection({
      path: { group_id: groupId }
    })

    if (error) {
      sellerSelectionError.value =
        'Selected group has no deliverable selection available for trading yet.'
      return
    }

    if (data) {
      sellerSelectionCache.value.set(groupId, data.group_deliverable_selection_id)
      sellerSelectionId.value = data.group_deliverable_selection_id
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loadingSellerSelection.value = false
  }
}

const openPurchaseModal = (component: GroupDeliverableComponent) => {
  selectedComponent.value = component
  selectedSeller.value = undefined
  sellerSelectionId.value = null
  sellerSelectionError.value = ''
  showPurchaseModal.value = true
}

watch(selectedSeller, (seller) => {
  if (!seller) {
    sellerSelectionId.value = null
    sellerSelectionError.value = ''
    return
  }

  fetchSellerSelectionId(seller.group_id)
})

const submitPurchase = async () => {
  if (
    !selectedComponent.value ||
    !selectedSeller.value ||
    !buyerGroupId.value ||
    !sellerSelectionId.value
  ) {
    return
  }

  loadingPurchase.value = true
  try {
    const { error } = await purchaseHandler({
      path: { fair_id: fairId },
      body: {
        buyer_group_id: buyerGroupId.value,
        group_deliverable_component_id: selectedComponent.value.group_deliverable_component_id,
        seller_group_deliverable_selection_id: sellerSelectionId.value
      }
    })

    if (error) {
      showError('Purchase failed', error)
      return
    }

    toast.add({
      title: 'Purchase completed',
      description: 'Transaction created successfully',
      color: 'success'
    })

    showPurchaseModal.value = false
    await fetchTransactions()
  } catch (err) {
    showError('Error', err)
  } finally {
    loadingPurchase.value = false
  }
}

const loadPage = async () => {
  loadingPage.value = true
  try {
    const [
      { data: leaderboardData, error: leaderboardError },
      { data: projectsData, error: projectsError },
      { data: groupsData, error: groupsError }
    ] = await Promise.all([
      leaderboardHandler({ path: { fair_id: fairId } }),
      getStudentProjects(),
      getGroups()
    ])

    if (leaderboardError) {
      showError('Failed to load leaderboard', leaderboardError)
      return
    }
    if (projectsError) {
      showError('Failed to load projects', projectsError)
      return
    }
    if (groupsError) {
      showError('Failed to load groups', groupsError)
      return
    }

    leaderboard.value = leaderboardData ?? null

    const matchingProject = projectsData?.projects.find((item) => item.fair_id === fairId) ?? null
    projectInfo.value = matchingProject

    if (!matchingProject) {
      return
    }

    projectId.value = matchingProject.project.project_id
    sellableComponents.value = matchingProject.group_components.filter(
      (component) => component.sellable
    )

    const myGroup = groupsData?.groups.find(
      (item) => item.project.project_id === matchingProject.project.project_id
    )

    if (myGroup) {
      buyerGroupId.value = myGroup.group.group_id
      buyerGroupName.value = myGroup.group.name
      await fetchTransactions()
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loadingPage.value = false
  }
}

onMounted(() => {
  loadPage()
})
</script>
