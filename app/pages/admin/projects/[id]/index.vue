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
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ project.name }}</h1>
            <p class="text-gray-600 mt-1">Year: {{ project.year }}</p>
          </div>
          <UBadge :color="project.active ? 'success' : 'neutral'" size="lg">
            {{ project.active ? 'Active' : 'Inactive' }}
          </UBadge>
        </div>
      </div>

      <UTabs v-model="currentTab" :items="tabs">
        <template #overview>
          <UCard>
            <template #header>
              <h3 class="font-semibold">Project Details</h3>
            </template>

            <div class="grid grid-cols-2 gap-4">
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
          <div class="space-y-4">
            <div v-if="groupDeliverables.length === 0" class="text-center py-12">
              <p class="text-gray-600">No group deliverables configured</p>
              <UButton
                :to="`/admin/projects/${project.project_id}/setup`"
                color="primary"
                class="mt-4"
              >
                Setup Deliverables
              </UButton>
            </div>
            <UCard v-for="deliverable in groupDeliverables" :key="deliverable.group_deliverable_id">
              <h4 class="font-semibold mb-2">{{ deliverable.name }}</h4>
              <p class="text-sm text-gray-600">ID: {{ deliverable.group_deliverable_id }}</p>
            </UCard>
          </div>
        </template>

        <!-- Student Deliverables Tab -->
        <template #student-deliverables>
          <div class="space-y-4">
            <div v-if="studentDeliverables.length === 0" class="text-center py-12">
              <p class="text-gray-600">No student deliverables configured</p>
              <UButton
                :to="`/admin/projects/${project.project_id}/setup`"
                color="primary"
                class="mt-4"
              >
                Setup Deliverables
              </UButton>
            </div>
            <UCard
              v-for="deliverable in studentDeliverables"
              :key="deliverable.student_deliverable_id"
            >
              <h4 class="font-semibold mb-2">{{ deliverable.name }}</h4>
              <p class="text-sm text-gray-600">ID: {{ deliverable.student_deliverable_id }}</p>
            </UCard>
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
      <template #actions>
        <UButton
          v-if="!loadingAdmins"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="material-symbols:refresh"
          @click="fetchAdmins"
        >
          Refresh List
        </UButton>
      </template>

      <template #body>
        <div v-if="loadingAdmins" class="text-center py-6">
          <Icon
            name="material-symbols:hourglass-empty"
            size="32"
            class="animate-spin mx-auto text-primary-500"
          />
        </div>
        <div v-else class="space-y-4">
          <div v-if="coordinators.length === 0" class="text-center py-4">
            <p class="text-gray-600 mb-4">No coordinators available</p>
            <UButton color="primary" size="sm" @click="showCreateCoordinatorModal = true">
              <Icon name="material-symbols:person-add" class="mr-2" />
              Create New Coordinator
            </UButton>
          </div>
          <div v-else class="space-y-3">
            <USelectMenu
              v-model="selectedAdmin"
              :options="coordinators"
              value-attribute="id"
              option-attribute="email"
              placeholder="Select a coordinator"
            />
            <p v-if="selectedAdmin" class="text-sm text-gray-600">
              Selected: {{ selectedAdmin.first_name }} {{ selectedAdmin.last_name }} ({{
                selectedAdmin.email
              }})
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showAssignModal = false">
            Cancel
          </UButton>
          <UButton :loading="assigning" :disabled="!selectedAdmin" @click="assignCoordinator">
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
  AdminResponseScheme
} from '~/composables/api/types.gen'
import {
  getOneProjectHandler,
  getProjectGroups,
  listCoordinators,
  getAllAdminsHandler,
  assignCoordinator as assignCoordinatorApi,
  removeCoordinator as removeCoordinatorApi,
  createAdminHandler
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

const project = ref<Project | null>(null)
const groupDeliverables = ref<GroupDeliverable[]>([])
const studentDeliverables = ref<StudentDeliverable[]>([])
const groupComponents = ref<GroupDeliverableComponent[]>([])
const studentComponents = ref<StudentDeliverableComponent[]>([])
const groups = ref<GroupInfo[]>([])
const coordinator = ref<CoordinatorDetail | null>(null)
const coordinators = ref<AdminResponseScheme[]>([])
const selectedAdmin = ref<AdminResponseScheme | null>(null)

const coordinatorForm = reactive({
  email: '',
  first_name: '',
  last_name: ''
})

const currentTab = ref(0)

// Close modals when switching tabs
watch(currentTab, () => {
  showCreateCoordinatorModal.value = false
  showAssignModal.value = false
})
const tabs = [
  { key: 'overview', label: 'Overview', icon: 'material-symbols:info', slot: 'overview' },
  {
    key: 'group-deliverables',
    label: 'Group Deliverables',
    icon: 'material-symbols:group-work',
    slot: 'group-deliverables'
  },
  {
    key: 'student-deliverables',
    label: 'Student Deliverables',
    icon: 'material-symbols:person',
    slot: 'student-deliverables'
  },
  { key: 'groups', label: 'Groups', icon: 'material-symbols:groups', slot: 'groups' },
  {
    key: 'coordinators',
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
    const { data } = await getAllAdminsHandler()

    if (data) {
      // Filter for coordinators only (role_id === 3)
      coordinators.value = data.admins.filter((admin: AdminResponseScheme) => admin.role_id === 3)
    }
  } finally {
    loadingAdmins.value = false
  }
}

watch(showAssignModal, (show) => {
  if (show && coordinators.value.length === 0) {
    fetchAdmins()
  }
})

const assignCoordinator = async () => {
  if (!selectedAdmin.value) return

  assigning.value = true
  try {
    const { error } = await assignCoordinatorApi({
      path: { project_id: projectId },
      body: { admin_id: selectedAdmin.value.id }
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
    selectedAdmin.value = null
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
  currentTab.value = 0
})
</script>
