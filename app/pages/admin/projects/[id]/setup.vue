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
        <p class="text-sm text-gray-600 mb-4">
          Mark components as "sellable" if groups can trade them with each other
        </p>
        <div class="space-y-3">
          <div
            v-for="(comp, index) in setupStore.groupComponents"
            :key="index"
            class="flex gap-2 items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <UInput
              v-model="comp.name"
              placeholder="Component name (e.g., Tool, World generator)"
              class="flex-1"
            />
            <div class="flex items-center gap-2 min-w-fit">
              <UCheckbox v-model="comp.sellable" />
              <span class="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Sellable
              </span>
            </div>
            <UButton
              color="error"
              variant="ghost"
              icon="material-symbols:delete"
              @click="setupStore.removeGroupComponent(index)"
            />
          </div>
          <UButton variant="soft" block @click="setupStore.addGroupComponent()">
            <Icon name="material-symbols:add" class="mr-2" />
            Add Component
          </UButton>
        </div>
      </div>

      <!-- Step 1: Student Components -->
      <div v-if="currentStep === 1">
        <h3 class="font-semibold mb-4">Create Student Components</h3>
        <div class="space-y-3">
          <div
            v-for="(comp, index) in setupStore.studentComponents"
            :key="index"
            class="flex gap-2"
          >
            <UInput
              v-model="comp.name"
              placeholder="Component name (e.g., Robot, Visualizer)"
              class="flex-1"
            />
            <UButton
              color="error"
              variant="ghost"
              icon="material-symbols:delete"
              @click="setupStore.removeStudentComponent(index)"
            />
          </div>
          <UButton variant="soft" block @click="setupStore.addStudentComponent()">
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
            v-for="(deliv, delivIndex) in setupStore.groupDeliverables"
            :key="delivIndex"
            class="border rounded-lg p-4 space-y-4"
          >
            <div class="flex gap-2">
              <UInput v-model="deliv.name" placeholder="Deliverable name" class="flex-1" />
              <UButton
                color="error"
                variant="ghost"
                icon="material-symbols:delete"
                @click="setupStore.removeGroupDeliverable(delivIndex)"
              />
            </div>

            <div v-if="setupStore.groupComponents.filter((c) => c.name.trim()).length > 0">
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
                    {{ setupStore.groupComponents[comp.componentIndex]?.name }}
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
                    @click="setupStore.removeGroupComponentFromDeliverable(delivIndex, compIdx)"
                  />
                </div>
              </div>

              <!-- Add Component Buttons -->
              <div class="flex flex-wrap gap-2">
                <template v-for="(comp, compIndex) in setupStore.groupComponents" :key="compIndex">
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
          <UButton variant="soft" block @click="setupStore.addGroupDeliverable()">
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
            v-for="(deliv, delivIndex) in setupStore.studentDeliverables"
            :key="delivIndex"
            class="border rounded-lg p-4 space-y-4"
          >
            <div class="flex gap-2">
              <UInput v-model="deliv.name" placeholder="Deliverable name" class="flex-1" />
              <UButton
                color="error"
                variant="ghost"
                icon="material-symbols:delete"
                @click="setupStore.removeStudentDeliverable(delivIndex)"
              />
            </div>

            <div v-if="setupStore.studentComponents.filter((c) => c.name.trim()).length > 0">
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
                    {{ setupStore.studentComponents[comp.componentIndex]?.name }}
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
                    @click="setupStore.removeStudentComponentFromDeliverable(delivIndex, compIdx)"
                  />
                </div>
              </div>

              <!-- Add Component Buttons -->
              <div class="flex flex-wrap gap-2">
                <template
                  v-for="(comp, compIndex) in setupStore.studentComponents"
                  :key="compIndex"
                >
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
          <UButton variant="soft" block @click="setupStore.addStudentDeliverable()">
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
              Group Components ({{
                setupStore.groupComponents.filter((c) => c.name.trim()).length
              }})
            </h4>
            <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
              <li
                v-for="(comp, index) in setupStore.groupComponents.filter((c) => c.name.trim())"
                :key="index"
              >
                {{ comp.name }}
                <UBadge v-if="comp.sellable" color="success" variant="soft" size="xs" class="ml-2">
                  Sellable
                </UBadge>
                <UBadge v-else color="neutral" variant="soft" size="xs" class="ml-2">
                  Non-sellable
                </UBadge>
              </li>
            </ul>
          </div>

          <!-- Student Components -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">
              Student Components ({{
                setupStore.studentComponents.filter((c) => c.name.trim()).length
              }})
            </h4>
            <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
              <li
                v-for="(comp, index) in setupStore.studentComponents.filter((c) => c.name.trim())"
                :key="index"
              >
                {{ comp.name }}
              </li>
            </ul>
          </div>

          <!-- Group Deliverables -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">
              Group Deliverables ({{
                setupStore.groupDeliverables.filter((d) => d.name.trim()).length
              }})
            </h4>
            <div class="space-y-3">
              <div
                v-for="(deliv, index) in setupStore.groupDeliverables.filter((d) => d.name.trim())"
                :key="index"
                class="border-l-2 border-primary-500 pl-3"
              >
                <p class="font-medium text-sm">{{ deliv.name }}</p>
                <div v-if="deliv.components.length > 0" class="text-xs text-gray-600 mt-1">
                  <p class="font-medium">Components:</p>
                  <ul class="list-disc list-inside ml-2">
                    <li v-for="(comp, idx) in deliv.components" :key="idx">
                      {{ setupStore.groupComponents[comp.componentIndex]?.name }} (Qty:
                      {{ comp.quantity }})
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
              Student Deliverables ({{
                setupStore.studentDeliverables.filter((d) => d.name.trim()).length
              }})
            </h4>
            <div class="space-y-3">
              <div
                v-for="(deliv, index) in setupStore.studentDeliverables.filter((d) =>
                  d.name.trim()
                )"
                :key="index"
                class="border-l-2 border-primary-500 pl-3"
              >
                <p class="font-medium text-sm">{{ deliv.name }}</p>
                <div v-if="deliv.components.length > 0" class="text-xs text-gray-600 mt-1">
                  <p class="font-medium">Components:</p>
                  <ul class="list-disc list-inside ml-2">
                    <li v-for="(comp, idx) in deliv.components" :key="idx">
                      {{ setupStore.studentComponents[comp.componentIndex]?.name }} (Qty:
                      {{ comp.quantity }})
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
            title="Ready to Create!"
            description="Review your configuration above. When you click 'Finish Setup', all components and deliverables will be created in the database."
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UButton
            v-if="currentStep > 0"
            color="neutral"
            variant="ghost"
            :disabled="submitting"
            @click="currentStep--"
          >
            <Icon name="material-symbols:arrow-back" class="mr-2" />
            Back
          </UButton>
          <div v-else />

          <UButton v-if="currentStep < steps.length - 1" @click="nextStep">
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
import { useProjectSetupStore } from '~/stores/projectSetup'

definePageMeta({
  middleware: [
    'admin-auth',
    async () => {
      const { roleId, roles } = useAdminAuth()

      // Only ROOT and PROFESSOR can access setup page
      if (roleId.value === roles.COORDINATOR) {
        return navigateTo('/admin/projects')
      }
    }
  ],
  layout: 'admin'
})

const route = useRoute()
const toast = useToast()
const { showError } = useErrorToast()

const projectId = parseInt(route.params.id as string)
const currentStep = ref(0)
const submitting = ref(false)

// Use Pinia store
const setupStore = useProjectSetupStore()

// Initialize store with project ID
onMounted(() => {
  setupStore.initializeProject(projectId)
})

// Clean up store on unmount
onUnmounted(() => {
  setupStore.$reset()
})

const steps = [
  'Group Components',
  'Student Components',
  'Group Deliverables',
  'Student Deliverables',
  'Review & Finish'
]

const nextStep = () => {
  // Simply advance to next step without creating anything in the database
  currentStep.value++
}

// Add a group component to a deliverable with default quantity
const addGroupComponentToDeliverable = (deliverableIndex: number, componentIndex: unknown) => {
  if (componentIndex === null || typeof componentIndex !== 'number') return
  setupStore.addGroupComponentToDeliverable(deliverableIndex, componentIndex)
}

// Add a student component to a deliverable with default quantity
const addStudentComponentToDeliverable = (deliverableIndex: number, componentIndex: unknown) => {
  if (componentIndex === null || typeof componentIndex !== 'number') return
  setupStore.addStudentComponentToDeliverable(deliverableIndex, componentIndex)
}

const finishSetup = async () => {
  submitting.value = true

  try {
    // Create everything in the database
    await setupStore.createAllInDatabase()

    toast.add({
      title: 'Setup Complete',
      description: 'All project components and deliverables have been created',
      color: 'success'
    })

    // Redirect to project details page
    await navigateTo(`/admin/projects/${projectId}`)
  } catch (err) {
    showError('Setup Failed', err)
  } finally {
    submitting.value = false
  }
}
</script>
