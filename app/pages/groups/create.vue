<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create a Group</h1>

    <UCard>
      <UForm :state="form" class="space-y-4" @submit="onSubmit">
        <UFormField
          label="Security Code"
          name="security_code"
          required
          help="Enter the code provided by your coordinator"
        >
          <UInput v-model="form.security_code" placeholder="XXX-XXX" @blur="validateCode" />
        </UFormField>

        <div v-if="projectInfo" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">Project Information</h3>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            <strong>Project:</strong> {{ projectInfo.name }}
          </p>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            <strong>Year:</strong> {{ projectInfo.year }}
          </p>
        </div>

        <UFormField label="Group Name" name="name" required>
          <UInput v-model="form.name" placeholder="Enter your group name" />
        </UFormField>

        <UButton type="submit" block :loading="loading" :disabled="!projectInfo">
          <Icon name="material-symbols:group-add" class="mr-2" />
          Create Group
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { ProjectInfo } from '~/composables/api/types.gen'
import { validateCode as validateCodeApi, createGroup } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()
const { showError } = useErrorToast()
const loading = ref(false)
const projectInfo = ref<ProjectInfo | null>(null)

const form = reactive({
  name: '',
  security_code: ''
})

const validateCode = async () => {
  if (!form.security_code || form.security_code.length < 7) {
    projectInfo.value = null
    return
  }

  try {
    const { data, error } = await validateCodeApi({
      body: { security_code: form.security_code }
    })

    if (error) {
      projectInfo.value = null
      showError('Invalid Code', error)
      return
    }

    if (data?.is_valid && data.project) {
      projectInfo.value = data.project
      toast.add({
        title: 'Code Valid',
        description: `Code is valid for project: ${data.project.name}`,
        color: 'success'
      })
    } else {
      projectInfo.value = null
      showError('Invalid Code', { error: 'The security code is invalid or expired' })
    }
  } catch {
    projectInfo.value = null
  }
}

const onSubmit = async () => {
  if (!projectInfo.value) {
    showError('Validation Error', { error: 'Please enter a valid security code' })
    return
  }

  loading.value = true

  try {
    const { data, error } = await createGroup({
      body: {
        name: form.name,
        security_code: form.security_code
      }
    })

    if (error) {
      showError('Group Creation Failed', error)
      return
    }

    if (data) {
      toast.add({
        title: 'Group Created',
        description: `Successfully created group: ${data.name}`,
        color: 'success'
      })

      navigateTo(`/groups/${data.group_id}`)
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}
</script>
