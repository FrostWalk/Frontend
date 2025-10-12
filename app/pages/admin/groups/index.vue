<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Groups</h1>
      <p class="text-gray-600 mt-1">Manage groups from your assigned projects</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading groups...</p>
    </div>

    <div v-else-if="allGroups.length === 0" class="text-center py-12">
      <Icon name="material-symbols:groups-off" size="64" class="mx-auto text-gray-400" />
      <p class="mt-4 text-lg text-gray-600">No groups found</p>
      <p class="text-sm text-gray-500 mt-2">
        Groups will appear here once students form groups in your projects
      </p>
    </div>

    <div v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="material-symbols:groups" size="32" class="text-primary-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Total Groups</p>
              <p class="text-2xl font-bold">{{ allGroups.length }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="material-symbols:assignment-turned-in" size="32" class="text-green-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">With Deliverable</p>
              <p class="text-2xl font-bold">{{ groupsWithDeliverable }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="material-symbols:warning" size="32" class="text-orange-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Pending Selection</p>
              <p class="text-2xl font-bold">{{ groupsWithoutDeliverable }}</p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Groups Table -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">All Groups</h3>
            <UInput
              v-model="searchQuery"
              placeholder="Search groups..."
              icon="material-symbols:search"
              class="w-64"
            />
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Group Name
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Project
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Members
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Leader
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Deliverable
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="group in filteredGroups"
                :key="group.group_id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                @click="navigateTo(`/admin/groups/${group.group_id}`)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ group.name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ group.project_name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ group.member_count }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ group.group_leader.name }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div
                    v-if="group.deliverable_selected"
                    class="text-sm text-gray-900 dark:text-white"
                  >
                    {{ group.deliverable_selected.name }}
                  </div>
                  <div v-else class="text-sm text-gray-500 italic">Not selected</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge v-if="group.deliverable_selected" color="success" variant="soft">
                    Complete
                  </UBadge>
                  <UBadge v-else-if="group.time_expired" color="error" variant="soft">
                    Expired
                  </UBadge>
                  <UBadge v-else color="warning" variant="soft"> Pending </UBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <UButton
                    size="sm"
                    color="neutral"
                    variant="ghost"
                    @click.stop="navigateTo(`/admin/groups/${group.group_id}`)"
                  >
                    View Details
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project, GroupInfo } from '~/composables/api/types.gen'
import { getAllProjectsHandler, getProjectGroups } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: [
    'admin-auth',
    async () => {
      const { roleId, roles } = useAdminAuth()

      // Only COORDINATOR can access this page
      if (roleId.value !== roles.COORDINATOR) {
        return navigateTo('/admin/projects')
      }
    }
  ],
  layout: 'admin'
})

const { showError } = useErrorToast()

const loading = ref(true)
const projects = ref<Project[]>([])
const allGroups = ref<Array<GroupInfo & { project_name: string }>>([])
const searchQuery = ref('')

// Computed statistics
const groupsWithDeliverable = computed(() => {
  return allGroups.value.filter((group) => group.deliverable_selected).length
})

const groupsWithoutDeliverable = computed(() => {
  return allGroups.value.filter((group) => !group.deliverable_selected).length
})

// Filtered groups based on search
const filteredGroups = computed(() => {
  if (!searchQuery.value.trim()) {
    return allGroups.value
  }

  const query = searchQuery.value.toLowerCase()
  return allGroups.value.filter((group) => {
    return (
      group.name.toLowerCase().includes(query) ||
      group.project_name.toLowerCase().includes(query) ||
      group.group_leader.name.toLowerCase().includes(query) ||
      group.deliverable_selected?.name.toLowerCase().includes(query)
    )
  })
})

const fetchProjectsAndGroups = async () => {
  loading.value = true
  try {
    // Fetch all projects (for coordinators, this returns only their assigned projects)
    const { data: projectsData, error: projectsError } = await getAllProjectsHandler()

    if (projectsError) {
      showError('Error', projectsError)
      return
    }

    if (projectsData) {
      projects.value = projectsData.projects

      // Fetch groups for each project
      const groupsPromises = projects.value.map(async (project) => {
        const { data: groupsData } = await getProjectGroups({
          path: { project_id: project.project_id }
        })

        if (groupsData) {
          // Add project name to each group
          return groupsData.groups.map((group) => ({
            ...group,
            project_name: project.name
          }))
        }

        return []
      })

      const groupsResults = await Promise.all(groupsPromises)

      // Flatten all groups into a single array
      allGroups.value = groupsResults.flat()
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProjectsAndGroups()
})
</script>
