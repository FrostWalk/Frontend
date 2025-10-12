<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
      Setup Project Deliverables
    </h1>

    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div v-for="(step, index) in steps" :key="index" class="flex-1">
          <div class="flex items-center">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :class="
                currentStep === index
                  ? 'bg-primary-500 text-white'
                  : currentStep > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
              "
            >
              {{ index + 1 }}
            </div>
            <div v-if="index < steps.length - 1" class="flex-1 h-0.5 mx-2 bg-gray-200" />
          </div>
          <p class="text-xs mt-2 text-center" :class="currentStep === index ? 'font-semibold' : ''">
            {{ step }}
          </p>
        </div>
      </div>
    </div>

    <UCard>
      <!-- Step 0: Group Components -->
      <div v-if="currentStep === 0">
        <h3 class="font-semibold mb-4">Create Group Components</h3>
        <div class="space-y-3">
          <div v-for="(comp, index) in groupComponents" :key="index" class="flex gap-2">
            <UInput
              v-model="comp.name"
              placeholder="Component name (e.g., Tool, World generator)"
              class="flex-1"
            />
            <UButton
              color="error"
              variant="ghost"
              icon="material-symbols:delete"
              @click="groupComponents.splice(index, 1)"
            />
          </div>
          <UButton variant="soft" block @click="groupComponents.push({ name: '' })">
            <Icon name="material-symbols:add" class="mr-2" />
            Add Component
          </UButton>
        </div>
      </div>

      <!-- Step 1: Student Components -->
      <div v-if="currentStep === 1">
        <h3 class="font-semibold mb-4">Create Student Components</h3>
        <div class="space-y-3">
          <div v-for="(comp, index) in studentComponents" :key="index" class="flex gap-2">
            <UInput
              v-model="comp.name"
              placeholder="Component name (e.g., Robot, Visualizer)"
              class="flex-1"
            />
            <UButton
              color="error"
              variant="ghost"
              icon="material-symbols:delete"
              @click="studentComponents.splice(index, 1)"
            />
          </div>
          <UButton variant="soft" block @click="studentComponents.push({ name: '' })">
            <Icon name="material-symbols:add" class="mr-2" />
            Add Component
          </UButton>
        </div>
      </div>

      <!-- Step 2: Group Deliverables -->
      <div v-if="currentStep === 2">
        <h3 class="font-semibold mb-4">Create Group Deliverables</h3>
        <p class="text-sm text-gray-600 mb-4">
          Create deliverables and specify which group components they include with quantities
        </p>
        <div class="space-y-6">
          <div
            v-for="(deliv, delivIndex) in groupDeliverables"
            :key="delivIndex"
            class="border rounded-lg p-4 space-y-4"
          >
            <div class="flex gap-2">
              <UInput v-model="deliv.name" placeholder="Deliverable name" class="flex-1" />
              <UButton
                color="error"
                variant="ghost"
                icon="material-symbols:delete"
                @click="groupDeliverables.splice(delivIndex, 1)"
              />
            </div>

            <div v-if="groupComponents.filter((c) => c.name.trim()).length > 0">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Components in this deliverable:
              </label>

              <!-- Selected Components with Quantities -->
              <div v-if="deliv.components.length > 0" class="space-y-2 mb-3">
                <div
                  v-for="(comp, compIdx) in deliv.components"
                  :key="compIdx"
                  class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded"
                >
                  <span class="text-sm flex-1">
                    {{ groupComponents[comp.componentIndex]?.name }}
                  </span>
                  <UInput
                    v-model.number="comp.quantity"
                    type="number"
                    min="1"
                    placeholder="Qty"
                    class="w-20"
                  />
                  <UButton
                    color="error"
                    variant="ghost"
                    icon="material-symbols:close"
                    size="sm"
                    @click="deliv.components.splice(compIdx, 1)"
                  />
                </div>
              </div>

              <!-- Add Component Buttons -->
              <div class="flex flex-wrap gap-2">
                <template v-for="(comp, compIndex) in groupComponents" :key="compIndex">
                  <UButton
                    v-if="
                      comp.name.trim() &&
                      !deliv.components.some((dc) => dc.componentIndex === compIndex)
                    "
                    variant="soft"
                    size="sm"
                    @click="addGroupComponentToDeliverable(delivIndex, compIndex)"
                  >
                    <Icon name="material-symbols:add" class="mr-1" />
                    {{ comp.name }}
                  </UButton>
                </template>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 italic">
              No group components created. Go back to add components first.
            </div>
          </div>
          <UButton
            variant="soft"
            block
            @click="groupDeliverables.push({ name: '', components: [] })"
          >
            <Icon name="material-symbols:add" class="mr-2" />
            Add Deliverable
          </UButton>
        </div>
      </div>

      <!-- Step 3: Student Deliverables -->
      <div v-if="currentStep === 3">
        <h3 class="font-semibold mb-4">Create Student Deliverables</h3>
        <p class="text-sm text-gray-600 mb-4">
          Create deliverables and specify which student components they include with quantities
        </p>
        <div class="space-y-6">
          <div
            v-for="(deliv, delivIndex) in studentDeliverables"
            :key="delivIndex"
            class="border rounded-lg p-4 space-y-4"
          >
            <div class="flex gap-2">
              <UInput v-model="deliv.name" placeholder="Deliverable name" class="flex-1" />
              <UButton
                color="error"
                variant="ghost"
                icon="material-symbols:delete"
                @click="studentDeliverables.splice(delivIndex, 1)"
              />
            </div>

            <div v-if="studentComponents.filter((c) => c.name.trim()).length > 0">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Components in this deliverable:
              </label>

              <!-- Selected Components with Quantities -->
              <div v-if="deliv.components.length > 0" class="space-y-2 mb-3">
                <div
                  v-for="(comp, compIdx) in deliv.components"
                  :key="compIdx"
                  class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded"
                >
                  <span class="text-sm flex-1">
                    {{ studentComponents[comp.componentIndex]?.name }}
                  </span>
                  <UInput
                    v-model.number="comp.quantity"
                    type="number"
                    min="1"
                    placeholder="Qty"
                    class="w-20"
                  />
                  <UButton
                    color="error"
                    variant="ghost"
                    icon="material-symbols:close"
                    size="sm"
                    @click="deliv.components.splice(compIdx, 1)"
                  />
                </div>
              </div>

              <!-- Add Component Buttons -->
              <div class="flex flex-wrap gap-2">
                <template v-for="(comp, compIndex) in studentComponents" :key="compIndex">
                  <UButton
                    v-if="
                      comp.name.trim() &&
                      !deliv.components.some((dc) => dc.componentIndex === compIndex)
                    "
                    variant="soft"
                    size="sm"
                    @click="addStudentComponentToDeliverable(delivIndex, compIndex)"
                  >
                    <Icon name="material-symbols:add" class="mr-1" />
                    {{ comp.name }}
                  </UButton>
                </template>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 italic">
              No student components created. Go back to add components first.
            </div>
          </div>
          <UButton
            variant="soft"
            block
            @click="studentDeliverables.push({ name: '', components: [] })"
          >
            <Icon name="material-symbols:add" class="mr-2" />
            Add Deliverable
          </UButton>
        </div>
      </div>

      <!-- Step 4: Summary -->
      <div v-if="currentStep === 4">
        <h3 class="font-semibold mb-6">Review Setup</h3>
        <div class="space-y-6">
          <!-- Group Components -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">
              Group Components ({{ groupComponents.filter((c) => c.name.trim()).length }})
            </h4>
            <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
              <li
                v-for="(comp, index) in groupComponents.filter((c) => c.name.trim())"
                :key="index"
              >
                {{ comp.name }}
              </li>
            </ul>
          </div>

          <!-- Student Components -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">
              Student Components ({{ studentComponents.filter((c) => c.name.trim()).length }})
            </h4>
            <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
              <li
                v-for="(comp, index) in studentComponents.filter((c) => c.name.trim())"
                :key="index"
              >
                {{ comp.name }}
              </li>
            </ul>
          </div>

          <!-- Group Deliverables -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">
              Group Deliverables ({{ groupDeliverables.filter((d) => d.name.trim()).length }})
            </h4>
            <div class="space-y-3">
              <div
                v-for="(deliv, index) in groupDeliverables.filter((d) => d.name.trim())"
                :key="index"
                class="border-l-2 border-primary-500 pl-3"
              >
                <p class="font-medium text-sm">{{ deliv.name }}</p>
                <div v-if="deliv.components.length > 0" class="text-xs text-gray-600 mt-1">
                  <p class="font-medium">Components:</p>
                  <ul class="list-disc list-inside ml-2">
                    <li v-for="(comp, idx) in deliv.components" :key="idx">
                      {{ groupComponents[comp.componentIndex]?.name }} (Qty: {{ comp.quantity }})
                    </li>
                  </ul>
                </div>
                <p v-else class="text-xs text-gray-500 italic mt-1">No components selected</p>
              </div>
            </div>
          </div>

          <!-- Student Deliverables -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">
              Student Deliverables ({{ studentDeliverables.filter((d) => d.name.trim()).length }})
            </h4>
            <div class="space-y-3">
              <div
                v-for="(deliv, index) in studentDeliverables.filter((d) => d.name.trim())"
                :key="index"
                class="border-l-2 border-primary-500 pl-3"
              >
                <p class="font-medium text-sm">{{ deliv.name }}</p>
                <div v-if="deliv.components.length > 0" class="text-xs text-gray-600 mt-1">
                  <p class="font-medium">Components:</p>
                  <ul class="list-disc list-inside ml-2">
                    <li v-for="(comp, idx) in deliv.components" :key="idx">
                      {{ studentComponents[comp.componentIndex]?.name }} (Qty: {{ comp.quantity }})
                    </li>
                  </ul>
                </div>
                <p v-else class="text-xs text-gray-500 italic mt-1">No components selected</p>
              </div>
            </div>
          </div>

          <UAlert
            icon="material-symbols:check-circle"
            color="success"
            title="Setup Complete!"
            description="All components and deliverables have been successfully created. Click 'Finish Setup' to view the project."
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UButton
            v-if="currentStep > 0"
            color="neutral"
            variant="ghost"
            :disabled="nextStepLoading"
            @click="currentStep--"
          >
            <Icon name="material-symbols:arrow-back" class="mr-2" />
            Back
          </UButton>
          <div v-else />

          <UButton
            v-if="currentStep < steps.length - 1"
            :loading="nextStepLoading"
            @click="nextStep"
          >
            Next
            <Icon name="material-symbols:arrow-forward" class="ml-2" />
          </UButton>
          <UButton v-else :loading="submitting" color="success" @click="finishSetup">
            <Icon name="material-symbols:check" class="mr-2" />
            Finish Setup
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import {
  createGroupComponentHandler,
  createStudentComponentHandler,
  createGroupDeliverableHandler,
  createStudentDeliverableHandler,
  createGroupDeliverableComponentHandler,
  createStudentDeliverableComponentHandler,
  getGroupComponentsForProjectHandler,
  getStudentComponentsForProjectHandler
} from '~/composables/api/sdk.gen'

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
})

const route = useRoute()
const toast = useToast()
const { showError } = useErrorToast()

const projectId = parseInt(route.params.id as string)
const currentStep = ref(0)
const submitting = ref(false)
const nextStepLoading = ref(false)

// Store created IDs as we progress through steps
const createdGroupComponentIds = ref<number[]>([])
const createdStudentComponentIds = ref<number[]>([])

// Track which steps have been completed (items created)
const completedSteps = ref<Set<number>>(new Set())

const steps = [
  'Group Components',
  'Student Components',
  'Group Deliverables',
  'Student Deliverables',
  'Review & Finish'
]

const groupComponents = ref<Array<{ name: string }>>([{ name: '' }])
const studentComponents = ref<Array<{ name: string }>>([{ name: '' }])
interface ComponentWithQuantity {
  componentIndex: number
  quantity: number
}

const groupDeliverables = ref<Array<{ name: string; components: ComponentWithQuantity[] }>>([
  { name: '', components: [] }
])
const studentDeliverables = ref<Array<{ name: string; components: ComponentWithQuantity[] }>>([
  { name: '', components: [] }
])

const nextStep = async () => {
  nextStepLoading.value = true

  try {
    // Skip if step already completed
    if (!completedSteps.value.has(currentStep.value)) {
      switch (currentStep.value) {
        case 0: // Create group components
          await createGroupComponents()
          break
        case 1: // Create student components
          await createStudentComponents()
          break
        case 2: // Create group deliverables with components
          await createGroupDeliverablesWithComponents()
          break
        case 3: // Create student deliverables with components
          await createStudentDeliverablesWithComponents()
          break
      }

      // Mark step as completed
      completedSteps.value.add(currentStep.value)
    }

    // Advance to next step
    currentStep.value++

    // Load components when entering deliverable creation steps
    if (currentStep.value === 2 && createdGroupComponentIds.value.length === 0) {
      await loadGroupComponentsFromBackend()
    } else if (currentStep.value === 3 && createdStudentComponentIds.value.length === 0) {
      await loadStudentComponentsFromBackend()
    }
  } catch (err) {
    showError('Creation Failed', err)
    // Stay on current step
    currentStep.value--
  } finally {
    nextStepLoading.value = false
  }
}

// Load existing group components from backend
const loadGroupComponentsFromBackend = async () => {
  const { data, error } = await getGroupComponentsForProjectHandler({
    path: { project_id: projectId }
  })

  if (error) {
    throw error
  }

  if (data && data.components && data.components.length > 0) {
    // Clear and populate with existing components
    groupComponents.value = data.components.map((comp) => ({ name: comp.name }))
    createdGroupComponentIds.value = data.components.map(
      (comp) => comp.group_deliverable_component_id
    )

    toast.add({
      title: 'Group Components Loaded',
      description: `Loaded ${data.components.length} existing group component(s)`,
      color: 'info'
    })
  }
}

// Load existing student components from backend
const loadStudentComponentsFromBackend = async () => {
  const { data, error } = await getStudentComponentsForProjectHandler({
    path: { project_id: projectId }
  })

  if (error) {
    throw error
  }

  if (data && data.components && data.components.length > 0) {
    // Clear and populate with existing components
    studentComponents.value = data.components.map((comp) => ({ name: comp.name }))
    createdStudentComponentIds.value = data.components.map(
      (comp) => comp.student_deliverable_component_id
    )

    toast.add({
      title: 'Student Components Loaded',
      description: `Loaded ${data.components.length} existing student component(s)`,
      color: 'info'
    })
  }
}

// Step 0: Create group components
const createGroupComponents = async () => {
  createdGroupComponentIds.value = []

  for (const comp of groupComponents.value) {
    if (comp.name.trim()) {
      const { data, error } = await createGroupComponentHandler({
        body: {
          project_id: projectId,
          name: comp.name
        }
      })

      if (error) throw error

      if (data) {
        createdGroupComponentIds.value.push(data.group_deliverable_component_id)
      }
    }
  }

  toast.add({
    title: 'Group Components Created',
    description: `Created ${createdGroupComponentIds.value.length} group component(s)`,
    color: 'success'
  })
}

// Step 1: Create student components
const createStudentComponents = async () => {
  createdStudentComponentIds.value = []

  for (const comp of studentComponents.value) {
    if (comp.name.trim()) {
      const { data, error } = await createStudentComponentHandler({
        body: {
          project_id: projectId,
          name: comp.name
        }
      })

      if (error) throw error

      if (data) {
        createdStudentComponentIds.value.push(data.student_deliverable_component_id)
      }
    }
  }

  toast.add({
    title: 'Student Components Created',
    description: `Created ${createdStudentComponentIds.value.length} student component(s)`,
    color: 'success'
  })
}

// Step 2: Create group deliverables with component associations
const createGroupDeliverablesWithComponents = async () => {
  for (const deliv of groupDeliverables.value) {
    if (deliv.name.trim()) {
      const { data, error } = await createGroupDeliverableHandler({
        body: {
          project_id: projectId,
          name: deliv.name
        }
      })

      if (error) throw error

      // Associate selected components with this deliverable
      if (data && deliv.components.length > 0) {
        for (const component of deliv.components) {
          const componentId = createdGroupComponentIds.value[component.componentIndex]
          if (componentId) {
            const { error: compError } = await createGroupDeliverableComponentHandler({
              body: {
                group_deliverable_id: data.group_deliverable_id,
                group_deliverable_component_id: componentId,
                quantity: component.quantity
              }
            })

            if (compError) throw compError
          }
        }
      }
    }
  }

  toast.add({
    title: 'Group Deliverables Created',
    description: `Created ${groupDeliverables.value.filter((d) => d.name.trim()).length} group deliverable(s)`,
    color: 'success'
  })
}

// Step 3: Create student deliverables with component associations
const createStudentDeliverablesWithComponents = async () => {
  for (const deliv of studentDeliverables.value) {
    if (deliv.name.trim()) {
      const { data, error } = await createStudentDeliverableHandler({
        body: {
          project_id: projectId,
          name: deliv.name
        }
      })

      if (error) throw error

      // Associate selected components with this deliverable
      if (data && deliv.components.length > 0) {
        for (const component of deliv.components) {
          const componentId = createdStudentComponentIds.value[component.componentIndex]
          if (componentId) {
            const { error: compError } = await createStudentDeliverableComponentHandler({
              body: {
                student_deliverable_id: data.student_deliverable_id,
                student_deliverable_component_id: componentId,
                quantity: component.quantity
              }
            })

            if (compError) throw compError
          }
        }
      }
    }
  }

  toast.add({
    title: 'Student Deliverables Created',
    description: `Created ${studentDeliverables.value.filter((d) => d.name.trim()).length} student deliverable(s)`,
    color: 'success'
  })
}

// Add a group component to a deliverable with default quantity
const addGroupComponentToDeliverable = (deliverableIndex: number, componentIndex: unknown) => {
  const deliv = groupDeliverables.value[deliverableIndex]
  if (!deliv || componentIndex === null || typeof componentIndex !== 'number') return

  deliv.components.push({
    componentIndex,
    quantity: 1
  })
}

// Add a student component to a deliverable with default quantity
const addStudentComponentToDeliverable = (deliverableIndex: number, componentIndex: unknown) => {
  const deliv = studentDeliverables.value[deliverableIndex]
  if (!deliv || componentIndex === null || typeof componentIndex !== 'number') return

  deliv.components.push({
    componentIndex,
    quantity: 1
  })
}

const finishSetup = async () => {
  submitting.value = true

  try {
    toast.add({
      title: 'Setup Complete',
      description: 'All project components and deliverables have been created',
      color: 'success'
    })

    // Redirect to project details page
    await navigateTo(`/admin/projects/${projectId}`)
  } catch (err) {
    showError('Navigation Failed', err)
  } finally {
    submitting.value = false
  }
}

// Load existing components on mount (in case user is resuming setup)
onMounted(async () => {
  try {
    // Try to load group components
    const { data: groupData } = await getGroupComponentsForProjectHandler({
      path: { project_id: projectId }
    })

    if (groupData && groupData.components && groupData.components.length > 0) {
      groupComponents.value = groupData.components.map((comp) => ({ name: comp.name }))
      createdGroupComponentIds.value = groupData.components.map(
        (comp) => comp.group_deliverable_component_id
      )
      completedSteps.value.add(0) // Mark step 0 as completed
    }

    // Try to load student components
    const { data: studentData } = await getStudentComponentsForProjectHandler({
      path: { project_id: projectId }
    })

    if (studentData && studentData.components && studentData.components.length > 0) {
      studentComponents.value = studentData.components.map((comp) => ({ name: comp.name }))
      createdStudentComponentIds.value = studentData.components.map(
        (comp) => comp.student_deliverable_component_id
      )
      completedSteps.value.add(1) // Mark step 1 as completed
    }
  } catch (err) {
    // Silently fail - user can create components from scratch
    console.error('Failed to load existing components:', err)
  }
})
</script>
