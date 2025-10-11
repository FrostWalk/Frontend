<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
      Select Individual Deliverable
    </h1>

    <div v-if="loading" class="text-center py-12">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading deliverables...</p>
    </div>

    <UCard v-else>
      <!-- Current Selection -->
      <div v-if="currentSelection" class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div class="flex items-center mb-2">
          <Icon name="material-symbols:check-circle" class="mr-2 text-green-500" size="24" />
          <h3 class="font-semibold text-green-900 dark:text-green-100">Current Selection</h3>
        </div>
        <p class="text-sm text-green-800 dark:text-green-200">
          {{ currentSelection.student_deliverable_name }}
        </p>
      </div>

      <UForm :state="form" class="space-y-4" @submit="onSubmit">
        <UFormField label="Select Deliverable" name="student_deliverable_id" required>
          <USelectMenu
            v-model="selectedDeliverable"
            :options="deliverables"
            option-attribute="name"
            value-attribute="student_deliverable_id"
            placeholder="Choose a deliverable"
          />
        </UFormField>

        <div v-if="selectedDeliverable" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">Components Required</h4>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li v-for="comp in componentsForSelected" :key="comp.student_deliverable_component_id">
              • {{ comp.name }}
            </li>
          </ul>
        </div>

        <UButton type="submit" block :loading="submitting">
          <Icon name="material-symbols:check-circle" class="mr-2" />
          {{ currentSelection ? 'Update Selection' : 'Confirm Selection' }}
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type {
  StudentDeliverable,
  StudentDeliverableComponent,
  StudentDeliverableSelectionResponse
} from '~/composables/api/types.gen'
import {
  getStudentProjects,
  getStudentDeliverableSelection,
  createStudentDeliverableSelection,
  updateStudentDeliverableSelection
} from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)
const deliverables = ref<StudentDeliverable[]>([])
const components = ref<StudentDeliverableComponent[]>([])
const selectedDeliverable = ref<StudentDeliverable | null>(null)
const currentSelection = ref<StudentDeliverableSelectionResponse | null>(null)
const projectId = ref<number>(parseInt(route.params.id as string))

const form = reactive({
  student_deliverable_id: null as number | null
})

const componentsForSelected = computed(() => {
  if (!selectedDeliverable.value) return []
  return components.value.filter((c) => c.project_id === selectedDeliverable.value?.project_id)
})

const fetchData = async () => {
  loading.value = true
  try {
    // Fetch all projects to get deliverables
    const { data: projectsData, error: projectsError } = await getStudentProjects()

    if (projectsError) {
      toast.add({
        title: 'Error',
        description: projectsError.error || 'Failed to load deliverables',
        color: 'error'
      })
      return
    }

    if (projectsData) {
      const project = projectsData.projects.find((p) => p.project.project_id === projectId.value)
      if (project) {
        deliverables.value = project.student_deliverables
        components.value = project.student_components
      }
    }

    // Check for existing selection
    try {
      const { data: selectionData } = await getStudentDeliverableSelection({
        path: { project_id: projectId.value }
      })
      if (selectionData) {
        currentSelection.value = selectionData
        // Pre-select the current deliverable
        selectedDeliverable.value =
          deliverables.value.find(
            (d) => d.student_deliverable_id === selectionData.student_deliverable_id
          ) || null
      }
    } catch {
      // No current selection, that's okay
    }
  } catch {
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (!selectedDeliverable.value) {
    toast.add({
      title: 'Validation Error',
      description: 'Please select a deliverable',
      color: 'error'
    })
    return
  }

  submitting.value = true
  try {
    let response

    if (currentSelection.value) {
      // Update existing selection
      response = await updateStudentDeliverableSelection({
        body: {
          student_deliverable_id: selectedDeliverable.value.student_deliverable_id,
          project_id: projectId.value
        }
      })
    } else {
      // Create new selection
      response = await createStudentDeliverableSelection({
        body: {
          student_deliverable_id: selectedDeliverable.value.student_deliverable_id,
          project_id: projectId.value
        }
      })
    }

    const { data, error } = response

    if (error) {
      toast.add({
        title: 'Selection Failed',
        description: error.error || 'Failed to select deliverable',
        color: 'error'
      })
      return
    }

    if (data) {
      toast.add({
        title: currentSelection.value ? 'Selection Updated' : 'Deliverable Selected',
        description: 'Successfully selected individual deliverable',
        color: 'success'
      })

      navigateTo('/projects')
    }
  } catch {
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
