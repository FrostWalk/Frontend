<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Select Group Deliverable</h1>

    <div v-if="loading" class="text-center py-12">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading deliverables...</p>
    </div>

    <UCard v-else>
      <UForm :state="form" class="space-y-4" @submit="onSubmit">
        <UFormField label="Select Deliverable" name="group_deliverable_id" required>
          <USelectMenu
            v-model="selectedDeliverable"
            :options="deliverables"
            option-attribute="name"
            value-attribute="group_deliverable_id"
            placeholder="Choose a deliverable"
          />
        </UFormField>

        <div v-if="selectedDeliverable" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">Components</h4>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li v-for="comp in componentsForSelected" :key="comp.group_deliverable_component_id">
              • {{ comp.name }}
            </li>
          </ul>
        </div>

        <UFormField
          label="Repository Link"
          name="link"
          required
          help="GitHub, GitLab, or other repository URL"
        >
          <UInput
            v-model="form.link"
            type="url"
            placeholder="https://github.com/your-group/project"
          />
        </UFormField>

        <UFormField
          label="Project Description"
          name="markdown_text"
          required
          help="Describe your approach and methodology"
        >
          <UTextarea
            v-model="form.markdown_text"
            :rows="8"
            placeholder="# Our Project Approach..."
          />
        </UFormField>

        <UButton type="submit" block :loading="submitting">
          <Icon name="material-symbols:check-circle" class="mr-2" />
          Confirm Selection
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { GroupDeliverable, GroupDeliverableComponent } from '~/composables/api/types.gen'
import { getStudentProjects, createGroupDeliverableSelection } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)
const deliverables = ref<GroupDeliverable[]>([])
const components = ref<GroupDeliverableComponent[]>([])
const selectedDeliverable = ref<GroupDeliverable | null>(null)
const projectId = ref<number | null>(null)

const form = reactive({
  link: '',
  markdown_text: '# Our Project\n\n## Approach\n\nDescribe your project approach here...'
})

const componentsForSelected = computed(() => {
  if (!selectedDeliverable.value) return []
  return components.value.filter((c) => c.project_id === selectedDeliverable.value?.project_id)
})

const fetchDeliverables = async () => {
  loading.value = true
  try {
    const { data, error } = await getStudentProjects()

    if (error) {
      toast.add({
        title: 'Error',
        description: error.error || 'Failed to load deliverables',
        color: 'error'
      })
      return
    }

    if (data && data.projects.length > 0) {
      // Find the project for this group
      // For now, use the first project's deliverables
      const project = data.projects[0]
      if (project) {
        projectId.value = project.project.project_id
        deliverables.value = project.group_deliverables
        components.value = project.group_components
      }
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
    const groupId = parseInt(route.params.id as string)
    const { data, error } = await createGroupDeliverableSelection({
      path: { group_id: groupId },
      body: {
        group_deliverable_id: selectedDeliverable.value.group_deliverable_id,
        link: form.link,
        markdown_text: form.markdown_text
      }
    })

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
        title: 'Deliverable Selected',
        description: 'Successfully selected group deliverable',
        color: 'success'
      })

      navigateTo(`/groups/${groupId}`)
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
  fetchDeliverables()
})
</script>
