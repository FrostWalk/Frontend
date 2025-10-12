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
        <div class="space-y-3">
          <div v-for="(deliv, index) in groupDeliverables" :key="index" class="flex gap-2">
            <UInput v-model="deliv.name" placeholder="Deliverable name" class="flex-1" />
            <UButton
              color="error"
              variant="ghost"
              icon="material-symbols:delete"
              @click="groupDeliverables.splice(index, 1)"
            />
          </div>
          <UButton variant="soft" block @click="groupDeliverables.push({ name: '' })">
            <Icon name="material-symbols:add" class="mr-2" />
            Add Deliverable
          </UButton>
        </div>
      </div>

      <!-- Step 3: Student Deliverables -->
      <div v-if="currentStep === 3">
        <h3 class="font-semibold mb-4">Create Student Deliverables</h3>
        <div class="space-y-3">
          <div v-for="(deliv, index) in studentDeliverables" :key="index" class="flex gap-2">
            <UInput v-model="deliv.name" placeholder="Deliverable name" class="flex-1" />
            <UButton
              color="error"
              variant="ghost"
              icon="material-symbols:delete"
              @click="studentDeliverables.splice(index, 1)"
            />
          </div>
          <UButton variant="soft" block @click="studentDeliverables.push({ name: '' })">
            <Icon name="material-symbols:add" class="mr-2" />
            Add Deliverable
          </UButton>
        </div>
      </div>

      <!-- Step 4: Summary -->
      <div v-if="currentStep === 4">
        <h3 class="font-semibold mb-4">Summary</h3>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600">
              Group Components: {{ groupComponents.filter((c) => c.name).length }}
            </p>
            <p class="text-sm text-gray-600">
              Student Components: {{ studentComponents.filter((c) => c.name).length }}
            </p>
            <p class="text-sm text-gray-600">
              Group Deliverables: {{ groupDeliverables.filter((d) => d.name).length }}
            </p>
            <p class="text-sm text-gray-600">
              Student Deliverables: {{ studentDeliverables.filter((d) => d.name).length }}
            </p>
          </div>
          <UAlert
            icon="material-symbols:info"
            color="secondary"
            title="Note"
            description="After creation, you can associate components with deliverables in the project detail page."
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UButton v-if="currentStep > 0" color="neutral" variant="ghost" @click="currentStep--">
            <Icon name="material-symbols:arrow-back" class="mr-2" />
            Back
          </UButton>
          <div v-else />

          <UButton v-if="currentStep < steps.length - 1" @click="nextStep">
            Next
            <Icon name="material-symbols:arrow-forward" class="ml-2" />
          </UButton>
          <UButton v-else :loading="submitting" color="success" @click="submitAll">
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
  createStudentDeliverableHandler
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

const steps = [
  'Group Components',
  'Student Components',
  'Group Deliverables',
  'Student Deliverables',
  'Review & Finish'
]

const groupComponents = ref<Array<{ name: string }>>([{ name: '' }])
const studentComponents = ref<Array<{ name: string }>>([{ name: '' }])
const groupDeliverables = ref<Array<{ name: string }>>([{ name: '' }])
const studentDeliverables = ref<Array<{ name: string }>>([{ name: '' }])

const nextStep = () => {
  currentStep.value++
}

const submitAll = async () => {
  submitting.value = true

  try {
    // Create group components
    for (const comp of groupComponents.value) {
      if (comp.name.trim()) {
        await createGroupComponentHandler({
          body: {
            project_id: projectId,
            name: comp.name
          }
        })
      }
    }

    // Create student components
    for (const comp of studentComponents.value) {
      if (comp.name.trim()) {
        await createStudentComponentHandler({
          body: {
            project_id: projectId,
            name: comp.name
          }
        })
      }
    }

    // Create group deliverables
    for (const deliv of groupDeliverables.value) {
      if (deliv.name.trim()) {
        await createGroupDeliverableHandler({
          body: {
            project_id: projectId,
            name: deliv.name
          }
        })
      }
    }

    // Create student deliverables
    for (const deliv of studentDeliverables.value) {
      if (deliv.name.trim()) {
        await createStudentDeliverableHandler({
          body: {
            project_id: projectId,
            name: deliv.name
          }
        })
      }
    }

    toast.add({
      title: 'Setup Complete',
      description: 'Project deliverables and components created successfully',
      color: 'success'
    })

    navigateTo(`/admin/projects/${projectId}`)
  } catch (err) {
    showError('Setup Failed', err)
  } finally {
    submitting.value = false
  }
}
</script>
