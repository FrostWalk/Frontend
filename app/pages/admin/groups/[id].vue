<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-12">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading group details...</p>
    </div>

    <div v-else-if="groupDetails">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ groupDetails.name }}</h1>
        <p class="text-gray-600 mt-1">
          Project: {{ groupDetails.project_name }} (ID: {{ groupDetails.project_id }})
        </p>
      </div>

      <!-- Group Members -->
      <div class="mb-6">
        <!-- Header (always visible) -->
        <div
          class="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:groups" class="text-primary-500" size="20" />
            <h3 class="font-semibold">Group Members ({{ groupDetails.members.length }})</h3>
          </div>
          <UButton
            :icon="
              isMembersCollapsed ? 'material-symbols:expand-more' : 'material-symbols:expand-less'
            "
            color="neutral"
            variant="ghost"
            size="lg"
            class="!p-4 !min-w-14 !h-14 !text-lg"
            @click="isMembersCollapsed = !isMembersCollapsed"
          />
        </div>

        <!-- Collapsible Content -->
        <UCollapsible :open="!isMembersCollapsed" class="mt-0">
          <template #content>
            <div
              class="border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-lg bg-white dark:bg-gray-900"
            >
              <div class="p-4 space-y-3">
                <div
                  v-for="member in groupDetails.members"
                  :key="member.student_id"
                  class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <div class="flex items-center gap-2">
                        <p class="font-medium">{{ member.first_name }} {{ member.last_name }}</p>
                        <UBadge :color="member.role === 'Group Leader' ? 'primary' : 'neutral'">
                          {{ member.role }}
                        </UBadge>
                      </div>
                      <p class="text-sm text-gray-500 mt-1">{{ member.email }}</p>
                      <p class="text-sm text-gray-500">ID: {{ member.university_id }}</p>
                    </div>
                  </div>

                  <!-- Student's Individual Deliverable -->
                  <div
                    v-if="member.student_deliverable_selection"
                    class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                  >
                    <p class="text-xs text-gray-500 mb-1">Individual Deliverable:</p>
                    <p class="text-sm font-medium">
                      {{ member.student_deliverable_selection.student_deliverable_name }}
                    </p>
                    <div
                      v-if="member.student_deliverable_selection.components.length > 0"
                      class="mt-2"
                    >
                      <p class="text-xs text-gray-500 mb-1">Components:</p>
                      <div class="flex flex-wrap gap-1">
                        <UBadge
                          v-for="comp in member.student_deliverable_selection.components"
                          :key="comp.student_deliverable_component_id"
                          size="xs"
                          color="neutral"
                        >
                          {{ comp.name }}
                        </UBadge>
                      </div>
                    </div>
                  </div>
                  <div v-else class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p class="text-xs text-gray-500 italic">No individual deliverable selected</p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </UCollapsible>
      </div>

      <!-- Group Deliverable Selection -->
      <div v-if="groupDetails.deliverable_selection" class="mb-6">
        <!-- Header (always visible) -->
        <div
          class="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div class="flex items-center">
            <Icon
              name="material-symbols:assignment-turned-in"
              class="mr-2 text-green-500"
              size="24"
            />
            <h3 class="font-semibold">Group Deliverable Selection</h3>
          </div>
          <UButton
            :icon="
              isDeliverableCollapsed
                ? 'material-symbols:expand-more'
                : 'material-symbols:expand-less'
            "
            color="neutral"
            variant="ghost"
            size="lg"
            class="!p-4 !min-w-14 !h-14 !text-lg"
            @click="isDeliverableCollapsed = !isDeliverableCollapsed"
          />
        </div>

        <!-- Collapsible Content -->
        <UCollapsible :open="!isDeliverableCollapsed" class="mt-0">
          <template #content>
            <div
              class="border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-lg bg-white dark:bg-gray-900"
            >
              <div class="p-4 space-y-4">
                <div>
                  <p class="text-sm text-gray-600">Deliverable</p>
                  <p class="font-medium">{{ groupDetails.deliverable_selection.name }}</p>
                </div>

                <!-- Component Implementation Details -->
                <div
                  v-if="
                    groupDetails.deliverable_selection.component_implementation_details.length > 0
                  "
                >
                  <div class="flex items-center gap-2 mb-4">
                    <Icon name="material-symbols:extension" class="text-primary-500" size="20" />
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      Component Details
                    </h3>
                    <UBadge color="primary" size="sm">
                      {{
                        groupDetails.deliverable_selection.component_implementation_details.length
                      }}
                      component{{
                        groupDetails.deliverable_selection.component_implementation_details
                          .length !== 1
                          ? 's'
                          : ''
                      }}
                    </UBadge>
                  </div>

                  <div class="space-y-6">
                    <div
                      v-for="(detail, index) in groupDetails.deliverable_selection
                        .component_implementation_details"
                      :key="detail.id"
                      class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900"
                    >
                      <!-- Component Header -->
                      <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                          <div class="flex items-center gap-3 mb-2">
                            <div
                              class="flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full"
                            >
                              <span
                                class="text-sm font-semibold text-primary-600 dark:text-primary-400"
                              >
                                {{ index + 1 }}
                              </span>
                            </div>
                            <h4 class="text-xl font-semibold text-gray-900 dark:text-white">
                              {{ detail.component_name }}
                            </h4>
                          </div>

                          <!-- Repository Link -->
                          <div v-if="detail.repository_link" class="mt-3">
                            <div class="flex items-center gap-2 mb-2">
                              <Icon name="material-symbols:code" size="16" class="text-gray-500" />
                              <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >Repository</span
                              >
                            </div>
                            <a
                              :href="detail.repository_link"
                              target="_blank"
                              class="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-primary-600 hover:text-primary-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                            >
                              <Icon name="material-symbols:link" size="16" />
                              <span class="truncate max-w-md">{{ detail.repository_link }}</span>
                              <Icon name="material-symbols:open-in-new" size="14" />
                            </a>
                          </div>
                        </div>
                      </div>

                      <!-- Description Section -->
                      <div
                        v-if="detail.markdown_description"
                        class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                      >
                        <div class="flex items-center gap-2 mb-3">
                          <Icon
                            name="material-symbols:description"
                            size="16"
                            class="text-gray-500"
                          />
                          <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >Description</span
                          >
                        </div>

                        <div
                          class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div class="prose prose-sm dark:prose-invert max-w-none">
                            <MDC
                              :value="
                                isDescriptionExpanded(detail.id)
                                  ? detail.markdown_description
                                  : truncateText(detail.markdown_description)
                              "
                              tag="div"
                            />
                          </div>

                          <div
                            v-if="detail.markdown_description.length > 200"
                            class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                          >
                            <UButton
                              :color="isDescriptionExpanded(detail.id) ? 'neutral' : 'primary'"
                              :variant="isDescriptionExpanded(detail.id) ? 'outline' : 'solid'"
                              size="sm"
                              @click="toggleDescription(detail.id)"
                            >
                              <Icon
                                :name="
                                  isDescriptionExpanded(detail.id)
                                    ? 'material-symbols:expand-less'
                                    : 'material-symbols:expand-more'
                                "
                                class="mr-2"
                                size="16"
                              />
                              {{ isDescriptionExpanded(detail.id) ? 'Show Less' : 'Show All' }}
                            </UButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Icon name="material-symbols:widgets" size="48" class="mx-auto mb-3 opacity-50" />
                  <p>No component details added yet</p>
                </div>
              </div>
            </div>
          </template>
        </UCollapsible>
      </div>

      <div class="mb-6">
        <div
          class="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:report" class="text-primary-500" size="20" />
            <h3 class="font-semibold">Complaints</h3>
          </div>
          <UButton
            :icon="
              isComplaintsCollapsed
                ? 'material-symbols:expand-more'
                : 'material-symbols:expand-less'
            "
            color="neutral"
            variant="ghost"
            size="lg"
            class="!p-4 !min-w-14 !h-14 !text-lg"
            @click="isComplaintsCollapsed = !isComplaintsCollapsed"
          />
        </div>

        <UCollapsible :open="!isComplaintsCollapsed" class="mt-0">
          <template #content>
            <div
              class="border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-lg bg-white dark:bg-gray-900"
            >
              <div class="p-4">
                <div v-if="loadingComplaints" class="text-center py-8">
                  <Icon
                    name="material-symbols:hourglass-empty"
                    size="36"
                    class="animate-spin mx-auto text-primary-500"
                  />
                </div>

                <div v-else-if="!groupComplaints" class="text-sm text-gray-600">
                  No complaints data available.
                </div>

                <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <section class="space-y-3">
                    <div class="flex items-center justify-between">
                      <h4 class="font-medium text-gray-900 dark:text-white">Filed</h4>
                      <UBadge color="primary" variant="soft">
                        {{ groupComplaints.complaints_filed.length }}
                      </UBadge>
                    </div>
                    <div
                      v-if="groupComplaints.complaints_filed.length === 0"
                      class="text-sm text-gray-600"
                    >
                      No filed complaints.
                    </div>
                    <div v-else class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th class="px-3 py-2 text-left text-xs text-gray-500 uppercase">
                              Created At
                            </th>
                            <th class="px-3 py-2 text-left text-xs text-gray-500 uppercase">
                              To Group
                            </th>
                            <th class="px-3 py-2 text-left text-xs text-gray-500 uppercase">
                              Transaction
                            </th>
                            <th class="px-3 py-2 text-left text-xs text-gray-500 uppercase">
                              Text
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                          <tr
                            v-for="complaint in groupComplaints.complaints_filed"
                            :key="complaint.complaint_id"
                          >
                            <td class="px-3 py-2">{{ formatDateTime(complaint.created_at) }}</td>
                            <td class="px-3 py-2">{{ complaint.to_group_id }}</td>
                            <td class="px-3 py-2">{{ complaint.transaction_id }}</td>
                            <td class="px-3 py-2">{{ complaint.text }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section class="space-y-3">
                    <div class="flex items-center justify-between">
                      <h4 class="font-medium text-gray-900 dark:text-white">Received</h4>
                      <UBadge color="warning" variant="soft">
                        {{ groupComplaints.complaints_received.length }}
                      </UBadge>
                    </div>
                    <div
                      v-if="groupComplaints.complaints_received.length === 0"
                      class="text-sm text-gray-600"
                    >
                      No received complaints.
                    </div>
                    <div v-else class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th class="px-3 py-2 text-left text-xs text-gray-500 uppercase">
                              Created At
                            </th>
                            <th class="px-3 py-2 text-left text-xs text-gray-500 uppercase">
                              From Group
                            </th>
                            <th class="px-3 py-2 text-left text-xs text-gray-500 uppercase">
                              Transaction
                            </th>
                            <th class="px-3 py-2 text-left text-xs text-gray-500 uppercase">
                              Text
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                          <tr
                            v-for="complaint in groupComplaints.complaints_received"
                            :key="complaint.complaint_id"
                          >
                            <td class="px-3 py-2">{{ formatDateTime(complaint.created_at) }}</td>
                            <td class="px-3 py-2">{{ complaint.from_group_id }}</td>
                            <td class="px-3 py-2">{{ complaint.transaction_id }}</td>
                            <td class="px-3 py-2">{{ complaint.text }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </template>
        </UCollapsible>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GroupComplaintsResponse, GroupDetailsResponse } from '~/composables/api/types.gen'
import { getGroupComplaints, getGroupDetails } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const route = useRoute()
const { showError } = useErrorToast()

const loading = ref(true)
const loadingComplaints = ref(false)
const groupDetails = ref<GroupDetailsResponse | null>(null)
const groupComplaints = ref<GroupComplaintsResponse | null>(null)
const expandedDescriptions = ref<Set<number>>(new Set())

// Collapsible state
const isMembersCollapsed = ref(false)
const isDeliverableCollapsed = ref(true) // Collapsed by default
const isComplaintsCollapsed = ref(true)

const groupId = parseInt(route.params.id as string)

const truncateText = (text: string, maxLength: number = 200) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const toggleDescription = (componentId: number) => {
  if (expandedDescriptions.value.has(componentId)) {
    expandedDescriptions.value.delete(componentId)
  } else {
    expandedDescriptions.value.add(componentId)
  }
}

const isDescriptionExpanded = (componentId: number) => {
  return expandedDescriptions.value.has(componentId)
}

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchGroupComplaints = async () => {
  loadingComplaints.value = true
  try {
    const { data, error } = await getGroupComplaints({
      path: { group_id: groupId }
    })

    if (error) {
      showError('Failed to load complaints', error)
      return
    }

    groupComplaints.value = data ?? null
  } catch (err) {
    showError('Error', err)
  } finally {
    loadingComplaints.value = false
  }
}

const fetchGroupDetails = async () => {
  loading.value = true
  try {
    const { data, error } = await getGroupDetails({
      path: { group_id: groupId }
    })

    if (error) {
      showError('Error', error)
      return
    }

    if (data) {
      groupDetails.value = data
    }

    await fetchGroupComplaints()
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchGroupDetails()
})
</script>
