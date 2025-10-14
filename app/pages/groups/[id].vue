<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-12">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading group...</p>
    </div>

    <div v-else-if="groupData">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ groupData.group_name }}
          </h1>
          <p class="text-gray-600">{{ members.length }} member(s)</p>
        </div>
        <UButton v-if="isLeader" color="primary" @click="openDeliverableModal">
          <Icon name="material-symbols:assignment" class="mr-2" />
          Select Group Deliverable
        </UButton>
      </div>

      <!-- Select Deliverable Modal -->
      <UModal
        v-model:open="isModalOpen"
        :title="isEditMode ? 'Edit Group Deliverable' : 'Select Group Deliverable'"
        :description="
          isEditMode
            ? 'Update your project details'
            : 'Choose a deliverable and provide project details'
        "
        :ui="{
          content: 'sm:max-w-5xl',
          body: 'p-6 sm:p-8'
        }"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Icon
                :name="isEditMode ? 'material-symbols:edit' : 'material-symbols:assignment'"
                class="text-primary-600 dark:text-primary-400"
                size="24"
              />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ isEditMode ? 'Edit' : 'Select' }} Group Deliverable
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {{
                  isEditMode
                    ? 'Update your project details'
                    : 'Choose a deliverable and provide project details'
                }}
              </p>
            </div>
          </div>
        </template>

        <template #body>
          <div v-if="loadingDeliverables" class="text-center py-16">
            <Icon
              name="material-symbols:hourglass-empty"
              size="56"
              class="animate-spin mx-auto text-primary-500"
            />
            <p class="mt-4 text-gray-600 text-lg">Loading deliverables...</p>
          </div>

          <div v-else class="space-y-6">
            <!-- Two Column Layout for Deliverable Selection and Components -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Deliverable Selection Section -->
              <div>
                <h4
                  class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
                >
                  <Icon name="material-symbols:list-alt" size="20" class="text-primary-500" />
                  Choose Deliverable
                </h4>
                <UFormField label="Deliverable" name="group_deliverable_id" required>
                  <USelectMenu
                    v-model="selectedDeliverableOption"
                    :items="deliverableItems"
                    placeholder="Select a deliverable from the list"
                    size="lg"
                  />
                </UFormField>
              </div>

              <!-- Components Preview Section -->
              <div
                v-if="selectedDeliverableOption"
                class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800"
              >
                <div class="flex items-center gap-2 mb-3">
                  <Icon
                    name="material-symbols:widgets"
                    size="20"
                    class="text-blue-600 dark:text-blue-400"
                  />
                  <h4 class="font-semibold text-blue-900 dark:text-blue-100">
                    Required Components
                  </h4>
                </div>
                <div
                  v-if="componentsForSelected.length > 0"
                  class="space-y-2 max-h-32 overflow-y-auto pr-2"
                >
                  <div
                    v-for="comp in componentsForSelected"
                    :key="comp.group_deliverable_component_id"
                    class="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm"
                  >
                    <Icon
                      name="material-symbols:check-circle"
                      size="16"
                      class="text-green-500 flex-shrink-0"
                    />
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{
                      comp.name
                    }}</span>
                  </div>
                </div>
                <p v-else class="text-sm text-blue-700 dark:text-blue-300 italic">
                  No components required for this deliverable
                </p>
              </div>
            </div>

            <USeparator />

            <!-- Project Details Section - Full Width -->
            <div>
              <h4
                class="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2"
              >
                <Icon name="material-symbols:code" size="20" class="text-primary-500" />
                Project Details
              </h4>

              <div class="space-y-6">
                <!-- Repository Link - Full Width -->
                <UFormField
                  label="Repository Link"
                  name="link"
                  required
                  description="Provide the URL to your GitHub, GitLab, or other repository"
                >
                  <UInput
                    v-model="deliverableForm.link"
                    type="url"
                    placeholder="https://github.com/your-username/project-name"
                    size="lg"
                    icon="material-symbols:link"
                    class="w-full"
                  />
                </UFormField>

                <!-- Project Description - Full Width -->
                <UFormField
                  label="Project Description"
                  name="markdown_text"
                  required
                  description="Describe your project approach, methodology, and implementation (Markdown supported)"
                >
                  <UTextarea
                    v-model="deliverableForm.markdown_text"
                    :rows="12"
                    placeholder="# Project Overview&#10;&#10;## Approach&#10;Describe your implementation approach...&#10;&#10;## Technologies Used&#10;- Technology 1&#10;- Technology 2&#10;&#10;## Key Features&#10;Highlight the main features..."
                    size="lg"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="flex items-center justify-between w-full">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              All fields marked with <span class="text-red-500">*</span> are required
            </p>
            <div class="flex gap-3">
              <UButton
                color="neutral"
                variant="outline"
                label="Cancel"
                size="lg"
                @click="isModalOpen = false"
              />
              <UButton
                :loading="submittingDeliverable"
                :disabled="
                  !selectedDeliverableOption ||
                  !deliverableForm.link ||
                  !deliverableForm.markdown_text
                "
                size="lg"
                @click="onSubmitDeliverable"
              >
                <Icon name="material-symbols:check-circle" class="mr-2" />
                {{ isEditMode ? 'Update' : 'Confirm Selection' }}
              </UButton>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Group Deliverable Selection -->
      <UCard v-if="deliverableSelection" class="mb-6">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <Icon name="material-symbols:check-circle" class="mr-2 text-green-500" size="24" />
              <h3 class="font-semibold">Group Deliverable Selected</h3>
            </div>
            <UButton
              v-if="isLeader"
              color="primary"
              variant="outline"
              size="sm"
              @click="editDeliverableSelection"
            >
              <Icon name="material-symbols:edit" class="mr-2" size="18" />
              Edit
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Deliverable</p>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ deliverableSelection.group_deliverable_name }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Repository Link</p>
            <a
              :href="deliverableSelection.link"
              target="_blank"
              class="text-primary-500 hover:text-primary-600 flex items-center gap-1 font-medium"
            >
              {{ deliverableSelection.link }}
              <Icon name="material-symbols:open-in-new" size="16" />
            </a>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
            <div
              class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <MDC
                :value="deliverableSelection.markdown_text"
                tag="article"
                class="prose prose-sm dark:prose-invert max-w-none"
              />
            </div>
          </div>
        </div>
      </UCard>

      <!-- Members List -->
      <UCard class="mb-6">
        <template #header>
          <h3 class="font-semibold">Group Members</h3>
        </template>

        <div class="space-y-3">
          <div
            v-for="member in members"
            :key="member.student_id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <Icon name="material-symbols:account-circle" size="32" class="text-gray-400" />
              <div>
                <p class="font-medium">{{ member.first_name }} {{ member.last_name }}</p>
                <p class="text-sm text-gray-500">{{ member.email }}</p>
              </div>
            </div>
            <UBadge :color="member.role_name === 'Group Leader' ? 'primary' : 'neutral'">
              {{ member.role_name }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- Add Member (Leader Only) -->
      <UCard v-if="isLeader">
        <template #header>
          <h3 class="font-semibold">Add Member</h3>
        </template>

        <div class="space-y-6">
          <UAlert
            icon="material-symbols:info"
            color="primary"
            variant="soft"
            title="Registration Required"
            description="The student must already have registered an account with this email address. If they have not done so, remind them to do so."
          />

          <UForm :state="addMemberForm" class="space-y-4" @submit="addMember">
            <UFormField label="Student Email" name="email" required>
              <UInput
                v-model="addMemberForm.email"
                type="email"
                placeholder="student@studenti.unitn.it"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UButton type="submit" :loading="addingMember" size="lg">
              <Icon name="material-symbols:person-add" class="mr-2" />
              Add Member
            </UButton>
          </UForm>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  GroupMemberInfo,
  GroupDeliverableSelectionResponse,
  GroupDeliverable,
  GroupDeliverableComponent
} from '~/composables/api/types.gen'
import {
  listGroupMembers,
  getGroupDeliverableSelection,
  addMember2 as addMemberApi,
  getStudentProjects,
  createGroupDeliverableSelection,
  updateGroupDeliverableSelection,
  allowedDomainsHandler
} from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'auth',
  key: (route) => `group-${route.params.id}`
})

const route = useRoute()
const { user } = useStudentAuth()
const toast = useToast()
const { showError } = useErrorToast()

const loading = ref(true)
const addingMember = ref(false)
const groupData = ref<{ group_id: number; group_name: string } | null>(null)
const members = ref<GroupMemberInfo[]>([])
const deliverableSelection = ref<GroupDeliverableSelectionResponse | null>(null)
const allowedDomains = ref<string[]>([])

// Modal state
const isModalOpen = ref(false)
const isEditMode = ref(false)
const loadingDeliverables = ref(false)
const submittingDeliverable = ref(false)
const deliverables = ref<GroupDeliverable[]>([])
const components = ref<GroupDeliverableComponent[]>([])
const selectedDeliverableOption = ref<(GroupDeliverable & { label: string }) | undefined>(undefined)

const addMemberForm = reactive({
  email: ''
})

const deliverableForm = reactive({
  link: '',
  markdown_text: '# Our Project\n\n## Approach\n\nDescribe your project approach here...'
})

const isLeader = computed(() => {
  const currentMember = members.value.find((m) => m.student_id === user.value?.id)
  return currentMember?.role_name === 'Group Leader'
})

// Transform deliverables for USelectMenu
const deliverableItems = computed(() =>
  deliverables.value.map((deliverable) => ({
    ...deliverable,
    label: deliverable.name
  }))
)

const componentsForSelected = computed(() => {
  if (!selectedDeliverableOption.value) return []
  return components.value.filter(
    (c) => c.project_id === selectedDeliverableOption.value?.project_id
  )
})

const fetchGroupData = async () => {
  loading.value = true
  try {
    const groupId = parseInt(route.params.id as string)

    // Fetch members
    const { data: membersData, error: membersError } = await listGroupMembers({
      path: { group_id: groupId }
    })

    if (membersError) {
      showError('Error', membersError)
      return
    }

    if (membersData) {
      groupData.value = {
        group_id: membersData.group_id,
        group_name: membersData.group_name
      }
      members.value = membersData.members
    }

    // Try to fetch deliverable selection
    try {
      const { data: delivData } = await getGroupDeliverableSelection({
        path: { group_id: groupId }
      })
      if (delivData) {
        deliverableSelection.value = delivData
      }
    } catch {
      // No deliverable selected yet, that's okay
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}

const openDeliverableModal = async () => {
  isEditMode.value = false
  isModalOpen.value = true
  loadingDeliverables.value = true

  try {
    const { data, error } = await getStudentProjects()

    if (error) {
      showError('Error', error)
      return
    }

    if (data && data.projects.length > 0) {
      // Find the project for this group
      // For now, use the first project's deliverables
      const project = data.projects[0]
      if (project) {
        deliverables.value = project.group_deliverables
        components.value = project.group_components
      }
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loadingDeliverables.value = false
  }
}

const editDeliverableSelection = async () => {
  isEditMode.value = true
  isModalOpen.value = true
  loadingDeliverables.value = true

  try {
    const { data, error } = await getStudentProjects()

    if (error) {
      showError('Error', error)
      return
    }

    if (data && data.projects.length > 0) {
      const project = data.projects[0]
      if (project) {
        deliverables.value = project.group_deliverables
        components.value = project.group_components

        // Pre-fill form with existing data
        if (deliverableSelection.value) {
          deliverableForm.link = deliverableSelection.value.link
          deliverableForm.markdown_text = deliverableSelection.value.markdown_text

          // Find and select the current deliverable
          const currentDeliverable = project.group_deliverables.find(
            (d) => d.name === deliverableSelection.value?.group_deliverable_name
          )
          if (currentDeliverable) {
            selectedDeliverableOption.value = {
              ...currentDeliverable,
              label: currentDeliverable.name
            }
          }
        }
      }
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    loadingDeliverables.value = false
  }
}

const onSubmitDeliverable = async () => {
  if (!selectedDeliverableOption.value) {
    showError('Validation Error', { error: 'Please select a deliverable' })
    return
  }

  submittingDeliverable.value = true
  try {
    const groupId = parseInt(route.params.id as string)

    let data, error

    if (isEditMode.value) {
      // Update existing selection
      const result = await updateGroupDeliverableSelection({
        path: { group_id: groupId },
        body: {
          link: deliverableForm.link,
          markdown_text: deliverableForm.markdown_text
        }
      })
      data = result.data
      error = result.error
    } else {
      // Create new selection
      const result = await createGroupDeliverableSelection({
        path: { group_id: groupId },
        body: {
          group_deliverable_id: selectedDeliverableOption.value.group_deliverable_id,
          link: deliverableForm.link,
          markdown_text: deliverableForm.markdown_text
        }
      })
      data = result.data
      error = result.error
    }

    if (error) {
      showError(isEditMode.value ? 'Update Failed' : 'Selection Failed', error)
      return
    }

    if (data) {
      toast.add({
        title: isEditMode.value ? 'Deliverable Updated' : 'Deliverable Selected',
        description: isEditMode.value
          ? 'Successfully updated project details'
          : 'Successfully selected group deliverable',
        color: 'success'
      })

      // Close modal and refresh data
      isModalOpen.value = false
      isEditMode.value = false
      await fetchGroupData()

      // Reset form
      selectedDeliverableOption.value = undefined
      deliverableForm.link = ''
      deliverableForm.markdown_text =
        '# Our Project\n\n## Approach\n\nDescribe your project approach here...'
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    submittingDeliverable.value = false
  }
}

const validateEmail = (email: string): { valid: boolean; error?: string } => {
  // Check if email is empty
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required' }
  }

  // Check basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email address format' }
  }

  // Check if email domain is allowed
  if (allowedDomains.value.length > 0) {
    const domain = email.split('@')[1]?.toLowerCase()
    const isAllowed = allowedDomains.value.some((allowed) => allowed.toLowerCase() === domain)
    if (!isAllowed) {
      return {
        valid: false,
        error: `Email domain must be one of: ${allowedDomains.value.join(', ')}`
      }
    }
  }

  return { valid: true }
}

const addMember = async () => {
  // Validate email before making API call
  const validation = validateEmail(addMemberForm.email)
  if (!validation.valid) {
    toast.add({
      title: 'Invalid Email',
      description: validation.error || 'Please enter a valid email address',
      color: 'error'
    })
    return
  }

  addingMember.value = true
  try {
    const groupId = parseInt(route.params.id as string)
    const { data, error, response } = await addMemberApi({
      path: { group_id: groupId },
      body: { email: addMemberForm.email }
    })

    if (error) {
      // Handle 404 specifically - student not found
      if (response?.status === 404) {
        toast.add({
          title: 'Student Not Found',
          description: `No registered student found with email "${addMemberForm.email}". Please ensure the student has created an account first.`,
          color: 'error'
        })
        return
      }

      // Handle other errors
      showError('Failed to Add Member', error)
      return
    }

    if (data) {
      toast.add({
        title: 'Member Added',
        description: `${data.first_name} ${data.last_name} has been added to the group as ${data.role}`,
        color: 'success'
      })
      addMemberForm.email = ''
      await fetchGroupData()
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    addingMember.value = false
  }
}

onMounted(async () => {
  // Fetch allowed domains for email validation
  try {
    const { data: domainsData } = await allowedDomainsHandler()
    if (domainsData?.domains) {
      allowedDomains.value = domainsData.domains
    }
  } catch (err) {
    console.error('Failed to fetch allowed domains:', err)
  }

  // Fetch group data
  fetchGroupData()
})
</script>
