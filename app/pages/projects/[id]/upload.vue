<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Project Upload</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Upload your ZIP file. New upload replaces previous file.
        </p>
      </div>
      <UButton color="neutral" variant="ghost" icon="material-symbols:arrow-back" :to="`/projects`">
        Back
      </UButton>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold">Upload Status</h2>
          <UBadge v-if="status?.upload_deadline" :color="deadlineBadgeColor" variant="soft">
            {{ deadlineBadgeText }}
          </UBadge>
        </div>
      </template>

      <div v-if="loadingStatus" class="py-8 text-center">
        <Icon
          name="material-symbols:hourglass-empty"
          size="40"
          class="mx-auto animate-spin text-primary-500"
        />
        <p class="mt-3 text-sm text-gray-600">Loading upload status...</p>
      </div>

      <div v-else-if="status" class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <p class="text-xs uppercase tracking-wide text-gray-500">Uploads Used</p>
          <p class="mt-2 text-2xl font-semibold">{{ status.upload_count }}</p>
        </div>
        <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <p class="text-xs uppercase tracking-wide text-gray-500">Uploads Remaining</p>
          <p class="mt-2 text-2xl font-semibold">{{ status.uploads_remaining }}</p>
        </div>
        <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <p class="text-xs uppercase tracking-wide text-gray-500">Last Upload</p>
          <p class="mt-2 text-sm font-medium">
            {{ status.timestamp ? formatDate(status.timestamp) : 'No uploads yet' }}
          </p>
        </div>
      </div>

      <div
        v-if="status?.upload_deadline"
        class="mt-4 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900"
      >
        <p class="font-medium text-gray-800 dark:text-gray-100">Upload Deadline</p>
        <p class="mt-1 text-gray-600 dark:text-gray-300">
          {{ formatDate(status.upload_deadline) }}
        </p>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Upload ZIP</h2>
      </template>

      <div
        v-if="uploadBlocked"
        class="rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-800"
      >
        {{ blockReason }}
      </div>

      <div class="space-y-4">
        <UFileUpload
          v-slot="{ open, removeFile }"
          v-model="selectedFile"
          :disabled="uploadBlocked || uploading"
          accept=".zip,application/zip,application/x-zip-compressed"
          class="w-full min-h-44"
        >
          <div
            class="flex min-h-44 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-700"
          >
            <Icon name="material-symbols:folder-zip-outline" size="44" class="text-primary-500" />
            <p class="mt-3 text-sm font-medium text-gray-800 dark:text-gray-100">
              {{ selectedFile ? selectedFile.name : 'Drop ZIP here or choose file' }}
            </p>
            <p class="mt-1 text-xs text-gray-500">Only .zip files accepted</p>
            <div class="mt-4 flex items-center gap-2">
              <UButton
                color="neutral"
                variant="outline"
                icon="material-symbols:upload-file"
                :disabled="uploadBlocked || uploading"
                @click="open()"
              >
                Select ZIP
              </UButton>
              <UButton
                v-if="selectedFile"
                color="error"
                variant="ghost"
                icon="material-symbols:delete"
                :disabled="uploading"
                @click="removeFile()"
              >
                Remove
              </UButton>
            </div>
          </div>
        </UFileUpload>

        <UButton
          block
          color="primary"
          icon="material-symbols:cloud-upload"
          :loading="uploading"
          :disabled="!selectedFile || uploadBlocked"
          @click="submitUpload"
        >
          Upload ZIP
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { StudentUploadStatusResponse } from '~/composables/api/types.gen'
import { getUploadStatusHandler, uploadProjectZipHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const toast = useToast()
const { showError } = useErrorToast()

const projectId = Number(route.params.id)

const loadingStatus = ref(true)
const uploading = ref(false)
const status = ref<StudentUploadStatusResponse | null>(null)
const selectedFile = ref<File>()

const deadlineTimestamp = computed(() => {
  if (!status.value?.upload_deadline) return null
  return new Date(status.value.upload_deadline).getTime()
})

const deadlinePassed = computed(() => {
  if (!deadlineTimestamp.value) return false
  return Date.now() > deadlineTimestamp.value
})

const uploadBlocked = computed(() => {
  if (!status.value) return true
  return status.value.uploads_remaining <= 0 || deadlinePassed.value
})

const blockReason = computed(() => {
  if (!status.value) return 'Upload status unavailable.'
  if (status.value.uploads_remaining <= 0) return 'Upload limit reached for this project.'
  if (deadlinePassed.value) return 'Upload deadline reached. New uploads blocked.'
  return ''
})

const deadlineBadgeColor = computed(() => {
  if (deadlinePassed.value) return 'error' as const
  if (!deadlineTimestamp.value) return 'neutral' as const
  const hoursLeft = (deadlineTimestamp.value - Date.now()) / (1000 * 60 * 60)
  if (hoursLeft <= 24) return 'warning' as const
  return 'success' as const
})

const deadlineBadgeText = computed(() => {
  if (deadlinePassed.value) return 'Deadline passed'
  if (!deadlineTimestamp.value) return 'No deadline'
  const msLeft = deadlineTimestamp.value - Date.now()
  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60))
  if (hoursLeft <= 24) return `${Math.max(hoursLeft, 0)}h left`
  return 'Open'
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchStatus = async () => {
  loadingStatus.value = true
  try {
    const { data, error } = await getUploadStatusHandler({
      path: { project_id: projectId }
    })

    if (error) {
      showError('Status Failed', error)
      return
    }

    if (data) {
      status.value = data
    }
  } catch (err) {
    showError('Status Failed', err)
  } finally {
    loadingStatus.value = false
  }
}

const submitUpload = async () => {
  if (!selectedFile.value || uploadBlocked.value) return

  uploading.value = true
  try {
    const body = new FormData()
    body.append('file', selectedFile.value)

    const { data, error } = await uploadProjectZipHandler({
      path: { project_id: projectId },
      body: body as unknown as string
    })

    if (error) {
      showError('Upload Failed', error)
      return
    }

    if (data) {
      toast.add({
        title: 'Upload Completed',
        description: `Upload #${data.upload_count} saved. Previous upload replaced.`,
        color: 'success'
      })
      selectedFile.value = undefined
      await fetchStatus()
    }
  } catch (err) {
    showError('Upload Failed', err)
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  fetchStatus()
})
</script>
