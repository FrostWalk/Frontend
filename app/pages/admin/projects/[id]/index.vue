<template>
  <div>
    <div v-if="loading" class="text-center py-12">
      <Icon
        name="material-symbols:hourglass-empty"
        size="48"
        class="animate-spin mx-auto text-primary-500"
      />
      <p class="mt-4 text-gray-600">Loading project...</p>
    </div>

    <div v-else-if="project">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ project.name }}</h1>
        <p class="text-gray-600 mt-1">Year: {{ project.year }}</p>
      </div>

      <UTabs v-model="currentTab" :items="tabs">
        <template #overview>
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold">Project Details</h3>
                <div class="flex gap-2">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    icon="material-symbols:edit"
                    @click="openEditProjectModal"
                  >
                    Edit Project
                  </UButton>
                  <UButton
                    v-if="roleId === roles.PROFESSOR || roleId === roles.ROOT"
                    color="error"
                    variant="ghost"
                    size="sm"
                    icon="material-symbols:delete"
                    @click="showDeleteProjectModal = true"
                  >
                    Delete Project
                  </UButton>
                </div>
              </div>
            </template>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Project Name</p>
                <p class="font-medium">{{ project.name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Status</p>
                <UBadge :color="project.active ? 'success' : 'neutral'" variant="soft">
                  {{ project.active ? 'Active' : 'Inactive' }}
                </UBadge>
              </div>
              <div>
                <p class="text-sm text-gray-500">Max Group Size</p>
                <p class="font-medium">{{ project.max_group_size }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Max Student Uploads</p>
                <p class="font-medium">{{ project.max_student_uploads }}</p>
              </div>
              <div v-if="project.deliverable_selection_deadline" class="col-span-2">
                <p class="text-sm text-gray-500">Deliverable Selection Deadline</p>
                <p class="font-medium">{{ formatDate(project.deliverable_selection_deadline) }}</p>
              </div>
            </div>
          </UCard>
        </template>

        <!-- Group Deliverables Tab -->
        <template #group-deliverables>
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Group Deliverables
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ groupDeliverables.length }} deliverable{{
                    groupDeliverables.length !== 1 ? 's' : ''
                  }}
                  configured
                </p>
              </div>
              <UButton
                v-if="groupDeliverables.length === 0"
                :to="`/admin/projects/${project.project_id}/setup`"
                color="primary"
                icon="material-symbols:add"
              >
                Setup Deliverables
              </UButton>
            </div>

            <div
              v-if="groupDeliverables.length === 0"
              class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <Icon
                name="material-symbols:assignment"
                size="48"
                class="mx-auto text-gray-400 mb-4"
              />
              <p class="text-gray-600 mb-2">No group deliverables configured</p>
              <p class="text-sm text-gray-500">
                Set up deliverables to allow groups to select their assignments
              </p>
            </div>

            <div v-else class="space-y-4">
              <UCard
                v-for="deliverable in groupDeliverables"
                :key="deliverable.group_deliverable_id"
              >
                <template #header>
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-semibold text-lg">{{ deliverable.name }}</h4>
                      <p class="text-sm text-gray-600 mt-1">
                        ID: {{ deliverable.group_deliverable_id }}
                      </p>
                    </div>
                    <UBadge color="primary" variant="soft"> Group Deliverable </UBadge>
                  </div>
                </template>

                <div class="space-y-4">
                  <!-- Components Section -->
                  <div>
                    <h5
                      class="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                    >
                      <Icon name="material-symbols:extension" size="20" class="text-primary-500" />
                      Components
                    </h5>
                    <div
                      v-if="
                        getGroupComponentsForDeliverable(deliverable.group_deliverable_id)
                          .length === 0
                      "
                      class="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <Icon
                        name="material-symbols:extension-off"
                        size="32"
                        class="mx-auto text-gray-400 mb-2"
                      />
                      <p class="text-sm text-gray-600">No components assigned</p>
                    </div>
                    <div v-else class="grid gap-3">
                      <div
                        v-for="component in getGroupComponentsForDeliverable(
                          deliverable.group_deliverable_id
                        )"
                        :key="component.id"
                        class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div class="flex items-center gap-3">
                          <Icon
                            name="material-symbols:check-circle"
                            size="20"
                            class="text-green-500"
                          />
                          <div>
                            <p class="font-medium">{{ component.component_name }}</p>
                            <p class="text-sm text-gray-600">
                              Component ID: {{ component.group_deliverable_component_id }}
                            </p>
                          </div>
                        </div>
                        <UBadge color="secondary" variant="soft">
                          Qty: {{ component.quantity }}
                        </UBadge>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div
                    class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      icon="material-symbols:edit"
                      @click="openEditGroupDeliverableModal(deliverable)"
                    >
                      Edit
                    </UButton>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </template>

        <!-- Student Deliverables Tab -->
        <template #student-deliverables>
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Student Deliverables
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ studentDeliverables.length }} deliverable{{
                    studentDeliverables.length !== 1 ? 's' : ''
                  }}
                  configured
                </p>
              </div>
              <UButton
                v-if="studentDeliverables.length === 0"
                :to="`/admin/projects/${project.project_id}/setup`"
                color="primary"
                icon="material-symbols:add"
              >
                Setup Deliverables
              </UButton>
            </div>

            <div
              v-if="studentDeliverables.length === 0"
              class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <Icon name="material-symbols:person" size="48" class="mx-auto text-gray-400 mb-4" />
              <p class="text-gray-600 mb-2">No student deliverables configured</p>
              <p class="text-sm text-gray-500">
                Set up deliverables to allow students to select their assignments
              </p>
            </div>

            <div v-else class="space-y-4">
              <UCard
                v-for="deliverable in studentDeliverables"
                :key="deliverable.student_deliverable_id"
              >
                <template #header>
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-semibold text-lg">{{ deliverable.name }}</h4>
                      <p class="text-sm text-gray-600 mt-1">
                        ID: {{ deliverable.student_deliverable_id }}
                      </p>
                    </div>
                    <UBadge color="secondary" variant="soft"> Student Deliverable </UBadge>
                  </div>
                </template>

                <div class="space-y-4">
                  <!-- Components Section -->
                  <div>
                    <h5
                      class="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                    >
                      <Icon
                        name="material-symbols:extension"
                        size="20"
                        class="text-secondary-500"
                      />
                      Components
                    </h5>
                    <div
                      v-if="
                        getStudentComponentsForDeliverable(deliverable.student_deliverable_id)
                          .length === 0
                      "
                      class="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <Icon
                        name="material-symbols:extension-off"
                        size="32"
                        class="mx-auto text-gray-400 mb-2"
                      />
                      <p class="text-sm text-gray-600">No components assigned</p>
                    </div>
                    <div v-else class="grid gap-3">
                      <div
                        v-for="component in getStudentComponentsForDeliverable(
                          deliverable.student_deliverable_id
                        )"
                        :key="component.id"
                        class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div class="flex items-center gap-3">
                          <Icon
                            name="material-symbols:check-circle"
                            size="20"
                            class="text-green-500"
                          />
                          <div>
                            <p class="font-medium">{{ component.component_name }}</p>
                            <p class="text-sm text-gray-600">
                              Component ID: {{ component.student_deliverable_component_id }}
                            </p>
                          </div>
                        </div>
                        <UBadge color="secondary" variant="soft">
                          Qty: {{ component.quantity }}
                        </UBadge>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div
                    class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      icon="material-symbols:edit"
                      @click="openEditStudentDeliverableModal(deliverable)"
                    >
                      Edit
                    </UButton>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </template>

        <!-- Groups Tab -->
        <template #groups>
          <div v-if="loadingGroups" class="text-center py-12">
            <Icon
              name="material-symbols:hourglass-empty"
              size="32"
              class="animate-spin mx-auto text-primary-500"
            />
          </div>
          <div v-else-if="groups.length === 0" class="text-center py-12">
            <p class="text-gray-600">No groups enrolled yet</p>
          </div>
          <div v-else class="space-y-4">
            <UCard v-for="group in groups" :key="group.group_id">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-semibold">{{ group.name }}</h4>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ group.member_count }} member(s) • Leader: {{ group.group_leader.name }}
                  </p>
                  <p v-if="group.deliverable_selected" class="text-sm text-green-600 mt-2">
                    <Icon name="material-symbols:check-circle" class="inline" />
                    Deliverable: {{ group.deliverable_selected.name }}
                  </p>
                  <UBadge
                    v-if="group.time_expired && !group.deliverable_selected"
                    color="error"
                    class="mt-2"
                  >
                    Deadline Expired
                  </UBadge>
                </div>
                <UButton
                  :to="`/admin/groups/${group.group_id}`"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                >
                  View Details
                </UButton>
              </div>
            </UCard>
          </div>
        </template>

        <!-- Coordinators Tab -->
        <template #coordinators>
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <h3 class="font-semibold">Project Coordinators</h3>
                <UButton
                  v-if="(roleId === roles.PROFESSOR || roleId === roles.ROOT) && !coordinator"
                  size="sm"
                  color="primary"
                  @click="showAssignModal = true"
                >
                  <Icon name="material-symbols:person-add" class="mr-2" />
                  Assign Coordinator
                </UButton>
              </div>
            </template>

            <div v-if="coordinator" class="flex justify-between items-center">
              <div>
                <p class="font-medium">{{ coordinator.first_name }} {{ coordinator.last_name }}</p>
                <p class="text-sm text-gray-600">{{ coordinator.email }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  Assigned: {{ formatDate(coordinator.assigned_at) }}
                </p>
              </div>
              <UButton
                v-if="roleId === roles.PROFESSOR || roleId === roles.ROOT"
                color="error"
                variant="ghost"
                size="sm"
                @click="removeCoordinator"
              >
                Remove
              </UButton>
            </div>
            <div v-else class="text-center py-6 text-gray-600">No coordinator assigned</div>
          </UCard>
        </template>
      </UTabs>
    </div>

    <!-- Assign Coordinator Modal -->
    <UModal
      v-model:open="showAssignModal"
      title="Assign Coordinator"
      description="Select and assign a coordinator to manage this project"
    >
      <template #body>
        <div v-if="loadingAdmins" class="text-center py-6">
          <Icon
            name="material-symbols:hourglass-empty"
            size="32"
            class="animate-spin mx-auto text-primary-500"
          />
        </div>
        <div v-else class="space-y-4">
          <UForm :state="{ coordinator: selectedCoordinator }" class="space-y-4">
            <UFormField label="Select Coordinator" name="coordinator" required>
              <div class="flex gap-2">
                <USelectMenu
                  v-model="selectedCoordinator"
                  :items="coordinatorItems"
                  placeholder="Choose a coordinator..."
                  :loading="loadingAdmins"
                  searchable
                  class="flex-1"
                >
                  <template #leading>
                    <UAvatar
                      v-if="selectedCoordinator"
                      :text="`${selectedCoordinator.first_name[0]}${selectedCoordinator.last_name[0]}`"
                      size="2xs"
                    />
                  </template>

                  <template #item-leading="{ item }">
                    <UAvatar :text="`${item.first_name[0]}${item.last_name[0]}`" size="xs" />
                  </template>
                </USelectMenu>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="material-symbols:refresh"
                  :disabled="loadingAdmins"
                  @click="fetchAdmins"
                />
              </div>
            </UFormField>

            <div class="pt-2">
              <UButton
                color="neutral"
                variant="soft"
                block
                icon="material-symbols:person-add"
                @click="showCreateCoordinatorModal = true"
              >
                Create New Coordinator
              </UButton>
            </div>
          </UForm>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showAssignModal = false">
            Cancel
          </UButton>
          <UButton :loading="assigning" :disabled="!selectedCoordinator" @click="assignCoordinator">
            Assign
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Create Coordinator Modal -->
    <UModal
      v-model:open="showCreateCoordinatorModal"
      title="Create New Coordinator"
      description="Create a new administrator with coordinator role"
    >
      <template #body>
        <UForm :state="coordinatorForm" class="space-y-4" @submit="createCoordinator">
          <UFormField label="Email" name="email" required>
            <UInput
              v-model="coordinatorForm.email"
              type="email"
              placeholder="coordinator@example.com"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="First Name" name="first_name" required>
              <UInput v-model="coordinatorForm.first_name" placeholder="John" />
            </UFormField>

            <UFormField label="Last Name" name="last_name" required>
              <UInput v-model="coordinatorForm.last_name" placeholder="Doe" />
            </UFormField>
          </div>

          <UAlert icon="material-symbols:info" color="secondary">
            <template #description>
              <span class="text-sm"
                >The new user will be created with the Coordinator role. A temporary password will
                be generated automatically.</span
              >
            </template>
          </UAlert>
        </UForm>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showCreateCoordinatorModal = false">
            Cancel
          </UButton>
          <UButton :loading="creatingCoordinator" @click="createCoordinator">
            <Icon name="material-symbols:check" class="mr-2" />
            Create Coordinator
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Edit Group Deliverable Modal -->
    <UModal
      v-model:open="showEditGroupDeliverableModal"
      title="Edit Group Deliverable"
      description="Modify the deliverable name and component quantities"
    >
      <template #body>
        <UForm :state="groupDeliverableForm" class="space-y-4" @submit="updateGroupDeliverable">
          <UFormField label="Deliverable Name" name="name" required>
            <UInput v-model="groupDeliverableForm.name" placeholder="Enter deliverable name" />
          </UFormField>

          <!-- Components Section -->
          <div v-if="getGroupComponentsForDeliverable(groupDeliverableForm.id).length > 0">
            <h5 class="font-medium text-gray-900 dark:text-white mb-3">Component Quantities</h5>
            <div class="space-y-3">
              <div
                v-for="component in getGroupComponentsForDeliverable(groupDeliverableForm.id)"
                :key="component.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p class="font-medium">{{ component.component_name }}</p>
                  <p class="text-sm text-gray-600">
                    Component ID: {{ component.group_deliverable_component_id }}
                  </p>
                </div>
                <UInput
                  v-model.number="component.quantity"
                  type="number"
                  min="1"
                  class="w-20"
                  @blur="updateGroupComponentQuantity(component)"
                />
              </div>
            </div>
          </div>
        </UForm>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showEditGroupDeliverableModal = false">
            Cancel
          </UButton>
          <UButton :loading="editingDeliverable" @click="updateGroupDeliverable">
            <Icon name="material-symbols:save" class="mr-2" />
            Save Changes
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Edit Student Deliverable Modal -->
    <UModal
      v-model:open="showEditStudentDeliverableModal"
      title="Edit Student Deliverable"
      description="Modify the deliverable name and component quantities"
    >
      <template #body>
        <UForm :state="studentDeliverableForm" class="space-y-4" @submit="updateStudentDeliverable">
          <UFormField label="Deliverable Name" name="name" required>
            <UInput v-model="studentDeliverableForm.name" placeholder="Enter deliverable name" />
          </UFormField>

          <!-- Components Section -->
          <div v-if="getStudentComponentsForDeliverable(studentDeliverableForm.id).length > 0">
            <h5 class="font-medium text-gray-900 dark:text-white mb-3">Component Quantities</h5>
            <div class="space-y-3">
              <div
                v-for="component in getStudentComponentsForDeliverable(studentDeliverableForm.id)"
                :key="component.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p class="font-medium">{{ component.component_name }}</p>
                  <p class="text-sm text-gray-600">
                    Component ID: {{ component.student_deliverable_component_id }}
                  </p>
                </div>
                <UInput
                  v-model.number="component.quantity"
                  type="number"
                  min="1"
                  class="w-20"
                  @blur="updateStudentComponentQuantity(component)"
                />
              </div>
            </div>
          </div>
        </UForm>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showEditStudentDeliverableModal = false">
            Cancel
          </UButton>
          <UButton :loading="editingDeliverable" @click="updateStudentDeliverable">
            <Icon name="material-symbols:save" class="mr-2" />
            Save Changes
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Project Confirmation Modal -->
    <UModal
      v-model:open="showDeleteProjectModal"
      title="Delete Project"
      description="This action cannot be undone. All associated deliverables, components, and groups will be permanently deleted."
    >
      <template #body>
        <div class="space-y-4">
          <UAlert
            color="error"
            icon="material-symbols:warning"
            title="Warning"
            description="Deleting this project will permanently remove all data including:"
          />
          <ul class="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-2">
            <li>All group and student deliverables</li>
            <li>All components</li>
            <li>All groups and their data</li>
            <li>All student submissions</li>
          </ul>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            Are you sure you want to delete project "{{ project?.name }}"?
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showDeleteProjectModal = false">
            Cancel
          </UButton>
          <UButton color="error" :loading="deletingProject" @click="deleteProject">
            <Icon name="material-symbols:delete-forever" class="mr-2" />
            Delete Permanently
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Edit Project Modal -->
    <UModal
      v-model:open="showEditProjectModal"
      title="Edit Project"
      description="Modify project details and configuration"
    >
      <template #body>
        <UForm :state="projectForm" class="space-y-4">
          <UFormField label="Project Name" name="name" required>
            <UInput v-model="projectForm.name" placeholder="Enter project name" />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Max Group Size" name="max_group_size" required>
              <UInput v-model.number="projectForm.max_group_size" type="number" min="1" />
            </UFormField>

            <UFormField label="Max Student Uploads" name="max_student_uploads" required>
              <UInput v-model.number="projectForm.max_student_uploads" type="number" min="1" />
            </UFormField>
          </div>

          <UFormField label="Deliverable Selection Deadline" name="deliverable_selection_deadline">
            <UInput v-model="projectForm.deliverable_selection_deadline" type="datetime-local" />
          </UFormField>

          <UFormField label="Active Status" name="active">
            <div class="flex items-center gap-3">
              <USwitch v-model="projectForm.active" />
              <span
                class="text-sm font-medium"
                :class="projectForm.active ? 'text-green-600' : 'text-gray-500'"
              >
                {{
                  projectForm.active
                    ? 'Active - Visible to students'
                    : 'Inactive - Hidden from students'
                }}
              </span>
            </div>
          </UFormField>
        </UForm>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showEditProjectModal = false">
            Cancel
          </UButton>
          <UButton :loading="editingProject" @click="updateProject">
            <Icon name="material-symbols:save" class="mr-2" />
            Save Changes
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type {
  Project,
  GroupDeliverable,
  StudentDeliverable,
  GroupDeliverableComponent,
  StudentDeliverableComponent,
  GroupInfo,
  CoordinatorDetail,
  AdminResponseScheme,
  GroupDeliverableComponentResponse,
  StudentDeliverableComponentResponse
} from '~/composables/api/types.gen'
import {
  getOneProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  getProjectGroups,
  listCoordinators,
  getAllAdminsHandler,
  assignCoordinator as assignCoordinatorApi,
  removeCoordinator as removeCoordinatorApi,
  createAdminHandler,
  getComponentsForGroupDeliverableHandler,
  getComponentsForStudentDeliverableHandler,
  updateGroupDeliverableHandler,
  updateStudentDeliverableHandler,
  updateGroupDeliverableComponentHandler,
  updateStudentDeliverableComponentHandler
} from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const route = useRoute()
const { roleId, roles } = useAdminAuth()
const toast = useToast()
const { showError } = useErrorToast()

const loading = ref(true)
const loadingGroups = ref(false)
const loadingAdmins = ref(false)
const assigning = ref(false)
const showAssignModal = ref(false)
const showCreateCoordinatorModal = ref(false)
const creatingCoordinator = ref(false)

// Edit deliverable modals
const showEditGroupDeliverableModal = ref(false)
const showEditStudentDeliverableModal = ref(false)
const editingDeliverable = ref(false)

// Edit project modal
const showEditProjectModal = ref(false)
const editingProject = ref(false)

// Delete project modal
const showDeleteProjectModal = ref(false)
const deletingProject = ref(false)

const project = ref<Project | null>(null)
const groupDeliverables = ref<GroupDeliverable[]>([])
const studentDeliverables = ref<StudentDeliverable[]>([])
const groupComponents = ref<GroupDeliverableComponent[]>([])
const studentComponents = ref<StudentDeliverableComponent[]>([])
const groups = ref<GroupInfo[]>([])
const coordinator = ref<CoordinatorDetail | null>(null)
const coordinators = ref<AdminResponseScheme[]>([])

type CoordinatorItem = AdminResponseScheme & { label: string }
const selectedCoordinator = ref<CoordinatorItem | undefined>(undefined)

// Transform coordinators to include label for SelectMenu
const coordinatorItems = computed(() =>
  coordinators.value.map((coord) => ({
    ...coord,
    label: `${coord.first_name} ${coord.last_name}`
  }))
)

// Component associations for deliverables
const groupDeliverableComponents = ref<Map<number, GroupDeliverableComponentResponse[]>>(new Map())
const studentDeliverableComponents = ref<Map<number, StudentDeliverableComponentResponse[]>>(
  new Map()
)

const coordinatorForm = reactive({
  email: '',
  first_name: '',
  last_name: ''
})

// Edit deliverable forms
const groupDeliverableForm = reactive({
  id: 0,
  name: ''
})

const studentDeliverableForm = reactive({
  id: 0,
  name: ''
})

const projectForm = reactive({
  name: '',
  max_group_size: 0,
  max_student_uploads: 0,
  deliverable_selection_deadline: '',
  active: true
})

const currentTab = ref('overview')

// Close modals when switching tabs
watch(currentTab, () => {
  showCreateCoordinatorModal.value = false
  showAssignModal.value = false
  showEditGroupDeliverableModal.value = false
  showEditStudentDeliverableModal.value = false
  showEditProjectModal.value = false
  showDeleteProjectModal.value = false
})
const tabs = [
  {
    key: 'overview',
    value: 'overview',
    label: 'Overview',
    icon: 'material-symbols:info',
    slot: 'overview'
  },
  {
    key: 'group-deliverables',
    value: 'group-deliverables',
    label: 'Group Deliverables',
    icon: 'material-symbols:group-work',
    slot: 'group-deliverables'
  },
  {
    key: 'student-deliverables',
    value: 'student-deliverables',
    label: 'Student Deliverables',
    icon: 'material-symbols:person',
    slot: 'student-deliverables'
  },
  {
    key: 'groups',
    value: 'groups',
    label: 'Groups',
    icon: 'material-symbols:groups',
    slot: 'groups'
  },
  {
    key: 'coordinators',
    value: 'coordinators',
    label: 'Coordinators',
    icon: 'material-symbols:admin-panel-settings',
    slot: 'coordinators'
  }
]

const projectId = parseInt(route.params.id as string)

const fetchProject = async () => {
  loading.value = true
  try {
    const { data, error } = await getOneProjectHandler({
      path: { id: projectId }
    })

    if (error) {
      showError('Error', error)
      return
    }

    if (data) {
      project.value = data.project
      groupDeliverables.value = data.group_deliverables
      studentDeliverables.value = data.student_deliverables
      groupComponents.value = data.group_components
      studentComponents.value = data.student_components

      // Fetch component associations for deliverables
      await fetchDeliverableComponents()
    }

    // Fetch groups
    await fetchGroups()

    // Fetch coordinator
    await fetchCoordinator()
  } catch (err) {
    showError('Error', err)
  } finally {
    loading.value = false
  }
}

const fetchGroups = async () => {
  loadingGroups.value = true
  try {
    const { data } = await getProjectGroups({
      path: { project_id: projectId }
    })

    if (data) {
      groups.value = data.groups
    }
  } finally {
    loadingGroups.value = false
  }
}

const fetchCoordinator = async () => {
  try {
    const { data } = await listCoordinators({
      path: { project_id: projectId }
    })

    if (data && data.coordinator) {
      coordinator.value = data.coordinator
    }
  } catch {
    // No coordinator assigned
  }
}

const fetchAdmins = async () => {
  loadingAdmins.value = true
  try {
    const { data, error } = await getAllAdminsHandler()

    if (error) {
      showError('Failed to fetch admins', error)
      return
    }

    if (data) {
      // Filter for coordinators only (role_id === 3)
      coordinators.value = data.admins.filter((admin: AdminResponseScheme) => admin.role_id === 3)
    }
  } finally {
    loadingAdmins.value = false
  }
}

watch(showAssignModal, (show) => {
  if (show) {
    // Always refresh coordinators when opening the assign modal
    fetchAdmins()
    // Reset selection
    selectedCoordinator.value = undefined
  }
})

const assignCoordinator = async () => {
  if (!selectedCoordinator.value) return

  assigning.value = true
  try {
    const { error } = await assignCoordinatorApi({
      path: { project_id: projectId },
      body: { admin_id: selectedCoordinator.value.id }
    })

    if (error) {
      showError('Assignment Failed', error)
      return
    }

    toast.add({
      title: 'Coordinator Assigned',
      description: 'Successfully assigned coordinator to project',
      color: 'success'
    })

    showAssignModal.value = false
    selectedCoordinator.value = undefined
    await fetchCoordinator()
  } finally {
    assigning.value = false
  }
}

const removeCoordinator = async () => {
  if (!coordinator.value) return

  try {
    const { error } = await removeCoordinatorApi({
      path: {
        project_id: projectId,
        admin_id: coordinator.value.admin_id
      }
    })

    if (error) {
      showError('Removal Failed', error)
      return
    }

    toast.add({
      title: 'Coordinator Removed',
      description: 'Successfully removed coordinator from project',
      color: 'success'
    })

    coordinator.value = null
  } catch (err) {
    showError('Error', err)
  }
}

const createCoordinator = async () => {
  creatingCoordinator.value = true

  try {
    const { data, error } = await createAdminHandler({
      body: {
        email: coordinatorForm.email,
        first_name: coordinatorForm.first_name,
        last_name: coordinatorForm.last_name,
        admin_role_id: 3 // Coordinator role
      }
    })

    if (error) {
      showError('Creation Failed', error)
      return
    }

    if (data) {
      toast.add({
        title: 'Coordinator Created',
        description: `Successfully created coordinator: ${coordinatorForm.email}`,
        color: 'success'
      })

      // Reset form
      coordinatorForm.email = ''
      coordinatorForm.first_name = ''
      coordinatorForm.last_name = ''

      // Close modal and refresh coordinators list
      showCreateCoordinatorModal.value = false
      await fetchAdmins()
    }
  } catch (err) {
    showError('Error', err)
  } finally {
    creatingCoordinator.value = false
  }
}

// Edit project functions
const openEditProjectModal = () => {
  if (!project.value) return

  projectForm.name = project.value.name
  projectForm.max_group_size = project.value.max_group_size
  projectForm.max_student_uploads = project.value.max_student_uploads
  projectForm.active = project.value.active

  // Format datetime for datetime-local input
  if (project.value.deliverable_selection_deadline) {
    const date = new Date(project.value.deliverable_selection_deadline)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    projectForm.deliverable_selection_deadline = `${year}-${month}-${day}T${hours}:${minutes}`
  } else {
    projectForm.deliverable_selection_deadline = ''
  }

  showEditProjectModal.value = true
}

const updateProject = async () => {
  if (!project.value) return

  editingProject.value = true

  try {
    // Build the request body
    const body: {
      name?: string
      max_group_size?: number
      max_student_uploads?: number
      active?: boolean
    } = {
      name: projectForm.name,
      max_group_size: projectForm.max_group_size,
      max_student_uploads: projectForm.max_student_uploads,
      active: projectForm.active
    }

    const { error } = await updateProjectHandler({
      path: { id: project.value.project_id },
      body
    })

    if (error) {
      showError('Update Failed', error)
      return
    }

    // Update local project data
    project.value.name = projectForm.name
    project.value.max_group_size = projectForm.max_group_size
    project.value.max_student_uploads = projectForm.max_student_uploads
    project.value.active = projectForm.active

    toast.add({
      title: 'Project Updated',
      description: 'Project details updated successfully',
      color: 'success'
    })

    showEditProjectModal.value = false
  } catch (err) {
    showError('Error', err)
  } finally {
    editingProject.value = false
  }
}

const deleteProject = async () => {
  if (!project.value) return

  deletingProject.value = true

  try {
    const { error } = await deleteProjectHandler({
      path: { id: project.value.project_id }
    })

    if (error) {
      showError('Delete Failed', error)
      return
    }

    toast.add({
      title: 'Project Deleted',
      description: 'Project and all associated data have been permanently deleted',
      color: 'success'
    })

    // Redirect to projects list
    navigateTo('/admin/projects')
  } catch (err) {
    showError('Error', err)
  } finally {
    deletingProject.value = false
  }
}

// Edit deliverable functions
const openEditGroupDeliverableModal = (deliverable: GroupDeliverable) => {
  groupDeliverableForm.id = deliverable.group_deliverable_id
  groupDeliverableForm.name = deliverable.name
  showEditGroupDeliverableModal.value = true
}

const openEditStudentDeliverableModal = (deliverable: StudentDeliverable) => {
  studentDeliverableForm.id = deliverable.student_deliverable_id
  studentDeliverableForm.name = deliverable.name
  showEditStudentDeliverableModal.value = true
}

const updateGroupDeliverable = async () => {
  editingDeliverable.value = true

  try {
    const { error } = await updateGroupDeliverableHandler({
      path: { id: groupDeliverableForm.id },
      body: { name: groupDeliverableForm.name }
    })

    if (error) {
      showError('Update Failed', error)
      return
    }

    // Update the local data
    const deliverable = groupDeliverables.value.find(
      (d) => d.group_deliverable_id === groupDeliverableForm.id
    )
    if (deliverable) {
      deliverable.name = groupDeliverableForm.name
    }

    toast.add({
      title: 'Deliverable Updated',
      description: 'Group deliverable updated successfully',
      color: 'success'
    })

    showEditGroupDeliverableModal.value = false
  } catch (err) {
    showError('Error', err)
  } finally {
    editingDeliverable.value = false
  }
}

const updateStudentDeliverable = async () => {
  editingDeliverable.value = true

  try {
    const { error } = await updateStudentDeliverableHandler({
      path: { id: studentDeliverableForm.id },
      body: { name: studentDeliverableForm.name }
    })

    if (error) {
      showError('Update Failed', error)
      return
    }

    // Update the local data
    const deliverable = studentDeliverables.value.find(
      (d) => d.student_deliverable_id === studentDeliverableForm.id
    )
    if (deliverable) {
      deliverable.name = studentDeliverableForm.name
    }

    toast.add({
      title: 'Deliverable Updated',
      description: 'Student deliverable updated successfully',
      color: 'success'
    })

    showEditStudentDeliverableModal.value = false
  } catch (err) {
    showError('Error', err)
  } finally {
    editingDeliverable.value = false
  }
}

const updateGroupComponentQuantity = async (component: GroupDeliverableComponentResponse) => {
  try {
    const { error } = await updateGroupDeliverableComponentHandler({
      path: { id: component.id },
      body: { quantity: component.quantity }
    })

    if (error) {
      showError('Component Update Failed', error)
      return
    }

    toast.add({
      title: 'Component Updated',
      description: `Quantity updated to ${component.quantity}`,
      color: 'success'
    })
  } catch (err) {
    showError('Error', err)
  }
}

const updateStudentComponentQuantity = async (component: StudentDeliverableComponentResponse) => {
  try {
    const { error } = await updateStudentDeliverableComponentHandler({
      path: { id: component.id },
      body: { quantity: component.quantity }
    })

    if (error) {
      showError('Component Update Failed', error)
      return
    }

    toast.add({
      title: 'Component Updated',
      description: `Quantity updated to ${component.quantity}`,
      color: 'success'
    })
  } catch (err) {
    showError('Error', err)
  }
}

// Helper functions to get components for deliverables
const getGroupComponentsForDeliverable = (deliverableId: number) => {
  return groupDeliverableComponents.value.get(deliverableId) || []
}

const getStudentComponentsForDeliverable = (deliverableId: number) => {
  return studentDeliverableComponents.value.get(deliverableId) || []
}

// Fetch component associations for deliverables
const fetchDeliverableComponents = async () => {
  // Fetch group deliverable components
  for (const deliverable of groupDeliverables.value) {
    try {
      const { data } = await getComponentsForGroupDeliverableHandler({
        path: { id: deliverable.group_deliverable_id }
      })
      if (data) {
        groupDeliverableComponents.value.set(deliverable.group_deliverable_id, data.components)
      }
    } catch (error) {
      console.warn(
        `Failed to fetch components for group deliverable ${deliverable.group_deliverable_id}:`,
        error
      )
    }
  }

  // Fetch student deliverable components
  for (const deliverable of studentDeliverables.value) {
    try {
      const { data } = await getComponentsForStudentDeliverableHandler({
        path: { id: deliverable.student_deliverable_id }
      })
      if (data) {
        studentDeliverableComponents.value.set(deliverable.student_deliverable_id, data.components)
      }
    } catch (error) {
      console.warn(
        `Failed to fetch components for student deliverable ${deliverable.student_deliverable_id}:`,
        error
      )
    }
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchProject()
  // Ensure Overview tab is selected by default
  currentTab.value = 'overview'
})
</script>
