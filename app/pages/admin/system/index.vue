<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">System</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        System configuration and maintenance tools
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <UCard
        class="cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
        @click="openTestEmailModal"
      >
        <div class="flex items-center gap-3">
          <div class="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Icon
              name="material-symbols:mail"
              class="text-primary-600 dark:text-primary-400"
              size="24"
            />
          </div>
          <div>
            <h3 class="font-semibold text-lg">Test Email config.</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Send test emails to verify SMTP configuration
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Test Email Modal -->
    <UModal v-model:open="isTestEmailModalOpen" title="Test Email config.">
      <template #body>
        <UForm :state="emailForm" class="space-y-4">
          <UFormField label="To Email" name="to_email" required>
            <UInput
              v-model="emailForm.to_email"
              type="email"
              placeholder="Enter recipient email address"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Subject" name="subject" required>
            <UInput v-model="emailForm.subject" placeholder="Enter email subject" class="w-full" />
          </UFormField>

          <UFormField label="Body" name="body" required>
            <UTextarea
              v-model="emailForm.body"
              placeholder="Enter email body content"
              :rows="8"
              class="w-full"
            />
          </UFormField>
        </UForm>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="outline" @click="isTestEmailModalOpen = false">
            Cancel
          </UButton>
          <UButton :loading="sendingEmail" @click="sendTestEmail">
            <Icon name="material-symbols:send" class="mr-2" />
            Send Test Email
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { testEmailHandler } from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const { roleId, roles } = useAdminAuth()
const toast = useToast()
const { showError } = useErrorToast()

const isTestEmailModalOpen = ref(false)
const sendingEmail = ref(false)

const emailForm = reactive({
  to_email: '',
  subject: 'Test Email',
  body: 'This is a test email to verify SMTP configuration.'
})

// Redirect if not ROOT user
onMounted(() => {
  if (roleId.value !== roles.ROOT) {
    navigateTo('/admin/projects')
  }
})

const openTestEmailModal = () => {
  // Reset form with defaults when opening modal
  emailForm.to_email = ''
  emailForm.subject = 'Test Email'
  emailForm.body = 'This is a test email to verify SMTP configuration.'
  isTestEmailModalOpen.value = true
}

const sendTestEmail = async () => {
  // Validate form
  if (!emailForm.to_email || !emailForm.subject || !emailForm.body) {
    toast.add({
      title: 'Validation Error',
      description: 'Please fill in all fields',
      color: 'error'
    })
    return
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailForm.to_email)) {
    toast.add({
      title: 'Validation Error',
      description: 'Please enter a valid email address',
      color: 'error'
    })
    return
  }

  sendingEmail.value = true

  try {
    const { data, error } = await testEmailHandler({
      body: {
        to_email: emailForm.to_email,
        subject: emailForm.subject,
        body: emailForm.body
      }
    })

    if (error) {
      showError('Test Email Failed', error)
      return
    }

    if (data) {
      toast.add({
        title: 'Test Email Sent',
        description: data.message || 'Test email sent successfully',
        color: 'success'
      })

      // Clear form and close modal after successful send
      emailForm.to_email = ''
      emailForm.subject = ''
      emailForm.body = ''
      isTestEmailModalOpen.value = false
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    sendingEmail.value = false
  }
}
</script>
