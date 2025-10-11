<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Project</h1>

    <UCard>
      <UForm :state="form" class="space-y-4" @submit="onSubmit">
        <UFormField label="Project Name" name="name" required>
          <UInput v-model="form.name" placeholder="Advanced Programming 2025" />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Max Group Size" name="max_group_size" required>
            <UInput v-model.number="form.max_group_size" type="number" min="1" placeholder="4" />
          </UFormField>

          <UFormField label="Max Student Uploads" name="max_student_uploads" required>
            <UInput
              v-model.number="form.max_student_uploads"
              type="number"
              min="1"
              placeholder="10"
            />
          </UFormField>
        </div>

        <UFormField
          label="Deliverable Selection Deadline"
          name="deliverable_selection_deadline"
          help="Optional: Set a deadline for deliverable selections"
        >
          <UInput v-model="form.deliverable_selection_deadline" type="datetime-local" />
        </UFormField>

        <UFormField label="Active Status" name="active">
          <UToggle v-model="form.active" />
          <template #help>
            {{ form.active ? 'Project is active and visible to students' : 'Project is inactive' }}
          </template>
        </UFormField>

        <div class="flex gap-3 pt-4">
          <UButton type="submit" :loading="loading">
            <Icon name="material-symbols:check" class="mr-2" />
            Create Project
          </UButton>
          <UButton to="/admin/projects" color="neutral" variant="ghost"> Cancel </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { createProjectHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const toast = useToast()
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
      toast.add({
        title: 'Project Creation Failed',
        description: error.error || 'Failed to create project',
        color: 'error'
      })
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
</script>
