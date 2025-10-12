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
        <UButton v-if="isLeader" color="primary" @click="navigateToSelectDeliverable">
          <Icon name="material-symbols:assignment" class="mr-2" />
          Select Group Deliverable
        </UButton>
      </div>

      <!-- Group Deliverable Selection -->
      <UCard v-if="deliverableSelection" class="mb-6">
        <template #header>
          <div class="flex items-center">
            <Icon name="material-symbols:check-circle" class="mr-2 text-green-500" size="24" />
            <h3 class="font-semibold">Group Deliverable Selected</h3>
          </div>
        </template>

        <div class="space-y-3">
          <div>
            <p class="text-sm text-gray-600">Deliverable</p>
            <p class="font-medium">{{ deliverableSelection.group_deliverable_name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Repository Link</p>
            <a
              :href="deliverableSelection.link"
              target="_blank"
              class="text-primary-500 hover:text-primary-600 flex items-center"
            >
              {{ deliverableSelection.link }}
              <Icon name="material-symbols:open-in-new" class="ml-1" size="16" />
            </a>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-2">Description</p>
            <div
              class="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 p-3 rounded"
            >
              {{ deliverableSelection.markdown_text }}
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

        <UForm :state="addMemberForm" class="space-y-4" @submit="addMember">
          <UFormField label="Student Email" name="email" required>
            <UInput
              v-model="addMemberForm.email"
              type="email"
              placeholder="student@studenti.unitn.it"
            />
          </UFormField>

          <UButton type="submit" :loading="addingMember">
            <Icon name="material-symbols:person-add" class="mr-2" />
            Add Member
          </UButton>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  GroupMemberInfo,
  GroupDeliverableSelectionResponse
} from '~/composables/api/types.gen'
import {
  listGroupMembers,
  getGroupDeliverableSelection,
  addMember2 as addMemberApi
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

const addMemberForm = reactive({
  email: ''
})

const isLeader = computed(() => {
  const currentMember = members.value.find((m) => m.student_id === user.value?.id)
  return currentMember?.role_name === 'Group Leader'
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

const navigateToSelectDeliverable = async () => {
  const groupId = route.params.id as string
  await navigateTo(`/groups/${groupId}/select-deliverable`, {
    replace: false,
    external: false
  })
}

const addMember = async () => {
  addingMember.value = true
  try {
    const groupId = parseInt(route.params.id as string)
    const { data, error } = await addMemberApi({
      path: { group_id: groupId },
      body: { email: addMemberForm.email }
    })

    if (error) {
      showError('Failed to Add Member', error)
      return
    }

    if (data?.success) {
      toast.add({
        title: 'Member Added',
        description: data.message,
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

onMounted(() => {
  fetchGroupData()
})
</script>
