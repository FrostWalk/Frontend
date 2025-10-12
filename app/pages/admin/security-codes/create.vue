<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Security Code</h1>

    <UCard>
      <UForm :state="form" class="space-y-4" @submit="onSubmit">
        <UFormField label="Project" name="project_id" required>
          <USelectMenu
            v-model="selectedProject"
            :items="projectItems"
            :loading="loadingProjects"
            placeholder="Choose a project..."
            searchable
          >
            <template #leading>
              <Icon
                v-if="selectedProject"
                name="material-symbols:folder"
                size="20"
                class="text-primary-500"
              />
            </template>
          </USelectMenu>
        </UFormField>

        <UFormField
          label="Expiration Date & Time"
          name="expiration"
          required
          help="Code must be valid for at least 1 day"
        >
          <UInput v-model="form.expiration" type="datetime-local" :min="minDate" />
        </UFormField>

        <div class="flex gap-3 pt-4">
          <UButton type="submit" :loading="loading" :disabled="!selectedProject">
            <Icon name="material-symbols:key" class="mr-2" />
            Generate Code
          </UButton>
          <UButton to="/admin/security-codes" color="neutral" variant="ghost"> Cancel </UButton>
        </div>
      </UForm>
    </UCard>

    <!-- Success Modal -->
    <UModal v-model:open="showSuccessModal" title="Security Code Generated" :close="false">
      <template #body>
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center mb-4">
            <Icon name="material-symbols:check-circle" size="48" class="text-green-500" />
          </div>

          <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <code class="text-2xl font-mono font-bold text-primary-600">{{ generatedCode }}</code>
          </div>

          <p class="text-sm text-gray-600">
            Share this code with group leaders to allow them to create groups for this project.
          </p>

          <UButton block @click="copyGeneratedCode">
            <Icon name="material-symbols:content-copy" class="mr-2" />
            Copy Code
          </UButton>
        </div>
      </template>

      <template #footer>
        <UButton color="primary" block @click="closeModal"> Done </UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/composables/api/types.gen'
import { getAllProjectsHandler, createCodeHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

type ProjectItem = Project & { label: string }

const route = useRoute()
const toast = useToast()
const { showError } = useErrorToast()

const loading = ref(false)
const loadingProjects = ref(true)
const showSuccessModal = ref(false)
const generatedCode = ref('')

const projects = ref<Project[]>([])
const selectedProject = ref<ProjectItem | undefined>(undefined)

const form = reactive({
  project_id: null as number | null,
  expiration: ''
})

// Transform projects for USelectMenu
const projectItems = computed(() =>
  projects.value.map((project) => ({
    ...project,
    label: `${project.name} (${project.year})`
  }))
)

// Set minimum date to tomorrow
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().slice(0, 16)
})

const fetchProjects = async () => {
  loadingProjects.value = true
  try {
    const { data, error } = await getAllProjectsHandler()

    if (error) {
      showError('Error', error)
      return
    }

    if (data) {
      projects.value = data.projects

      // Pre-select project from query param if provided
      const projectId = route.query.project
      if (projectId) {
        const project = projects.value.find((p) => p.project_id === parseInt(projectId as string))
        if (project) {
          selectedProject.value = {
            ...project,
            label: `${project.name} (${project.year})`
          }
        }
      }
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loadingProjects.value = false
  }
}

watch(selectedProject, (project) => {
  if (project) {
    form.project_id = project.project_id
  }
})

const onSubmit = async () => {
  if (!selectedProject.value || !form.project_id) {
    showError('Validation Error', { error: 'Please select a project' })
    return
  }

  loading.value = true

  try {
    // Convert datetime-local to ISO 8601 format
    const expirationDate = new Date(form.expiration)
    const expirationISO = expirationDate.toISOString()

    const { data, error } = await createCodeHandler({
      body: {
        project_id: form.project_id,
        expiration: expirationISO
      }
    })

    if (error) {
      showError('Code Generation Failed', error)
      return
    }

    if (data) {
      generatedCode.value = data.code
      showSuccessModal.value = true
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}

const copyGeneratedCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    toast.add({
      title: 'Copied',
      description: 'Security code copied to clipboard',
      color: 'success'
    })
  } catch (err) {
    showError('Copy Failed', err)
  }
}

const closeModal = () => {
  showSuccessModal.value = false
  navigateTo('/admin/security-codes')
}

onMounted(() => {
  fetchProjects()

  // Set default expiration to 7 days from now
  const defaultExpiration = new Date()
  defaultExpiration.setDate(defaultExpiration.getDate() + 7)
  form.expiration = defaultExpiration.toISOString().slice(0, 16)
})
</script>
