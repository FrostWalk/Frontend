import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createGroupComponentHandler,
  createStudentComponentHandler,
  createGroupDeliverableHandler,
  createStudentDeliverableHandler,
  createGroupDeliverableComponentHandler,
  createStudentDeliverableComponentHandler
} from '~/composables/api/sdk.gen'

interface ComponentWithQuantity {
  componentIndex: number
  quantity: number
}

interface GroupComponent {
  name: string
  sellable: boolean
}

interface StudentComponent {
  name: string
}

interface GroupDeliverable {
  name: string
  components: ComponentWithQuantity[]
}

interface StudentDeliverable {
  name: string
  components: ComponentWithQuantity[]
}

export const useProjectSetupStore = defineStore('projectSetup', () => {
  // State
  const projectId = ref<number | null>(null)
  const groupComponents = ref<GroupComponent[]>([{ name: '', sellable: true }])
  const studentComponents = ref<StudentComponent[]>([{ name: '' }])
  const groupDeliverables = ref<GroupDeliverable[]>([{ name: '', components: [] }])
  const studentDeliverables = ref<StudentDeliverable[]>([{ name: '', components: [] }])

  // Track created IDs (only set after final submission)
  const createdGroupComponentIds = ref<number[]>([])
  const createdStudentComponentIds = ref<number[]>([])

  // Actions
  function initializeProject(id: number) {
    projectId.value = id
  }

  function setGroupComponents(components: GroupComponent[]) {
    groupComponents.value = components
  }

  function setStudentComponents(components: StudentComponent[]) {
    studentComponents.value = components
  }

  function setGroupDeliverables(deliverables: GroupDeliverable[]) {
    groupDeliverables.value = deliverables
  }

  function setStudentDeliverables(deliverables: StudentDeliverable[]) {
    studentDeliverables.value = deliverables
  }

  function addGroupComponent() {
    groupComponents.value.push({ name: '', sellable: true })
  }

  function removeGroupComponent(index: number) {
    groupComponents.value.splice(index, 1)
  }

  function addStudentComponent() {
    studentComponents.value.push({ name: '' })
  }

  function removeStudentComponent(index: number) {
    studentComponents.value.splice(index, 1)
  }

  function addGroupDeliverable() {
    groupDeliverables.value.push({ name: '', components: [] })
  }

  function removeGroupDeliverable(index: number) {
    groupDeliverables.value.splice(index, 1)
  }

  function addStudentDeliverable() {
    studentDeliverables.value.push({ name: '', components: [] })
  }

  function removeStudentDeliverable(index: number) {
    studentDeliverables.value.splice(index, 1)
  }

  function addGroupComponentToDeliverable(deliverableIndex: number, componentIndex: number) {
    const deliv = groupDeliverables.value[deliverableIndex]
    if (!deliv) return

    deliv.components.push({
      componentIndex,
      quantity: 1
    })
  }

  function removeGroupComponentFromDeliverable(deliverableIndex: number, componentIdx: number) {
    const deliv = groupDeliverables.value[deliverableIndex]
    if (!deliv) return

    deliv.components.splice(componentIdx, 1)
  }

  function addStudentComponentToDeliverable(deliverableIndex: number, componentIndex: number) {
    const deliv = studentDeliverables.value[deliverableIndex]
    if (!deliv) return

    deliv.components.push({
      componentIndex,
      quantity: 1
    })
  }

  function removeStudentComponentFromDeliverable(deliverableIndex: number, componentIdx: number) {
    const deliv = studentDeliverables.value[deliverableIndex]
    if (!deliv) return

    deliv.components.splice(componentIdx, 1)
  }

  // Create all data in the database (final submission)
  async function createAllInDatabase() {
    if (!projectId.value) {
      throw new Error('Project ID not set')
    }

    // Step 1: Create group components
    createdGroupComponentIds.value = []
    for (const comp of groupComponents.value) {
      if (comp.name.trim()) {
        const { data, error } = await createGroupComponentHandler({
          body: {
            project_id: projectId.value,
            name: comp.name,
            sellable: comp.sellable
          }
        })

        if (error) throw error

        if (data) {
          createdGroupComponentIds.value.push(data.group_deliverable_component_id)
        }
      }
    }

    // Step 2: Create student components
    createdStudentComponentIds.value = []
    for (const comp of studentComponents.value) {
      if (comp.name.trim()) {
        const { data, error } = await createStudentComponentHandler({
          body: {
            project_id: projectId.value,
            name: comp.name
          }
        })

        if (error) throw error

        if (data) {
          createdStudentComponentIds.value.push(data.student_deliverable_component_id)
        }
      }
    }

    // Step 3: Create group deliverables with components
    for (const deliv of groupDeliverables.value) {
      if (deliv.name.trim()) {
        const { data, error } = await createGroupDeliverableHandler({
          body: {
            project_id: projectId.value,
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

    // Step 4: Create student deliverables with components
    for (const deliv of studentDeliverables.value) {
      if (deliv.name.trim()) {
        const { data, error } = await createStudentDeliverableHandler({
          body: {
            project_id: projectId.value,
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
  }

  // Reset store to initial state
  function $reset() {
    projectId.value = null
    groupComponents.value = [{ name: '', sellable: true }]
    studentComponents.value = [{ name: '' }]
    groupDeliverables.value = [{ name: '', components: [] }]
    studentDeliverables.value = [{ name: '', components: [] }]
    createdGroupComponentIds.value = []
    createdStudentComponentIds.value = []
  }

  return {
    // State
    projectId,
    groupComponents,
    studentComponents,
    groupDeliverables,
    studentDeliverables,
    createdGroupComponentIds,
    createdStudentComponentIds,

    // Actions
    initializeProject,
    setGroupComponents,
    setStudentComponents,
    setGroupDeliverables,
    setStudentDeliverables,
    addGroupComponent,
    removeGroupComponent,
    addStudentComponent,
    removeStudentComponent,
    addGroupDeliverable,
    removeGroupDeliverable,
    addStudentDeliverable,
    removeStudentDeliverable,
    addGroupComponentToDeliverable,
    removeGroupComponentFromDeliverable,
    addStudentComponentToDeliverable,
    removeStudentComponentFromDeliverable,
    createAllInDatabase,
    $reset
  }
})
