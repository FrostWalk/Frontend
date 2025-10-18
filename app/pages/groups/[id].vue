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

            <!-- Next Step Information -->
            <div
              class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div class="flex items-center gap-3 mb-3">
                <Icon
                  name="material-symbols:info"
                  size="24"
                  class="text-blue-600 dark:text-blue-400"
                />
                <h4 class="font-semibold text-blue-900 dark:text-blue-100">Next Step</h4>
              </div>
              <p class="text-blue-800 dark:text-blue-200 text-sm">
                After selecting a deliverable, you'll be able to add repository links and
                descriptions for each component individually.
              </p>
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
                :disabled="!selectedDeliverableOption"
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

      <!-- Component Implementation Details Modal -->
      <UModal
        v-model:open="isComponentModalOpen"
        title="Manage Component Details"
        description="Add repository links and descriptions for each component"
        :ui="{
          content: 'sm:max-w-4xl',
          body: 'p-6 sm:p-8'
        }"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Icon
                name="material-symbols:widgets"
                class="text-primary-600 dark:text-primary-400"
                size="24"
              />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                Component Implementation Details
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Add repository links and descriptions for each component
              </p>
            </div>
          </div>
        </template>

        <template #body>
          <div v-if="loadingComponents" class="text-center py-16">
            <Icon
              name="material-symbols:hourglass-empty"
              size="56"
              class="animate-spin mx-auto text-primary-500"
            />
            <p class="mt-4 text-gray-600 text-lg">Loading components...</p>
          </div>

          <div v-else class="space-y-6">
            <UTabs :items="componentTabs" class="w-full">
              <template #default="{ item }">
                <div class="space-y-6">
                  <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
                      {{ item.name }}
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.description }}</p>
                  </div>

                  <UFormField
                    :label="`Repository Link for ${item.name}`"
                    :name="`repo_${item.id}`"
                    description="GitHub, GitLab, or other repository URL"
                  >
                    <UInput
                      type="url"
                      placeholder="https://github.com/your-group/component-name"
                      size="lg"
                      icon="material-symbols:link"
                      :model-value="componentForms[item.id]?.repository_link || ''"
                      @update:model-value="
                        (value) => updateComponentForm(item.id, 'repository_link', value)
                      "
                    />
                  </UFormField>

                  <UFormField
                    :label="`Description for ${item.name}`"
                    :name="`desc_${item.id}`"
                    description="Describe this component's implementation (Markdown supported)"
                  >
                    <UTextarea
                      :rows="8"
                      placeholder="# Component Overview&#10;&#10;## Implementation&#10;Describe how this component is implemented...&#10;&#10;## Key Features&#10;- Feature 1&#10;- Feature 2"
                      size="lg"
                      :model-value="componentForms[item.id]?.markdown_description || ''"
                      @update:model-value="
                        (value) => updateComponentForm(item.id, 'markdown_description', value)
                      "
                    />
                  </UFormField>

                  <div class="flex justify-end gap-3">
                    <UButton
                      v-if="
                        componentImplementationDetails.find(
                          (d) => d.group_deliverable_component_id === item.id
                        )
                      "
                      color="error"
                      variant="outline"
                      size="lg"
                      @click="deleteComponentDetail(item.id)"
                    >
                      <Icon name="material-symbols:delete" class="mr-2" />
                      Delete Details
                    </UButton>
                    <UButton
                      :loading="submittingComponent"
                      :disabled="
                        !componentForms[item.id]?.repository_link ||
                        !componentForms[item.id]?.markdown_description
                      "
                      color="primary"
                      size="lg"
                      @click="saveComponentDetail(item.id)"
                    >
                      <Icon name="material-symbols:save" class="mr-2" />
                      Save Details
                    </UButton>
                  </div>
                </div>
              </template>
            </UTabs>
          </div>
        </template>

        <template #footer>
          <div class="flex items-center justify-between w-full">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Each component can have its own repository and description
            </p>
            <div class="flex gap-3">
              <UButton
                color="neutral"
                variant="outline"
                label="Close"
                size="lg"
                @click="isComponentModalOpen = false"
              />
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
              @click="openComponentDetailsModal"
            >
              <Icon name="material-symbols:settings" class="mr-2" size="18" />
              Manage Components
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

          <!-- Component Implementation Details -->
          <div v-if="componentImplementationDetails.length > 0">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Component Details</p>
            <div class="space-y-4">
              <div
                v-for="detail in componentImplementationDetails"
                :key="detail.id"
                class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-gray-900 dark:text-white">
                    {{ detail.component_name }}
                  </h4>
                  <UButton
                    v-if="isLeader"
                    color="primary"
                    variant="ghost"
                    size="xs"
                    @click="editComponentDetail(detail)"
                  >
                    <Icon name="material-symbols:edit" size="16" />
                  </UButton>
                </div>

                <div v-if="detail.repository_link" class="mb-3">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Repository</p>
                  <a
                    :href="detail.repository_link"
                    target="_blank"
                    class="text-primary-500 hover:text-primary-600 flex items-center gap-1 font-medium text-sm"
                  >
                    {{ detail.repository_link }}
                    <Icon name="material-symbols:open-in-new" size="14" />
                  </a>
                </div>

                <div v-if="detail.markdown_description">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                  <div class="prose prose-sm dark:prose-invert max-w-none">
                    <MDC :value="detail.markdown_description" tag="div" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            <Icon name="material-symbols:widgets" size="48" class="mx-auto mb-3 opacity-50" />
            <p>No component details added yet</p>
            <p class="text-sm">
              Group leaders can add repository links and descriptions for each component
            </p>
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
  GroupDeliverableComponent,
  ComponentImplementationDetail
} from '~/composables/api/types.gen'
import {
  listGroupMembers,
  getGroupDeliverableSelection,
  addMember2 as addMemberApi,
  getStudentProjects,
  createGroupDeliverableSelection,
  allowedDomainsHandler,
  getComponentImplementationDetails,
  createComponentImplementationDetail,
  updateComponentImplementationDetail,
  deleteComponentImplementationDetail
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

// Component implementation details state
const isComponentModalOpen = ref(false)
const loadingComponents = ref(false)
const submittingComponent = ref(false)
const componentImplementationDetails = ref<ComponentImplementationDetail[]>([])
const componentForms = ref<
  Record<number, { repository_link: string; markdown_description: string }>
>({})

const addMemberForm = reactive({
  email: ''
})

// deliverableForm removed - component details are managed separately

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

const componentTabs = computed(() => {
  if (!deliverableSelection.value) return []

  // Get components for the selected deliverable
  const selectedDeliverable = deliverables.value.find(
    (d) => d.group_deliverable_id === deliverableSelection.value?.group_deliverable_id
  )

  if (!selectedDeliverable) return []

  return components.value
    .filter((c) => c.project_id === selectedDeliverable.project_id)
    .map((component) => ({
      id: component.group_deliverable_component_id,
      name: component.name,
      description: `Manage implementation details for ${component.name}`,
      label: component.name
    }))
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

    // Try to fetch component implementation details
    try {
      const { data: compData } = await getComponentImplementationDetails({
        path: { group_id: groupId }
      })
      if (compData) {
        componentImplementationDetails.value = compData.details
      }
    } catch {
      // No component details yet, that's okay
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

const openComponentDetailsModal = async () => {
  isComponentModalOpen.value = true
  loadingComponents.value = true

  try {
    // Initialize component forms
    componentTabs.value.forEach((tab) => {
      const existingDetail = componentImplementationDetails.value.find(
        (d) => d.group_deliverable_component_id === tab.id
      )

      componentForms.value[tab.id] = {
        repository_link: existingDetail?.repository_link || '',
        markdown_description: existingDetail?.markdown_description || ''
      }
    })
  } catch (err) {
    showError('Error', err)
  } finally {
    loadingComponents.value = false
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

    // Create new selection (only group_deliverable_id required)
    const { data, error } = await createGroupDeliverableSelection({
      path: { group_id: groupId },
      body: {
        group_deliverable_id: selectedDeliverableOption.value.group_deliverable_id
      }
    })

    if (error) {
      showError('Selection Failed', error)
      return
    }

    if (data) {
      toast.add({
        title: 'Deliverable Selected',
        description: 'Successfully selected group deliverable. You can now add component details.',
        color: 'success'
      })

      // Close modal and refresh data
      isModalOpen.value = false
      isEditMode.value = false
      await fetchGroupData()

      // Reset form
      selectedDeliverableOption.value = undefined
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    submittingDeliverable.value = false
  }
}

const saveComponentDetail = async (componentId: number) => {
  submittingComponent.value = true
  try {
    const groupId = parseInt(route.params.id as string)
    const form = componentForms.value[componentId]

    if (!form?.repository_link || !form?.markdown_description) {
      showError('Validation Error', { error: 'Repository link and description are required' })
      return
    }

    const existingDetail = componentImplementationDetails.value.find(
      (d) => d.group_deliverable_component_id === componentId
    )

    let data, error

    if (existingDetail) {
      // Update existing
      const result = await updateComponentImplementationDetail({
        path: { group_id: groupId },
        body: {
          group_deliverable_component_id: componentId,
          repository_link: form?.repository_link || '',
          markdown_description: form?.markdown_description || ''
        }
      })
      data = result.data
      error = result.error
    } else {
      // Create new
      const result = await createComponentImplementationDetail({
        path: { group_id: groupId },
        body: {
          group_deliverable_component_id: componentId,
          repository_link: form?.repository_link || '',
          markdown_description: form?.markdown_description || ''
        }
      })
      data = result.data
      error = result.error
    }

    if (error) {
      showError('Save Failed', error)
      return
    }

    if (data) {
      toast.add({
        title: 'Component Details Saved',
        description: 'Successfully saved component implementation details',
        color: 'success'
      })

      // Refresh component details
      await fetchGroupData()
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    submittingComponent.value = false
  }
}

const editComponentDetail = (_detail: ComponentImplementationDetail) => {
  // Open modal and navigate to the specific component tab
  openComponentDetailsModal()
  // The form will be pre-filled with existing data
}

const updateComponentForm = (
  componentId: number,
  field: 'repository_link' | 'markdown_description',
  value: string
) => {
  if (!componentForms.value[componentId]) {
    componentForms.value[componentId] = { repository_link: '', markdown_description: '' }
  }
  componentForms.value[componentId][field] = value
}

const deleteComponentDetail = async (componentId: number) => {
  if (!confirm('Are you sure you want to delete the implementation details for this component?')) {
    return
  }

  submittingComponent.value = true
  try {
    const groupId = parseInt(route.params.id as string)

    const { data, error } = await deleteComponentImplementationDetail({
      path: { group_id: groupId },
      body: {
        group_deliverable_component_id: componentId
      }
    })

    if (error) {
      showError('Delete Failed', error)
      return
    }

    if (data) {
      toast.add({
        title: 'Component Details Deleted',
        description: 'Successfully deleted component implementation details',
        color: 'success'
      })

      // Refresh component details
      await fetchGroupData()

      // Clear form for this component
      componentForms.value[componentId] = {
        repository_link: '',
        markdown_description: ''
      }
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    submittingComponent.value = false
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
