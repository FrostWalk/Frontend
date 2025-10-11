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

        <div class="space-y-3">
          <div>
            <p class="text-sm text-gray-600">Deliverable</p>
            <p class="font-medium">{{ groupDetails.deliverable_selection.name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Repository Link</p>
            <a
              :href="groupDetails.deliverable_selection.link"
              target="_blank"
              class="text-primary-500 hover:text-primary-600 flex items-center"
            >
              {{ groupDetails.deliverable_selection.link }}
              <Icon name="material-symbols:open-in-new" class="ml-1" size="16" />
            </a>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-2">Project Description</p>
            <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm whitespace-pre-wrap">
              {{ groupDetails.deliverable_selection.markdown_text }}
            </div>
          </div>
        </div>
      </UCard>

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

const groupId = parseInt(route.params.id as string)

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
