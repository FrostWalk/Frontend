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
      <UCard class="mb-6">
        <template #header>
          <h3 class="font-semibold">Group Members ({{ groupDetails.members.length }})</h3>
        </template>

        <div class="space-y-3">
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
              <div v-if="member.student_deliverable_selection.components.length > 0" class="mt-2">
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
      </UCard>

      <!-- Group Deliverable Selection -->
      <UCard v-if="groupDetails.deliverable_selection" class="mb-6">
        <template #header>
          <div class="flex items-center">
            <Icon
              name="material-symbols:assignment-turned-in"
              class="mr-2 text-green-500"
              size="24"
            />
            <h3 class="font-semibold">Group Deliverable Selection</h3>
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600">Deliverable</p>
            <p class="font-medium">{{ groupDetails.deliverable_selection.name }}</p>
          </div>

          <!-- Component Implementation Details -->
          <div
            v-if="groupDetails.deliverable_selection.component_implementation_details.length > 0"
          >
            <p class="text-sm text-gray-600 mb-3">Component Details</p>
            <div class="space-y-4">
              <div
                v-for="detail in groupDetails.deliverable_selection
                  .component_implementation_details"
                :key="detail.id"
                class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <h4 class="font-semibold text-gray-900 dark:text-white mb-3">
                  {{ detail.component_name }}
                </h4>

                <div v-if="detail.repository_link" class="mb-3">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Repository</p>
                  <a
                    :href="detail.repository_link"
                    target="_blank"
                    class="text-primary-500 hover:text-primary-600 flex items-center gap-1 font-medium text-sm"
                  >
                    {{ detail.repository_link }}
                    <Icon name="material-symbols:open-in-new" size="14" />
                  </a>
                </div>

                <div v-if="detail.markdown_description">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                  <div class="prose prose-sm dark:prose-invert max-w-none">
                    <MDC
                      :value="
                        isDescriptionExpanded(detail.id)
                          ? detail.markdown_description
                          : truncateText(detail.markdown_description)
                      "
                      tag="div"
                    />
                    <div
                      v-if="detail.markdown_description.length > 200"
                      class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
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
                          class="mr-1"
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
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GroupDetailsResponse } from '~/composables/api/types.gen'
import { getGroupDetails } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const route = useRoute()
const { showError } = useErrorToast()

const loading = ref(true)
const groupDetails = ref<GroupDetailsResponse | null>(null)
const expandedDescriptions = ref<Set<number>>(new Set())

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
