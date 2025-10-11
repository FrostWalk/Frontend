<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Projects</h1>
      <UButton to="/groups/create" color="primary">
        <Icon name="material-symbols:add" class="mr-2" />
        Create Group
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
      <p class="text-sm text-gray-500 mt-2">You need to join a group to see projects</p>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="item in projects" :key="item.project.project_id">
        <template #header>
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold">{{ item.project.name }}</h3>
              <p class="text-sm text-gray-500">Year: {{ item.project.year }}</p>
            </div>
            <UBadge :color="item.project.active ? 'success' : 'neutral'">
              {{ item.project.active ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-3">
          <div class="text-sm">
            <p class="text-gray-600">
              <strong>Max Group Size:</strong> {{ item.project.max_group_size }}
            </p>
            <p class="text-gray-600">
              <strong>Max Uploads:</strong> {{ item.project.max_student_uploads }}
            </p>
            <p v-if="item.project.deliverable_selection_deadline" class="text-gray-600">
              <strong>Deadline:</strong>
              {{ formatDate(item.project.deliverable_selection_deadline) }}
            </p>
          </div>

          <div class="border-t pt-3">
            <p class="text-xs text-gray-500 mb-2">
              Group Deliverables: {{ item.group_deliverables.length }}
            </p>
            <p class="text-xs text-gray-500">
              Student Deliverables: {{ item.student_deliverables.length }}
            </p>
          </div>
        </div>

        <template #footer>
          <div class="flex gap-2">
            <UButton
              :to="`/projects/${item.project.project_id}/select-deliverable`"
              color="primary"
              variant="soft"
              block
            >
              <Icon name="material-symbols:assignment" class="mr-2" />
              My Deliverable
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectWithDetails } from '~/composables/api/types.gen'
import { getStudentProjects } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()

const loading = ref(true)
const projects = ref<ProjectWithDetails[]>([])

const fetchProjects = async () => {
  loading.value = true
  try {
    const { data, error } = await getStudentProjects()

    if (error) {
      toast.add({
        title: 'Error',
        description: error.error || 'Failed to load projects',
        color: 'error'
      })
      return
    }

    if (data) {
      projects.value = data.projects
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

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchProjects()
})
</script>
