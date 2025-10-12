<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create New Project</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Set up a new project with configurations for groups and deliverables
      </p>
    </div>

    <UForm :state="form" @submit="onSubmit">
      <!-- Basic Information Section -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:info" class="text-primary-500" size="20" />
            <h2 class="text-lg font-semibold">Basic Information</h2>
          </div>
        </template>

        <div class="space-y-4">
          <UFormField label="Project Name" name="name" required>
            <UInput v-model="form.name" placeholder="e.g., Advanced Programming 2025" size="lg" />
          </UFormField>
        </div>
      </UCard>

      <!-- Configuration Section -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:settings" class="text-primary-500" size="20" />
            <h2 class="text-lg font-semibold">Configuration</h2>
          </div>
        </template>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField
              label="Max Group Size"
              name="max_group_size"
              required
              help="Maximum number of students per group"
            >
              <UInput
                v-model.number="form.max_group_size"
                type="number"
                min="1"
                placeholder="4"
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Max Student Uploads"
              name="max_student_uploads"
              required
              help="Maximum uploads allowed per student"
            >
              <UInput
                v-model.number="form.max_student_uploads"
                type="number"
                min="1"
                placeholder="10"
                size="lg"
              />
            </UFormField>
          </div>

          <UFormField
            label="Deliverable Selection Deadline"
            name="deliverable_selection_deadline"
            help="Optional: Students must select their deliverable before this date"
          >
            <UInput v-model="form.deliverable_selection_deadline" type="datetime-local" size="lg" />
          </UFormField>
        </div>
      </UCard>

      <!-- Status Section -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:toggle-on" class="text-primary-500" size="20" />
            <h2 class="text-lg font-semibold">Status</h2>
          </div>
        </template>

        <UFormField label="Active Status" name="active">
          <div class="flex items-center gap-3">
            <USwitch v-model="form.active" size="lg" />
            <span
              class="text-sm font-medium"
              :class="form.active ? 'text-green-600' : 'text-gray-500'"
            >
              {{ form.active ? 'Active - Visible to students' : 'Inactive - Hidden from students' }}
            </span>
          </div>
        </UFormField>
      </UCard>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 mt-8">
        <UButton to="/admin/projects" color="error" size="lg">
          <Icon name="material-symbols:close" class="mr-2" />
          Cancel
        </UButton>
        <UButton type="submit" :loading="loading" size="lg">
          <Icon name="material-symbols:check" class="mr-2" />
          Create Project
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { createProjectHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const toast = useToast()
const { showError } = useErrorToast()
const loading = ref(false)

const form = reactive({
  name: '',
  max_group_size: 4,
  max_student_uploads: 10,
  deliverable_selection_deadline: '',
  active: true
})

const onSubmit = async () => {
  loading.value = true

  try {
    const { data, error } = await createProjectHandler({
      body: {
        name: form.name,
        max_group_size: form.max_group_size,
        max_student_uploads: form.max_student_uploads,
        deliverable_selection_deadline: form.deliverable_selection_deadline || null,
        active: form.active
      }
    })

    if (error) {
      showError('Project Creation Failed', error)
      return
    }

    if (data) {
      toast.add({
        title: 'Project Created',
        description: 'Project created successfully. Now you can set up deliverables.',
        color: 'success'
      })

      // Redirect to project setup
      navigateTo(`/admin/projects/${data.project_id}/setup`)
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}
</script>
