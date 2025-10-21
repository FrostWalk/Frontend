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
        <UButton
          v-if="isLeader && !deliverableSelection"
          color="primary"
          @click="openDeliverableModal"
        >
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
        :ui="{
          content: 'sm:max-w-6xl',
          body: 'p-0'
        }"
        :close-button="true"
      >
        <template #header>
          <div class="flex items-center gap-3 p-6 pb-0">
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

          <div v-else class="p-6 space-y-6">
            <!-- Progress indicator -->
            <div
              class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div class="flex items-center gap-2 mb-2">
                <Icon
                  name="material-symbols:info"
                  size="20"
                  class="text-blue-600 dark:text-blue-400"
                />
                <span class="font-medium text-blue-900 dark:text-blue-100">Workflow</span>
              </div>
              <p class="text-sm text-blue-800 dark:text-blue-200">
                Add implementation details for each component of your selected deliverable. Each
                component can have its own repository and detailed description.
              </p>
            </div>

            <!-- Component Cards -->
            <div class="grid gap-6">
              <div
                v-for="(item, index) in componentTabs"
                :key="item.id"
                class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <!-- Component Header -->
                <div class="flex items-start justify-between mb-6">
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0">
                      <div
                        class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center"
                      >
                        <span class="text-white font-bold text-lg">{{ index + 1 }}</span>
                      </div>
                    </div>
                    <div class="flex-1">
                      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {{ item.name }}
                      </h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {{ item.description }}
                      </p>
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <UBadge
                    :color="
                      componentImplementationDetails.find(
                        (d) => d.group_deliverable_component_id === item.id
                      )
                        ? 'success'
                        : 'neutral'
                    "
                    variant="soft"
                    size="sm"
                  >
                    <Icon
                      :name="
                        componentImplementationDetails.find(
                          (d) => d.group_deliverable_component_id === item.id
                        )
                          ? 'material-symbols:check-circle'
                          : 'material-symbols:radio-button-unchecked'
                      "
                      class="mr-1"
                      size="14"
                    />
                    {{
                      componentImplementationDetails.find(
                        (d) => d.group_deliverable_component_id === item.id
                      )
                        ? 'Configured'
                        : 'Not configured'
                    }}
                  </UBadge>
                </div>

                <!-- Form Fields -->
                <div class="space-y-6">
                  <!-- Repository Link -->
                  <UFormField
                    :label="`Repository Link`"
                    :name="`repo_${item.id}`"
                    description="GitHub, GitLab, or other repository URL for this component"
                    class="w-full"
                  >
                    <UInput
                      type="url"
                      placeholder="https://github.com/your-group/component-name"
                      size="lg"
                      icon="material-symbols:link"
                      class="w-full"
                      :model-value="componentForms[item.id]?.repository_link || ''"
                      @update:model-value="
                        (value) => updateComponentForm(item.id, 'repository_link', value)
                      "
                    />
                  </UFormField>

                  <!-- Description -->
                  <UFormField
                    :label="`Implementation Description`"
                    :name="`desc_${item.id}`"
                    description="Describe how this component is implemented (Markdown supported)"
                    class="w-full"
                  >
                    <UTextarea
                      :rows="6"
                      placeholder="# Component Overview&#10;&#10;## Implementation&#10;Describe how this component is implemented...&#10;&#10;## Key Features&#10;- Feature 1&#10;- Feature 2&#10;&#10;## Technical Details&#10;Add any technical implementation notes here..."
                      size="lg"
                      class="w-full"
                      :model-value="componentForms[item.id]?.markdown_description || ''"
                      @update:model-value="
                        (value) => updateComponentForm(item.id, 'markdown_description', value)
                      "
                    />
                  </UFormField>

                  <!-- Action Buttons -->
                  <div
                    class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Icon name="material-symbols:info" size="16" />
                      <span>Component {{ index + 1 }} of {{ componentTabs.length }}</span>
                    </div>

                    <div class="flex gap-3">
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
                        Delete
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
                        {{
                          componentImplementationDetails.find(
                            (d) => d.group_deliverable_component_id === item.id
                          )
                            ? 'Update'
                            : 'Save'
                        }}
                        Details
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="componentTabs.length === 0" class="text-center py-12">
              <Icon name="material-symbols:widgets" size="64" class="mx-auto text-gray-400 mb-4" />
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Components Found
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                This deliverable doesn't have any components defined yet.
              </p>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="p-6 pt-0">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              <Icon name="material-symbols:lightbulb" class="mr-1" size="16" />
              Tip: You can save each component individually or configure them all at once
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
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
                Component Implementation Details
              </h4>
              <div class="flex items-center gap-2">
                <UBadge color="success" variant="soft" size="sm">
                  {{ configuredComponentsCount }} component{{
                    configuredComponentsCount !== 1 ? 's' : ''
                  }}
                  configured
                </UBadge>
                <UBadge v-if="pendingComponentsCount > 0" color="warning" variant="soft" size="sm">
                  {{ pendingComponentsCount }} component{{
                    pendingComponentsCount !== 1 ? 's' : ''
                  }}
                  pending
                </UBadge>
              </div>
            </div>

            <div class="grid gap-4">
              <div
                v-for="(detail, index) in componentImplementationDetails"
                :key="detail.id"
                class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              >
                <!-- Component Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <div
                        class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center"
                      >
                        <span class="text-white font-bold text-sm">{{ index + 1 }}</span>
                      </div>
                    </div>
                    <div class="flex-1">
                      <h5 class="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                        {{ detail.component_name }}
                      </h5>
                      <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Icon
                          name="material-symbols:check-circle"
                          size="16"
                          class="text-green-500"
                        />
                        <span>Implementation details configured</span>
                      </div>
                    </div>
                  </div>

                  <UButton
                    v-if="isLeader"
                    color="primary"
                    variant="ghost"
                    size="sm"
                    @click="editComponentDetail(detail)"
                  >
                    <Icon name="material-symbols:edit" size="16" class="mr-1" />
                    Edit
                  </UButton>
                </div>

                <!-- Repository Link -->
                <div v-if="detail.repository_link" class="mb-4">
                  <div class="flex items-center gap-2 mb-2">
                    <Icon
                      name="material-symbols:link"
                      size="16"
                      class="text-gray-500 dark:text-gray-400"
                    />
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >Repository</span
                    >
                  </div>
                  <a
                    :href="detail.repository_link"
                    target="_blank"
                    class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <span class="truncate max-w-xs">{{ detail.repository_link }}</span>
                    <Icon name="material-symbols:open-in-new" size="14" />
                  </a>
                </div>

                <!-- Description -->
                <div v-if="detail.markdown_description">
                  <div class="flex items-center gap-2 mb-3">
                    <Icon
                      name="material-symbols:description"
                      size="16"
                      class="text-gray-500 dark:text-gray-400"
                    />
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >Implementation Description</span
                    >
                  </div>
                  <div
                    class="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <MDC
                      :value="
                        isDescriptionExpanded(detail.id)
                          ? detail.markdown_description
                          : truncateText(detail.markdown_description)
                      "
                      tag="div"
                    />
                    <div
                      v-if="detail.markdown_description.length > 200"
                      class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
                    >
                      <UButton
                        :color="isDescriptionExpanded(detail.id) ? 'neutral' : 'primary'"
                        :variant="isDescriptionExpanded(detail.id) ? 'outline' : 'solid'"
                        size="sm"
                        @click="toggleDescription(detail.id)"
                      >
                        <Icon
                          :name="
                            isDescriptionExpanded(detail.id)
                              ? 'material-symbols:expand-less'
                              : 'material-symbols:expand-more'
                          "
                          class="mr-1"
                          size="16"
                        />
                        {{ isDescriptionExpanded(detail.id) ? 'Show Less' : 'Show All' }}
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <div
              class="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-600"
            >
              <Icon name="material-symbols:widgets" size="48" class="mx-auto mb-4 text-gray-400" />
              <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Component Details Yet
              </h4>
              <p class="text-gray-500 dark:text-gray-400 mb-4">
                Component implementation details haven't been added yet
              </p>
              <p class="text-sm text-gray-400 dark:text-gray-500">
                Group leaders can add repository links and descriptions for each component
              </p>
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

      <!-- Group at Max Capacity Message -->
      <UCard v-if="isLeader && isGroupAtMaxCapacity" class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <Icon name="material-symbols:group-work" class="text-amber-500" size="20" />
            <h3 class="font-semibold text-amber-700 dark:text-amber-300">
              Group at Maximum Capacity
            </h3>
          </div>
        </template>
        <div class="space-y-4">
          <UAlert
            icon="material-symbols:info"
            color="warning"
            variant="soft"
            title="Maximum Group Size Reached"
            :description="`This group has reached its maximum capacity of ${projectData?.max_group_size || 'unknown'} members. You cannot add more members at this time.`"
          />
        </div>
      </UCard>

      <!-- Add Member (Leader Only) -->
      <UCard v-if="isLeader && !isGroupAtMaxCapacity">
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
  ComponentImplementationDetail,
  Project
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
const projectData = ref<Project | null>(null)

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
const expandedDescriptions = ref<Set<number>>(new Set())

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

const configuredComponentsCount = computed(() => {
  return componentImplementationDetails.value.length
})

const totalComponentsCount = computed(() => {
  // If we have a deliverable selection but no components loaded yet, return 0
  if (deliverableSelection.value && components.value.length === 0) {
    return 0
  }
  return componentTabs.value.length
})

const pendingComponentsCount = computed(() => {
  const total = totalComponentsCount.value
  const configured = configuredComponentsCount.value
  const pending = total - configured
  return Math.max(0, pending) // Ensure we don't return negative numbers
})

const isGroupAtMaxCapacity = computed(() => {
  if (!projectData.value) return false
  return members.value.length >= projectData.value.max_group_size
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

    // Load deliverables and components data if we have a deliverable selection
    if (deliverableSelection.value) {
      try {
        const { data, error } = await getStudentProjects()
        if (error) {
          console.warn('Failed to load project data:', error)
        } else if (data && data.projects.length > 0) {
          const project = data.projects[0]
          if (project) {
            deliverables.value = project.group_deliverables
            components.value = project.group_components
            projectData.value = project.project
          }
        }
      } catch (err) {
        console.warn('Failed to load project data:', err)
      }
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
    // First, ensure we have the necessary data loaded
    if (!deliverables.value.length || !components.value.length) {
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
        }
      }
    }

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

const toggleDescription = (componentId: number) => {
  if (expandedDescriptions.value.has(componentId)) {
    expandedDescriptions.value.delete(componentId)
  } else {
    expandedDescriptions.value.add(componentId)
  }
}

const isDescriptionExpanded = (componentId: number) => {
  return expandedDescriptions.value.has(componentId)
}

const truncateText = (text: string, maxLength: number = 200) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
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
