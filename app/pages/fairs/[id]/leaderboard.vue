<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Fair Leaderboard</h1>
        <p class="text-sm text-gray-600">Sales ranking by group</p>
      </div>
      <div class="flex items-center gap-2">
        <UBadge :color="leaderboard?.is_active ? 'success' : 'neutral'" variant="soft">
          {{ leaderboard?.is_active ? 'Active' : 'Inactive' }}
        </UBadge>
        <UButton color="primary" variant="soft" :to="`/fairs/${fairId}/trade`">
          <Icon name="material-symbols:storefront" class="mr-2" />
          Go to Trade
        </UButton>
      </div>
    </div>

    <UCard v-if="loading">
      <div class="text-center py-10">
        <Icon
          name="material-symbols:hourglass-empty"
          size="40"
          class="animate-spin mx-auto text-primary-500"
        />
        <p class="mt-3 text-gray-600">Loading leaderboard...</p>
      </div>
    </UCard>

    <UAlert
      v-else-if="!leaderboard"
      icon="material-symbols:warning"
      color="error"
      title="Leaderboard unavailable"
      description="The fair leaderboard could not be loaded."
    />

    <UCard v-else-if="leaderboard.leaderboard.length === 0">
      <div class="text-center py-10">
        <Icon name="material-symbols:leaderboard" size="44" class="mx-auto text-gray-400" />
        <p class="mt-3 text-gray-600">No sales data yet.</p>
      </div>
    </UCard>

    <UCard v-else>
      <template #header>
        <div class="flex items-center gap-2">
          <Icon name="material-symbols:emoji-events" size="20" class="text-primary-500" />
          <h2 class="font-semibold">Ranking</h2>
        </div>
      </template>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rank
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Group
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Sales
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="entry in sortedEntries" :key="entry.group_id">
              <td class="px-4 py-3">
                <UBadge color="primary" variant="soft">#{{ entry.rank }}</UBadge>
              </td>
              <td class="px-4 py-3 font-medium">{{ entry.group_name }}</td>
              <td class="px-4 py-3">{{ entry.total_sales }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { LeaderboardResponse } from '~/composables/api/types.gen'
import { leaderboardHandler } from '~/composables/api/sdk.gen'

const route = useRoute()
const { showError } = useErrorToast()

const fairId = Number(route.params.id)
const loading = ref(true)
const leaderboard = ref<LeaderboardResponse | null>(null)

const sortedEntries = computed(() => {
  if (!leaderboard.value) return []
  return [...leaderboard.value.leaderboard].sort((a, b) => a.rank - b.rank)
})

const fetchLeaderboard = async () => {
  loading.value = true
  try {
    const { data, error } = await leaderboardHandler({
      path: { fair_id: fairId }
    })

    if (error) {
      showError('Failed to load leaderboard', error)
      leaderboard.value = null
      return
    }

    leaderboard.value = data ?? null
  } catch (err) {
    showError('Error', err)
    leaderboard.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLeaderboard()
})
</script>
