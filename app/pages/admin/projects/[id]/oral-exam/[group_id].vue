<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div v-if="loading" class="py-12 text-center">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="mx-auto animate-spin text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading oral exam details...</p>
    </div>

    <div v-else-if="details">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ details.name }}</h1>
          <p class="mt-1 text-gray-600">{{ details.project_name }}</p>
        </div>
        <UButton
          color="neutral"
          variant="soft"
          icon="material-symbols:arrow-back"
          @click="navigateTo(`/admin/projects/${projectId}?tab=oral-exam`)"
        >
          Back to Oral Exam List
        </UButton>
      </div>

      <div class="space-y-4">
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <Icon name="material-symbols:groups" class="text-primary-500" size="20" />
                <h3 class="font-semibold">Members & Exam</h3>
              </div>
              <UButton
                icon="material-symbols:checklist"
                :loading="bulkSaving"
                :disabled="selectedPresentStudentIds.length === 0"
                @click="markSelectedPresentAsCompleted"
              >
                Mark Selected Present as Completed
              </UButton>
            </div>
          </template>

          <div class="space-y-4">
            <div
              v-for="member in details.members"
              :key="member.student_id"
              class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ member.first_name }} {{ member.last_name }}
                    </p>
                    <UBadge v-if="member.is_leader" color="primary" variant="soft">Leader</UBadge>
                  </div>
                  <p class="text-sm text-gray-600">{{ member.email }}</p>
                  <p class="text-sm text-gray-600">University ID: {{ member.university_id }}</p>
                </div>

                <div class="flex flex-wrap items-center gap-4">
                  <UCheckbox
                    :model-value="presentSelection[member.student_id]"
                    label="Present today"
                    @update:model-value="setPresentSelection(member.student_id, $event)"
                  />
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600">Oral exam completed</span>
                    <USwitch
                      :model-value="completionState[member.student_id]"
                      :loading="completionSavingState[member.student_id]"
                      @update:model-value="setMemberCompletion(member.student_id, $event)"
                    />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <p class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Student deliverable
                </p>
                <div
                  v-if="member.student_deliverable"
                  class="rounded-md bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <p class="font-medium">{{ member.student_deliverable.name }}</p>
                  <p
                    v-if="member.student_deliverable.components.length > 0"
                    class="mt-1 text-xs text-gray-600 dark:text-gray-300"
                  >
                    Components:
                    {{
                      member.student_deliverable.components
                        .map((component) => component.name)
                        .join(', ')
                    }}
                  </p>
                </div>
                <p v-else class="text-sm text-gray-500">No student deliverable selected</p>
              </div>

              <UFormField label="Oral exam note">
                <UTextarea
                  v-model="noteTexts[member.student_id]"
                  :rows="4"
                  placeholder="Write note for this student..."
                  @input="scheduleNoteSave(member.student_id)"
                />
              </UFormField>
              <div class="mt-2 flex items-center justify-end">
                <p
                  v-if="noteSaveStatus[member.student_id] === 'saving'"
                  class="text-xs text-gray-500"
                >
                  Saving...
                </p>
                <p
                  v-else-if="noteSaveStatus[member.student_id] === 'saved'"
                  class="text-xs text-green-600"
                >
                  Saved
                </p>
                <p
                  v-else-if="noteSaveStatus[member.student_id] === 'error'"
                  class="text-xs text-red-600"
                >
                  Save failed
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <Icon name="material-symbols:inventory-2" class="text-primary-500" size="20" />
              <h3 class="font-semibold">Group Deliverable</h3>
            </div>
          </template>

          <div v-if="details.group_deliverable">
            <h4 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ details.group_deliverable.name }}
            </h4>

            <div
              v-if="details.group_deliverable.implementation_details.length > 0"
              class="mt-4 space-y-3"
            >
              <div
                v-for="implementation in details.group_deliverable.implementation_details"
                :key="implementation.id"
                class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p class="font-medium">{{ implementation.component_name }}</p>
                  <a
                    :href="implementation.repository_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-primary-600 hover:underline"
                  >
                    Repository
                  </a>
                </div>
                <MDC
                  :value="
                    implementation.markdown_description || 'No implementation description provided.'
                  "
                  class="prose prose-sm dark:prose-invert max-w-none"
                />
              </div>
            </div>
            <p v-else class="mt-2 text-sm text-gray-500">No implementation details available</p>
          </div>
          <p v-else class="text-sm text-gray-500">No group deliverable selected</p>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <Icon name="material-symbols:report" class="text-warning-500" size="20" />
              <h3 class="font-semibold">Complaints</h3>
            </div>
          </template>

          <div class="grid gap-6 lg:grid-cols-2">
            <div>
              <h4 class="mb-2 font-medium text-gray-900 dark:text-white">Filed</h4>
              <div v-if="details.complaints_filed.length === 0" class="text-sm text-gray-500">
                No complaints filed
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="complaint in details.complaints_filed"
                  :key="complaint.complaint_id"
                  class="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-700"
                >
                  <p class="font-medium">Against: {{ complaint.other_group_name }}</p>
                  <p class="mt-1 text-gray-700 dark:text-gray-300">{{ complaint.text }}</p>
                  <p class="mt-1 text-xs text-gray-500">
                    {{ formatDateTime(complaint.created_at) }}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 class="mb-2 font-medium text-gray-900 dark:text-white">Received</h4>
              <div v-if="details.complaints_received.length === 0" class="text-sm text-gray-500">
                No complaints received
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="complaint in details.complaints_received"
                  :key="complaint.complaint_id"
                  class="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-700"
                >
                  <p class="font-medium">From: {{ complaint.other_group_name }}</p>
                  <p class="mt-1 text-gray-700 dark:text-gray-300">{{ complaint.text }}</p>
                  <p class="mt-1 text-xs text-gray-500">
                    {{ formatDateTime(complaint.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <Icon name="material-symbols:payments" class="text-success-500" size="20" />
              <h3 class="font-semibold">Fair Sales</h3>
            </div>
          </template>

          <div v-if="details.fair_sales.length === 0" class="text-sm text-gray-500">
            No sales at fair
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Buyer Group
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Component
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="sale in details.fair_sales" :key="sale.transaction_id">
                  <td class="px-4 py-3 text-sm">{{ sale.buyer_group_name }}</td>
                  <td class="px-4 py-3 text-sm">{{ sale.component_name }}</td>
                  <td class="px-4 py-3 text-sm">{{ formatDateTime(sale.timestamp) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OralExamGroupDetailsResponse } from '~/composables/api/types.gen'
import {
  bulkSetGroupCompletions,
  deleteNote,
  getOralExamGroupDetails,
  setStudentCompletion,
  upsertNote
} from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

type NoteSaveState = 'idle' | 'saving' | 'saved' | 'error'

const route = useRoute()
const { showError } = useErrorToast()

const projectId = Number(route.params.id)
const groupId = Number(route.params.group_id)

const loading = ref(true)
const bulkSaving = ref(false)
const details = ref<OralExamGroupDetailsResponse | null>(null)
const noteTimers = new Map<number, ReturnType<typeof setTimeout>>()
const noteTexts = reactive<Record<number, string>>({})
const noteExists = reactive<Record<number, boolean>>({})
const noteSaveStatus = reactive<Record<number, NoteSaveState>>({})
const completionState = reactive<Record<number, boolean>>({})
const completionSavingState = reactive<Record<number, boolean>>({})
const presentSelection = reactive<Record<number, boolean>>({})

const selectedPresentStudentIds = computed(() => {
  if (!details.value) {
    return []
  }

  return details.value.members
    .filter((member) => presentSelection[member.student_id])
    .map((member) => member.student_id)
})

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

const initializeMemberState = () => {
  if (!details.value) {
    return
  }

  for (const member of details.value.members) {
    noteTexts[member.student_id] = member.oral_exam_note ?? ''
    noteExists[member.student_id] = Boolean(member.oral_exam_note)
    noteSaveStatus[member.student_id] = 'idle'
    completionState[member.student_id] = member.oral_exam_completed
    completionSavingState[member.student_id] = false
    presentSelection[member.student_id] = !member.oral_exam_completed
  }
}

const fetchGroupDetails = async () => {
  loading.value = true
  try {
    const { data, error } = await getOralExamGroupDetails({
      path: {
        project_id: projectId,
        group_id: groupId
      }
    })

    if (error) {
      showError('Failed to load oral exam group details', error)
      return
    }

    details.value = data ?? null
    initializeMemberState()
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}

const setPresentSelection = (studentId: number, value: boolean | 'indeterminate') => {
  presentSelection[studentId] = value === true
}

const setMemberCompletion = async (studentId: number, completed: boolean | 'indeterminate') => {
  const isCompleted = completed === true
  completionSavingState[studentId] = true

  try {
    const { error } = await setStudentCompletion({
      path: {
        project_id: projectId,
        student_id: studentId
      },
      body: {
        completed: isCompleted
      }
    })

    if (error) {
      showError('Failed to update student completion', error)
      return
    }

    completionState[studentId] = isCompleted
  } catch (err) {
    showError('Error', err)
  } finally {
    completionSavingState[studentId] = false
  }
}

const markSelectedPresentAsCompleted = async () => {
  const studentIds = selectedPresentStudentIds.value
  if (studentIds.length === 0) {
    return
  }

  bulkSaving.value = true
  try {
    const { error } = await bulkSetGroupCompletions({
      path: {
        project_id: projectId,
        group_id: groupId
      },
      body: {
        completed: true,
        student_ids: studentIds
      }
    })

    if (error) {
      showError('Failed to mark selected students as completed', error)
      return
    }

    for (const studentId of studentIds) {
      completionState[studentId] = true
      presentSelection[studentId] = false
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    bulkSaving.value = false
  }
}

const persistNote = async (studentId: number) => {
  noteSaveStatus[studentId] = 'saving'
  const noteText = noteTexts[studentId] ?? ''
  const hasText = noteText.trim().length > 0

  try {
    if (hasText) {
      const { error } = await upsertNote({
        path: {
          project_id: projectId,
          student_id: studentId
        },
        body: {
          text: noteText
        }
      })

      if (error) {
        showError('Failed to save oral exam note', error)
        noteSaveStatus[studentId] = 'error'
        return
      }

      noteExists[studentId] = true
    } else if (noteExists[studentId]) {
      const { error } = await deleteNote({
        path: {
          project_id: projectId,
          student_id: studentId
        }
      })

      if (error) {
        showError('Failed to delete oral exam note', error)
        noteSaveStatus[studentId] = 'error'
        return
      }

      noteExists[studentId] = false
    } else {
      noteSaveStatus[studentId] = 'idle'
      return
    }

    noteSaveStatus[studentId] = 'saved'
    setTimeout(() => {
      if (noteSaveStatus[studentId] === 'saved') {
        noteSaveStatus[studentId] = 'idle'
      }
    }, 2000)
  } catch (err) {
    showError('Error', err)
    noteSaveStatus[studentId] = 'error'
  }
}

const scheduleNoteSave = (studentId: number) => {
  const existingTimer = noteTimers.get(studentId)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  const timer = setTimeout(() => {
    persistNote(studentId)
  }, 800)

  noteTimers.set(studentId, timer)
}

onMounted(() => {
  fetchGroupDetails()
})

onBeforeUnmount(() => {
  for (const timer of noteTimers.values()) {
    clearTimeout(timer)
  }
  noteTimers.clear()
})
</script>
