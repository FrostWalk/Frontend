<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <p class="text-gray-600 mt-1">
          {{ roleId === roles.COORDINATOR ? 'Assigned projects' : 'All projects' }}
        </p>
      </div>
      <UButton
        v-if="roleId === roles.PROFESSOR || roleId === roles.ROOT"
        to="/admin/projects/create"
        color="primary"
      >
        <Icon name="material-symbols:add" class="mr-2" />
        Create Project
      </UButton>
    </div>

    <div v-if="loading" class="text-center py-12">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading projects...</p>
    </div>

    <div v-else-if="projects.length === 0" class="text-center py-12">
      <Icon name="material-symbols:folder-off" size="64" class="mx-auto text-gray-400" />
      <p class="mt-4 text-lg text-gray-600">No projects found</p>
    </div>

    <div v-else class="grid gap-6">
      <UCard v-for="project in projects" :key="project.project_id">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-xl font-semibold">{{ project.name }}</h3>
              <UBadge :color="project.active ? 'success' : 'neutral'">
                {{ project.active ? 'Active' : 'Inactive' }}
              </UBadge>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
              <div>
                <p class="text-gray-500">Year</p>
                <p class="font-medium">{{ project.year }}</p>
              </div>
              <div>
                <p class="text-gray-500">Max Group Size</p>
                <p class="font-medium">{{ project.max_group_size }}</p>
              </div>
              <div>
                <p class="text-gray-500">Max Uploads</p>
                <p class="font-medium">{{ project.max_student_uploads }}</p>
              </div>
              <div v-if="project.deliverable_selection_deadline">
                <p class="text-gray-500">Deadline</p>
                <p class="font-medium text-xs">
                  {{ formatDate(project.deliverable_selection_deadline) }}
                </p>
              </div>
            </div>
          </div>

          <UDropdownMenu :items="getProjectActions(project)">
            <UButton color="neutral" variant="ghost" icon="material-symbols:more-vert" />
          </UDropdownMenu>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/composables/api/types.gen'
import { getAllProjectsHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const { roleId, roles } = useAdminAuth()
const { showError } = useErrorToast()

const loading = ref(true)
const projects = ref<Project[]>([])

const fetchProjects = async () => {
  loading.value = true
  try {
    const { data, error } = await getAllProjectsHandler()

    if (error) {
      showError('Error', error)
      return
    }

    if (data) {
      projects.value = data.projects
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}

const getProjectActions = (project: Project) => {
  const actions = [
    [
      {
        label: 'View Details',
        icon: 'material-symbols:visibility',
        to: `/admin/projects/${project.project_id}`
      }
    ],
    [
      {
        label: 'Create Security Code',
        icon: 'material-symbols:key',
        to: `/admin/security-codes/create?project=${project.project_id}`
      }
    ]
  ]

  if (roleId.value === roles.PROFESSOR || roleId.value === roles.ROOT) {
    actions.push([
      {
        label: 'Setup Deliverables',
        icon: 'material-symbols:settings',
        to: `/admin/projects/${project.project_id}/setup`
      }
    ])
  }

  return actions
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchProjects()
})
</script>
